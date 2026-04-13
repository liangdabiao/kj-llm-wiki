/**
 * build-site.js
 * 从 tools_deduped.json 生成单文件 HTML 静态导航网站
 */
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'tools_deduped.json');
const OUTPUT = path.join(__dirname, '..', 'docs', 'index.html');

function normalizeCategory(name) {
  return name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
}

function generateCSS() {
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --bg-card-hover: #263348;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent: #f59e0b;
  --accent-dim: rgba(245, 158, 11, 0.15);
  --border-color: #334155;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --max-width: 1400px;
  --header-height: 64px;
}

html { scroll-behavior: smooth; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

a { color: var(--accent); text-decoration: none; transition: color 0.2s; }
a:hover { color: #fbbf24; }

/* ===== Header ===== */
.header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  height: var(--header-height);
}

.header-inner {
  max-width: var(--max-width); margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; height: 100%;
}

.header-left { display: flex; align-items: center; gap: 16px; }

.site-title {
  font-size: 1.25rem; font-weight: 700; white-space: nowrap;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.site-subtitle { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }

.search-box {
  flex: 1; max-width: 400px; margin-left: 24px;
}
.search-box input {
  width: 100%; padding: 8px 16px;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); color: var(--text-primary);
  font-size: 0.9rem; outline: none; transition: border-color 0.2s;
}
.search-box input::placeholder { color: var(--text-muted); }
.search-box input:focus { border-color: var(--accent); }

.stats { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }

.mobile-menu-btn {
  display: none; background: none; border: none;
  color: var(--text-primary); font-size: 1.5rem; cursor: pointer;
  padding: 4px 8px;
}

/* ===== Navigation ===== */
.nav-bar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.nav-inner {
  max-width: var(--max-width); margin: 0 auto;
  display: flex; align-items: center; gap: 4px;
  padding: 8px 24px;
  flex-wrap: wrap;
}

.nav-item {
  padding: 6px 14px; border-radius: var(--radius-sm);
  font-size: 0.82rem; color: var(--text-secondary);
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
  user-select: none; border: 1px solid transparent;
}
.nav-item:hover { color: var(--text-primary); background: var(--bg-card-hover); }
.nav-item.active {
  color: var(--accent); background: var(--accent-dim);
  border-color: rgba(245, 158, 11, 0.3); font-weight: 600;
}

.nav-close-btn {
  display: none; background: none; border: none;
  color: var(--text-primary); font-size: 2rem;
  cursor: pointer; padding: 16px 20px; text-align: right;
  width: 100%; box-sizing: border-box;
}

.nav-overlay {
  display: none; position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 199;
}
.nav-overlay.open { display: block; }

/* ===== Main Content ===== */
.main-content {
  max-width: var(--max-width); margin: 0 auto;
  padding: 24px;
}

.result-info {
  font-size: 0.85rem; color: var(--text-muted);
  margin-bottom: 20px; padding: 12px 16px;
  background: var(--bg-secondary); border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

.category-section { margin-bottom: 40px; }
.category-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px; padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}
.category-icon { font-size: 1.4rem; }
.category-name { font-size: 1.15rem; font-weight: 700; }
.category-count {
  font-size: 0.75rem; color: var(--text-muted);
  background: var(--bg-secondary); padding: 2px 10px;
  border-radius: 10px;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.plugin-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 20px;
  transition: all 0.2s; cursor: default;
  display: flex; flex-direction: column; gap: 10px;
}
.plugin-card:hover {
  border-color: rgba(245, 158, 11, 0.4);
  background: var(--bg-card-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.card-top { display: flex; align-items: flex-start; gap: 12px; }

.card-icon {
  width: 42px; height: 42px; border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent), #ef4444);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 1.1rem; font-weight: 700;
  flex-shrink: 0;
}

.card-title { flex: 1; }
.card-title a {
  font-size: 0.95rem; font-weight: 600; color: var(--text-primary);
  line-height: 1.4; transition: color 0.2s;
}
.card-title a:hover { color: var(--accent); }

.card-desc {
  font-size: 0.85rem; color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; overflow: hidden;
}

.card-meta {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-top: 4px;
}

.card-tag {
  font-size: 0.72rem; color: var(--text-muted);
  background: rgba(100, 116, 139, 0.15); padding: 2px 8px;
  border-radius: 4px;
}

.card-date {
  font-size: 0.72rem; color: var(--text-muted); margin-left: auto;
}

.hidden { display: none !important; }

/* ===== Empty State ===== */
.empty-state {
  text-align: center; padding: 80px 20px;
  color: var(--text-muted);
}
.empty-state .icon { font-size: 3rem; margin-bottom: 16px; }
.empty-state .text { font-size: 1.1rem; }

/* ===== Footer ===== */
.footer {
  text-align: center; padding: 40px 24px;
  color: var(--text-muted); font-size: 0.8rem;
  border-top: 1px solid var(--border-color); margin-top: 40px;
}
.footer a { color: var(--accent); }

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .header-inner { padding: 0 16px; gap: 12px; }
  .site-subtitle { display: none; }
  .search-box { max-width: none; margin-left: 0; order: 3; width: 100%; }
  .header-left { flex: 1; }
  .header-inner { flex-wrap: wrap; height: auto; padding: 12px 16px; gap: 8px; }
  .stats { display: none; }
  .mobile-menu-btn { display: block; }

  .nav-bar {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.98); z-index: 200;
    transform: translateX(100%); transition: transform 0.3s ease;
    overflow-y: auto; overflow-x: hidden;
  }
  .nav-bar.open { transform: translateX(0); }

  .nav-close-btn { display: block; }
  .nav-inner { flex-direction: column; padding: 0 20px 20px; gap: 0; }
  .nav-item { padding: 12px 16px; font-size: 0.95rem; border-radius: var(--radius-sm); }

  .main-content { padding: 16px; }
  .plugin-grid { grid-template-columns: 1fr !important; }
  .plugin-card { padding: 16px; }
}

@media (max-width: 480px) {
  .main-content { padding: 12px; }
  .card-desc { -webkit-line-clamp: 2; }
}
  `;
}

function generateCardHTML(entry) {
  const initial = (entry.title || '?').charAt(0);
  const desc = entry.description || '';
  const truncatedDesc = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
  const date = entry.date || '';
  const tags = (entry.tags || []).slice(0, 3);
  const catSlug = entry.category_slug || normalizeCategory(entry.category || '');

  return `
    <div class="plugin-card" data-name="${escAttr(entry.title)}" data-desc="${escAttr(desc)}" data-categories="${escAttr(tags.join(','))}">
      <div class="card-top">
        <div class="card-icon">${initial}</div>
        <div class="card-title">
          <a href="${escAttr(entry.url)}" target="_blank" rel="noopener">${escHTML(entry.title)}</a>
        </div>
      </div>
      ${truncatedDesc ? `<div class="card-desc">${escHTML(truncatedDesc)}</div>` : ''}
      <div class="card-meta">
        ${date ? `<span class="card-date">${escHTML(date)}</span>` : ''}
        ${tags.map(t => `<span class="card-tag">${escHTML(t)}</span>`).join('')}
      </div>
    </div>
  `;
}

function generateJS(data) {
  const categoryNames = [...new Set(data.entries.map(e => e.category))].filter(Boolean);

  return `
const allSections = document.querySelectorAll('.category-section');
const allCards = document.querySelectorAll('.plugin-card');
const navItems = document.querySelectorAll('.nav-item[data-filter]');
const searchInput = document.getElementById('search-input');
const resultInfo = document.getElementById('result-info');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navBar = document.getElementById('nav-bar');
const navOverlay = document.getElementById('nav-overlay');
const navCloseBtn = document.getElementById('nav-close-btn');

let currentFilter = 'all';

// Category filter
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const filter = item.dataset.filter;
    currentFilter = filter;

    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    filterSections(filter);
    performSearch();

    // Close mobile menu
    navBar.classList.remove('open');
    navOverlay.classList.remove('open');
  });
});

function filterSections(filter) {
  allSections.forEach(section => {
    if (filter === 'all' || section.dataset.category === filter) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });
}

// Search
function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

searchInput.addEventListener('input', debounce(performSearch, 200));

function performSearch() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  allSections.forEach(section => {
    if (section.classList.contains('hidden')) return;

    const cards = section.querySelectorAll('.plugin-card');
    let sectionHasMatch = false;

    cards.forEach(card => {
      if (!query) {
        card.classList.remove('hidden');
        sectionHasMatch = true;
        return;
      }
      const name = (card.dataset.name || '').toLowerCase();
      const desc = (card.dataset.desc || '').toLowerCase();
      const cats = (card.dataset.categories || '').toLowerCase();
      const match = name.includes(query) || desc.includes(query) || cats.includes(query);
      card.classList.toggle('hidden', !match);
      if (match) sectionHasMatch = true;
    });

    section.classList.toggle('hidden', !sectionHasMatch);
    if (sectionHasMatch) {
      visibleCount += section.querySelectorAll('.plugin-card:not(.hidden)').length;
    }
  });

  updateResultInfo(query, visibleCount);
}

function updateResultInfo(query, count) {
  const total = ${data.entries.length};
  if (query) {
    resultInfo.textContent = '搜索 "' + query + '" 找到 ' + count + ' 条结果（共 ' + total + ' 条）';
    resultInfo.classList.remove('hidden');
  } else {
    resultInfo.textContent = '共收录 ' + total + ' 篇优质内容';
    resultInfo.classList.remove('hidden');
  }
}

// Mobile menu
mobileMenuBtn.addEventListener('click', () => {
  navBar.classList.toggle('open');
  navOverlay.classList.toggle('open');
});

navCloseBtn.addEventListener('click', () => {
  navBar.classList.remove('open');
  navOverlay.classList.remove('open');
});

navOverlay.addEventListener('click', () => {
  navBar.classList.remove('open');
  navOverlay.classList.remove('open');
});

// Initial
updateResultInfo('', ${data.entries.length});
performSearch();
  `;
}

function escHTML(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function main() {
  const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const entries = data.entries || [];

  console.log(`构建导航站: ${entries.length} 条目`);

  // Group by category
  const grouped = {};
  for (const entry of entries) {
    const cat = entry.category || '未分类';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  // Sort categories by count (descending)
  const sortedCategories = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

  // Build nav items
  const allCount = entries.length;
  const navItemsHTML = `
    <div class="nav-item active" data-filter="all">全部 (${allCount})</div>
    ${sortedCategories.map(([name, items]) => {
      const slug = items[0]?.category_slug || normalizeCategory(name);
      const icon = items[0]?.category_icon || '';
      return `<div class="nav-item" data-filter="${slug}">${icon} ${escHTML(name)} (${items.length})</div>`;
    }).join('')}
  `;

  // Build sections
  const sectionsHTML = sortedCategories.map(([name, items]) => {
    const slug = items[0]?.category_slug || normalizeCategory(name);
    const icon = items[0]?.category_icon || '';
    const cardsHTML = items.map(entry => generateCardHTML(entry)).join('\n');
    return `
      <div class="category-section" data-category="${slug}">
        <div class="category-header">
          <span class="category-icon">${icon}</span>
          <span class="category-name">${escHTML(name)}</span>
          <span class="category-count">${items.length} 篇</span>
        </div>
        <div class="plugin-grid">
          ${cardsHTML}
        </div>
      </div>
    `;
  }).join('\n');

  // Assemble full HTML
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>大湾区人工智能导航 - ${allCount} 篇优质 AI 内容</title>
<meta name="description" content="WaytoAGI 知识库精选内容导航，涵盖 AI 编程、Agent、大模型、AI 视频、AI 绘画等领域，共 ${allCount} 篇优质内容。">
<style>${generateCSS()}</style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <div class="header-left">
      <span class="site-title">大湾区人工智能导航</span>
      <span class="site-subtitle">通往人工智能未来的知识导航</span>
    </div>
    <div class="search-box">
      <input type="text" id="search-input" placeholder="搜索文章标题、描述、分类...">
    </div>
    <span class="stats">${allCount} 篇内容 / ${sortedCategories.length} 个分类</span>
    <button class="mobile-menu-btn" id="mobile-menu-btn">&#9776;</button>
  </div>
</header>

<nav class="nav-bar" id="nav-bar">
  <button class="nav-close-btn" id="nav-close-btn">&times;</button>
  <div class="nav-inner">
    ${navItemsHTML}
  </div>
</nav>
<div class="nav-overlay" id="nav-overlay"></div>

<main class="main-content">
  <div class="result-info" id="result-info">共收录 ${allCount} 篇优质内容</div>
  ${sectionsHTML}
</main>

<footer class="footer">
  <p>数据来源: <a href="https://waytoagi.feishu.cn/wiki/FjiOwWp2giA7hRk6jjfcPioCnAc" target="_blank" rel="noopener">WaytoAGI 飞书知识库</a></p>
  <p>由 llm-wiki-skill 自动生成 | 共 ${allCount} 篇内容，${sortedCategories.length} 个分类</p>
</footer>

<script>${generateJS(data)}</script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT, html, 'utf8');
  console.log(`已生成: ${OUTPUT}`);
  console.log(`文件大小: ${(html.length / 1024).toFixed(0)} KB`);
}

main();
