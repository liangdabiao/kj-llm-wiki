// 知识库站点主脚本

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
  
  results.innerHTML = filtered.map(item => `
    <div class="search-result-item">
      <a href="/wiki/${item.path}">${item.title}</a>
      <span class="category">${item.category}</span>
    </div>
  `).join('');
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
      `<li><a href="/wiki/${item.path}">${item.title}</a></li>`
    ).join('');
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  calculateBackLinks();
});
