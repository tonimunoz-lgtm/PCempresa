// ============================================================
//  ui-mapa.js — VALLNOVA: Ciutat interactiva amb operacions encobertes
//  
//  Framing: competència deslleial (NO violència real)
//  6 operacions: espionatge, difamació, fake reviews, head hunting, denúncia, "incendi"
//  Sistema de seguretat defensiva + policia + feed "Vallnova Live"
// ============================================================

(function() {
'use strict';

const getG   = () => window.G;
const saveGameData   = (...a) => window.saveGameData?.(...a);
const showToast      = (...a) => window.showToast?.(...a);
const showEventToast = (...a) => window.showEventToast?.(...a);
const playSfx        = (...a) => window.playSfx?.(...a);
const fmt            = (n) => (n||0).toLocaleString('ca');

// ════════════════════════════════════════════════════════════
//  CONFIGURACIÓ DEL MAPA
// ════════════════════════════════════════════════════════════

const MAP_CONFIG = {
  cols: 20,
  rows: 15,
  tileSize: 40, // 40px per casella → mapa 800×600
  get width()  { return this.cols * this.tileSize; },
  get height() { return this.rows * this.tileSize; },
};

// Paleta de colors segons moment del dia
const PALETTES = {
  day: {
    grass: '#2f7c3d',
    road: '#3a3f4a',
    roadLine: '#f5d547',
    sidewalk: '#858c99',
    plaza: '#8a9bb0',
    water: '#3a6bb0',
    building: '#4a5668',
    sky: '#6b9bd8',
  },
  dusk: {
    grass: '#3d5a30',
    road: '#2a2d36',
    roadLine: '#d4a63c',
    sidewalk: '#5c6270',
    plaza: '#5e6b7c',
    water: '#2a4a7a',
    building: '#3a3f52',
    sky: '#c68354',
  },
  night: {
    grass: '#1a2d1f',
    road: '#181b24',
    roadLine: '#6b5a30',
    sidewalk: '#2c303a',
    plaza: '#303845',
    water: '#142040',
    building: '#1e2230',
    sky: '#0c1428',
  },
};

// Layout fix de la ciutat (0-9 tipus de tile)
// 0=gespa, 1=carretera horitzontal, 2=carretera vertical, 3=vorera, 4=plaça, 5=aigua
// 6=parc (gespa+arbres), 7=edifici decoratiu, 8=intersecció, 9=pas vianants
// Els edificis d'empresa es col·loquen dinàmicament sobre caselles de gespa (0)
const CITY_LAYOUT = [
  // Files 0-2: nord — carretera principal i plaça
  [3,3,3,3,8,1,1,1,1,1,1,8,1,1,1,1,1,8,3,3],
  [3,6,6,3,2,0,0,0,0,0,0,2,0,0,0,0,0,2,3,3],
  [3,6,6,3,2,0,0,0,0,0,0,2,0,0,0,0,0,2,3,3],
  // Files 3-5: zona comercial
  [3,3,3,3,2,0,0,0,0,0,0,2,0,0,0,0,0,2,3,3],
  [8,1,1,8,2,0,0,4,4,4,4,2,0,0,0,0,0,2,3,3],
  [2,0,0,2,2,0,0,4,4,4,4,2,0,0,0,0,0,2,3,3],
  // Files 6-8: centre — plaça amb font + carrer major
  [2,0,0,2,2,0,0,4,4,4,4,2,0,0,0,0,0,8,1,1],
  [8,1,1,8,8,1,1,9,9,1,1,8,1,1,1,1,1,1,1,1],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0],
  // Files 9-11: zona residencial / industrial
  [2,0,0,6,6,6,0,0,0,0,0,0,6,6,6,0,0,2,0,0],
  [2,0,0,6,6,6,0,0,0,0,0,0,6,6,6,0,0,2,0,0],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0],
  // Files 12-14: sud — parc gran i llac
  [8,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,8,0,0],
  [3,6,6,6,6,6,6,3,2,5,5,5,5,5,5,5,3,3,0,0],
  [3,6,6,6,6,6,6,3,2,5,5,5,5,5,5,5,3,3,0,0],
];

// Punts d'interès fixos (decoracions)
const POI = [
  { type: 'plaza-fountain', col: 8,  row: 5,  w: 3, h: 2, icon: '🏛️', name: 'Plaça Central' },
  { type: 'police',         col: 1,  row: 0,  w: 1, h: 1, icon: '🚔', name: 'Estació de Policia' },
  { type: 'hospital',       col: 18, row: 2,  w: 1, h: 1, icon: '🏥', name: 'Hospital' },
  { type: 'ayuntamiento',   col: 0,  row: 7,  w: 1, h: 1, icon: '🏛️', name: 'Ajuntament' },
  { type: 'park',           col: 9,  row: 13, w: 1, h: 1, icon: '🌳', name: 'Parc del Llac' },
  { type: 'tree',           col: 2,  row: 1,  w: 1, h: 1, icon: '🌲', name: '' },
  { type: 'tree',           col: 2,  row: 2,  w: 1, h: 1, icon: '🌲', name: '' },
  { type: 'tree',           col: 4,  row: 10, w: 1, h: 1, icon: '🌳', name: '' },
  { type: 'tree',           col: 13, row: 10, w: 1, h: 1, icon: '🌳', name: '' },
];

// Slots on es col·loquen les empreses (rotats segons ordre del rànquing)
// w=3, h=3 caselles. Es trien slots d'aquesta llista segons # d'empreses.
const COMPANY_SLOTS = [
  { col: 5,  row: 1,  side: 'north' },
  { col: 12, row: 1,  side: 'north' },
  { col: 1,  row: 4,  side: 'west' },
  { col: 13, row: 4,  side: 'east' },
  { col: 0,  row: 8,  side: 'west' },
  { col: 13, row: 8,  side: 'east' },
  { col: 5,  row: 8,  side: 'central' },
  { col: 8,  row: 8,  side: 'central' },
];


// ════════════════════════════════════════════════════════════
//  ESTAT DE RENDERITZAT
// ════════════════════════════════════════════════════════════

let canvas = null;
let ctx = null;
let animationFrame = null;
let lastFrameTime = 0;
let gameTime = 8 * 3600; // Temps del joc en segons (comença a les 08:00)
const DAY_LENGTH_SECONDS = 30; // 30 segons reals = 1 dia virtual
let selectedCompanyUid = null;
let companies = []; // Empreses renderitzades al mapa
let hoveredBuilding = null;

// ★★★ SESSIÓ 2: Sprites animats ★★★
let pedestrians = [];  // Persones caminant per voreres
let cars = [];          // Cotxes pels carrers
let visualEvents = [];  // Flames, sirenes, etc. que apareixen quan passa quelcom

const PEDESTRIAN_EMOJIS = ['🚶', '🚶‍♀️', '🧑', '👩', '👨', '🧍', '🧍‍♀️', '👔', '🧑‍💼', '👩‍💼', '👨‍💼', '🧑‍🎓', '🛍️'];
const CAR_EMOJIS = ['🚗', '🚙', '🚕', '🚐', '🛵'];
const BIG_VEHICLE_EMOJIS = ['🚚', '🚌', '🚓'];

function isTileOfType(col, row, types) {
  const t = CITY_LAYOUT[row]?.[col];
  return types.includes(t);
}

function findWalkableNeighbor(col, row) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  const options = [];
  dirs.forEach(([dc, dr]) => {
    const nc = col + dc, nr = row + dr;
    if (nc < 0 || nc >= MAP_CONFIG.cols || nr < 0 || nr >= MAP_CONFIG.rows) return;
    if (isTileOfType(nc, nr, [3, 4, 6, 9])) {
      options.push({ col: nc, row: nr });
    }
  });
  return options;
}

function findRoadNeighbor(col, row, currentDir) {
  const dirs = {
    right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1]
  };
  const options = [];
  const opposite = { right:'left', left:'right', up:'down', down:'up' };
  
  if (currentDir && dirs[currentDir]) {
    const [dc, dr] = dirs[currentDir];
    const nc = col + dc, nr = row + dr;
    if (nc >= 0 && nc < MAP_CONFIG.cols && nr >= 0 && nr < MAP_CONFIG.rows &&
        isTileOfType(nc, nr, [1, 2, 8, 9])) {
      options.push({ col: nc, row: nr, dir: currentDir });
    }
  }
  
  const otherDirs = Object.keys(dirs).filter(d => d !== currentDir).sort(() => Math.random() - 0.5);
  for (const dir of otherDirs) {
    if (currentDir && dir === opposite[currentDir]) continue;
    const [dc, dr] = dirs[dir];
    const nc = col + dc, nr = row + dr;
    if (nc < 0 || nc >= MAP_CONFIG.cols || nr < 0 || nr >= MAP_CONFIG.rows) continue;
    if (isTileOfType(nc, nr, [1, 2, 8, 9])) {
      options.push({ col: nc, row: nr, dir });
    }
  }
  return options;
}

function spawnPedestrian() {
  const walkableTiles = [];
  for (let r = 0; r < MAP_CONFIG.rows; r++) {
    for (let c = 0; c < MAP_CONFIG.cols; c++) {
      if (isTileOfType(c, r, [3])) walkableTiles.push({ col: c, row: r });
    }
  }
  if (walkableTiles.length === 0) return;
  
  const spawn = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
  const emoji = PEDESTRIAN_EMOJIS[Math.floor(Math.random() * PEDESTRIAN_EMOJIS.length)];
  
  pedestrians.push({
    id: Date.now() + Math.random(),
    emoji,
    px: spawn.col * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2,
    py: spawn.row * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2,
    col: spawn.col,
    row: spawn.row,
    targetCol: spawn.col,
    targetRow: spawn.row,
    speed: 15 + Math.random() * 10,
    life: 60 + Math.random() * 60,
    age: 0,
    bobPhase: Math.random() * Math.PI * 2,
  });
}

function spawnCar() {
  const roadEdges = [];
  for (let r = 0; r < MAP_CONFIG.rows; r++) {
    for (let c = 0; c < MAP_CONFIG.cols; c++) {
      if (!isTileOfType(c, r, [1, 2, 8])) continue;
      if (c === 0 || c === MAP_CONFIG.cols - 1 || r === 0 || r === MAP_CONFIG.rows - 1) {
        roadEdges.push({ col: c, row: r });
      }
    }
  }
  if (roadEdges.length === 0) return;
  
  const spawn = roadEdges[Math.floor(Math.random() * roadEdges.length)];
  const isSpecial = Math.random() < 0.08;
  const emoji = isSpecial 
    ? BIG_VEHICLE_EMOJIS[Math.floor(Math.random() * BIG_VEHICLE_EMOJIS.length)]
    : CAR_EMOJIS[Math.floor(Math.random() * CAR_EMOJIS.length)];
  
  let dir = 'right';
  if (spawn.col === MAP_CONFIG.cols - 1) dir = 'left';
  else if (spawn.row === MAP_CONFIG.rows - 1) dir = 'up';
  else if (spawn.row === 0) dir = 'down';
  
  cars.push({
    id: Date.now() + Math.random(),
    emoji,
    px: spawn.col * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2,
    py: spawn.row * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2,
    col: spawn.col,
    row: spawn.row,
    targetCol: spawn.col,
    targetRow: spawn.row,
    dir,
    speed: isSpecial ? 40 : 50 + Math.random() * 30,
    life: 40,
    age: 0,
    isSpecial,
  });
}

function updateSprites(delta) {
  const hour = (gameTime / 3600) % 24;
  const isNight = hour >= 22 || hour < 6;
  const isRushHour = (hour >= 8 && hour < 10) || (hour >= 18 && hour < 20);
  
  const pedestrianTarget = isNight ? 4 : isRushHour ? 22 : 10;
  const carTarget = isNight ? 2 : isRushHour ? 9 : 4;
  
  if (pedestrians.length < pedestrianTarget && Math.random() < 0.15) spawnPedestrian();
  if (cars.length < carTarget && Math.random() < 0.08) spawnCar();
  
  pedestrians = pedestrians.filter(p => {
    p.age += delta;
    if (p.age > p.life) return false;
    
    const targetPx = p.targetCol * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2;
    const targetPy = p.targetRow * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2;
    const dx = targetPx - p.px;
    const dy = targetPy - p.py;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 3) {
      p.col = p.targetCol;
      p.row = p.targetRow;
      const neighbors = findWalkableNeighbor(p.col, p.row);
      if (neighbors.length === 0) return false;
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      p.targetCol = next.col;
      p.targetRow = next.row;
    } else {
      const moveDist = p.speed * delta;
      p.px += (dx/dist) * moveDist;
      p.py += (dy/dist) * moveDist;
    }
    return true;
  });
  
  cars = cars.filter(c => {
    c.age += delta;
    if (c.age > c.life) return false;
    
    const targetPx = c.targetCol * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2;
    const targetPy = c.targetRow * MAP_CONFIG.tileSize + MAP_CONFIG.tileSize/2;
    const dx = targetPx - c.px;
    const dy = targetPy - c.py;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 5) {
      c.col = c.targetCol;
      c.row = c.targetRow;
      const neighbors = findRoadNeighbor(c.col, c.row, c.dir);
      if (neighbors.length === 0) return false;
      const next = Math.random() < 0.7 ? neighbors[0] : neighbors[Math.floor(Math.random() * neighbors.length)];
      c.targetCol = next.col;
      c.targetRow = next.row;
      c.dir = next.dir;
    } else {
      const moveDist = c.speed * delta;
      c.px += (dx/dist) * moveDist;
      c.py += (dy/dist) * moveDist;
    }
    
    if (c.px < -40 || c.px > MAP_CONFIG.width + 40 || c.py < -40 || c.py > MAP_CONFIG.height + 40) return false;
    return true;
  });
  
  visualEvents = visualEvents.filter(e => {
    e.age = (e.age || 0) + delta;
    return e.age < e.duration;
  });
}


// ════════════════════════════════════════════════════════════
//  EVENTS VISUALS SOBRE EL MAPA
// ════════════════════════════════════════════════════════════

function addVisualEvent(targetUid, type, duration = 10) {
  const target = companies.find(c => c.uid === targetUid);
  if (!target) return;
  
  visualEvents.push({
    id: Date.now() + Math.random(),
    type,
    targetUid,
    col: target.col,
    row: target.row,
    w: target.w,
    h: target.h,
    duration,
    age: 0,
  });
  
  if (window.playSfx) {
    if (type === 'fire' || type === 'police') playSfx('alert');
    else if (type === 'success') playSfx('cling');
    else playSfx('click');
  }
}

window.addMapVisualEvent = addVisualEvent;

// ════════════════════════════════════════════════════════════
//  CSS
// ════════════════════════════════════════════════════════════

const CSS = document.createElement('style');
CSS.textContent = `
.vallnova-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
}
.vallnova-topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  background: linear-gradient(90deg, rgba(79,127,255,.10), rgba(124,58,237,.08));
  border-bottom: 1px solid var(--border);
  font-family: var(--font);
}
.vallnova-title {
  font-family: 'Syne', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.vallnova-clock {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--gold);
  background: rgba(245,158,11,.10);
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 700;
}
.vallnova-counter {
  font-size: 11px;
  color: var(--text2);
  margin-left: auto;
  display: flex;
  gap: 10px;
}
.vallnova-counter span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.vallnova-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
  min-height: 0;
}
@media (max-width: 900px) {
  .vallnova-layout { grid-template-columns: 1fr; }
  .vallnova-sidebar { order: -1; max-height: 300px; }
}
.vallnova-canvas-wrap {
  position: relative;
  background: #1a2332;
  border: 1px solid var(--border2);
  border-radius: 12px;
  overflow: hidden;
  min-height: 500px;
}
#vallnova-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  image-rendering: pixelated;
}
.vallnova-controls {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
  background: rgba(0,0,0,.6);
  padding: 6px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
}
.vallnova-ctrl-btn {
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.15);
  color: #fff;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: var(--font);
  font-weight: 700;
}
.vallnova-ctrl-btn:hover { background: rgba(255,255,255,.20); }
.vallnova-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,.6);
  padding: 8px 12px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  font-size: 10px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vallnova-legend-item { display: flex; align-items: center; gap: 4px; }
.vallnova-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-width: 0;
}
.sidebar-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}
.sidebar-section h3 {
  font-family: 'Syne', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Tooltip flotant d'empresa al hover */
.map-tooltip {
  position: absolute;
  background: linear-gradient(180deg, rgba(20,28,60,.98), rgba(8,12,24,.98));
  border: 1px solid var(--accent);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--text);
  font-size: 12px;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
  font-family: var(--font);
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
}
.map-tooltip-name {
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}
.map-tooltip-sub {
  font-size: 10px;
  color: var(--text2);
}

/* Modal de selecció d'empresa */
.company-select-modal {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.75);
  backdrop-filter: blur(10px);
  animation: fadeIn .3s ease;
  padding: 16px;
}
.company-select-card {
  background: linear-gradient(180deg, rgba(20,28,60,.99), rgba(8,12,24,.99));
  border: 2px solid var(--accent);
  border-radius: 18px;
  padding: 22px;
  max-width: 420px;
  width: 100%;
  animation: slideUp .4s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(79,127,255,.2);
}
.cs-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.cs-avatar {
  font-size: 48px;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(79,127,255,.2), rgba(124,58,237,.15));
  border-radius: 14px;
  border: 1px solid var(--border2);
  flex-shrink: 0;
}
.cs-info { flex: 1; min-width: 0; }
.cs-name {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}
.cs-owner {
  font-size: 11px;
  color: var(--text2);
  margin-bottom: 4px;
}
.cs-sector {
  font-size: 10px;
  color: var(--text3);
}
.cs-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.cs-stat {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
}
.cs-stat-label {
  font-size: 10px;
  color: var(--text3);
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.cs-stat-value {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
}
.cs-ranking {
  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.25);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--gold);
  font-weight: 700;
  text-align: center;
  margin-bottom: 14px;
}
.cs-actions {
  display: flex;
  gap: 8px;
}
.cs-btn {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  font-family: var(--font);
  transition: .2s;
}
.cs-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff;
}
.cs-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,127,255,.4); }
.cs-btn.danger {
  background: linear-gradient(135deg, #c1352d, #7a1a16);
  color: #fff;
}
.cs-btn.danger:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239,68,68,.4); }
.cs-btn.secondary {
  background: rgba(255,255,255,.06);
  color: var(--text);
  border: 1px solid var(--border);
}

/* Badges al selector */
.cs-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 6px;
  margin-left: 4px;
  letter-spacing: 0.5px;
}
.cs-badge.me { background: rgba(79,127,255,.20); color: var(--accent); }
.cs-badge.leader { background: rgba(245,158,11,.20); color: var(--gold); }
.cs-badge.crisis { background: rgba(239,68,68,.20); color: var(--red); }
`;
document.head.appendChild(CSS);


// ════════════════════════════════════════════════════════════
//  RECÀLCUL D'EMPRESES AL MAPA
// ════════════════════════════════════════════════════════════

function getCompaniesInCity() {
  const G = getG();
  if (!G) return [];
  
  // Obtenir tots els alumnes de la meva classe (ja filtrats per allStudents)
  const allStudents = G.allStudents || [];
  const withCompany = allStudents.filter(s => s.company && !s.isProf);
  
  // Ordenar per cash descendent (el líder al primer slot central)
  const sorted = [...withCompany].sort((a, b) => 
    ((b.finances?.cash||0) - (a.finances?.cash||0))
  );
  
  // Assignar slots
  const result = [];
  sorted.forEach((student, i) => {
    if (i >= COMPANY_SLOTS.length) return; // màxim 8 empreses al mapa
    const slot = COMPANY_SLOTS[i];
    result.push({
      uid: student.uid,
      student: student,
      col: slot.col,
      row: slot.row,
      w: 3, h: 3,
      isMe: student.uid === G.uid,
      isLeader: i === 0,
      cash: student.finances?.cash || 0,
      prestigi: student.prestigi || 0,
      employees: (student.employees||[]).length,
      inCrisis: (student.finances?.cash||0) < 0,
      icon: student._avatar?.emoji || student.company?.sectorData?.icon || '🏢',
      color: student._avatar?.color || (i === 0 ? '#f5d547' : student.uid === G.uid ? '#4f7fff' : '#7a8599'),
      name: student.company?.name || 'Empresa',
      ownerName: student.displayName || 'Alumne',
      rank: i + 1,
    });
  });
  
  return result;
}


// ════════════════════════════════════════════════════════════
//  RENDERITZAT DEL CANVAS
// ════════════════════════════════════════════════════════════

function getCurrentPalette() {
  const hour = (gameTime / 3600) % 24;
  if (hour >= 6 && hour < 18) return PALETTES.day;
  if (hour >= 18 && hour < 22) return PALETTES.dusk;
  return PALETTES.night;
}

function drawTile(ctx, col, row, type, pal) {
  const x = col * MAP_CONFIG.tileSize;
  const y = row * MAP_CONFIG.tileSize;
  const s = MAP_CONFIG.tileSize;
  
  switch(type) {
    case 0: // gespa
      ctx.fillStyle = pal.grass;
      ctx.fillRect(x, y, s, s);
      // Textura: petits punts
      ctx.fillStyle = 'rgba(0,0,0,.1)';
      ctx.fillRect(x + 8, y + 12, 2, 2);
      ctx.fillRect(x + 22, y + 6, 2, 2);
      ctx.fillRect(x + 32, y + 26, 2, 2);
      ctx.fillRect(x + 15, y + 30, 2, 2);
      break;
    case 1: // carretera horitzontal
    case 2: // carretera vertical
    case 8: // intersecció
      ctx.fillStyle = pal.road;
      ctx.fillRect(x, y, s, s);
      // Línies discontinues
      ctx.strokeStyle = pal.roadLine;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      if (type === 1) {
        ctx.moveTo(x, y + s/2);
        ctx.lineTo(x + s, y + s/2);
      } else if (type === 2) {
        ctx.moveTo(x + s/2, y);
        ctx.lineTo(x + s/2, y + s);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 3: // vorera
      ctx.fillStyle = pal.sidewalk;
      ctx.fillRect(x, y, s, s);
      // Llambordes
      ctx.strokeStyle = 'rgba(0,0,0,.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
      ctx.beginPath();
      ctx.moveTo(x + s/2, y);
      ctx.lineTo(x + s/2, y + s);
      ctx.moveTo(x, y + s/2);
      ctx.lineTo(x + s, y + s/2);
      ctx.stroke();
      break;
    case 4: // plaça
      ctx.fillStyle = pal.plaza;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fillRect(x, y, s, 2);
      ctx.fillRect(x, y, 2, s);
      break;
    case 5: // aigua
      ctx.fillStyle = pal.water;
      ctx.fillRect(x, y, s, s);
      // Onades
      const t = gameTime / 50;
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + s/3 + Math.sin(t + col) * 2);
      ctx.lineTo(x + s, y + s/3 + Math.sin(t + col + 1) * 2);
      ctx.moveTo(x, y + 2*s/3 + Math.sin(t + col + 2) * 2);
      ctx.lineTo(x + s, y + 2*s/3 + Math.sin(t + col + 3) * 2);
      ctx.stroke();
      break;
    case 6: // parc (gespa + fulles)
      ctx.fillStyle = pal.grass;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      for (let i = 0; i < 5; i++) {
        const dx = (i * 8 + 5) % s;
        const dy = (i * 13 + 2) % s;
        ctx.fillRect(x + dx, y + dy, 3, 3);
      }
      break;
    case 9: // pas de vianants
      ctx.fillStyle = pal.road;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#eee';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + 3 + i*7, y + 10, 5, 20);
      }
      break;
    default:
      ctx.fillStyle = pal.grass;
      ctx.fillRect(x, y, s, s);
  }
}

function drawCityBase(ctx, pal) {
  // Renderitzar totes les tiles
  for (let r = 0; r < MAP_CONFIG.rows; r++) {
    for (let c = 0; c < MAP_CONFIG.cols; c++) {
      const type = CITY_LAYOUT[r]?.[c] ?? 0;
      drawTile(ctx, c, r, type, pal);
    }
  }
}

function drawPOI(ctx, pal) {
  POI.forEach(p => {
    const x = p.col * MAP_CONFIG.tileSize;
    const y = p.row * MAP_CONFIG.tileSize;
    const s = MAP_CONFIG.tileSize;
    
    // Fons si no és un arbre
    if (p.type !== 'tree') {
      ctx.fillStyle = pal.building;
      ctx.fillRect(x + 2, y + 2, s * p.w - 4, s * p.h - 4);
      // Borde
      ctx.strokeStyle = 'rgba(0,0,0,.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, s * p.w - 4, s * p.h - 4);
    }
    
    // Icona emoji centrada
    ctx.font = `${Math.floor(s * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.icon, x + s * p.w / 2, y + s * p.h / 2 + 2);
  });
}

function drawCompanies(ctx, pal) {
  companies.forEach(co => {
    const x = co.col * MAP_CONFIG.tileSize;
    const y = co.row * MAP_CONFIG.tileSize;
    const s = MAP_CONFIG.tileSize;
    const w = co.w * s;
    const h = co.h * s;
    
    const isHovered = hoveredBuilding && hoveredBuilding.uid === co.uid;
    const isSelected = selectedCompanyUid === co.uid;
    
    // Ombra del edifici
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(x + 4, y + 4, w, h);
    
    // Cos del edifici (amb gradient subtil)
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, shadeColor(co.color, isHovered || isSelected ? 30 : 20));
    grad.addColorStop(1, shadeColor(co.color, -20));
    ctx.fillStyle = co.inCrisis ? '#7a2b26' : grad;
    ctx.fillRect(x, y, w, h);
    
    // Borde de selecció/hover
    if (isSelected) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
      // Glow
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 12;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;
    } else if (isHovered) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    } else {
      // Borde normal segons estat
      if (co.isMe) {
        ctx.strokeStyle = '#4f7fff';
        ctx.lineWidth = 2.5;
      } else if (co.isLeader) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
      } else if (co.inCrisis) {
        // Parpelleig vermell per crisi
        const blink = Math.sin(gameTime / 4) > 0;
        ctx.strokeStyle = blink ? '#ef4444' : '#7a1a16';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,.5)';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(x, y, w, h);
    }
    
    // Finestres (rengles de punts il·luminats)
    const isNight = getCurrentPalette() === PALETTES.night;
    const isDusk = getCurrentPalette() === PALETTES.dusk;
    ctx.fillStyle = isNight ? 'rgba(255,220,100,.8)' : isDusk ? 'rgba(255,220,100,.4)' : 'rgba(255,255,255,.15)';
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        const wx = x + 6 + c * (w - 12) / 4 - 3;
        const wy = y + 12 + r * 30;
        // Algunes finestres apagades a la nit
        if (isNight && Math.random() < 0.3) continue;
        ctx.fillRect(wx, wy, 6, 8);
      }
    }
    
    // Emoji de l'avatar al sostre (icona principal)
    ctx.font = `${Math.floor(s * 0.8)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(co.icon, x + w/2, y + s * 0.5);
    
    // Nom sota l'edifici
    ctx.fillStyle = isNight ? '#fff' : '#000';
    ctx.strokeStyle = isNight ? '#000' : '#fff';
    ctx.lineWidth = 3;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const labelY = y + h + 14;
    ctx.strokeText(co.name, x + w/2, labelY);
    ctx.fillText(co.name, x + w/2, labelY);
    
    // Badge de rànquing
    if (co.isLeader) {
      ctx.font = '18px serif';
      ctx.fillText('👑', x + w - 8, y + 10);
    } else if (co.isMe) {
      ctx.fillStyle = '#4f7fff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + w - 10, y + 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('TU', x + w - 10, y + 14);
    }
    
    // Indicador de ranking (#2, #3, etc.)
    if (co.rank > 1 && !co.isMe) {
      ctx.fillStyle = 'rgba(0,0,0,.7)';
      ctx.fillRect(x + 2, y + 2, 24, 14);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('#' + co.rank, x + 4, y + 10);
    }
  });
}

function shadeColor(hex, percent) {
  // Helper per tornar un color més clar/fosc
  if (!hex || !hex.startsWith('#')) hex = '#4f7fff';
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function drawNightOverlay(ctx, pal) {
  // Tint semitransparent segons paleta (per suavitzar la transició dia/nit)
  if (pal === PALETTES.night) {
    ctx.fillStyle = 'rgba(10,20,50,.25)';
    ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
  } else if (pal === PALETTES.dusk) {
    ctx.fillStyle = 'rgba(200,100,40,.10)';
    ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
  }
}

// ─── SPRITES: dibuixar vianants i cotxes ───
function drawSprites(ctx) {
  const hour = (gameTime / 3600) % 24;
  const isNight = hour >= 22 || hour < 6;
  const isDusk = hour >= 18 && hour < 22;
  const opacityNight = isNight ? 0.55 : isDusk ? 0.80 : 1;
  
  // Vianants
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '18px serif';
  pedestrians.forEach(p => {
    ctx.globalAlpha = opacityNight;
    // Petit bob vertical per simular caminar
    const bob = Math.sin(gameTime * 4 + p.bobPhase) * 1.5;
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.beginPath();
    ctx.ellipse(p.px, p.py + 8, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Emoji
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = opacityNight;
    ctx.fillText(p.emoji, p.px, p.py + bob);
  });
  
  // Cotxes
  ctx.font = '22px serif';
  cars.forEach(c => {
    ctx.globalAlpha = opacityNight;
    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.ellipse(c.px, c.py + 10, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Halo si és especial (policia)
    if (c.isSpecial && c.emoji === '🚓') {
      const flash = Math.sin(gameTime * 15) > 0;
      ctx.fillStyle = flash ? 'rgba(79,127,255,.5)' : 'rgba(239,68,68,.5)';
      ctx.beginPath();
      ctx.arc(c.px, c.py, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    // Emoji
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = opacityNight;
    ctx.fillText(c.emoji, c.px, c.py);
  });
  
  ctx.globalAlpha = 1;
}

// ─── EVENTS VISUALS: flames, sirenes, pluja de fletxes, etc. ───
function drawVisualEvents(ctx) {
  visualEvents.forEach(e => {
    const x = e.col * MAP_CONFIG.tileSize;
    const y = e.row * MAP_CONFIG.tileSize;
    const w = e.w * MAP_CONFIG.tileSize;
    const h = e.h * MAP_CONFIG.tileSize;
    const t = e.age;
    const remaining = e.duration - e.age;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (e.type === 'fire') {
      // Flames al damunt de l'edifici — emojis oscil·lant
      const flames = ['🔥', '🔥', '🔥'];
      ctx.font = '32px serif';
      flames.forEach((f, i) => {
        const wave = Math.sin(t * 8 + i * 1.5) * 3;
        const fx = x + w * (0.3 + i * 0.2) + wave;
        const fy = y + h * 0.3 + Math.sin(t * 6 + i) * 5;
        ctx.fillText(f, fx, fy);
      });
      // Fum
      ctx.font = '28px serif';
      for (let i = 0; i < 4; i++) {
        const smokeY = y - 15 - i * 20 - (t * 30) % 40;
        ctx.globalAlpha = Math.max(0, 0.6 - i * 0.15 - (t * 30 % 40) / 100);
        ctx.fillText('💨', x + w/2 + Math.sin(t * 3 + i) * 10, smokeY);
      }
      ctx.globalAlpha = 1;
      // Glow vermell al voltant
      const pulse = 0.5 + Math.sin(t * 8) * 0.3;
      ctx.shadowColor = 'rgba(239,68,68,.8)';
      ctx.shadowBlur = 25 * pulse;
      ctx.strokeStyle = 'rgba(239,68,68,.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
      ctx.shadowBlur = 0;
    }
    
    else if (e.type === 'police') {
      // Sirenes blau-vermell parpellejant al damunt
      const flash = Math.sin(t * 10) > 0;
      ctx.font = '28px serif';
      ctx.fillText(flash ? '🚨' : '🚔', x + w/2, y - 15);
      // Aura parpellejant
      ctx.shadowColor = flash ? 'rgba(79,127,255,.8)' : 'rgba(239,68,68,.8)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = flash ? 'rgba(79,127,255,.7)' : 'rgba(239,68,68,.7)';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
      ctx.shadowBlur = 0;
    }
    
    else if (e.type === 'inspection') {
      // Inspector acostant-se amb portafoli
      ctx.font = '28px serif';
      const walkX = x - 30 + t * 15; // camina cap a l'edifici
      if (walkX < x + w/2) {
        ctx.fillText('🕴️', walkX, y + h/2);
        ctx.fillText('📋', walkX + 15, y + h/2 - 10);
      } else {
        // Ja ha arribat — icones a la façana
        ctx.fillText('🕴️📋', x + w/2, y + h/2);
      }
    }
    
    else if (e.type === 'migration') {
      // Un empleat migrant — apareix una fletxa cap a una altra empresa
      if (e.targetUid2) {
        const target2 = companies.find(c => c.uid === e.targetUid2);
        if (target2) {
          const x2 = target2.col * MAP_CONFIG.tileSize + target2.w * MAP_CONFIG.tileSize / 2;
          const y2 = target2.row * MAP_CONFIG.tileSize + target2.h * MAP_CONFIG.tileSize / 2;
          const x1 = x + w/2;
          const y1 = y + h/2;
          // Progrés del moviment
          const progress = Math.min(1, t / (e.duration * 0.8));
          const empX = x1 + (x2 - x1) * progress;
          const empY = y1 + (y2 - y1) * progress - Math.sin(progress * Math.PI) * 20; // arc
          ctx.font = '24px serif';
          ctx.fillText('🧑‍💼', empX, empY);
          // Línia de trajectòria
          ctx.strokeStyle = 'rgba(245,158,11,.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    
    else if (e.type === 'news-bad') {
      // Diari amb titular vermell
      ctx.font = '32px serif';
      const bounce = Math.sin(t * 4) * 3;
      ctx.fillText('📰', x + w/2, y - 20 + bounce);
      // Text "SCANDAL!" parpellejant
      ctx.font = 'bold 10px system-ui';
      ctx.fillStyle = Math.sin(t * 8) > 0 ? '#ef4444' : '#fff';
      ctx.fillText('ESCÀNDOL!', x + w/2, y - 5);
    }
    
    else if (e.type === 'success') {
      // Confeti simple
      const confettiCount = 8;
      for (let i = 0; i < confettiCount; i++) {
        const angle = (i / confettiCount) * Math.PI * 2;
        const dist = t * 80;
        const cx = x + w/2 + Math.cos(angle) * dist;
        const cy = y + h/2 + Math.sin(angle) * dist - t * 50;
        ctx.fillStyle = ['#f5d547','#ef4444','#4f7fff','#10b981','#a78bfa'][i % 5];
        ctx.fillRect(cx, cy, 6, 10);
      }
      // Emoji estrella
      ctx.font = '32px serif';
      ctx.fillStyle = '#f5d547';
      ctx.fillText('⭐', x + w/2, y + h/2);
    }
    
    else if (e.type === 'review') {
      // Gotes d'estrelles caient
      ctx.font = '22px serif';
      for (let i = 0; i < 5; i++) {
        const phase = (t * 1.5 + i * 0.4) % 1;
        const sx = x + (i / 5) * w + 10;
        const sy = y - 10 + phase * (h + 30);
        ctx.globalAlpha = 1 - phase * 0.5;
        ctx.fillText('⭐', sx, sy);
      }
      ctx.globalAlpha = 1;
    }
    
    // Fade out al final
    if (remaining < 1) {
      ctx.fillStyle = `rgba(0,0,0,${1 - remaining})`;
      // Opcional: un lleuger oscuriment
    }
  });
}

function render() {
  if (!canvas || !ctx) return;
  
  const pal = getCurrentPalette();
  
  // Cel de fons
  ctx.fillStyle = pal.sky;
  ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
  
  // Capes: base → POI → cotxes (sota edificis) → empreses → vianants (damunt) → events → overlay nocturn
  drawCityBase(ctx, pal);
  drawPOI(ctx, pal);
  // Els cotxes van SOTA els edificis (perquè visualment sembli que estan als carrers)
  // Dibuixem vehicles primer, després edificis, després vianants
  drawSprites(ctx);
  drawCompanies(ctx, pal);
  // Tornem a dibuixar els vianants que caminen per davant dels edificis (efecte de profunditat simple)
  // — per simplicitat els deixem tots dibuixats al mateix moment
  drawVisualEvents(ctx);
  drawNightOverlay(ctx, pal);
}

function animationLoop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const delta = Math.min(0.1, (timestamp - lastFrameTime) / 1000); // màxim 100ms per evitar salts grans
  lastFrameTime = timestamp;
  
  // Avançar temps del joc
  gameTime += delta * (86400 / DAY_LENGTH_SECONDS);
  if (gameTime >= 86400) gameTime -= 86400;
  
  // ★ Actualitzar sprites i events visuals ★
  updateSprites(delta);
  
  render();
  updateClock();
  
  animationFrame = requestAnimationFrame(animationLoop);
}


// ════════════════════════════════════════════════════════════
//  INTERACCIÓ — CLICS I HOVER
// ════════════════════════════════════════════════════════════

function getMouseTile(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = MAP_CONFIG.width / rect.width;
  const scaleY = MAP_CONFIG.height / rect.height;
  const x = (evt.clientX - rect.left) * scaleX;
  const y = (evt.clientY - rect.top) * scaleY;
  return {
    col: Math.floor(x / MAP_CONFIG.tileSize),
    row: Math.floor(y / MAP_CONFIG.tileSize),
    px: x, py: y,
  };
}

function getCompanyAt(col, row) {
  return companies.find(co => 
    col >= co.col && col < co.col + co.w &&
    row >= co.row && row < co.row + co.h
  );
}

function handleCanvasClick(evt) {
  const pos = getMouseTile(evt);
  const co = getCompanyAt(pos.col, pos.row);
  
  if (co) {
    selectedCompanyUid = co.uid;
    if (window.playSfx) playSfx('click');
    showCompanyModal(co);
  } else {
    selectedCompanyUid = null;
  }
}

function handleCanvasMouseMove(evt) {
  const pos = getMouseTile(evt);
  const co = getCompanyAt(pos.col, pos.row);
  
  hoveredBuilding = co || null;
  canvas.style.cursor = co ? 'pointer' : 'default';
  
  // Tooltip
  const tooltip = document.getElementById('map-tooltip');
  if (co && tooltip) {
    tooltip.style.display = 'block';
    const rect = canvas.getBoundingClientRect();
    tooltip.style.left = (evt.clientX - rect.left + 15) + 'px';
    tooltip.style.top = (evt.clientY - rect.top + 15) + 'px';
    tooltip.innerHTML = `
      <div class="map-tooltip-name">${co.icon} ${co.name}</div>
      <div class="map-tooltip-sub">${co.ownerName} · ${fmt(co.cash)}€ · ⭐ ${co.prestigi.toFixed(0)}</div>
      <div class="map-tooltip-sub" style="color:var(--accent);margin-top:3px">Clic per veure accions</div>
    `;
  } else if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function handleCanvasMouseLeave() {
  hoveredBuilding = null;
  const tooltip = document.getElementById('map-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}


// ════════════════════════════════════════════════════════════
//  MODAL DE SELECCIÓ D'EMPRESA
// ════════════════════════════════════════════════════════════

function showCompanyModal(co) {
  const existing = document.getElementById('company-select-modal');
  if (existing) existing.remove();
  
  const G = getG();
  const gd = G?.gameData;
  
  // Rànquing i comparativa
  const myPosition = companies.findIndex(c => c.isMe) + 1 || '-';
  const diff = co.cash - (gd?.finances?.cash || 0);
  const diffText = co.isMe 
    ? `Ets #${myPosition} a la classe`
    : diff > 0 
      ? `Et porta ${fmt(diff)}€ d'avantatge` 
      : `Li portes ${fmt(-diff)}€ d'avantatge`;
  
  const modal = document.createElement('div');
  modal.id = 'company-select-modal';
  modal.className = 'company-select-modal';
  
  // Nivell de seguretat (per ara aleatori basat en cash — en futures sessions es lligarà al sistema)
  const securityLevel = (co.student?._security?.level || 'baixa').toUpperCase();
  const securityColor = securityLevel === 'ALTA' ? 'var(--red)' : securityLevel === 'MITJANA' ? 'var(--gold)' : 'var(--green)';
  
  let badges = '';
  if (co.isMe) badges += '<span class="cs-badge me">TU</span>';
  if (co.isLeader) badges += '<span class="cs-badge leader">LÍDER</span>';
  if (co.inCrisis) badges += '<span class="cs-badge crisis">EN CRISI</span>';
  
  modal.innerHTML = `
    <div class="company-select-card">
      <div class="cs-header">
        <div class="cs-avatar" style="background:linear-gradient(135deg, ${co.color}40, ${co.color}20);border-color:${co.color}60">
          ${co.icon}
        </div>
        <div class="cs-info">
          <div class="cs-name">${co.name}${badges}</div>
          <div class="cs-owner">👤 ${co.ownerName}</div>
          <div class="cs-sector">${co.student?.company?.sectorData?.name || co.student?.company?.sector || 'Empresa'} · ${co.student?.company?.legalFormName || ''}</div>
        </div>
      </div>
      
      <div class="cs-stats">
        <div class="cs-stat">
          <div class="cs-stat-label">💰 TRESORERIA</div>
          <div class="cs-stat-value" style="color:${co.cash < 0 ? 'var(--red)' : co.cash >= 50000 ? 'var(--green)' : 'var(--text)'}">${fmt(co.cash)}€</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">⭐ PRESTIGI</div>
          <div class="cs-stat-value">${co.prestigi.toFixed(0)}</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">👥 EMPLEATS</div>
          <div class="cs-stat-value">${co.employees}</div>
        </div>
        <div class="cs-stat">
          <div class="cs-stat-label">🛡️ SEGURETAT</div>
          <div class="cs-stat-value" style="color:${securityColor};font-size:13px">${securityLevel}</div>
        </div>
      </div>
      
      <div class="cs-ranking">
        🏆 Rànquing: #${co.rank} de ${companies.length} · ${diffText}
      </div>
      
      <div class="cs-actions">
        <button class="cs-btn secondary" onclick="window._closeCompanyModal()">Tancar</button>
        ${co.isMe ? `
          <button class="cs-btn primary" onclick="window._goToMySecurity()">🛡️ Seguretat</button>
        ` : `
          <button class="cs-btn danger" onclick="window._openEspionageMenu('${co.uid}')">🕵️ Operacions encobertes</button>
        `}
      </div>
      
      ${!co.isMe ? '<div style="font-size:10px;color:var(--text3);text-align:center;margin-top:10px;line-height:1.5">⚠️ Les operacions encobertes són <em>competència deslleial</em>. Si t\'enxampen, tindràs conseqüències.</div>' : ''}
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.addEventListener('click', e => {
    if (e.target === modal) window._closeCompanyModal();
  });
}

window._closeCompanyModal = function() {
  const modal = document.getElementById('company-select-modal');
  if (modal) {
    modal.style.animation = 'fadeIn .25s ease reverse';
    setTimeout(() => modal.remove(), 230);
  }
  selectedCompanyUid = null;
};

window._openEspionageMenu = function(targetUid) {
  // Placeholder per a la sessió 3 (operacions encobertes)
  showToast('🕵️ Operacions encobertes en construcció — vindrà en la pròxima sessió!');
  window._closeCompanyModal();
};

window._goToMySecurity = function() {
  showToast('🛡️ Panell de seguretat — vindrà en la pròxima sessió!');
  window._closeCompanyModal();
};


// ════════════════════════════════════════════════════════════
//  RENDERITZAT DE LA PESTANYA COMPLETA
// ════════════════════════════════════════════════════════════

function updateClock() {
  const hour = Math.floor(gameTime / 3600);
  const minute = Math.floor((gameTime % 3600) / 60);
  const clockEl = document.getElementById('vallnova-clock');
  if (clockEl) {
    const hourStr = hour.toString().padStart(2, '0');
    const minStr = minute.toString().padStart(2, '0');
    const pal = getCurrentPalette();
    const timeIcon = pal === PALETTES.day ? '☀️' : pal === PALETTES.dusk ? '🌆' : '🌙';
    clockEl.textContent = `${timeIcon} ${hourStr}:${minStr}`;
  }
}

function renderSidebar() {
  const G = getG();
  const gd = G?.gameData;
  const classCode = gd?.classCode || '?';
  
  const myRank = companies.findIndex(c => c.isMe) + 1;
  const total = companies.length;
  
  const recentEvents = (gd?._mapEvents || []).slice(-5).reverse();
  
  return `
    <div class="sidebar-section">
      <h3>📊 Vallnova Live</h3>
      <div style="font-size:11px;color:var(--text2);line-height:1.7">
        🏫 Classe: <strong style="color:var(--gold);font-family:'JetBrains Mono',monospace">${classCode}</strong><br>
        👥 ${total} empreses actives<br>
        ${myRank > 0 ? `🏆 Ets #${myRank} al rànquing` : '⚠️ No estàs al mapa encara'}<br>
        🕐 Dia virtual · cicle 30s
      </div>
    </div>
    
    <div class="sidebar-section">
      <h3>🔥 Activitat recent</h3>
      ${recentEvents.length === 0 ? `
        <div style="font-size:11px;color:var(--text3);font-style:italic;padding:8px 0">
          Encara no hi ha activitat sospitosa a Vallnova...
        </div>
      ` : recentEvents.map(e => `
        <div style="font-size:11px;padding:6px 0;border-bottom:1px solid var(--border);color:var(--text2);line-height:1.5">
          <span>${e.icon || '📌'}</span> ${e.text || e.desc}
          ${e.time ? `<span style="color:var(--text3);float:right;font-size:9px">${e.time}</span>` : ''}
        </div>
      `).join('')}
    </div>
    
    <div class="sidebar-section">
      <h3>ℹ️ Com funciona</h3>
      <div style="font-size:11px;color:var(--text2);line-height:1.6">
        • Clic en una empresa per veure info<br>
        • Opcions de <strong>competència deslleial</strong> disponibles des de la fitxa rival<br>
        • 🕐 Cicle dia/nit: els sabotatges nocturns són més efectius però més arriscats<br>
        • 🛡️ Protegeix la teva empresa amb seguretat
      </div>
    </div>
    
    <div class="sidebar-section" style="border-color:rgba(124,58,237,.3)">
      <h3>🎬 Demo d'efectes</h3>
      <div style="font-size:10px;color:var(--text3);margin-bottom:8px">Prova com es veuran els events al mapa. Fes clic en una empresa del mapa, després en un botó aquí.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
        <button class="vallnova-ctrl-btn" style="background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);padding:6px;font-size:10px" onclick="window._demoEvent('fire')">🔥 Incendi</button>
        <button class="vallnova-ctrl-btn" style="background:rgba(79,127,255,.15);border-color:rgba(79,127,255,.3);padding:6px;font-size:10px" onclick="window._demoEvent('police')">🚔 Policia</button>
        <button class="vallnova-ctrl-btn" style="background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.3);padding:6px;font-size:10px" onclick="window._demoEvent('inspection')">🕴️ Inspecció</button>
        <button class="vallnova-ctrl-btn" style="background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.3);padding:6px;font-size:10px" onclick="window._demoEvent('news-bad')">📰 Escàndol</button>
        <button class="vallnova-ctrl-btn" style="background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.3);padding:6px;font-size:10px" onclick="window._demoEvent('success')">⭐ Èxit</button>
        <button class="vallnova-ctrl-btn" style="background:rgba(245,158,11,.10);border-color:rgba(245,158,11,.3);padding:6px;font-size:10px" onclick="window._demoEvent('review')">✨ Reviews</button>
        <button class="vallnova-ctrl-btn" style="background:rgba(124,58,237,.10);border-color:rgba(124,58,237,.3);padding:6px;font-size:10px;grid-column:1/-1" onclick="window._demoMigration()">🧑‍💼 Migració empleat (2 empreses necessàries)</button>
      </div>
    </div>
  `;
}

window._demoEvent = function(type) {
  if (!selectedCompanyUid) {
    showToast('👆 Primer selecciona una empresa al mapa');
    return;
  }
  addVisualEvent(selectedCompanyUid, type, 8);
  showToast('🎬 Demo: ' + type + ' (8 segons)');
};

window._demoMigration = function() {
  if (companies.length < 2) {
    showToast('Necessites almenys 2 empreses al mapa');
    return;
  }
  const src = companies[0];
  const dst = companies[1];
  visualEvents.push({
    id: Date.now(),
    type: 'migration',
    targetUid: src.uid,
    targetUid2: dst.uid,
    col: src.col, row: src.row, w: src.w, h: src.h,
    duration: 5, age: 0,
  });
  if (window.playSfx) window.playSfx('click');
  showToast('🎬 Demo: empleat migrant de ' + src.name + ' a ' + dst.name);
};

window.renderMap = function() {
  const tab = document.getElementById('tab-map');
  if (!tab) return;
  
  const G = getG();
  const gd = G?.gameData;
  
  // Si l'usuari encara no té empresa, missatge
  if (!gd || !gd.mode || !gd.company) {
    tab.innerHTML = `
      <div style="padding:60px 20px;text-align:center;color:var(--text2)">
        <div style="font-size:64px;margin-bottom:14px">🗺️</div>
        <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:8px;font-family:'Syne',sans-serif">Vallnova t'espera</div>
        <div style="font-size:13px;line-height:1.6;max-width:400px;margin:0 auto">Has de crear la teva empresa primer per entrar al mapa de la ciutat i veure els teus rivals.</div>
      </div>
    `;
    return;
  }
  
  // Recalcular empreses
  companies = getCompaniesInCity();
  
  tab.innerHTML = `
    <div class="vallnova-wrap">
      <div class="vallnova-topbar">
        <div class="vallnova-title">🗺️ Vallnova</div>
        <div class="vallnova-clock" id="vallnova-clock">☀️ 08:00</div>
        <div class="vallnova-counter">
          <span>🏢 ${companies.length}</span>
          <span>🏫 ${gd.classCode || '?'}</span>
        </div>
      </div>
      <div class="vallnova-layout">
        <div class="vallnova-canvas-wrap">
          <canvas id="vallnova-canvas" width="${MAP_CONFIG.width}" height="${MAP_CONFIG.height}"></canvas>
          <div id="map-tooltip" class="map-tooltip" style="display:none"></div>
          <div class="vallnova-legend">
            <div class="vallnova-legend-item"><span style="color:#4f7fff">■</span> Tu</div>
            <div class="vallnova-legend-item"><span style="color:#ffd700">■</span> Líder classe</div>
            <div class="vallnova-legend-item"><span style="color:#ef4444">■</span> En crisi</div>
          </div>
          <div class="vallnova-controls">
            <button class="vallnova-ctrl-btn" onclick="window._resetMapTime()" title="Sincronitzar amb l'hora actual">🕐 Sync</button>
            <button class="vallnova-ctrl-btn" onclick="window._refreshMap()" title="Actualitzar empreses">🔄</button>
          </div>
        </div>
        <div class="vallnova-sidebar">
          ${renderSidebar()}
        </div>
      </div>
    </div>
  `;
  
  // Inicialitzar canvas
  canvas = document.getElementById('vallnova-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    
    // Listeners
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    
    // Touch suport bàsic
    canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      handleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
    });
    
    // Iniciar animació si no està corrent
    if (!animationFrame) {
      lastFrameTime = 0;
      animationFrame = requestAnimationFrame(animationLoop);
    }
  }
};

window._resetMapTime = function() {
  const now = new Date();
  gameTime = (now.getHours() * 3600) + (now.getMinutes() * 60);
  if (window.playSfx) playSfx('click');
  showToast('🕐 Sincronitzat amb l\'hora actual');
};

window._refreshMap = function() {
  companies = getCompaniesInCity();
  if (window.playSfx) playSfx('click');
  const sidebarEl = document.querySelector('.vallnova-sidebar');
  if (sidebarEl) sidebarEl.innerHTML = renderSidebar();
  showToast('🔄 Mapa actualitzat');
};

// Aturar animació quan no siguem al tab del mapa
function checkMapTabActive() {
  const G = getG();
  const isMapActive = G?.currentTab === 'map';
  
  if (isMapActive) {
    if (!animationFrame && canvas) {
      lastFrameTime = 0;
      animationFrame = requestAnimationFrame(animationLoop);
    }
  } else {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
}

// Polling lleuger per veure si el tab canvia (simplificat)
setInterval(checkMapTabActive, 500);

console.log('🗺️ ui-mapa.js carregat — Vallnova city base ready');

})();
