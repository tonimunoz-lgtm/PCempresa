// ============================================================
// UI RENDERING — shop, city, profile, tabs, audio
// ============================================================

let currentCat = 'all';
let cityPlayers = [];

// ===================== AUDIO SYSTEM =====================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;
let isMuted = false;
let bgMusicNode = null;
let bgGainNode = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new AudioCtx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(audioCtx.destination);
  startBgMusic();
}

function playSound(type) {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  const now = audioCtx.currentTime;

  switch(type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.06);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
      break;
    case 'combo':
      [440, 554, 659, 880].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(masterGain);
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, now + i * 0.06);
        g.gain.linearRampToValueAtTime(0.15, now + i * 0.06 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
        o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.15);
      });
      break;
    case 'buy':
      [523, 659, 784].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(masterGain);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.12, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.2);
      });
      break;
    case 'levelup':
      [523,659,784,1047].forEach((f,i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(masterGain);
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.2, now + i*0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + i*0.1 + 0.3);
        o.start(now + i*0.1); o.stop(now + i*0.1 + 0.3);
      });
      break;
    case 'event_bad':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
      break;
    case 'event_good':
      [659,784,1047].forEach((f,i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(masterGain);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.12, now + i*0.07);
        g.gain.exponentialRampToValueAtTime(0.001, now + i*0.07 + 0.25);
        o.start(now + i*0.07); o.stop(now + i*0.07 + 0.25);
      });
      break;
    case 'pvp':
      osc.type = 'square';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(165, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
      break;
  }
}

function startBgMusic() {
  if (!audioCtx || isMuted) return;
  if (bgMusicNode) { bgMusicNode.stop(); bgMusicNode = null; }

  bgGainNode = audioCtx.createGain();
  bgGainNode.gain.value = 0.08;
  bgGainNode.connect(masterGain);

  // Italian tarantella-inspired looping melody
  const melody = [
    [392,0.15],[440,0.15],[494,0.15],[523,0.3],[494,0.15],
    [440,0.3],[392,0.15],[349,0.15],[392,0.3],[440,0.15],
    [494,0.15],[523,0.15],[587,0.3],[523,0.15],[494,0.3],
    [440,0.15],[392,0.15],[349,0.3],[330,0.15],[349,0.15],
    [392,0.6]
  ];

  const totalDur = melody.reduce((s,[,d]) => s+d, 0);

  function scheduleMelody(startTime) {
    let t = startTime;
    melody.forEach(([freq, dur]) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(bgGainNode);
      o.type = 'triangle';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.5, t);
      g.gain.setValueAtTime(0.5, t + dur * 0.7);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.start(t); o.stop(t + dur);
      t += dur;
    });
    // Schedule next loop
    setTimeout(() => { if (!isMuted && audioCtx) scheduleMelody(audioCtx.currentTime + 0.05); }, (totalDur - 0.1) * 1000);
  }

  scheduleMelody(audioCtx.currentTime + 0.1);
}

window.toggleMute = function() {
  if (!audioCtx) { initAudio(); return; }
  isMuted = !isMuted;
  masterGain.gain.value = isMuted ? 0 : 0.7;
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
  if (!isMuted) startBgMusic();
};

// Hook into game actions for sounds
const _origClick = window.handleOvenClick;
window.handleOvenClick = function(e) {
  initAudio();
  if (_origClick) _origClick(e);
  if (G.combo > 10) playSound('combo');
  else playSound('click');
};

const _origBuy = window.buyUpgrade;
window.buyUpgrade = function(id) {
  if (_origBuy) _origBuy(id);
  playSound('buy');
};

// ===================== TABS =====================
window.switchTab = function(name, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'shop') renderShop();
  if (name === 'city') { initAudio(); renderCity(); }
};

// ===================== SHOP =====================
function renderShop() {
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
  UPGRADES.filter(u => currentCat === 'all' || u.cat === currentCat).forEach(upg => {
    const lv = upgLevel(upg.id);
    const cost = upgCost(upg);
    const maxed = lv >= upg.maxLv;
    const spaceLocked = upg.cat === 'space' && G.level < 8;
    const pvpLocked   = upg.cat === 'security' && (upg.id==='sec_3'||upg.id==='sec_4') && G.level < 10;
    const locked = spaceLocked || pvpLocked;
    const canAfford = !maxed && !locked && G.pizzas >= cost;

    const card = document.createElement('div');
    card.className = 'upgrade-card' + (maxed?' maxed':locked?' locked':canAfford?' affordable':'');
    card.dataset.upgId = upg.id;
    if (!maxed && !locked) card.onclick = () => buyUpgrade(upg.id);

    const dotsHtml = Array.from({length:Math.min(upg.maxLv,10)},(_,i)=>
      `<div class="lvl-dot${i<lv?' on':''}"></div>`).join('');

    let costHtml;
    if (maxed)            costHtml = '<span class="cost-max">✅ MAX</span>';
    else if (spaceLocked) costHtml = '<span class="cost-lock">🔒 Nv.8</span>';
    else if (pvpLocked)   costHtml = '<span class="cost-lock">🔒 Nv.10</span>';
    else costHtml = `<span class="${canAfford?'cost-ok':'cost-no'}">${fmt(cost)} 🍕</span>`;

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
        ${lv>0?`<div class="upgrade-lv">Nv.${lv}/${upg.maxLv}</div>`:''}
      </div>`;
    list.appendChild(card);
  });
  document.getElementById('shop-budget').textContent = fmt(G.pizzas) + ' 🍕';
}

// ===================== CITY =====================

// Big city layout: 32x24 grid
const CITY_W = 32, CITY_H = 24;
const BIG_LAYOUT = [];
for (let y = 0; y < CITY_H; y++) {
  BIG_LAYOUT[y] = [];
  for (let x = 0; x < CITY_W; x++) {
    // Roads every 3 columns and every 3 rows
    if (x % 3 === 2 || y % 3 === 2) {
      BIG_LAYOUT[y][x] = 0; // road
    } else {
      // Special zones
      const bx = Math.floor(x/3), by = Math.floor(y/3);
      if ((bx===3&&by===3)||(bx===4&&by===3)) BIG_LAYOUT[y][x] = 2; // park
      else if ((bx===7&&by===5)||(bx===8&&by===5)) BIG_LAYOUT[y][x] = 3; // plaza
      else if (bx===5&&by===1) BIG_LAYOUT[y][x] = 4; // market
      else BIG_LAYOUT[y][x] = 1; // building
    }
  }
}

// Demo players to populate the city
const DEMO_PLAYERS = [
  {userId:'d1',username:'PizzaKing',x:0,y:0,level:12,reputation:1200,pizzasSold:500000,upgrades:['oven_4','staff_5','delivery_3','decor_4','tech_4'],lastActive:Date.now()-120000},
  {userId:'d2',username:'ItalyBoss',x:3,y:0,level:9,reputation:800,pizzasSold:200000,upgrades:['oven_3','staff_3','delivery_2','decor_3'],lastActive:Date.now()-600000},
  {userId:'d3',username:'MozzaMaster',x:6,y:0,level:7,reputation:400,pizzasSold:80000,upgrades:['oven_2','staff_2','decor_2'],lastActive:Date.now()-3600000},
  {userId:'d4',username:'NapoliPro',x:9,y:0,level:5,reputation:200,pizzasSold:20000,upgrades:['oven_2','staff_1'],lastActive:Date.now()-7200000},
  {userId:'d5',username:'VesuBurns',x:12,y:0,level:10,reputation:950,pizzasSold:300000,upgrades:['oven_3','staff_4','delivery_3','sec_2'],lastActive:Date.now()-300000},
  {userId:'d6',username:'FornoRex',x:0,y:3,level:6,reputation:300,pizzasSold:50000,upgrades:['oven_2','staff_2'],lastActive:Date.now()-14400000},
  {userId:'d7',username:'PizzaLoca',x:3,y:3,level:4,reputation:120,pizzasSold:10000,upgrades:['oven_1','staff_1'],lastActive:Date.now()-86400000},
  {userId:'d8',username:'GalacticPie',x:6,y:3,level:14,reputation:2000,pizzasSold:5000000,upgrades:['oven_5','staff_6','space_2','tech_4'],lastActive:Date.now()-60000},
  {userId:'d9',username:'TomatoGod',x:9,y:3,level:8,reputation:500,pizzasSold:150000,upgrades:['oven_3','staff_3','delivery_2'],lastActive:Date.now()-1800000},
  {userId:'d10',username:'CheeseLord',x:12,y:3,level:3,reputation:60,pizzasSold:5000,upgrades:['oven_1'],lastActive:Date.now()-172800000},
  {userId:'d11',username:'MarcoPollo',x:15,y:0,level:11,reputation:1100,pizzasSold:400000,upgrades:['oven_4','staff_5','delivery_3','tech_3'],lastActive:Date.now()-900000},
  {userId:'d12',username:'SalsaDiva',x:18,y:0,level:2,reputation:20,pizzasSold:500,upgrades:[],lastActive:Date.now()-259200000},
];

// Get visual appearance of pizzeria based on upgrades
function getPizzeriaVisual(player) {
  const upgList = player.upgrades || [];
  const lv = player.level || 1;

  // Size based on level
  let size = '🏠';
  if (lv >= 14) size = '🏯';
  else if (lv >= 11) size = '🏰';
  else if (lv >= 8)  size = '🏢';
  else if (lv >= 5)  size = '🏬';
  else if (lv >= 3)  size = '🏪';

  // Special decorations based on upgrades
  let decor = '';
  if (upgList.some(u=>u.startsWith('space'))) decor = '🚀';
  else if (upgList.some(u=>u==='tech_4'))     decor = '🌐';
  else if (upgList.some(u=>u==='decor_4'))    decor = '⛲';
  else if (upgList.some(u=>u==='decor_3'))    decor = '🕯️';
  else if (upgList.some(u=>u.startsWith('delivery_3'))) decor = '🚁';

  return { size, decor };
}

// Zoom & pan state
let cityZoom = 1.2;
let cityPanX = 0;
let cityPanY = 0;
let isDragging = false;
let dragSX = 0, dragSY = 0, panSX = 0, panSY = 0;
const CELL = 46;

async function renderCity() {
  const wrapper = document.getElementById('city-map-scroll');
  wrapper.innerHTML = '';

  // Controls bar
  const controls = document.createElement('div');
  controls.className = 'city-controls';
  controls.innerHTML = `
    <div class="city-ctrl-group">
      <button class="city-ctrl-btn" id="zoom-in"  onclick="cityZoomIn()">🔍+</button>
      <button class="city-ctrl-btn" id="zoom-out" onclick="cityZoomOut()">🔍-</button>
      <button class="city-ctrl-btn" onclick="cityCenter()">📍 Yo</button>
    </div>
    <div style="color:rgba(255,255,255,.35);font-size:10px;white-space:nowrap">Arrastra · Scroll = zoom</div>
  `;
  wrapper.appendChild(controls);
  // Setup drawer toggle
  setupRankingDrawer();

  // Viewport — fills remaining space
  const viewport = document.createElement('div');
  viewport.className = 'city-viewport';
  viewport.id = 'city-viewport';
  viewport.style.position = 'relative';
  viewport.style.flex = '1';
  wrapper.appendChild(viewport);

  // Canvas world — positioned inside viewport
  const world = document.createElement('div');
  world.className = 'city-world';
  world.id = 'city-world';
  world.style.position = 'absolute';
  world.style.top = '0';
  world.style.left = '0';
  viewport.appendChild(world);

  // Load real players
  try {
    if (window._db && window._db_getDocs && window._db_collection) {
      const snap = await window._db_getDocs(window._db_collection(window._db, 'city'));
      cityPlayers = [];
      snap.forEach(d => cityPlayers.push(d.data()));
    }
  } catch(e) {
    console.log('City load error:', e.message);
    cityPlayers = [];
  }

  // Merge with demo players (avoid position collisions)
  const allPlayers = [...cityPlayers];
  const usedPositions = new Set(cityPlayers.map(p => `${p.x},${p.y}`));
  DEMO_PLAYERS.forEach(dp => {
    if (!usedPositions.has(`${dp.x},${dp.y}`)) {
      allPlayers.push(dp);
      usedPositions.add(`${dp.x},${dp.y}`);
    }
  });

  // Build grid
  const grid = document.createElement('div');
  grid.className = 'city-grid-big';
  grid.style.cssText = `
    display:grid;
    grid-template-columns:repeat(${CITY_W},${CELL}px);
    grid-template-rows:repeat(${CITY_H},${CELL}px);
    gap:2px;
    width:${CITY_W*(CELL+2)}px;
    height:${CITY_H*(CELL+2)}px;
  `;

  const playerMap = {};
  allPlayers.forEach(p => { playerMap[`${p.x},${p.y}`] = p; });

  for (let y = 0; y < CITY_H; y++) {
    for (let x = 0; x < CITY_W; x++) {
      const tile = BIG_LAYOUT[y][x];
      const player = playerMap[`${x},${y}`];
      const isMe = player && window._currentUserId && player.userId === window._currentUserId;

      const cell = document.createElement('div');
      const tileNames = ['road','block','park','plaza','market'];
      cell.className = 'c-cell ' + (tileNames[tile]||'block');
      // Road direction classes for markings
      if (tile === 0) {
        const isHRoad = y % 3 === 2;
        const isVRoad = x % 3 === 2;
        if (isHRoad && isVRoad) cell.classList.add('x-road');
        else if (isHRoad)       cell.classList.add('h-road');
        else                    cell.classList.add('v-road');
      }
      if (player) cell.classList.add('has-player');
      if (isMe)   cell.classList.add('is-me');
      cell.style.width  = CELL+'px';
      cell.style.height = CELL+'px';

      if (player) {
        const col = getLvColor(player.level||1);
        cell.style.background = `radial-gradient(circle at 50% 60%, ${col}30, ${getTileBg(tile)})`;
        cell.style.border = isMe ? `2px solid ${col}` : `1px solid ${col}44`;
        const vis = getPizzeriaVisual(player);
        cell.innerHTML = `
          <div class="cell-inner">
            <span style="font-size:${isMe?22:18}px;line-height:1">${vis.size}</span>
            ${vis.decor ? `<span style="font-size:10px;position:absolute;top:2px;right:3px">${vis.decor}</span>` : ''}
            <span style="font-size:8px;color:${col};font-weight:900;text-shadow:0 1px 3px #000;max-width:${CELL-4}px;overflow:hidden;white-space:nowrap;text-align:center">${(player.username||'?').substring(0,7)}</span>
            ${isMe ? '<span style="font-size:7px;color:#ffcc00;font-weight:900">★ YO</span>' : ''}
          </div>`;
        cell.onclick = () => openPlayerPopup(player, allPlayers);
      } else if (tile===2) {
        cell.innerHTML = `<span style="font-size:${CELL*0.38}px;opacity:.7">🌳</span>`;
      } else if (tile===3) {
        cell.innerHTML = `<span style="font-size:${CELL*0.38}px;opacity:.7">⛲</span>`;
      } else if (tile===4) {
        cell.innerHTML = `<span style="font-size:${CELL*0.38}px;opacity:.7">🏛️</span>`;
      } else if (tile===1) {
        // Empty building slot — show faded outline
        cell.innerHTML = `<div style="position:absolute;inset:4px;border:1px dashed rgba(255,255,255,.06);border-radius:3px;display:flex;align-items:center;justify-content:center"><span style="font-size:14px;opacity:.15">🏗️</span></div>`;
      } else if (tile===0) {
        // Road markings
        if (y % 3 === 2) cell.style.borderBottom = '1px solid rgba(255,255,255,.04)';
      }

      grid.appendChild(cell);
    }
  }

  world.appendChild(grid);

  // Center on my player on load
  const myPlayer = allPlayers.find(p => p.userId === window._currentUserId);
  if (myPlayer) {
    cityPanX = -(myPlayer.x * (CELL+2) * cityZoom) + viewport.offsetWidth/2 - CELL/2;
    cityPanY = -(myPlayer.y * (CELL+2) * cityZoom) + viewport.offsetHeight/2 - CELL/2;
  }
  applyTransform();
  setupCityEvents(viewport, world);
  renderRanking(allPlayers);
}

function getTileBg(tile) {
  return ['#1e1a0c','#0f180f','#0a1a10','#181610','#141214'][tile] || '#0f180f';
}

function applyTransform() {
  const world = document.getElementById('city-world');
  if (!world) return;
  const vp = document.getElementById('city-viewport');
  if (!vp) return;
  // Clamp pan
  const maxX = 0, maxY = 0;
  const minX = -(CITY_W*(CELL+2)*cityZoom - vp.offsetWidth);
  const minY = -(CITY_H*(CELL+2)*cityZoom - vp.offsetHeight);
  cityPanX = Math.min(maxX, Math.max(minX, cityPanX));
  cityPanY = Math.min(maxY, Math.max(minY, cityPanY));
  world.style.transform = `translate(${cityPanX}px,${cityPanY}px) scale(${cityZoom})`;
  world.style.transformOrigin = '0 0';
}

function setupCityEvents(viewport, world) {
  // Mouse drag
  viewport.addEventListener('mousedown', e => {
    isDragging = true;
    dragSX = e.clientX; dragSY = e.clientY;
    panSX = cityPanX; panSY = cityPanY;
    viewport.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    cityPanX = panSX + (e.clientX - dragSX);
    cityPanY = panSY + (e.clientY - dragSY);
    applyTransform();
  });
  window.addEventListener('mouseup', () => { isDragging = false; if(viewport) viewport.style.cursor='grab'; });

  // Touch drag
  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragSX = e.touches[0].clientX; dragSY = e.touches[0].clientY;
      panSX = cityPanX; panSY = cityPanY;
    }
  }, {passive:true});
  viewport.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    cityPanX = panSX + (e.touches[0].clientX - dragSX);
    cityPanY = panSY + (e.touches[0].clientY - dragSY);
    applyTransform();
  }, {passive:true});
  viewport.addEventListener('touchend', () => { isDragging = false; });

  // Scroll zoom
  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    cityZoom = Math.min(2.5, Math.max(0.4, cityZoom + delta));
    applyTransform();
  }, {passive:false});

  viewport.style.cursor = 'grab';
}

window.cityZoomIn  = function() { cityZoom = Math.min(2.5, cityZoom+0.2); applyTransform(); };
window.cityZoomOut = function() { cityZoom = Math.max(0.4, cityZoom-0.2); applyTransform(); };
window.cityCenter  = function() {
  const vp = document.getElementById('city-viewport');
  if (!vp) return;
  const myPlayer = cityPlayers.find(p=>p.userId===window._currentUserId);
  if (myPlayer) {
    cityPanX = -(myPlayer.x*(CELL+2)*cityZoom) + vp.offsetWidth/2 - CELL/2;
    cityPanY = -(myPlayer.y*(CELL+2)*cityZoom) + vp.offsetHeight/2 - CELL/2;
    applyTransform();
  }
};

// ===================== PLAYER POPUP =====================
function openPlayerPopup(player, allPlayers) {
  const existing = document.getElementById('player-popup');
  if (existing) existing.remove();

  const isMe    = window._currentUserId && player.userId === window._currentUserId;
  const canPvp  = G.level >= 10 && !isMe;
  const isDemo  = player.userId.startsWith('d') && player.userId.length <= 3;
  const lastStr = timeAgoCity(player.lastActive);
  const vis     = getPizzeriaVisual(player);
  const col     = getLvColor(player.level||1);

  // Nearby players for "neighborhood"
  const neighbors = (allPlayers||[]).filter(p =>
    p.userId !== player.userId &&
    Math.abs((p.x||0)-(player.x||0)) <= 4 &&
    Math.abs((p.y||0)-(player.y||0)) <= 4
  ).slice(0,3);

  const popup = document.createElement('div');
  popup.className = 'player-popup';
  popup.id = 'player-popup';
  popup.innerHTML = `
    <div class="popup-card">
      <button class="popup-close" id="popup-close-btn">✕</button>
      <div class="popup-head">
        <div class="popup-avatar-big">${vis.size}${vis.decor}</div>
        <div>
          <div class="popup-name">${player.username||'?'}</div>
          <div class="popup-lvl" style="color:${col}">Nivel ${player.level||1} · ${LEVELS.find(l=>l.lv===(player.level||1))?.title||''}</div>
          ${isDemo?'<div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px">jugador demo</div>':''}
        </div>
      </div>
      <div class="popup-stats">
        <div class="popup-stat"><span>⭐ Reputación</span><strong>${player.reputation||0}</strong></div>
        <div class="popup-stat"><span>🍕 Pizzas vendidas</span><strong>${fmt(player.pizzasSold||0)}</strong></div>
        <div class="popup-stat"><span>🏪 Mejoras activas</span><strong>${(player.upgrades||[]).length}</strong></div>
        <div class="popup-stat"><span>📍 Posición ciudad</span><strong>(${player.x||0}, ${player.y||0})</strong></div>
        <div class="popup-stat"><span>📅 Última conexión</span><strong>${lastStr}</strong></div>
      </div>
      ${neighbors.length ? `
        <div style="margin-top:14px">
          <div style="font-size:11px;color:rgba(255,200,100,.6);margin-bottom:6px;font-weight:800">🏘️ VECINOS CERCANOS</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${neighbors.map(n=>`<span style="background:rgba(255,150,0,.1);border:1px solid rgba(255,150,0,.2);border-radius:8px;padding:4px 10px;font-size:11px;cursor:pointer;color:${getLvColor(n.level||1)}" onclick="document.getElementById('player-popup').remove()">${n.username} Nv.${n.level}</span>`).join('')}
          </div>
        </div>` : ''}
      ${canPvp ? `
        <div class="popup-pvp">
          <div class="pvp-title">⚔️ Acciones PvP — Nivel 10+</div>
          <button class="pvp-btn pvp-fire" onclick="pvpAction('fire','${player.userId}','${player.username}')">🔥 Contratar pirómano <span style="opacity:.6;font-size:10px">(coste: 500🍕 · riesgo: 30%)</span></button>
          <button class="pvp-btn pvp-water" onclick="pvpAction('water','${player.userId}','${player.username}')">💧 Sabotear cañerías <span style="opacity:.6;font-size:10px">(coste: 300🍕 · riesgo: 20%)</span></button>
          <button class="pvp-btn pvp-spy" onclick="pvpAction('spy','${player.userId}','${player.username}')">🕵️ Contratar detective <span style="opacity:.6;font-size:10px">(coste: 200🍕 · info)</span></button>
          <button class="pvp-btn pvp-sabotage" onclick="pvpAction('sabotage','${player.userId}','${player.username}')">🐀 Soltar ratas <span style="opacity:.6;font-size:10px">(coste: 150🍕 · riesgo: 15%)</span></button>
        </div>` : ''}
      ${!canPvp && !isMe && G.level < 10 ? `
        <div style="margin-top:14px;background:rgba(255,100,0,.06);border:1px solid rgba(255,100,0,.15);border-radius:10px;padding:10px;text-align:center">
          <div style="font-size:12px;color:rgba(255,150,0,.7)">⚔️ Desbloquea PvP en <strong>Nivel 10</strong></div>
          <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:3px">Te faltan ${10-G.level} niveles</div>
        </div>` : ''}
      ${isMe ? '<div class="popup-me-note">👑 ¡Esta es tu pizzería!</div>' : ''}
    </div>`;

  popup.onclick = e => { if (e.target===popup) popup.remove(); };
  document.body.appendChild(popup);
  document.getElementById('popup-close-btn').onclick = () => popup.remove();
}

// ===================== PVP SYSTEM =====================
window.pvpAction = function(type, targetId, targetName) {
  const actions = {
    fire:     { cost:500, name:'Pirómano',    riskBase:0.30, emoji:'🔥' },
    water:    { cost:300, name:'Sabotaje',    riskBase:0.20, emoji:'💧' },
    spy:      { cost:200, name:'Detective',   riskBase:0.05, emoji:'🕵️' },
    sabotage: { cost:150, name:'Ratas',       riskBase:0.15, emoji:'🐀' },
  };
  const action = actions[type];
  if (!action) return;
  if (G.pizzas < action.cost) {
    showPvpResult(`❌ No tienes suficientes pizzas (necesitas ${action.cost} 🍕)`,'error');
    return;
  }

  G.pizzas -= action.cost;
  updateUI();

  // Calculate success based on police corruption and detective level
  const policeBonus   = G.policeCorr * 0.005;  // reduces chance of getting caught
  const detectiveBonus = G.detectiveLv * 0.05;  // increases chance of detecting enemy
  const caughtChance  = Math.max(0.02, action.riskBase - policeBonus);
  const caught        = Math.random() < caughtChance;

  if (type === 'spy') {
    // Spy gives info, never caught
    showPvpResult(`🕵️ Detective contratado sobre <strong>${targetName}</strong>:<br>
      • Nivel: ~${Math.floor(Math.random()*3)+G.level-1}<br>
      • Seguridad: ${Math.random()>0.5?'Alta':'Baja'}<br>
      • Actividad: ${Math.random()>0.5?'Muy activo':'Poco activo'}<br>
      • Recomendación: ${Math.random()>0.5?'Atacable':'Bien defendido'}`, 'info');
    playSound('pvp');
    return;
  }

  if (caught) {
    const fine = Math.floor(G.pizzas * 0.1);
    G.pizzas = Math.max(0, G.pizzas - fine);
    updateUI();
    showPvpResult(`🚨 <strong>¡Te han pillado!</strong><br>La policía te ha detenido intentando sabotear a ${targetName}.<br>Multa: -${fmt(fine)} 🍕<br><small>Consejo: sube el nivel de soborno policial</small>`, 'error');
    playSound('event_bad');
  } else {
    const successMsgs = {
      fire:     `🔥 El pirómano actuó con éxito. La pizzería de <strong>${targetName}</strong> sufrió daños graves.`,
      water:    `💧 Las cañerías de <strong>${targetName}</strong> saboteadas. Sin agua durante horas.`,
      sabotage: `🐀 Las ratas invadieron el local de <strong>${targetName}</strong>. Inspección sanitaria inminente.`,
    };
    showPvpResult(`✅ ${successMsgs[type]}<br><small>No te han pillado. ${G.policeCorr>0?'El soborno funcionó.':''}</small>`, 'success');
    playSound('event_good');
  }
  const popup = document.getElementById('player-popup');
  if (popup) popup.remove();
};

function showPvpResult(html, type) {
  const colors = { success:'rgba(50,200,100,.5)', error:'rgba(255,50,50,.5)', info:'rgba(80,150,255,.5)' };
  const toast = document.createElement('div');
  toast.className = 'event-toast';
  toast.style.cssText = `border-color:${colors[type]};max-width:340px;pointer-events:all`;
  toast.innerHTML = `<span class="et-emoji">${type==='success'?'✅':type==='error'?'🚨':'🕵️'}</span><div class="et-body"><div class="et-desc" style="color:#fff;line-height:1.5">${html}</div></div>`;
  toast.onclick = () => toast.remove();
  document.getElementById('events-container').appendChild(toast);
  setTimeout(() => { if(toast.parentNode) toast.remove(); }, 8000);
}

function timeAgoCity(ts) {
  if (!ts) return 'Nunca';
  const d = Date.now()-ts;
  if (d<60000)    return '🟢 En línea';
  if (d<3600000)  return `Hace ${Math.floor(d/60000)}m`;
  if (d<86400000) return `Hace ${Math.floor(d/3600000)}h`;
  return `Hace ${Math.floor(d/86400000)}d`;
}

// ===================== RANKING =====================
function renderRanking(allPlayers) {
  const list = document.getElementById('ranking-list');
  if (!list) return;
  const players = [...(allPlayers||cityPlayers)].sort((a,b)=>(b.pizzasSold||0)-(a.pizzasSold||0));
  list.innerHTML = '';
  // Update count badge
  const countEl = document.getElementById('ranking-count');
  if (countEl) countEl.textContent = `(${players.length} jugadores)`;
  players.slice(0,30).forEach((p,i) => {
    const isMe = window._currentUserId && p.userId===window._currentUserId;
    const medals = ['🥇','🥈','🥉'];
    const row = document.createElement('div');
    row.className = 'rank-row'+(isMe?' me':'');
    row.innerHTML = `
      <span class="rank-num">${medals[i]||'#'+(i+1)}</span>
      <span>${getPizzeriaVisual(p).size}</span>
      <span class="rank-name">${p.username||'?'}</span>
      <span class="rank-lv" style="color:${getLvColor(p.level||1)}">Nv.${p.level||1}</span>
      <span class="rank-pz">${fmt(p.pizzasSold||0)} 🍕</span>
    `;
    row.onclick = () => openPlayerPopup(p, allPlayers||cityPlayers);
    list.appendChild(row);
  });
}

function setupRankingDrawer() {
  const drawer = document.getElementById('ranking-drawer');
  const handle = document.getElementById('ranking-handle');
  if (!drawer || !handle) return;
  handle.onclick = () => {
    drawer.classList.toggle('open');
  };
  // Swipe up to open, swipe down to close
  let touchStartY = 0;
  handle.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, {passive:true});
  handle.addEventListener('touchend', e => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 30) drawer.classList.add('open');
    if (diff < -30) drawer.classList.remove('open');
  }, {passive:true});
}

// ===================== PROFILE =====================
window.openProfile = function() {
  const lvData = LEVELS.find(l=>l.lv===G.level)||LEVELS[0];
  const nextLv  = LEVELS.find(l=>l.lv===G.level+1);
  document.getElementById('mod-uname').textContent    = window._currentUsername||'-';
  document.getElementById('mod-email').textContent    = window._currentEmail||'-';
  document.getElementById('mod-title-lv').textContent = lvData.title;
  const unlockedCount = Object.keys(G.upgrades).filter(k=>G.upgrades[k]>0).length;
  document.getElementById('mod-stat-grid').innerHTML = [
    ['Nivel',G.level],['XP Total',fmt(G.xp)],['🍕 Total',fmt(G.total)],
    ['Reputación',G.rep],['🍕/click',fmt(G.ppc)],['🍕/seg',fmt(G.pps)],
    ['Mejoras',unlockedCount],
  ].map(([l,v])=>`<div class="sg-box"><div class="sg-v">${v}</div><div class="sg-l">${l}</div></div>`).join('');
  const nu = document.getElementById('mod-next-unlock');
  if (nextLv) { nu.innerHTML=`<div class="nu-lbl">Próximo desbloqueo (Nv.${nextLv.lv}):</div><div class="nu-val">${nextLv.unlock}</div>`; nu.style.display='block'; }
  else nu.style.display='none';
  document.getElementById('mod-msg').style.display='none';
  document.getElementById('sec-msg').style.display='none';
  document.getElementById('profile-modal').style.display='flex';
};

window.closeProfile = function() { document.getElementById('profile-modal').style.display='none'; };

window.switchModalTab = function(tab, btn) {
  document.querySelectorAll('.modal-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('modal-stats').style.display    = tab==='stats'    ? 'block':'none';
  document.getElementById('modal-security').style.display = tab==='security' ? 'block':'none';
};

window.saveGameUI = async function() {
  const msg = document.getElementById('mod-msg');
  msg.style.display='block'; msg.textContent='⏳ Guardando...';
  try { await saveGameToFirebase(); msg.textContent='✅ Partida guardada en la nube'; }
  catch(e) { msg.textContent='⚠️ Error al guardar (sin conexión)'; }
  setTimeout(()=>msg.style.display='none',3000);
};

window.changePasswordUI = async function() {
  const np=document.getElementById('new-pass').value;
  const cp=document.getElementById('confirm-pass').value;
  const msg=document.getElementById('sec-msg');
  msg.style.display='block';
  if (np.length<6)  { msg.textContent='⚠️ Mínimo 6 caracteres'; return; }
  if (np!==cp)      { msg.textContent='⚠️ Las contraseñas no coinciden'; return; }
  try {
    await window._changePassword(np);
    msg.textContent='✅ Contraseña actualizada correctamente';
    document.getElementById('new-pass').value='';
    document.getElementById('confirm-pass').value='';
  } catch(e) { msg.textContent='⚠️ Error. Re-inicia sesión primero.'; }
  setTimeout(()=>msg.style.display='none',3500);
};
