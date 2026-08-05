let favorites = [];
const FAV_KEY = "arcade:favorites";

function getCookie(name) { 
  const m = document.cookie.split("; ").find(r => r.startsWith(name + "=")); 
  return m ? decodeURIComponent(m.split("=").slice(1).join("=")) : null; 
}

function loadFavorites() {
  try { 
    const r = localStorage.getItem(FAV_KEY); 
    if(r) { 
      const p = JSON.parse(r); 
      if(Array.isArray(p)) return p.filter(v => typeof v === "string"); 
    } 
  } catch {}
  const r = getCookie(FAV_KEY); 
  if(r) { 
    try { 
      const p = JSON.parse(r); 
      if(Array.isArray(p)) return p.filter(v => typeof v === "string"); 
    } catch {} 
  }
  return [];
}

function saveFavorites() { 
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch {} 
}

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
  if (favorites.length > 0) { el.textContent = favorites.length; el.classList.remove("hidden"); } 
  else el.classList.add("hidden");
}

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
    if (route === 'index.html' && (pathname === 'index.html' || pathname === '/' || pathname === '')) isActive = true;
    else if (route === pathname) isActive = true;
    b.classList.toggle("active", isActive);
  });
}

function renderCard(item, type) {
  const fav = isFavorite(item.id);
  const playPath = type === 'app' ? `game.html?type=app&id=${item.id}` : `game.html?id=${item.id}`;
  return `<div class="game-card">
    <button class="card-thumb" onclick="navigate('${playPath}')" aria-label="Play ${escapeHtml(item.name)}">
      <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.name)} thumbnail" loading="lazy">
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

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("arcade:theme", next);
  const icon = document.getElementById("theme-icon");
  if (icon) {
    if (next === "dark") {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    } else {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }
}

function applySiteConfig() {
  setTitle("");
  document.querySelector('meta[name="description"]').setAttribute("content", SITE.tagline);
  let f = document.querySelector("link[rel='icon']") || document.createElement('link');
  f.rel = 'icon'; f.href = SITE.favicon; document.head.appendChild(f);
  document.getElementById("logo-btn").setAttribute("aria-label", SITE.name + " home");
  document.getElementById("logo-text").textContent = SITE.name;
  document.getElementById("logo-badge").innerHTML = `<img src="${escapeHtml(SITE.logo)}" alt="Logo" style="width:100%;height:100%;object-fit:cover">`;
  document.getElementById("footer-name").textContent = SITE.name;
  document.getElementById("footer-tagline").textContent = SITE.tagline;
  document.getElementById("footer-copy-name").textContent = SITE.name;
}

function initBase(pathname) {
  document.getElementById("year").textContent = new Date().getFullYear();
  applySiteConfig();
  const saved = localStorage.getItem("arcade:theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  favorites = loadFavorites();
  updateFavCount();
  renderHeader(pathname);
}
