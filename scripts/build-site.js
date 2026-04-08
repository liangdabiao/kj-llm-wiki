#!/usr/bin/env node
/**
 * build-site.js
 * 将 wiki 目录下的 Markdown 文件转换为静态 HTML 站点
 * 输出到 docs/ 目录，可直接推送到 GitHub + Cloudflare Pages
 * 
 * 使用方法：
 *   node scripts/build-site.js
 */

const fs = require('fs');
const path = require('path');

// 检查并安装依赖
function checkDependencies() {
  const required = ['marked', 'glob'];
  const missing = [];
  
  for (const dep of required) {
    try {
      require.resolve(dep);
    } catch (e) {
      missing.push(dep);
    }
  }
  
  if (missing.length > 0) {
    console.log(`📦 安装依赖: ${missing.join(', ')}`);
    const { execSync } = require('child_process');
    execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ 依赖安装完成\n');
  }
}

checkDependencies();

const { marked } = require('marked');
const glob = require('glob');

// ==================== 配置 ====================

const WIKI_DIR = path.resolve(__dirname, '../wiki');
const OUTPUT_DIR = path.resolve(__dirname, '../docs');

// 知识库配置
const SITE_CONFIG = {
  title: 'AI 技术学习笔记',
  subtitle: '基于 OpenClaw 和 AI 智能体的跨境电商与自动化实践',
  description: '个人知识库公开站点，涵盖 OpenClaw、跨境电商AI、智能客服、选品方法论等主题',
  baseUrl: '/',  // Cloudflare Pages 部署时设为 '/'
  wikiSourceUrl: 'https://github.com/yourusername/kllm-wiki'  // GitHub 仓库地址
};

// ==================== 工具函数 ====================

// 确保目录存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 复制静态资源
function copyAssets() {
  const cssDir = path.join(OUTPUT_DIR, 'css');
  const jsDir = path.join(OUTPUT_DIR, 'js');
  ensureDir(cssDir);
  ensureDir(jsDir);
  
  // 生成 CSS
  const css = generateCSS();
  fs.writeFileSync(path.join(cssDir, 'style.css'), css, 'utf8');
  console.log('  ✓ css/style.css');
  
  // 生成 JS
  const js = generateJS();
  fs.writeFileSync(path.join(jsDir, 'main.js'), js, 'utf8');
  console.log('  ✓ js/main.js');
}

// 读取所有 wiki 文件并建立索引
function buildWikiIndex() {
  const files = glob.sync('**/*.md', { 
    cwd: WIKI_DIR,
    ignore: ['node_modules/**']
  });
  
  const index = {};
  
  files.forEach(file => {
    const fullPath = path.join(WIKI_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 从文件名或内容提取标题
    let title = path.basename(file, '.md');
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match) {
      title = h1Match[1].trim();
    }
    
    index[file] = {
      file: file,
      path: file.replace(/\.md$/, '.html'),
      title: title,
      content: content,
      category: getCategory(file),
      links: extractLinks(content),  // 提取 [[双向链接]]
      date: extractDate(content)
    };
  });
  
  return index;
}

// 根据路径获取分类
function getCategory(filePath) {
  // 处理 Windows 路径分隔符
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  if (normalizedPath.startsWith('entities/')) return '实体';
  if (normalizedPath.startsWith('topics/')) return '主题';
  if (normalizedPath.startsWith('sources/')) return '素材';
  if (normalizedPath.startsWith('comparisons/')) return '对比';
  if (normalizedPath.startsWith('synthesis/')) return '综合';
  return '其他';
}

// 提取文档中的 [[双向链接]]
function extractLinks(content) {
  const links = [];
  const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push({
      target: match[1].trim(),
      display: match[2] || match[1].trim()
    });
  }
  
  return links;
}

// 构建反向链接索引
function buildBacklinksIndex(wikiIndex) {
  // 构建标题到文件路径的映射
  const titleToFile = {};
  Object.entries(wikiIndex).forEach(([filePath, item]) => {
    titleToFile[item.title] = filePath;
    // 也匹配不带日期的标题
    const titleWithoutDate = item.title.replace(/^\d{4}-\d{2}-\d{2}\s*/, '');
    titleToFile[titleWithoutDate] = filePath;
  });
  
  // 反向链接索引：{ 目标文件路径: [来源文件路径, ...] }
  const backlinks = {};
  
  // 初始化所有页面的反向链接数组
  Object.keys(wikiIndex).forEach(filePath => {
    backlinks[filePath] = [];
  });
  
  // 遍历所有页面，收集链接关系
  Object.entries(wikiIndex).forEach(([sourceFile, item]) => {
    item.links.forEach(link => {
      const targetFile = titleToFile[link.target];
      if (targetFile && targetFile !== sourceFile) {
        // 避免重复添加
        if (!backlinks[targetFile].includes(sourceFile)) {
          backlinks[targetFile].push(sourceFile);
        }
      }
    });
  });
  
  return backlinks;
}

// 提取文档日期
function extractDate(content) {
  const dateMatch = content.match(/created:\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) return dateMatch[1];
  
  // 从文件名提取日期 (2026-04-08-xxx.md)
  const fileName = content.match(/#.*(\d{4}-\d{2}-\d{2})/);
  if (fileName) return fileName[1];
  
  return new Date().toISOString().slice(0, 10);
}

// 配置 marked 选项
function configureMarked() {
  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false
  });
  
  // 自定义渲染器
  const renderer = new marked.Renderer();
  
  // 重写链接渲染（处理 wiki 内部链接）
  renderer.link = function(token) {
    // marked v9+ 传入的是 token 对象
    let href = typeof token === 'string' ? token : (token.href || '');
    const title = typeof token === 'string' ? title : (token.title || '');
    const text = typeof token === 'string' ? text : (token.text || '');
    
    // 处理相对路径
    if (href.startsWith('./') || href.startsWith('../')) {
      const resolved = href.replace(/^\.\.?\//, '').replace(/\.md$/, '.html');
      href = SITE_CONFIG.baseUrl + 'wiki/' + resolved;
    }
    
    let out = `<a href="${href}"`;
    if (title) out += ` title="${title}"`;
    out += `>${text}</a>`;
    return out;
  };
  
  // 重写代码块渲染（支持 Mermaid）
  renderer.code = function(token) {
    // marked v9+ 传入的是 token 对象
    const code = typeof token === 'string' ? token : token.text;
    const language = typeof token === 'string' ? language : (token.lang || '');
    
    if (language === 'mermaid') {
      return `<div class="mermaid">${code}</div>`;
    }
    
    // 普通代码块
    return `<pre><code class="language-${language || 'text'}">${escapeHtml(code)}</code></pre>`;
  };
  
  marked.setOptions({ renderer });
}

// HTML 转义
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 转换 [[双向链接]] 为 HTML 链接
function convertWikiLinks(content, wikiIndex) {
  // 构建文件名到标题的映射
  const titleToPath = {};
  Object.values(wikiIndex).forEach(item => {
    titleToPath[item.title] = item.path;
    // 也匹配不带日期的标题
    const titleWithoutDate = item.title.replace(/^\d{4}-\d{2}-\d{2}\s*/, '');
    titleToPath[titleWithoutDate] = item.path;
  });
  
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, pageName, displayText) => {
    const targetPath = titleToPath[pageName.trim()];
    const text = displayText || pageName;
    
    if (targetPath) {
      return `<a href="${SITE_CONFIG.baseUrl}wiki/${targetPath}" class="wiki-link">${text}</a>`;
    }
    
    // 找不到目标，显示为待创建链接
    return `<span class="wiki-link-missing" title="页面不存在">${text}</span>`;
  });
}

// 生成 HTML 页面
function generateHtml(content, title, wikiIndex, backlinks, currentFilePath) {
  // 转换双向链接
  const processedContent = convertWikiLinks(content, wikiIndex);
  
  // Markdown 转 HTML
  const htmlContent = marked.parse(processedContent);
  
  // 获取当前页面的反向链接
  const currentBacklinks = backlinks[currentFilePath] || [];
  const backlinksHtml = currentBacklinks.length > 0
    ? currentBacklinks.map(sourceFile => {
        const sourceItem = wikiIndex[sourceFile];
        return `<li><a href="${SITE_CONFIG.baseUrl}wiki/${sourceItem.path}">${sourceItem.title}</a></li>`;
      }).join('\n')
    : '<li class="no-backlinks">暂无反向链接</li>';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${SITE_CONFIG.title}</title>
  <meta name="description" content="${SITE_CONFIG.description}">
  <link rel="stylesheet" href="${SITE_CONFIG.baseUrl}css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@9.4.0/dist/mermaid.min.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="container">
      <div class="header-left">
        <a href="${SITE_CONFIG.baseUrl}" class="logo">📚 ${SITE_CONFIG.title}</a>
      </div>
      <nav class="header-nav">
        <a href="${SITE_CONFIG.baseUrl}">首页</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/entities/">实体</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/topics/">主题</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/sources/">素材</a>
        <button class="search-btn" onclick="toggleSearch()">🔍 搜索</button>
      </nav>
      <button class="menu-toggle" onclick="toggleMenu()">☰</button>
    </div>
  </header>
  
  <div class="search-overlay" id="searchOverlay" style="display:none;">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="搜索知识库..." oninput="searchWiki(this.value)">
      <button onclick="toggleSearch()">✕</button>
    </div>
    <div class="search-results" id="searchResults"></div>
  </div>
  
  <main class="container">
    <div class="content-wrapper">
      <article class="wiki-page">
        <header class="page-header">
          <h1>${title}</h1>
          <div class="page-meta">
            <span class="category">${getCategory(currentFilePath)}</span>
            <span class="backlinks-count">${currentBacklinks.length} 个反向链接</span>
          </div>
        </header>
        
        <div class="page-content">
          ${htmlContent}
        </div>
        
        <footer class="page-footer">
          <div class="back-links">
            <h3>🔗 反向链接 (${currentBacklinks.length})</h3>
            <p class="backlinks-desc">以下页面链接到了本页：</p>
            <ul class="backlinks-list">
              ${backlinksHtml}
            </ul>
          </div>
          <div class="source-link">
            <a href="${SITE_CONFIG.wikiSourceUrl}/blob/main/wiki/${currentFilePath}" target="_blank">
              📄 查看原始 Markdown
            </a>
          </div>
        </footer>
      </article>
    </div>
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} ${SITE_CONFIG.title} · Powered by llm-wiki & Cloudflare Pages</p>
    </div>
  </footer>
  
  <script>
    window.wikiIndex = ${JSON.stringify(buildSearchIndex(wikiIndex))};
    
    // Mermaid 初始化
    mermaid.initialize({ 
      startOnLoad: true, 
      theme: 'default',
      securityLevel: 'loose'
    });
  </script>
  <script src="${SITE_CONFIG.baseUrl}js/main.js"></script>
</body>
</html>`;
}

// 构建搜索索引
function buildSearchIndex(wikiIndex) {
  return Object.values(wikiIndex).map(item => ({
    title: item.title,
    path: item.path,
    category: item.category,
    date: item.date
  }));
}

// 生成单个 wiki 页面
function generatePage(filePath, wikiIndex, backlinks) {
  const fullPath = path.join(WIKI_DIR, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // 提取标题
  let title = path.basename(filePath, '.md');
  const h1Match = content.match(/^# (.+)$/m);
  if (h1Match) {
    title = h1Match[1].trim();
  }
  
  // 生成 HTML（传入反向链接数据）
  const html = generateHtml(content, title, wikiIndex, backlinks, filePath);
  
  // 输出路径
  const outputPath = path.join(OUTPUT_DIR, 'wiki', filePath.replace(/\.md$/, '.html'));
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, html, 'utf8');
  
  return { title, path: filePath, category: getCategory(filePath) };
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
    if (categories[item.category]) {
      categories[item.category].push(item);
    }
  });
  
  let content = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SITE_CONFIG.title}</title>
  <meta name="description" content="${SITE_CONFIG.description}">
  <link rel="stylesheet" href="${SITE_CONFIG.baseUrl}css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <div class="header-left">
        <a href="${SITE_CONFIG.baseUrl}" class="logo">📚 ${SITE_CONFIG.title}</a>
      </div>
      <nav class="header-nav">
        <a href="${SITE_CONFIG.baseUrl}" class="active">首页</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/entities/">实体</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/topics/">主题</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/sources/">素材</a>
        <button class="search-btn" onclick="toggleSearch()">🔍 搜索</button>
      </nav>
      <button class="menu-toggle" onclick="toggleMenu()">☰</button>
    </div>
  </header>
  
  <div class="search-overlay" id="searchOverlay" style="display:none;">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="搜索知识库..." oninput="searchWiki(this.value)">
      <button onclick="toggleSearch()">✕</button>
    </div>
    <div class="search-results" id="searchResults"></div>
  </div>
  
  <main class="container">
    <section class="hero">
      <h1>${SITE_CONFIG.title}</h1>
      <p class="subtitle">${SITE_CONFIG.subtitle}</p>
      <p class="description">${SITE_CONFIG.description}</p>
    </section>
    
    <section class="stats">
      <div class="stat-card">
        <span class="stat-number">${Object.keys(wikiIndex).length}</span>
        <span class="stat-label">总页面数</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${categories['实体'].length}</span>
        <span class="stat-label">实体</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${categories['主题'].length}</span>
        <span class="stat-label">主题</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${categories['素材'].length}</span>
        <span class="stat-label">素材</span>
      </div>
    </section>
`;

  // 按分类输出
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      content += `
    <section class="category-section">
      <h2>${category}</h2>
      <ul class="page-list">
`;
      items.forEach(item => {
        content += `        <li><a href="${SITE_CONFIG.baseUrl}wiki/${item.path}">${item.title}</a></li>\n`;
      });
      content += `      </ul>
    </section>\n`;
    }
  });

  content += `
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} ${SITE_CONFIG.title} · Powered by llm-wiki & Cloudflare Pages</p>
    </div>
  </footer>
  
  <script>
    window.wikiIndex = ${JSON.stringify(buildSearchIndex(wikiIndex))};
  </script>
  <script src="${SITE_CONFIG.baseUrl}js/main.js"></script>
</body>
</html>`;

  const indexPath = path.join(OUTPUT_DIR, 'index.html');
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('  ✓ index.html');
}

// 生成分类索引页
function generateCategoryIndex(category, items, wikiIndex) {
  let content = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${category} - ${SITE_CONFIG.title}</title>
  <link rel="stylesheet" href="${SITE_CONFIG.baseUrl}css/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <div class="header-left">
        <a href="${SITE_CONFIG.baseUrl}" class="logo">📚 ${SITE_CONFIG.title}</a>
      </div>
      <nav class="header-nav">
        <a href="${SITE_CONFIG.baseUrl}">首页</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/entities/" class="${category === '实体' ? 'active' : ''}">实体</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/topics/" class="${category === '主题' ? 'active' : ''}">主题</a>
        <a href="${SITE_CONFIG.baseUrl}wiki/sources/" class="${category === '素材' ? 'active' : ''}">素材</a>
        <button class="search-btn" onclick="toggleSearch()">🔍 搜索</button>
      </nav>
      <button class="menu-toggle" onclick="toggleMenu()">☰</button>
    </div>
  </header>
  
  <main class="container">
    <section class="category-page">
      <h1>${category}</h1>
      <ul class="page-list">
`;

  items.forEach(item => {
    content += `        <li>
          <a href="${SITE_CONFIG.baseUrl}wiki/${item.path}">${item.title}</a>
          <span class="date">${item.date}</span>
        </li>\n`;
  });

  content += `      </ul>
    </section>
  </main>
  
  <footer class="site-footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} ${SITE_CONFIG.title} · Powered by llm-wiki & Cloudflare Pages</p>
    </div>
  </footer>
  
  <script src="${SITE_CONFIG.baseUrl}js/main.js"></script>
</body>
</html>`;

  const categoryPath = path.join(OUTPUT_DIR, 'wiki', 
    category === '实体' ? 'entities' : 
    category === '主题' ? 'topics' : 
    category === '素材' ? 'sources' : 
    category === '对比' ? 'comparisons' : 'synthesis', 'index.html');
  
  ensureDir(path.dirname(categoryPath));
  fs.writeFileSync(categoryPath, content, 'utf8');
  console.log(`  ✓ wiki/${path.dirname(path.relative(OUTPUT_DIR, categoryPath))}/index.html`);
}

// 生成 CSS
function generateCSS() {
  return `/* 知识库站点样式 */

:root {
  --primary-color: #2563eb;
  --text-color: #1f2937;
  --bg-color: #ffffff;
  --bg-secondary: #f9fafb;
  --border-color: #e5e7eb;
  --code-bg: #f3f4f6;
  --link-color: #2563eb;
  --link-hover: #1d4ed8;
  --wiki-link: #059669;
  --wiki-link-missing: #d97706;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--text-color);
  background: var(--bg-color);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部导航 */
.site-header {
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.site-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.header-nav a {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.header-nav a:hover,
.header-nav a.active {
  color: var(--primary-color);
}

.search-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* 首页 Hero */
.hero {
  text-align: center;
  padding: 4rem 0 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.description {
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

/* 统计卡片 */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 分类区块 */
.category-section {
  margin: 3rem 0;
}

.category-section h2 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.page-list {
  list-style: none;
}

.page-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.page-list li a {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
}

.page-list li a:hover {
  text-decoration: underline;
}

.page-list .date {
  float: right;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 文章页面 */
.wiki-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.page-meta {
  color: #6b7280;
  font-size: 0.875rem;
}

.page-meta .category {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.page-content {
  line-height: 1.8;
}

.page-content h1,
.page-content h2,
.page-content h3 {
  margin: 2rem 0 1rem;
}

.page-content h1 { font-size: 1.75rem; }
.page-content h2 { font-size: 1.5rem; }
.page-content h3 { font-size: 1.25rem; }

.page-content p {
  margin: 1rem 0;
}

.page-content a {
  color: var(--link-color);
  text-decoration: none;
}

.page-content a:hover {
  text-decoration: underline;
}

.page-content code {
  background: var(--code-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.875em;
}

.page-content pre {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.page-content pre code {
  background: none;
  padding: 0;
}

.page-content blockquote {
  border-left: 4px solid var(--primary-color);
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  background: var(--bg-secondary);
  border-radius: 0 8px 8px 0;
}

.page-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.page-content th,
.page-content td {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  text-align: left;
}

.page-content th {
  background: var(--bg-secondary);
  font-weight: 600;
}

.page-content ul,
.page-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.page-content li {
  margin: 0.5rem 0;
}

/* Wiki 双向链接 */
.wiki-link {
  color: var(--wiki-link);
  text-decoration: none;
  border-bottom: 1px dashed var(--wiki-link);
}

.wiki-link:hover {
  color: var(--wiki-link);
  border-bottom-style: solid;
}

.wiki-link-missing {
  color: var(--wiki-link-missing);
  border-bottom: 1px dashed var(--wiki-link-missing);
  cursor: help;
}

/* 页脚 */
.page-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.back-links h3 {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
}

.backlinks-desc {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.backlinks-list {
  list-style: none;
}

.backlinks-list li {
  padding: 0.75rem;
  margin: 0.5rem 0;
  background: var(--bg-secondary);
  border-radius: 6px;
  border-left: 3px solid var(--wiki-link);
}

.backlinks-list li a {
  color: var(--wiki-link);
  text-decoration: none;
  font-weight: 500;
}

.backlinks-list li a:hover {
  text-decoration: underline;
}

.backlinks-list .no-backlinks {
  color: #9ca3af;
  font-style: italic;
  padding: 1rem;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.page-meta .backlinks-count {
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.source-link {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.source-link a {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.source-link a:hover {
  text-decoration: underline;
  color: var(--primary-color);
}

/* 搜索 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  padding: 2rem;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.search-box button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.search-results {
  max-width: 600px;
  margin: 1rem auto;
  background: white;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.search-result-item a {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
}

/* 页脚 */
.site-footer {
  background: var(--bg-secondary);
  padding: 2rem 0;
  margin-top: 4rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-nav {
    display: none;
  }
  
  .menu-toggle {
    display: block;
  }
  
  .hero h1 {
    font-size: 1.75rem;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mermaid 图表 */
.mermaid {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
}
`;
}

// 生成 JavaScript
function generateJS() {
  return `// 知识库站点主脚本

// 切换菜单
function toggleMenu() {
  const nav = document.querySelector('.header-nav');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

// 切换搜索
function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
  if (overlay.style.display === 'block') {
    document.getElementById('searchInput').focus();
  }
}

// 搜索 wiki
function searchWiki(query) {
  const results = document.getElementById('searchResults');
  if (!query || !window.wikiIndex) {
    results.innerHTML = '';
    return;
  }
  
  const filtered = window.wikiIndex.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
  
  results.innerHTML = filtered.map(item => \`
    <div class="search-result-item">
      <a href="/wiki/\${item.path}">\${item.title}</a>
      <span class="category">\${item.category}</span>
    </div>
  \`).join('');
}

// 计算反向链接
function calculateBackLinks() {
  const backLinks = document.getElementById('backLinks');
  if (!backLinks || !window.wikiIndex) return;
  
  const currentPage = window.location.pathname;
  const linkingPages = window.wikiIndex.filter(item => {
    // 检查页面内容是否链接到当前页
    return false; // 简化版，实际需要在构建时计算
  });
  
  if (linkingPages.length === 0) {
    backLinks.innerHTML = '<li>暂无反向链接</li>';
  } else {
    backLinks.innerHTML = linkingPages.map(item => 
      \`<li><a href="/wiki/\${item.path}">\${item.title}</a></li>\`
    ).join('');
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  calculateBackLinks();
});
`;
}

// ==================== 主函数 ====================

function main() {
  console.log('🚀 开始构建静态站点...\n');
  
  // 确保输出目录存在（不清理，避免文件锁定问题）
  ensureDir(OUTPUT_DIR);
  console.log('✓ 准备输出目录\n');
  
  // 配置 marked
  console.log('📝 配置 Markdown 解析器...');
  configureMarked();
  
  // 构建 wiki 索引
  console.log('\n📚 构建 wiki 索引...');
  const wikiIndex = buildWikiIndex();
  console.log(`   找到 ${Object.keys(wikiIndex).length} 个 wiki 页面\n`);
  
  // 构建反向链接索引
  console.log('🔗 构建反向链接索引...');
  const backlinks = buildBacklinksIndex(wikiIndex);
  const totalBacklinks = Object.values(backlinks).reduce((sum, links) => sum + links.length, 0);
  console.log(`   共 ${totalBacklinks} 个反向链接\n`);
  
  // 生成所有 wiki 页面
  console.log('🔄 生成 wiki 页面...');
  const results = [];
  Object.keys(wikiIndex).forEach(filePath => {
    const result = generatePage(filePath, wikiIndex, backlinks);
    const backlinkCount = backlinks[filePath] ? backlinks[filePath].length : 0;
    console.log(`   ✓ ${result.category}/${result.title} (${backlinkCount} 个反向链接)`);
    results.push(result);
  });
  console.log(`\n   共生成 ${results.length} 个页面\n`);
  
  // 生成分类索引
  console.log('📑 生成分类索引...');
  const categories = {};
  results.forEach(r => {
    if (!categories[r.category]) categories[r.category] = [];
    categories[r.category].push(wikiIndex[r.path]);
  });
  
  Object.entries(categories).forEach(([category, items]) => {
    generateCategoryIndex(category, items, wikiIndex);
  });
  console.log('');
  
  // 生成首页
  console.log('🏠 生成首页...');
  generateIndexPage(wikiIndex);
  console.log('');
  
  // 复制静态资源
  console.log('📦 复制静态资源...');
  copyAssets();
  console.log('');
  
  console.log('✅ 构建完成！');
  console.log(`   输出目录: ${OUTPUT_DIR}`);
  console.log(`   页面总数: ${results.length + 1 + Object.keys(categories).length}`);
  console.log('\n📖 预览站点:');
  console.log(`   使用 VS Code Live Server 或 npx serve ${OUTPUT_DIR}`);
  console.log('\n🚀 推送到 GitHub:');
  console.log('   git add docs/');
  console.log('   git commit -m "build: generate static site"');
  console.log('   git push');
}

// 运行主函数
main();
