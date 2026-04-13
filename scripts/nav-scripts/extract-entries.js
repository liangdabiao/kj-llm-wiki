/**
 * extract-entries.js
 * 从飞书文档 JSON 输出中提取所有文章条目
 *
 * 输入: lark-cli docs +fetch 的原始 JSON 输出文件
 * 输出: tools_all.json - 包含所有提取的条目
 */

const fs = require('fs');
const path = require('path');

// 配置 - 支持多文件
const INPUT_FILES = process.argv[2]
  ? process.argv[2].split(',')
  : [
      path.join(__dirname, '..', 'raw', 'fetch-result.json'),
      path.join(__dirname, '..', 'raw', 'fetch-2024.json'),
      path.join(__dirname, '..', 'raw', 'fetch-2023.json'),
      path.join(__dirname, '..', 'raw', 'aibot-daily.json'),
      path.join(__dirname, '..', 'raw', 'weekly-extracted.json'),
    ];
const OUTPUT_FILE = path.join(__dirname, '..', 'tools_all.json');

function main() {
  console.log('=== WaytoAGI 条目提取 ===\n');

  // 1. 读取并合并多个原始 JSON
  const allEntries = [];

  for (const inputFile of INPUT_FILES) {
    if (!fs.existsSync(inputFile)) {
      console.warn(`跳过不存在的文件: ${inputFile}`);
      continue;
    }
    const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    // 检测格式：飞书 JSON vs aibot 纯数组
    if (Array.isArray(raw)) {
      // aibot 格式: [{title, description, url, source}]
      console.log(`[${path.basename(inputFile)}] aibot JSON 数组: ${raw.length} 条`);
      const entries = raw.map(item => ({
        token: 'aibot-' + Math.random().toString(36).substring(2, 10),
        title: item.title,
        description: item.description || '',
        url: item.url || '',
        doc_type: 'aibot',
        date: item.date || '',
        source: item.source || 'ai-bot.cn',
      }));
      console.log(`  提取条目: ${entries.length}`);
      allEntries.push(...entries);
    } else {
      // 飞书格式: {data: {markdown: ...}}
      const markdown = raw.data?.markdown || raw.markdown || '';
      console.log(`[${path.basename(inputFile)}] Markdown 长度: ${markdown.length} 字符`);
      const entries = extractFromMarkdown(markdown, path.basename(inputFile));
      console.log(`  提取条目: ${entries.length}`);
      allEntries.push(...entries);
    }
  }

  // 3. 去重（按 token，aibot 用标题去重）
  const seenTokens = new Set();
  const seenTitles = new Set();
  const unique = allEntries.filter(e => {
    if (e.token && !e.token.startsWith('aibot-')) {
      if (seenTokens.has(e.token)) return false;
      seenTokens.add(e.token);
    }
    // aibot 条目用标题去重（跨来源也去重）
    const titleKey = e.title.substring(0, 30);
    if (seenTitles.has(titleKey)) return false;
    seenTitles.add(titleKey);
    return true;
  });

  console.log(`\n合并去重: ${allEntries.length} → ${unique.length}`);
  console.log(`有描述: ${unique.filter(e => e.description).length}`);
  console.log(`无描述: ${unique.filter(e => !e.description).length}`);

  // 4. 写入输出
  const output = {
    project: 'WaytoAGI',
    source: '飞书更新日志 (2024+2025+2026)',
    extracted_at: new Date().toISOString(),
    total: unique.length,
    entries: unique
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n已写入: ${OUTPUT_FILE}`);

  // 5. 打印前 5 条示例
  console.log(`\n前 5 条示例:`);
  unique.slice(0, 5).forEach((e, i) => {
    console.log(`  ${i + 1}. [${e.date}] ${e.title}`);
    console.log(`     ${e.description.substring(0, 80)}...`);
  });
}

function extractFromMarkdown(markdown, source) {
  const entries = [];
  const lines = markdown.split('\n');
  let currentDate = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 跟踪日期（### 4 月 4 日 格式）
    const dateMatch = line.match(/^###\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (dateMatch) {
      currentDate = `${dateMatch[1]}月${dateMatch[2]}日`;
      continue;
    }

    // 跟踪年份月份（## 2026 年 4 月 格式）
    const yearMonthMatch = line.match(/^##\s*(\d{4})\s*年\s*(\d{1,2})\s*月/);
    if (yearMonthMatch) {
      currentDate = `${yearMonthMatch[1]}年${yearMonthMatch[2]}月`;
      continue;
    }

    // 跳过非条目行
    if (!line.startsWith('- ') && !line.startsWith('-《')) continue;

    // 提取 mention-doc
    const docMatch = line.match(/<mention-doc\s+token="([^"]+)"\s+type="([^"]+)">([^<]+)<\/mention-doc>/);
    if (!docMatch) continue;

    const token = docMatch[1];
    let title = docMatch[3].trim();
    const docType = docMatch[2];

    // 清理标题
    title = title.replace(/^《/, '').replace(/》$/, '').trim();

    // 提取描述：mention-doc 闭合标签之后到行尾的内容
    let desc = '';
    const afterDoc = line.split(/<\/mention-doc>/);
    if (afterDoc.length > 1) {
      desc = afterDoc.slice(1).join('</mention-doc>').trim();
      // 去掉开头的 》
      desc = desc.replace(/^》/, '').trim();
      // 去掉末尾的图片标签
      desc = desc.replace(/<image[^/]*\/>/g, '').trim();
    }

    // 构建链接（飞书 wiki 链接）
    const url = token.startsWith('http') ? token : `https://waytoagi.feishu.cn/wiki/${token}`;

    entries.push({
      token,
      title,
      description: desc,
      url,
      doc_type: docType,
      date: currentDate,
      source_line: i + 1
    });
  }

  return entries;
}

main();
