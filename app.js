let favorites = [];
let recent = [];
let codeState = { html: "", css: "", js: "" };
const FAV_KEY = "arcade:favorites";
const FAV_COOKIE = "arcade:favorites";
const RECENT_KEY = "arcade:recent-games";
const CODE_KEY = "arcade:code-editor";
const THEME_KEY = "arcade:theme";
const DEFAULT_CODE = {
  html: '<div class="card">\n  <h1>Hello, World! 👋</h1>\n  <p>Edit the HTML, CSS, and JS panels to see live changes.</p>\n  <button id="btn">Click me</button>\n</div>\n',
  css: '* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  background: linear-gradient(135deg, #0f172a, #1e293b);\n  color: #e2e8f0;\n}\n\n.card {\n  text-align: center;\n  padding: 2.5rem 3rem;\n  border-radius: 1rem;\n  background: rgba(30, 41, 59, 0.6);\n  border: 1px solid rgba(148, 163, 184, 0.15);\n  backdrop-filter: blur(8px);\n  box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.5);\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.75rem;\n}\n\np {\n  margin: 0 0 1.5rem;\n  color: #94a3b8;\n}\n\nbutton {\n  padding: 0.6rem 1.5rem;\n  border: none;\n  border-radius: 0.5rem;\n  font-size: 0.95rem;\n  font-weight: 600;\n  color: white;\n  background: linear-gradient(135deg, #10b981, #14b8a6);\n  cursor: pointer;\n  transition: transform 0.15s ease, box-shadow 0.15s ease;\n}\n\nbutton:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 8px 24px -8px rgba(16, 185, 129, 0.6);\n}\n\nbutton:active {\n  transform: translateY(0);\n}\n',
  js: 'const btn = document.getElementById(\'btn\');\nlet count = 0;\n\nbtn.addEventListener(\'click\', () => {\n  count++;\n  btn.textContent = \'Clicked \' + count + \' times\';\n});\n'
};

// Fix for relative paths breaking on subpages
function resolvePath(path) {
  if (!path) return path;
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path;
  return '/' + path;
}

function getCookie(name) { const m = document.cookie.split("; ").find(r => r.startsWith(name + "=")); return m ? decodeURIComponent(m.split("=").slice(1).join("=")) : null; }
function setCookie(name, value, maxAgeDays) { document.cookie = name + "=" + encodeURIComponent(value) + "; max-age=" + (maxAgeDays * 86400) + "; path=/; SameSite=Lax"; }

function loadFavorites() {
  try { const r = localStorage.getItem(FAV_KEY); if(r) { const p = JSON.parse(r); if(Array.isArray(p)) return p.filter(v => typeof v === "string"); } } catch {}
  const r = getCookie(FAV_KEY); if(r) { try { const p = JSON.parse(r); if(Array.isArray(p)) return p.filter(v => typeof v === "string"); } catch {} }
  return [];
}
function saveFavorites() { try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch {} }
function isFavorite(id) { return favorites.includes(id); }
function toggleFavorite(id) {
  if (favorites.includes(id)) favorites = favorites.filter(x => x !== id);
  else favorites.push(id);
  saveFavorites();
  updateFavCount();
  if (typeof renderCurrentView === 'function') renderCurrentView();
  if (typeof updateFavBtn === 'function') updateFavBtn();
}
function updateFavCount() {
  const el = document.getElementById("fav-count");
  if (!el) return;
  if (favorites.length > 0) { el.textContent = favorites.length; el.classList.remove("hidden"); } else el.classList.add("hidden");
}

function loadRecent() { try { const r = localStorage.getItem(RECENT_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function saveRecent() { try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch {} }
function addRecent(game) { recent = [game, ...recent.filter(g => g.id !== game.id)].slice(0, 8); saveRecent(); }

function getGameById(id) { return GAMES.find(g => g.id === id) || APPS.find(a => a.id === id); }
function escapeHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function navigate(path) { window.location.href = path; }
function setTitle(prefix) { document.title = (prefix && prefix.trim() !== "") ? prefix + (SITE.titleSuffix || "") : SITE.name; }

function searchGames(query, category) {
  const q = query.trim().toLowerCase();
  return GAMES.filter(g => {
    const mc = category === "All" || g.genre === category;
    const mq = !q || g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q);
    return mc && mq;
  });
}

function renderHeader(pathname) {
  document.querySelectorAll(".nav-btn").forEach(b => {
    const route = b.dataset.route;
    let isActive = false;
    if (route === './' && (pathname === './' || pathname === '/' || pathname === '' || pathname === 'index.html')) isActive = true;
    else if (route === pathname) isActive = true;
    b.classList.toggle("active", isActive);
  });
}

function renderCard(item, type) {
  const fav = isFavorite(item.id);
  const playPath = type === 'app' ? `game?type=app&id=${item.id}` : `game?id=${item.id}`;
  return `<div class="game-card">
    <button class="card-thumb" onclick="navigate('${playPath}')" aria-label="Play ${escapeHtml(item.name)}">
      <img src="${resolvePath(item.thumbnail)}" alt="${escapeHtml(item.name)} thumbnail" loading="lazy" onerror="this.style.display='none'; this.parentNode.classList.add('img-failed')">
      ${item.genre ? `<span class="card-genre">${escapeHtml(item.genre)}</span>` : ''}
      <div class="card-play"><span>Open</span></div>
    </button>
    <button class="fav-btn ${fav ? "active" : ""}" onclick="event.stopPropagation();toggleFavorite('${item.id}')" aria-label="Favorite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${fav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </button>
    <div class="card-body">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <button class="btn btn-sm btn-ghost card-more-btn" onclick="toggleCardBio(this)">More</button>
    </div>
  </div>`;
}

function toggleCardBio(btn) {
  const card = btn.closest('.game-card');
  card.classList.toggle('bio-expanded');
  btn.textContent = card.classList.contains('bio-expanded') ? 'Collapse' : 'More';
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) document.documentElement.setAttribute("data-theme", saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (!icon) return;
  if (theme === "dark") {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  } else {
    // Fix: Added fill="currentColor" so the moon icon is visible
    icon.innerHTML = '<path fill="currentColor" stroke="none" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}

var FALLBACK_LOGO_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/></svg>';
var FALLBACK_FOOTER_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/></svg>';

function applySiteConfig() {
  setTitle("");
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", SITE.tagline);
  let f = document.querySelector("link[rel='icon']");
  if (!f) { f = document.createElement('link'); f.rel = 'icon'; document.head.appendChild(f); }
  if (SITE.favicon && SITE.favicon.trim() !== "") f.href = resolvePath(SITE.favicon);
  
  const logoBtn = document.getElementById("logo-btn");
  if (logoBtn) logoBtn.setAttribute("aria-label", SITE.name + " home");
  const logoText = document.getElementById("logo-text");
  if (logoText) logoText.textContent = SITE.name;
  const logoBadge = document.getElementById("logo-badge");
  if (logoBadge) {
    if (SITE.logo && SITE.logo.trim() !== "") logoBadge.innerHTML = `<img src="${resolvePath(SITE.logo)}" alt="${escapeHtml(SITE.name)} logo" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.innerHTML=window.FALLBACK_LOGO_SVG">`;
    else logoBadge.innerHTML = FALLBACK_LOGO_SVG;
  }
  
  const fName = document.getElementById("footer-name");
  if (fName) fName.textContent = SITE.name;
  const fTag = document.getElementById("footer-tagline");
  if (fTag) fTag.textContent = SITE.tagline;
  const fCopy = document.getElementById("footer-copy-name");
  if (fCopy) fCopy.textContent = SITE.name;
  const fBadge = document.getElementById("footer-badge");
  if (fBadge) {
    if (SITE.logo && SITE.logo.trim() !== "") fBadge.innerHTML = `<img src="${resolvePath(SITE.logo)}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.innerHTML=window.FALLBACK_FOOTER_SVG">`;
    else fBadge.innerHTML = FALLBACK_FOOTER_SVG;
  }
}

function initBase(pathname) {
  document.getElementById("year").textContent = new Date().getFullYear();
  applySiteConfig();
  loadTheme();
  const saved = localStorage.getItem(THEME_KEY);
  updateThemeIcon(saved || "dark");
  favorites = loadFavorites();
  recent = loadRecent();
  updateFavCount();
  renderHeader(pathname);
}
