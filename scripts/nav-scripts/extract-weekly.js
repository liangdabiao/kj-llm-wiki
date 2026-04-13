/**
 * extract-weekly.js
 * 从阮一峰科技爱好者周刊 markdown 文件中提取条目
 *
 * 提取区域: 科技动态、文章、工具
 */
const fs = require('fs');
const path = require('path');

const WEEKLY_DIR = process.argv[2] || path.join(__dirname, '..', '..', 'raw', 'weekly');
const OUTPUT = path.join(__dirname, '..', 'raw', 'weekly-extracted.json');

function main() {
  console.log('=== 阮一峰周刊条目提取 ===\n');

  // 1. 读取所有周刊文件
  const files = fs.readdirSync(WEEKLY_DIR)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

  console.log(`找到 ${files.length} 个周刊文件`);

  // 2. 解析每个文件
  const allEntries = [];
  let fileErrors = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(WEEKLY_DIR, file), 'utf8');
      const entries = extractFromWeekly(content, file);
      allEntries.push(...entries);
    } catch (e) {
      fileErrors++;
    }
  }

  // 3. 去重（按 url）
  const seen = new Set();
  const unique = allEntries.filter(e => {
    const key = e.url || e.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n提取: ${allEntries.length} 条`);
  console.log(`去重: ${unique.length} 条`);
  console.log(`文件错误: ${fileErrors}`);

  // 按来源区域统计
  const bySection = {};
  for (const e of unique) {
    bySection[e.section] = (bySection[e.section] || 0) + 1;
  }
  console.log('\n按区域分布:');
  for (const [k, v] of Object.entries(bySection).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  // 按期数范围
  const issues = unique.map(e => e.issue).filter(Boolean);
  console.log(`\n期数范围: ${Math.min(...issues)} - ${Math.max(...issues)}`);

  fs.writeFileSync(OUTPUT, JSON.stringify(unique, null, 2), 'utf8');
  console.log(`\n已写入: ${OUTPUT}`);

  // 示例
  console.log('\n前 5 条:');
  unique.slice(0, 5).forEach((e, i) => {
    console.log(`  ${i + 1}. [${e.section}] ${e.title}`);
    console.log(`     ${e.description?.substring(0, 60)}...`);
    console.log(`     🔗 ${e.url?.substring(0, 60)}`);
  });
}

function extractFromWeekly(content, filename) {
  const entries = [];

  // 解析 frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let issue = 0;
  let sourceUrl = '';
  if (fmMatch) {
    const fm = fmMatch[1];
    const issueMatch = fm.match(/issue:\s*(\d+)/);
    const urlMatch = fm.match(/url:\s*["']?(.+?)["']?\s*$/m);
    if (issueMatch) issue = parseInt(issueMatch[1]);
    if (urlMatch) sourceUrl = urlMatch[1].trim();
  }

  // 去掉 frontmatter
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');

  // 提取科技动态条目
  // 格式: 数字、[标题](url) 后跟描述文字
  // 或: 数字、**标题** 后跟描述
  extractSection(body, '科技动态', issue, sourceUrl, filename, entries);
  extractSection(body, '文章', issue, sourceUrl, filename, entries);
  extractSection(body, '工具', issue, sourceUrl, filename, entries);

  return entries;
}

function extractSection(body, sectionName, issue, sourceUrl, filename, entries) {
  // 找到 section
  const sectionRegex = new RegExp(`^##\\s+${sectionName}`, 'm');
  const match = sectionRegex.exec(body);
  if (!match) return;

  // 获取 section 内容（到下一个 ## 或文件结尾）
  const afterSection = body.substring(match.index + match[0].length);
  const nextSection = afterSection.search(/^##\s+/m);
  const sectionContent = nextSection > -1 ? afterSection.substring(0, nextSection) : afterSection;

  // 提取条目
  // 模式1: 数字、[标题](url)（可选语言标注）
  // 模式2: 数字、**粗体标题**
  const itemRegex = /^\d+[、,.]\s*?(?:\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/gm;

  let itemMatch;
  while ((itemMatch = itemRegex.exec(sectionContent)) !== null) {
    const title = itemMatch[1] || itemMatch[3] || '';
    const url = itemMatch[2] || '';

    if (!title) continue;

    // 获取描述（条目标题后到下一个条目或图片前的文字）
    const afterTitle = sectionContent.substring(itemMatch.index + itemMatch[0].length);
    const descEnd = afterTitle.search(/^\d+[、,.]\s/m);
    const descBlock = descEnd > -1 ? afterTitle.substring(0, descEnd) : afterTitle;

    // 清理描述：去掉图片、空行
    let desc = descBlock
      .replace(/!\[.*?\]\(.*?\)/g, '') // 去掉图片
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接只保留文字
      .replace(/\n{2,}/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 10) // 过滤短行
      .join(' ')
      .trim();

    if (desc.length > 300) desc = desc.substring(0, 300) + '...';

    entries.push({
      token: 'weekly-' + issue + '-' + entries.length,
      title: title.trim(),
      description: desc,
      url: url || sourceUrl || '',
      doc_type: 'weekly',
      date: issue > 0 ? `周刊第${issue}期` : '',
      source: 'ruanyifeng-weekly',
      section: sectionName,
      issue,
    });
  }
}

main();
