// ============================================================
// GAME STATE & LOGIC
// ============================================================

let G = {
  pizzas: 0, total: 0, ppc: 1, pps: 0, rep: 0,
  level: 1, xp: 0,
  upgrades: {}, // id -> level
  combo: 0, lastClick: 0, multiplier: 1,
  secLevel: 0, policeCorr: 0, detectiveLv: 0,
  cityPos: null,
};

let floaterId = 0;
let prevLevel = 1;

// ---- Formatters ----
function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if (n >= 1e9)  return (n/1e9).toFixed(2)+'B';
  if (n >= 1e6)  return (n/1e6).toFixed(2)+'M';
  if (n >= 1e3)  return (n/1e3).toFixed(1)+'K';
  return n.toString();
}

function getLvColor(lv) {
  if (lv >= 12) return '#ff00ff';
  if (lv >= 10) return '#ff6b00';
  if (lv >= 7)  return '#ffcc00';
  if (lv >= 4)  return '#00ff88';
  return '#aaaaaa';
}

function upgLevel(id) { return G.upgrades[id] || 0; }
function upgCost(upg) { return Math.floor(upg.cost * Math.pow(1.5, upgLevel(upg.id))); }

function recalcStats() {
  let ppc=1, pps=0, rep=0, sec=0, pol=0, det=0;
  UPGRADES.forEach(u => {
    const lv = upgLevel(u.id);
    if (lv > 0) {
      ppc += u.ppc * lv;
      pps += u.pps * lv;
      rep += u.rep * lv;
      if (u.id==='sec_1'||u.id==='sec_2') sec += lv;
      if (u.id==='sec_3') pol += lv*10;
      if (u.id==='sec_4') det += lv;
    }
  });
  G.ppc = ppc; G.pps = pps; G.rep = rep;
  G.secLevel = sec; G.policeCorr = pol; G.detectiveLv = det;
}

function addXP(amount) {
  G.xp += amount;
  while (true) {
    const next = LEVELS.find(l => l.lv === G.level + 1);
    if (next && G.xp >= next.xp) {
      G.level++;
      showLevelUp(G.level);
    } else break;
  }
}

// ---- Click handler ----
window.handleOvenClick = function(e) {
  const now = Date.now();
  if (now - G.lastClick < 500) {
    G.combo = Math.min(G.combo + 1, 50);
    G.multiplier = 1 + G.combo * 0.05;
  } else {
    G.combo = 0;
    G.multiplier = 1;
  }
  G.lastClick = now;

  const gained = Math.floor(G.ppc * G.multiplier);
  G.pizzas += gained;
  G.total  += gained;
  addXP(1);

  // Glow pulse
  const glow = document.getElementById('oven-glow');
  glow.style.opacity = '0.85';
  glow.style.transform = 'translate(-50%,-50%) scale(1.1)';
  setTimeout(() => { glow.style.opacity = '0.25'; glow.style.transform = 'translate(-50%,-50%) scale(1)'; }, 220);

  // Paddle animation
  const paddle = document.getElementById('pizza-paddle');
  paddle.classList.add('going-in');
  setTimeout(() => paddle.classList.remove('going-in'), 180);

  // Oven press
  const wrapper = document.getElementById('oven-wrapper');
  wrapper.classList.add('pressed');
  setTimeout(() => wrapper.classList.remove('pressed'), 110);

  // Floating text
  spawnFloater(e, gained);

  // Combo badge
  const badge = document.getElementById('combo-badge');
  if (G.combo > 5) {
    badge.style.display = 'inline-block';
    badge.textContent = `🔥 COMBO x${G.multiplier.toFixed(1)}`;
  } else {
    badge.style.display = 'none';
  }

  // Click hint
  const hint = document.getElementById('click-hint');
  if (G.combo > 5) {
    hint.textContent = `🔥 ¡Imparable! x${G.multiplier.toFixed(1)} multiplicador activo`;
  } else {
    hint.textContent = '¡Haz click en el horno para hacer pizzas!';
  }

  updateUI();
};

function spawnFloater(e, gained) {
  const container = document.getElementById('floaters-wrap');
  const rect = document.getElementById('oven-wrapper').getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  let text = `+${fmt(gained)} 🍕`;
  let color = '#ffcc00';
  if (G.multiplier >= 2)   { text = `🔥 COMBO! +${fmt(gained)} 🍕`; color = '#ff6b00'; }
  else if (G.multiplier >= 1.5) { color = '#ff9500'; }

  const el = document.createElement('div');
  el.className = 'floater';
  el.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.remove(), 1250);
}

// ---- Buy upgrade ----
window.buyUpgrade = function(id) {
  const upg = UPGRADES.find(u => u.id === id);
  if (!upg) return;
  const lv = upgLevel(id);
  if (lv >= upg.maxLv) return;
  const cost = upgCost(upg);
  if (G.pizzas < cost) return;
  G.pizzas -= cost;
  G.upgrades[id] = lv + 1;
  addXP(Math.floor(cost / 10));
  recalcStats();
  renderShop();
  updateUI();
};

// ---- UI Update ----
function updateUI() {
  // Nav
  document.getElementById('nav-pizzas').querySelector('.ns-val').textContent = fmt(G.pizzas) + ' 🍕';
  const ppsEl = document.getElementById('nav-pps');
  if (G.pps > 0) { ppsEl.style.display='flex'; ppsEl.querySelector('.ns-val').textContent = fmt(G.pps)+'/s'; }

  // Stats boxes
  document.getElementById('s-pizzas').textContent = fmt(G.pizzas);
  document.getElementById('s-ppc').textContent    = fmt(G.ppc);
  document.getElementById('s-pps').textContent    = fmt(G.pps);
  document.getElementById('s-total').textContent  = fmt(G.total);

  // Level + XP
  const lvData = LEVELS.find(l => l.lv === G.level) || LEVELS[0];
  const nextLv = LEVELS.find(l => l.lv === G.level + 1);
  const prog = nextLv ? Math.min(100, ((G.xp - lvData.xp) / (nextLv.xp - lvData.xp)) * 100) : 100;
  document.getElementById('xp-fill').style.width = prog + '%';
  document.getElementById('xp-info').textContent = `Nv.${G.level} · ${lvData.title}`;
  document.getElementById('xp-num').textContent  = fmt(G.xp) + ' XP';
  document.getElementById('nav-level').textContent = 'Nv.' + G.level;
  document.getElementById('level-badge').textContent = 'Nv.' + G.level;
  document.getElementById('level-title-text').textContent = lvData.title;

  // Small XP bar
  document.getElementById('xp-bar-small-fill').style.width = prog + '%';
  document.getElementById('xp-text-small').textContent = fmt(G.xp) + ' XP' + (nextLv ? ` / ${fmt(nextLv.xp)}` : ' (MAX)');

  // Shop budget
  const shopBudget = document.getElementById('shop-budget');
  if (shopBudget) shopBudget.textContent = fmt(G.pizzas) + ' 🍕';

  // Update upgrade card costs live
  document.querySelectorAll('[data-upg-id]').forEach(card => {
    const upg = UPGRADES.find(u => u.id === card.dataset.upgId);
    if (!upg) return;
    const lv = upgLevel(upg.id);
    const cost = upgCost(upg);
    const maxed = lv >= upg.maxLv;
    const costEl = card.querySelector('.upgrade-cost');
    if (!costEl) return;
    if (maxed) {
      costEl.innerHTML = '<span class="cost-max">✅ MAX</span>';
      card.classList.remove('affordable');
    } else {
      const canAfford = G.pizzas >= cost;
      costEl.innerHTML = `<span class="${canAfford?'cost-ok':'cost-no'}">${fmt(cost)} 🍕</span>`;
      card.classList.toggle('affordable', canAfford);
    }
  });
}

// ---- Passive income loop ----
function startPassiveLoop() {
  setInterval(() => {
    if (G.pps > 0) {
      const tick = G.pps / 20;
      G.pizzas += tick;
      G.total  += tick;
      addXP(tick / 100);
      updateUI();
    }
  }, 50);
}

// ---- Random events ----
function startEventLoop() {
  setInterval(() => {
    const badChance = Math.max(0.004, 0.016 - G.secLevel * 0.001);
    const r = Math.random();
    if (r < badChance) {
      const evt = RANDOM_EVENTS.bad[Math.floor(Math.random() * RANDOM_EVENTS.bad.length)];
      const loss = Math.floor(G.pizzas * evt.loss);
      G.pizzas = Math.max(0, G.pizzas - loss);
      showEventToast(evt.emoji, evt.title, evt.desc, `-${fmt(loss)} 🍕`, false);
      updateUI();
    } else if (r < badChance + 0.01) {
      const evt = RANDOM_EVENTS.good[Math.floor(Math.random() * RANDOM_EVENTS.good.length)];
      const gain = Math.max(10, Math.floor(G.total * evt.gain * 0.01));
      G.pizzas += gain; G.total += gain;
      showEventToast(evt.emoji, evt.title, evt.desc, `+${fmt(gain)} 🍕`, true);
      updateUI();
    }
  }, 11000);
}

// ---- Event toast ----
function showEventToast(emoji, title, desc, impact, isGood) {
  const color = isGood ? 'rgba(0,200,100,.55)' : 'rgba(255,80,0,.55)';
  const impactColor = isGood ? 'rgba(0,220,120,.5)' : 'rgba(255,80,0,.5)';
  const toast = document.createElement('div');
  toast.className = 'event-toast';
  toast.style.cssText = `border-color:${color};box-shadow:0 0 22px ${impactColor}`;
  toast.innerHTML = `
    <span class="et-emoji">${emoji}</span>
    <div class="et-body">
      <div class="et-title" style="color:${isGood?'#44ff88':'#ff6b00'}">${title}</div>
      <div class="et-desc">${desc}</div>
      <div class="et-impact ${isGood?'gain':'loss'}">${impact}</div>
    </div>
    <button class="et-dismiss" onclick="this.closest('.event-toast').remove()">✕</button>
  `;
  toast.onclick = () => toast.remove();
  document.getElementById('events-container').appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 7500);
}

// ---- Level up modal ----
function showLevelUp(lv) {
  const lvData = LEVELS.find(l => l.lv === lv);
  if (!lvData) return;
  document.getElementById('lu-badge').textContent  = 'NIVEL ' + lv;
  document.getElementById('lu-title').textContent  = lvData.title;
  document.getElementById('lu-unlock-val').textContent = lvData.unlock;
  document.getElementById('levelup-overlay').classList.add('show');
}
window.closeLevelUp = function() {
  document.getElementById('levelup-overlay').classList.remove('show');
};

// ---- Auto-save every 60s ----
function startAutoSave() {
  setInterval(() => {
    saveGameToFirebase().then(() => {
      const flash = document.createElement('span');
      flash.className = 'save-flash';
      flash.textContent = '☁️ guardado';
      const nc = document.getElementById('nav-center');
      nc.appendChild(flash);
      setTimeout(() => flash.remove(), 2200);
    }).catch(() => {});
  }, 60000);
}

// ---- Load game state from Firebase ----
function loadGameState(s) {
  if (!s) return;
  if (s.pizzas   !== undefined) G.pizzas   = s.pizzas;
  if (s.total    !== undefined) G.total    = s.total;
  if (s.level    !== undefined) G.level    = s.level;
  if (s.xp       !== undefined) G.xp       = s.xp;
  if (s.upgrades !== undefined) G.upgrades = s.upgrades;
  if (s.rep      !== undefined) G.rep      = s.rep;
  recalcStats();
}

// ===================== OVEN EVOLUTION =====================
const OVEN_TIERS = [
  { minLv:1,  tier:1, name:'🪵 Horno de Leña',        label:'FORNO A LEGNA' },
  { minLv:4,  tier:2, name:'🔥 Horno Napolitano',      label:'FORNO NAPOLETANO' },
  { minLv:7,  tier:3, name:'⭐ Horno Maestro',          label:'FORNO DEL MAESTRO' },
  { minLv:10, tier:4, name:'💜 Horno Volcánico',        label:'FORNO VULCANICO' },
  { minLv:13, tier:5, name:'🌌 Horno del Multiverso',  label:'FORNO MULTIVERSALE' },
];

const OVEN_DECOS = {
  1: [],
  2: [{ cls:'candles', html:'<div class="oven-deco candles"><div class="oven-deco candle"></div><div class="oven-deco candle"></div><div class="oven-deco candle"></div></div>' }],
  3: [
    { cls:'banner',  html:'<div class="oven-deco banner">🏆</div>' },
    { cls:'stars',   html:'<div class="oven-deco stars"><div class="oven-deco star">⭐</div><div class="oven-deco star">⭐</div><div class="oven-deco star">⭐</div></div>' },
  ],
  4: [
    { cls:'rockets', html:'<div class="oven-deco rockets">🚀</div>' },
    { cls:'banner',  html:'<div class="oven-deco banner">👑</div>' },
  ],
  5: [
    { cls:'galaxy',  html:'<div class="oven-deco galaxy"></div>' },
    { cls:'rockets', html:'<div class="oven-deco rockets">🌌</div>' },
    { cls:'stars',   html:'<div class="oven-deco stars"><div class="oven-deco star">✨</div><div class="oven-deco star">🌟</div><div class="oven-deco star">✨</div></div>' },
  ],
};

let _lastOvenTier = 0;

function updateOvenVisuals() {
  const tierData = [...OVEN_TIERS].reverse().find(t => G.level >= t.minLv) || OVEN_TIERS[0];
  if (tierData.tier === _lastOvenTier) return;
  _lastOvenTier = tierData.tier;

  const body   = document.getElementById('oven-body');
  const badge  = document.getElementById('oven-level-badge');
  const label  = document.getElementById('oven-label');
  const decos  = document.getElementById('oven-decorations');
  if (!body) return;

  // Remove old tier classes
  body.classList.remove('oven-tier-1','oven-tier-2','oven-tier-3','oven-tier-4','oven-tier-5');
  body.classList.add('oven-tier-' + tierData.tier);

  if (badge) badge.textContent = tierData.name;
  if (label) label.textContent = tierData.label;

  // Add decorations
  if (decos) {
    decos.innerHTML = '';
    (OVEN_DECOS[tierData.tier] || []).forEach(d => {
      decos.insertAdjacentHTML('beforeend', d.html);
    });
  }

  // Flash effect on tier change
  if (_lastOvenTier > 1) {
    const glow = document.getElementById('oven-glow');
    if (glow) {
      glow.style.opacity = '1';
      glow.style.transform = 'translate(-50%,-50%) scale(1.5)';
      setTimeout(() => {
        glow.style.opacity = '0.25';
        glow.style.transform = 'translate(-50%,-50%) scale(1)';
      }, 600);
    }
  }
}

// Hook into addXP to check oven tier on every level change
const _origAddXP = window._addXPHook;
function checkOvenOnLevelUp() {
  updateOvenVisuals();
}

// ===================== PVP NOTIFICATIONS =====================
let pvpNotifications = [];
let pvpBannerIndex  = 0;

async function loadPvpNotifications() {
  if (!window._db || !window._currentUserId) return;
  try {
    const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const q = query(
      collection(window._db, 'notifications'),
      where('userId', '==', window._currentUserId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    pvpNotifications = [];
    snap.forEach(d => pvpNotifications.push({ id: d.id, ...d.data() }));

    const unread = pvpNotifications.filter(n => !n.read);
    if (unread.length > 0) {
      showPvpBanner(unread);
      updateInboxBadge(unread.length);
    }
  } catch(e) {
    console.log('Notifications load error:', e.message);
  }
}

function showPvpBanner(notifications) {
  if (!notifications.length) return;
  pvpBannerIndex = 0;
  renderBannerNotif(notifications, 0);
  document.getElementById('pvp-banner').style.display = 'flex';
}

function renderBannerNotif(notifications, idx) {
  const n = notifications[idx];
  if (!n) return;
  const total = notifications.length;
  document.getElementById('pvp-banner-icon').textContent  = n.emoji || '⚔️';
  document.getElementById('pvp-banner-title').textContent = n.title || '¡Ataque recibido!';
  document.getElementById('pvp-banner-sub').textContent   = `Mientras estabas offline · ${timeAgoNotif(n.timestamp)}`;
  document.getElementById('pvp-banner-body').innerHTML = `
    <div>${n.desc || ''}</div>
    ${n.pizzaLoss ? `<div class="pvp-banner-loss">-${n.pizzaLoss} 🍕 perdidas</div>` : ''}
    ${n.attackerName ? `<div class="pvp-banner-attacker">Atacante: ${n.attackerName}</div>` : ''}
    ${total > 1 ? `<div class="pvp-banner-counter" style="margin-top:10px">Ataque ${idx+1} de ${total}</div>` : ''}
  `;
  const nextBtn = document.getElementById('pvp-banner-next');
  nextBtn.style.display = (idx < total-1) ? 'block' : 'none';
  nextBtn.onclick = () => {
    pvpBannerIndex++;
    renderBannerNotif(notifications, pvpBannerIndex);
  };
  // Apply pizza loss
  if (n.pizzaLoss && !n.applied) {
    G.pizzas = Math.max(0, G.pizzas - n.pizzaLoss);
    n.applied = true;
    updateUI();
  }
}

window.closePvpBanner = function() {
  document.getElementById('pvp-banner').style.display = 'none';
  markNotificationsRead();
};

window.openInbox = function() {
  renderInbox();
  document.getElementById('inbox-modal').style.display = 'flex';
};
window.closeInbox = function() {
  document.getElementById('inbox-modal').style.display = 'none';
};

function renderInbox() {
  const list = document.getElementById('inbox-list');
  if (!pvpNotifications.length) {
    list.innerHTML = '<div class="inbox-empty">🍕 Sin ataques recibidos.<br>¡Estás a salvo!</div>';
    return;
  }
  list.innerHTML = pvpNotifications.slice(0,20).map(n => `
    <div class="inbox-item ${n.read?'read':''}">
      <div class="inbox-item-header">
        <span class="inbox-item-emoji">${n.emoji||'⚔️'}</span>
        <span class="inbox-item-title">${n.title||'Ataque'}</span>
        <span class="inbox-item-time">${timeAgoNotif(n.timestamp)}</span>
      </div>
      <div class="inbox-item-desc">${n.desc||''}</div>
      ${n.pizzaLoss ? `<div class="inbox-item-loss">-${n.pizzaLoss} 🍕</div>` : ''}
    </div>
  `).join('');
}

window.markAllRead = async function() {
  closeInbox();
  markNotificationsRead();
  updateInboxBadge(0);
};

async function markNotificationsRead() {
  if (!window._db) return;
  try {
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    for (const n of pvpNotifications.filter(x=>!x.read)) {
      await updateDoc(doc(window._db, 'notifications', n.id), { read: true });
      n.read = true;
    }
    updateInboxBadge(0);
  } catch(e) {}
}

function updateInboxBadge(count) {
  const btn   = document.getElementById('inbox-btn');
  const badge = document.getElementById('inbox-count');
  if (!btn) return;
  if (count > 0) {
    btn.style.display = 'flex';
    badge.textContent = count;
  } else {
    btn.style.display = 'none';
  }
}

function timeAgoNotif(ts) {
  if (!ts) return '';
  const d = Date.now()-ts;
  if (d<3600000)  return `Hace ${Math.floor(d/60000)}m`;
  if (d<86400000) return `Hace ${Math.floor(d/3600000)}h`;
  return `Hace ${Math.floor(d/86400000)}d`;
}

// Expose so index.html can call after login
window.loadPvpNotifications = loadPvpNotifications;
window.updateOvenVisuals    = updateOvenVisuals;
window.checkOvenOnLevelUp   = checkOvenOnLevelUp;

// ===================== WORLD DECORATION BY LEVEL =====================

const WORLD_THEMES = [
  { minLv:1,  name:'beginner', cursor:'🍕',
    bg:'radial-gradient(ellipse at 30% 20%, rgba(139,69,19,0.08), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,80,0,0.06), transparent 60%)',
    navBg:'rgba(0,0,0,0.55)', accent:'#ff6b00', particle:null },
  { minLv:4,  name:'novice', cursor:'🔥',
    bg:'radial-gradient(ellipse at 20% 20%, rgba(205,133,63,0.1), transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(255,120,0,0.08), transparent 55%)',
    navBg:'rgba(10,5,0,0.6)', accent:'#ffaa00', particle:'✨' },
  { minLv:7,  name:'master', cursor:'⭐',
    bg:'radial-gradient(ellipse at 30% 30%, rgba(212,175,55,0.12), transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(255,200,50,0.08), transparent 50%)',
    navBg:'rgba(15,12,0,0.65)', accent:'#ffd700', particle:'⭐' },
  { minLv:10, name:'lord', cursor:'👑',
    bg:'radial-gradient(ellipse at 25% 25%, rgba(150,0,255,0.12), transparent 50%), radial-gradient(ellipse at 75% 65%, rgba(255,50,0,0.1), transparent 50%)',
    navBg:'rgba(10,0,20,0.7)', accent:'#cc44ff', particle:'💜' },
  { minLv:13, name:'god', cursor:'🌌',
    bg:'radial-gradient(ellipse at 20% 20%, rgba(0,150,255,0.14), transparent 45%), radial-gradient(ellipse at 80% 75%, rgba(0,220,255,0.1), transparent 45%), radial-gradient(ellipse at 50% 50%, rgba(0,50,150,0.06), transparent 60%)',
    navBg:'rgba(0,5,20,0.75)', accent:'#00ccff', particle:'🌟' },
];

const HORNO_DECOS_AROUND = {
  1: [],
  2: ['🕯️','🕯️'],
  3: ['🏆','⭐','⭐','⭐'],
  4: ['👑','🚀','💜'],
  5: ['🌌','🚀','✨','🌟','✨'],
};

let _lastWorldTheme = null;
let _particleInterval = null;

function updateWorldTheme() {
  const theme = [...WORLD_THEMES].reverse().find(t => G.level >= t.minLv) || WORLD_THEMES[0];
  if (_lastWorldTheme === theme.name) return;
  _lastWorldTheme = theme.name;

  // Background glows
  const bg1 = document.querySelector('.bg1');
  const bg2 = document.querySelector('.bg2');
  const body = document.getElementById('game-screen');
  if (body) body.style.setProperty('--theme-accent', theme.accent);

  // Nav accent
  const nav = document.querySelector('.top-nav');
  if (nav) nav.style.background = theme.navBg;
  const bNav = document.querySelector('.bottom-nav');
  if (bNav) bNav.style.background = theme.navBg;

  // Update CSS accent color on bnav active indicator
  document.documentElement.style.setProperty('--theme-accent', theme.accent);

  // Background pattern color
  if (bg1) {
    const colors = { beginner:'#ff4400', novice:'#ff8800', master:'#ffcc00', lord:'#aa00ff', god:'#0088ff' };
    bg1.style.background = colors[theme.name] || '#ff4400';
    bg2.style.background = theme.name === 'god' ? '#00ccff' : theme.name === 'lord' ? '#cc00ff' : '#ff0080';
  }

  // Cursor
  updateCursor(theme.cursor);

  // Particles
  spawnThemeParticles(theme.particle, theme.accent);

  // Oven surroundings decorations
  updateOvenSurroundings(theme);

  // Flash transition effect
  const flash = document.createElement('div');
  flash.style.cssText = `position:fixed;inset:0;z-index:999;background:${theme.accent};opacity:0.15;pointer-events:none;animation:worldFlash 0.8s ease forwards`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);
}

function updateCursor(emoji) {
  // Create SVG cursor from emoji
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><text y='26' font-size='24'>${emoji}</text></svg>`;
  const encoded = encodeURIComponent(svg);
  document.body.style.cursor = `url("data:image/svg+xml,${encoded}") 0 0, auto`;
  // Also apply to oven
  const oven = document.getElementById('oven-wrapper');
  if (oven) oven.style.cursor = `url("data:image/svg+xml,${encoded}") 0 0, pointer`;
}

function spawnThemeParticles(emoji, color) {
  if (_particleInterval) clearInterval(_particleInterval);
  const container = document.getElementById('theme-particles');
  if (!container) return;
  container.innerHTML = '';
  if (!emoji) return;

  _particleInterval = setInterval(() => {
    const p = document.createElement('div');
    p.className = 'theme-particle';
    p.textContent = emoji;
    p.style.cssText = `
      left:${Math.random()*100}%;
      font-size:${10+Math.random()*14}px;
      animation-duration:${4+Math.random()*6}s;
      animation-delay:${Math.random()*2}s;
      color:${color};
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 10000);
  }, 800);
}

function updateOvenSurroundings(theme) {
  const tierData = [...OVEN_TIERS].reverse().find(t => G.level >= t.minLv) || OVEN_TIERS[0];
  const decos = HORNO_DECOS_AROUND[tierData.tier] || [];
  let surround = document.getElementById('oven-surround');
  if (!surround) {
    surround = document.createElement('div');
    surround.id = 'oven-surround';
    surround.className = 'oven-surround';
    const container = document.querySelector('.oven-container');
    if (container) container.insertBefore(surround, container.firstChild);
  }
  if (!decos.length) { surround.innerHTML=''; return; }

  surround.innerHTML = decos.map((d,i) =>
    `<span class="surround-deco" style="animation-delay:${i*0.3}s">${d}</span>`
  ).join('');

  // Add floating elements around the oven
  const ovenArea = document.querySelector('.oven-container');
  if (ovenArea) {
    ovenArea.style.setProperty('--accent', theme.accent);
    ovenArea.style.boxShadow = `0 0 60px ${theme.accent}22`;
    ovenArea.style.borderRadius = '20px';
    ovenArea.style.transition = 'box-shadow 1s ease';
  }
}

// Hook updateWorldTheme into level-up
const _origShowLevelUp = window.showLevelUp || function(){};
window.showLevelUp = function(lv) {
  _origShowLevelUp(lv);
  updateWorldTheme();
};
window.updateWorldTheme = updateWorldTheme;
