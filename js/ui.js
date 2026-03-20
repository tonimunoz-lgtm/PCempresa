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
