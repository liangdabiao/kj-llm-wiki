/**
 * crawl-aibot.js
 * 从 ai-bot.cn/daily-ai-news/ 提取每日 AI 新闻
 *
 * 正确的链接结构:
 *   h2 > a[href] = 新闻原始来源链接（微信、官网等）
 *   p > a[href] = ai-bot.cn 自己的工具详情页（不取）
 */
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'raw', 'aibot-daily.json');
const URL = 'https://ai-bot.cn/daily-ai-news/';

async function main() {
  console.log('=== 爬取 ai-bot.cn 每日 AI 新闻 ===\n');

  const resp = await fetch(URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();
  console.log(`HTML 大小: ${(html.length / 1024).toFixed(0)} KB`);

  const mainMatch = html.match(/<main[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) { console.error('找不到 main'); process.exit(1); }
  const main = mainMatch[1];

  const entries = [];
  // h2 > a[href] = 新闻链接, h2纯文本 = 标题
  // p.text-muted = 描述
  const re = /<h2[^>]*>(?:<a[^>]*href="([^"]*)"[^>]*>)?([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)<\/a><\/h2>\s*<p[^>]*class="[^"]*text-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;

  let match;
  while ((match = re.exec(main)) !== null) {
    const url = match[1] || '';        // h2 里的链接 = 新闻源
    const titleRaw = match[2];         // h2 的 HTML 内容
    const descRaw = match[3];          // p 的 HTML 内容

    const title = cleanHTML(titleRaw).trim();
    const desc = cleanHTML(descRaw).trim();

    if (!title || title.length < 3) continue;
    if (title === '69 条评论' || title.startsWith('发表评论')) continue;

    // 描述去掉末尾的 "来源：xxx"
    let cleanDesc = desc.replace(/\s*来源[：:]\s*\S+\s*$/, '').trim();
    if (cleanDesc.length > 300) cleanDesc = cleanDesc.substring(0, 300) + '...';

    entries.push({
      title,
      description: cleanDesc,
      url: url || '',
      source: 'ai-bot.cn',
    });
  }

  // 去重
  const seen = new Set();
  const unique = entries.filter(e => {
    if (seen.has(e.title)) return false;
    seen.add(e.title);
    return true;
  });

  console.log(`提取: ${entries.length} 条`);
  console.log(`去重: ${unique.length} 条`);
  console.log(`有外链: ${unique.filter(e => e.url && !e.url.includes('ai-bot.cn')).length} 条`);
  console.log(`无链接: ${unique.filter(e => !e.url).length} 条`);

  fs.writeFileSync(OUTPUT, JSON.stringify(unique, null, 2), 'utf8');
  console.log(`\n已写入: ${OUTPUT}`);

  console.log('\n前 5 条:');
  unique.slice(0, 5).forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.title}`);
    console.log(`     ${e.description.substring(0, 60)}...`);
    console.log(`     url: ${e.url || '(无)'}`);
  });
}

function cleanHTML(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

main().catch(err => { console.error(err); process.exit(1); });
