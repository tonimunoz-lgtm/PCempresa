// ============================================================
// UI RENDERING — shop, city, profile, tabs
// ============================================================

let currentCat = 'all';
let cityPlayers = [];

// ===================== TABS =====================
window.switchTab = function(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'shop') renderShop();
  if (name === 'city') renderCity();
};

// ===================== SHOP =====================
function renderShop() {
  // Category bar
  const bar = document.getElementById('cat-bar');
  bar.innerHTML = '';
  CATS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (c.id === currentCat ? ' active' : '');
    btn.textContent = c.label;
    btn.onclick = () => { currentCat = c.id; renderShop(); };
    bar.appendChild(btn);
  });

  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';
  const filtered = UPGRADES.filter(u => currentCat === 'all' || u.cat === currentCat);

  filtered.forEach(upg => {
    const lv = upgLevel(upg.id);
    const cost = upgCost(upg);
    const maxed = lv >= upg.maxLv;
    const spaceLocked = upg.cat === 'space' && G.level < 8;
    const pvpLocked = upg.cat === 'security' && (upg.id === 'sec_3' || upg.id === 'sec_4') && G.level < 10;
    const locked = spaceLocked || pvpLocked;
    const canAfford = !maxed && !locked && G.pizzas >= cost;

    const card = document.createElement('div');
    card.className = 'upgrade-card' + (maxed ? ' maxed' : locked ? ' locked' : canAfford ? ' affordable' : '');
    card.dataset.upgId = upg.id;
    if (!maxed && !locked) card.onclick = () => buyUpgrade(upg.id);

    // Dots
    const dotsHtml = Array.from({length: Math.min(upg.maxLv, 10)}, (_, i) =>
      `<div class="lvl-dot${i < lv ? ' on' : ''}"></div>`
    ).join('');

    // Cost
    let costHtml;
    if (maxed)         costHtml = '<span class="cost-max">✅ MAX</span>';
    else if (spaceLocked) costHtml = '<span class="cost-lock">🔒 Nv.8</span>';
    else if (pvpLocked)   costHtml = '<span class="cost-lock">🔒 Nv.10</span>';
    else costHtml = `<span class="${canAfford ? 'cost-ok' : 'cost-no'}">${fmt(cost)} 🍕</span>`;

    card.innerHTML = `
      <div class="upgrade-emoji">${upg.emoji}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${upg.name}</div>
        <div class="upgrade-desc">${upg.desc}</div>
        <div class="upgrade-effect">${upg.effect}</div>
      </div>
      <div class="upgrade-right">
        <div class="lvl-dots">${dotsHtml}</div>
        <div class="upgrade-cost">${costHtml}</div>
        ${lv > 0 ? `<div class="upgrade-lv">Nv.${lv}/${upg.maxLv}</div>` : ''}
      </div>
    `;
    list.appendChild(card);
  });

  document.getElementById('shop-budget').textContent = fmt(G.pizzas) + ' 🍕';
}

// ===================== CITY =====================
async function renderCity() {
  const grid = document.getElementById('city-grid');
  const W = 16, H = 12;
  const cellSize = Math.min(Math.floor((Math.min(window.innerWidth, 500) - 40) / W), 48);
  grid.style.cssText = `grid-template-columns:repeat(${W},${cellSize}px);grid-template-rows:repeat(${H},${cellSize}px);gap:2px`;

  // Load players
  try {
    const snap = await window._db_getDocs(window._db_collection(window._db, 'city'));
    cityPlayers = [];
    snap.forEach(d => cityPlayers.push(d.data()));
  } catch(e) {
    // Demo players if offline
    if (!cityPlayers.length) {
      cityPlayers = [
        {userId:'d1',username:'PizzaKing',x:3,y:1,level:8,reputation:500,pizzasSold:50000,lastActive:Date.now()},
        {userId:'d2',username:'ItalyBoss',x:9,y:4,level:5,reputation:200,pizzasSold:20000,lastActive:Date.now()-3600000},
        {userId:'d3',username:'MozzaMaster',x:13,y:7,level:3,reputation:80,pizzasSold:5000,lastActive:Date.now()-86400000},
      ];
    }
  }

  grid.innerHTML = '';
  let selectedPlayer = null;

  CITY_LAYOUT.forEach((row, y) => {
    row.forEach((tile, x) => {
      const player = cityPlayers.find(p => p.x === x && p.y === y);
      const isMe = player && window._currentUserId && player.userId === window._currentUserId;
      const tileClass = ['road','block','park','plaza'][tile] || 'block';

      const cell = document.createElement('div');
      cell.className = `c-cell ${tileClass}${player ? ' has-player' : ''}${isMe ? ' is-me' : ''}`;
      cell.style.cssText = `width:${cellSize}px;height:${cellSize}px;`;

      if (isMe) cell.style.border = `2px solid ${getLvColor(player.level)}`;

      if (player) {
        cell.style.background = `radial-gradient(circle, ${getLvColor(player.level)}25, transparent)`;
        const pSize = Math.max(cellSize * 0.36, 13);
        const nSize = Math.max(cellSize * 0.17, 8);
        cell.innerHTML = `
          <div class="cell-inner">
            <span style="font-size:${pSize}px;line-height:1">🍕</span>
            <span class="cell-pname" style="font-size:${nSize}px;color:${getLvColor(player.level)}">${player.username.substring(0,6)}</span>
            ${isMe ? '<span class="cell-me">YO</span>' : ''}
          </div>
        `;
        cell.title = `${player.username} · Nv.${player.level} · ${fmt(player.pizzasSold)} 🍕`;
        cell.onclick = () => openPlayerPopup(player);
      } else if (tile === 2) {
        cell.innerHTML = `<span style="font-size:${cellSize*0.4}px">🌳</span>`;
      } else if (tile === 3) {
        cell.innerHTML = `<span style="font-size:${cellSize*0.4}px">⛲</span>`;
      } else if (tile === 1) {
        // building detail
        cell.innerHTML = `<div style="position:absolute;inset:3px;background:rgba(255,255,255,.02);border-radius:3px;border:1px solid rgba(255,255,255,.03)"></div>`;
      }

      grid.appendChild(cell);
    });
  });

  renderRanking();
}

function openPlayerPopup(player) {
  const existing = document.getElementById('player-popup');
  if (existing) existing.remove();

  const isMe = window._currentUserId && player.userId === window._currentUserId;
  const canPvp = G.level >= 10 && !isMe;
  const lastActive = Date.now() - player.lastActive;
  const lastStr = lastActive < 3600000 ? '< 1h' : lastActive < 86400000 ? '< 24h' : 'Hace días';

  const popup = document.createElement('div');
  popup.className = 'player-popup';
  popup.id = 'player-popup';
  popup.innerHTML = `
    <div class="popup-card">
      <button class="popup-close" onclick="document.getElementById('player-popup').remove()">✕</button>
      <div class="popup-head">
        <div class="popup-avatar">🍕</div>
        <div>
          <div class="popup-name">${player.username}</div>
          <div class="popup-lvl" style="color:${getLvColor(player.level)}">Nivel ${player.level}</div>
        </div>
      </div>
      <div class="popup-stats">
        <div class="popup-stat"><span>⭐ Reputación</span><strong>${player.reputation}</strong></div>
        <div class="popup-stat"><span>🍕 Pizzas vendidas</span><strong>${fmt(player.pizzasSold)}</strong></div>
        <div class="popup-stat"><span>🏪 Mejoras activas</span><strong>${(player.upgrades||[]).length}</strong></div>
        <div class="popup-stat"><span>📅 Última conexión</span><strong>${lastStr}</strong></div>
      </div>
      ${canPvp ? `
        <div class="popup-pvp">
          <div class="pvp-title">⚔️ Acciones PvP (Nv.10+)</div>
          <button class="pvp-btn pvp-fire">🔥 Contratar pirómano</button>
          <button class="pvp-btn pvp-water">💧 Sabotear cañerías</button>
          <button class="pvp-btn pvp-spy">🕵️ Espiar negocio</button>
          <p class="pvp-note">⚠️ PvP completo — próxima actualización</p>
        </div>` : ''}
      ${isMe ? '<div class="popup-me-note">👑 ¡Esta es tu pizzería!</div>' : ''}
    </div>
  `;
  popup.onclick = (e) => { if (e.target === popup) popup.remove(); };
  document.body.appendChild(popup);
}

function renderRanking() {
  const list = document.getElementById('ranking-list');
  list.innerHTML = '';
  [...cityPlayers].sort((a,b) => b.pizzasSold - a.pizzasSold).forEach((p, i) => {
    const isMe = window._currentUserId && p.userId === window._currentUserId;
    const row = document.createElement('div');
    row.className = 'rank-row' + (isMe ? ' me' : '');
    row.innerHTML = `
      <span class="rank-num">#${i+1}</span>
      <span>🍕</span>
      <span class="rank-name">${p.username}</span>
      <span class="rank-lv" style="color:${getLvColor(p.level)}">Nv.${p.level}</span>
      <span class="rank-pz">${fmt(p.pizzasSold)}</span>
    `;
    row.onclick = () => openPlayerPopup(p);
    list.appendChild(row);
  });
}

// ===================== PROFILE =====================
window.openProfile = function() {
  const lvData = LEVELS.find(l => l.lv === G.level) || LEVELS[0];
  const nextLv  = LEVELS.find(l => l.lv === G.level + 1);

  document.getElementById('mod-uname').textContent    = window._currentUsername || '-';
  document.getElementById('mod-email').textContent    = window._currentEmail    || '-';
  document.getElementById('mod-title-lv').textContent = lvData.title;

  const unlockedCount = Object.keys(G.upgrades).filter(k => G.upgrades[k] > 0).length;
  document.getElementById('mod-stat-grid').innerHTML = [
    ['Nivel', G.level],
    ['XP Total', fmt(G.xp)],
    ['🍕 Total', fmt(G.total)],
    ['Reputación', G.rep],
    ['🍕/click', fmt(G.ppc)],
    ['🍕/seg', fmt(G.pps)],
    ['Mejoras', unlockedCount],
  ].map(([l,v]) => `<div class="sg-box"><div class="sg-v">${v}</div><div class="sg-l">${l}</div></div>`).join('');

  const nu = document.getElementById('mod-next-unlock');
  if (nextLv) {
    nu.innerHTML = `<div class="nu-lbl">Próximo desbloqueo (Nv.${nextLv.lv}):</div><div class="nu-val">${nextLv.unlock}</div>`;
    nu.style.display = 'block';
  } else {
    nu.style.display = 'none';
  }

  document.getElementById('mod-msg').style.display = 'none';
  document.getElementById('sec-msg').style.display = 'none';
  document.getElementById('profile-modal').style.display = 'flex';
};

window.closeProfile = function() {
  document.getElementById('profile-modal').style.display = 'none';
};

window.switchModalTab = function(tab, btn) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('modal-stats').style.display    = tab === 'stats'    ? 'block' : 'none';
  document.getElementById('modal-security').style.display = tab === 'security' ? 'block' : 'none';
};

window.saveGameUI = async function() {
  const msg = document.getElementById('mod-msg');
  msg.style.display = 'block';
  msg.textContent = '⏳ Guardando...';
  try {
    await saveGameToFirebase();
    msg.textContent = '✅ Partida guardada en la nube';
  } catch(e) {
    msg.textContent = '⚠️ Error al guardar (sin conexión)';
  }
  setTimeout(() => msg.style.display = 'none', 3000);
};

window.changePasswordUI = async function() {
  const np  = document.getElementById('new-pass').value;
  const cp  = document.getElementById('confirm-pass').value;
  const msg = document.getElementById('sec-msg');
  msg.style.display = 'block';
  if (np.length < 6)  { msg.textContent = '⚠️ Mínimo 6 caracteres'; return; }
  if (np !== cp)      { msg.textContent = '⚠️ Las contraseñas no coinciden'; return; }
  try {
    await window._changePassword(np);
    msg.textContent = '✅ Contraseña actualizada correctamente';
    document.getElementById('new-pass').value    = '';
    document.getElementById('confirm-pass').value = '';
  } catch(e) {
    msg.textContent = '⚠️ Error. Re-inicia sesión primero.';
  }
  setTimeout(() => msg.style.display = 'none', 3500);
};
