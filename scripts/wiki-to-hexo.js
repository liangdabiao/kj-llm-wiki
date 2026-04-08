#!/usr/bin/env node
/**
 * wiki-to-hexo.js
 * 将 wiki 目录下的所有 markdown 文件转换为 Hexo 格式
 * 自动处理双向链接 [[页面名]] → 标准 Markdown 链接
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

// 配置
const WIKI_DIR = path.resolve(__dirname, '../wiki');
const HEXO_POSTS_DIR = path.resolve(__dirname, '../hexo-site/source/_posts');
const HEXO_PAGES_DIR = path.resolve(__dirname, '../hexo-site/source');

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取所有 wiki 文件并建立索引
function buildWikiIndex() {
  const files = glob.sync('**/*.md', { cwd: WIKI_DIR });
  const index = {};
  
  files.forEach(file => {
    const fullPath = path.join(WIKI_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(content);
    
    // 从文件名或内容中提取标题
    let title = path.basename(file, '.md');
    if (parsed.data.title) {
      title = parsed.data.title;
    } else {
      // 尝试从第一个 h1 提取标题
      const h1Match = content.match(/^# (.+)$/m);
      if (h1Match) {
        title = h1Match[1].trim();
      }
    }
    
    index[title] = {
      file: file,
      path: file.replace(/\.md$/, ''),
      title: title,
      content: content
    };
  });
  
  return index;
}

// 转换 [[双向链接]] 为标准 Markdown 链接
function convertWikiLinks(content, wikiIndex) {
  // 匹配 [[页面名]] 或 [[页面名|显示文本]]
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, pageName, displayText) => {
    const target = wikiIndex[pageName.trim()];
    if (target) {
      const text = displayText || pageName;
      // 转换为 Hexo 内部链接
      return `[${text}](/wiki/${target.path})`;
    }
    // 如果找不到目标，保留原文本但去掉方括号
    return displayText || pageName;
  });
}

// 处理图片路径
function convertImagePaths(content) {
  // 将相对路径转换为 Hexo 资源路径
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (src.startsWith('http') || src.startsWith('/')) {
      return match; // 已经是绝对路径，不处理
    }
    // 相对路径转换为 Hexo 资源路径
    return `![${alt}](/assets/${path.basename(src)})`;
  });
}

// 根据 wiki 子目录映射分类
function getCategory(filePath) {
  const relativePath = path.relative(WIKI_DIR, filePath);
  if (relativePath.startsWith('entities')) return '实体';
  if (relativePath.startsWith('topics')) return '主题';
  if (relativePath.startsWith('sources')) return '素材';
  if (relativePath.startsWith('comparisons')) return '对比';
  if (relativePath.startsWith('synthesis')) return '综合';
  return '其他';
}

// 提取标签
function extractTags(content) {
  const tags = [];
  const tagMatch = content.match(/tags:\s*\[([^\]]+)\]/);
  if (tagMatch) {
    return tagMatch[1].split(',').map(t => t.trim());
  }
  return [];
}

// 转换单个 wiki 文件为 Hexo 格式
function convertFile(filePath, wikiIndex) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(content);
  
  // 转换双向链接
  let processedContent = convertWikiLinks(parsed.content, wikiIndex);
  processedContent = convertImagePaths(processedContent);
  
  // 提取标题
  let title = parsed.data.title || path.basename(filePath, '.md');
  const h1Match = processedContent.match(/^# (.+)$/m);
  if (h1Match && !parsed.data.title) {
    title = h1Match[1].trim();
  }
  
  // 构建 Front-matter
  const frontMatter = {
    title: title,
    date: parsed.data.created || new Date().toISOString().slice(0, 10),
    updated: parsed.data.updated || new Date().toISOString().slice(0, 10),
    categories: [getCategory(filePath)],
    tags: parsed.data.tags || extractTags(content),
    wiki_path: path.relative(WIKI_DIR, filePath),
    permalink: `/wiki/${path.relative(WIKI_DIR, filePath).replace(/\.md$/, '')}`
  };
  
  // 生成 Hexo 文章
  const hexoContent = matter.stringify(processedContent, frontMatter);
  
  // 确定输出路径
  const relativePath = path.relative(WIKI_DIR, filePath);
  const outputPath = path.join(HEXO_POSTS_DIR, relativePath);
  
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, hexoContent, 'utf8');
  
  return {
    input: filePath,
    output: outputPath,
    title: title
  };
}

// 生成索引页面
function generateIndexPage(wikiIndex) {
  const categories = {
    '实体': [],
    '主题': [],
    '素材': [],
    '对比': [],
    '综合': []
  };
  
  Object.values(wikiIndex).forEach(item => {
    const cat = getCategory(path.join(WIKI_DIR, item.file));
    if (categories[cat]) {
      categories[cat].push(item);
    }
  });
  
  let content = `# AI 技术学习笔记

> 个人知识库公开站点，持续更新中

---

`;
  
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length > 0) {
      content += `## ${cat}\n\n`;
      items.forEach(item => {
        content += `- [${item.title}](/wiki/${item.path})\n`;
      });
      content += '\n';
    }
  });
  
  const frontMatter = {
    title: '知识库索引',
    date: new Date().toISOString().slice(0, 10),
    type: 'index'
  };
  
  const hexoContent = matter.stringify(content, frontMatter);
  const outputPath = path.join(HEXO_POSTS_DIR, 'index.md');
  fs.writeFileSync(outputPath, hexoContent, 'utf8');
  
  console.log(`✓ 生成索引页面: ${outputPath}`);
}

// 主函数
function main() {
  console.log('🚀 开始转换 wiki → Hexo...\n');
  
  // 确保输出目录存在
  ensureDir(HEXO_POSTS_DIR);
  ensureDir(path.join(HEXO_POSTS_DIR, 'entities'));
  ensureDir(path.join(HEXO_POSTS_DIR, 'topics'));
  ensureDir(path.join(HEXO_POSTS_DIR, 'sources'));
  ensureDir(path.join(HEXO_POSTS_DIR, 'comparisons'));
  ensureDir(path.join(HEXO_POSTS_DIR, 'synthesis'));
  
  // 构建 wiki 索引
  console.log('📚 构建 wiki 索引...');
  const wikiIndex = buildWikiIndex();
  console.log(`   找到 ${Object.keys(wikiIndex).length} 个 wiki 页面\n`);
  
  // 转换所有文件
  console.log('🔄 转换 wiki 文件...');
  let count = 0;
  const files = glob.sync('**/*.md', { cwd: WIKI_DIR });
  
  files.forEach(file => {
    const fullPath = path.join(WIKI_DIR, file);
    const result = convertFile(fullPath, wikiIndex);
    console.log(`   ✓ ${result.title}`);
    count++;
  });
  
  console.log(`\n   共转换 ${count} 个文件\n`);
  
  // 生成索引页面
  console.log('📑 生成索引页面...');
  generateIndexPage(wikiIndex);
  
  console.log('\n✅ 转换完成！');
  console.log(`   输出目录: ${HEXO_POSTS_DIR}`);
  console.log('   运行 npm run server 预览站点');
}

main();
