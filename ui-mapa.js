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
  cols: 40,   // Molt més gran: cabran 30+ empreses
  rows: 30,
  tileSize: 32, // Una mica més petit per compensar (mapa total 1280×960)
  get width()  { return this.cols * this.tileSize; },
  get height() { return this.rows * this.tileSize; },
};

// ★ Estat de zoom/pan ★
let zoomLevel = 1;     // 0.5 (allunyat) → 1 (normal) → 2 (prop)
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.5;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragStartPanX = 0, dragStartPanY = 0;

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
// 0=gespa, 1=carretera horitz, 2=carretera vert, 3=vorera, 4=plaça, 5=aigua, 6=parc, 7=pont, 8=intersecció, 9=pas vianants
// Ciutat de 40×30 amb 5 zones: nord=financer · oest=industrial · est=comercial · sud=residencial · centre=plaça + parc + riu
// Generem el layout programàticament per mantenir el codi net
function generateCityLayout() {
  const rows = 30, cols = 40;
  const L = Array.from({length: rows}, () => Array(cols).fill(0));
  
  // Utilitat: omplir un rang
  const fill = (c1, r1, c2, r2, val) => {
    for (let r = r1; r <= r2 && r < rows; r++)
      for (let c = c1; c <= c2 && c < cols; c++)
        if (r >= 0 && c >= 0) L[r][c] = val;
  };
  
  // ── CARRERS PRINCIPALS (horitzontals i verticals) ──
  // Verticals: cols 5, 12, 20, 27, 34
  [5, 12, 20, 27, 34].forEach(c => {
    for (let r = 0; r < rows; r++) L[r][c] = 2;
  });
  // Horitzontals: rows 3, 9, 15, 21, 27
  [3, 9, 15, 21, 27].forEach(r => {
    for (let c = 0; c < cols; c++) L[r][c] = 1;
  });
  // Interseccions
  [5, 12, 20, 27, 34].forEach(c => {
    [3, 9, 15, 21, 27].forEach(r => { L[r][c] = 8; });
  });
  
  // ── VORERES adjacents als carrers ──
  // Per simplicitat: adjacent tiles a carrers reben tipus 3 si són 0
  const isRoad = (c, r) => [1,2,8,9].includes(L[r]?.[c]);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (L[r][c] !== 0) continue;
      // Si té un carrer adjacent, és vorera
      if (isRoad(c-1, r) || isRoad(c+1, r) || isRoad(c, r-1) || isRoad(c, r+1)) {
        L[r][c] = 3;
      }
    }
  }
  
  // ── PLAÇA CENTRAL (al voltant de cols 14-18, rows 11-13) ──
  fill(14, 11, 18, 13, 4);
  // Passos de vianants a la plaça
  L[12][15] = 9; L[12][17] = 9;
  
  // ── RIU diagonal (de la cantonada sud-oest cap al sud-est passant pel centre-sud) ──
  // Riu als rows 23-25 amb uns quants meandres
  fill(0, 24, 3, 25, 5);
  fill(4, 23, 10, 24, 5);
  fill(11, 24, 18, 25, 5);
  fill(19, 23, 26, 24, 5);
  fill(27, 24, 39, 25, 5);
  // Ponts sobre els carrers que creuen el riu
  [5, 12, 20, 27, 34].forEach(c => {
    for (let r = 23; r <= 25; r++) {
      if (L[r][c] === 5) L[r][c] = 7; // pont
    }
  });
  
  // ── PARC GRAN al sud-est (rows 26-29, cols 13-19) ──
  fill(13, 26, 19, 29, 6);
  
  // ── ZONA VERDA NORD-OEST (petit parc als rows 4-7, cols 1-4) ──
  fill(1, 4, 4, 7, 6);
  
  // ── ALTRES PARCS escampats ──
  fill(28, 11, 33, 14, 6); // parc est
  fill(22, 4, 26, 7, 6);   // parc nord-est
  fill(6, 16, 10, 19, 6);  // parc central-oest
  
  return L;
}

const CITY_LAYOUT = generateCityLayout();

// Punts d'interès (més variats i distribuïts)
const POI = [
  // Institucions
  { type: 'police',       col: 6,  row: 1,  w: 1, h: 1, icon: '🚔', name: 'Comissaria' },
  { type: 'hospital',     col: 35, row: 1,  w: 2, h: 2, icon: '🏥', name: 'Hospital' },
  { type: 'ayuntamiento', col: 14, row: 10, w: 5, h: 1, icon: '🏛️', name: 'Ajuntament' },
  { type: 'fountain',     col: 15, row: 12, w: 3, h: 1, icon: '⛲', name: 'Font de la Plaça' },
  { type: 'church',       col: 13, row: 4,  w: 1, h: 1, icon: '⛪', name: 'Església' },
  { type: 'school',       col: 21, row: 22, w: 2, h: 2, icon: '🏫', name: 'Escola' },
  { type: 'bank',         col: 28, row: 4,  w: 1, h: 1, icon: '🏦', name: 'Banc Central' },
  { type: 'library',      col: 7,  row: 10, w: 1, h: 1, icon: '📚', name: 'Biblioteca' },
  { type: 'stadium',      col: 35, row: 26, w: 3, h: 2, icon: '🏟️', name: 'Estadi' },
  { type: 'museum',       col: 2,  row: 10, w: 1, h: 1, icon: '🏛️', name: 'Museu' },
  // Punts d'oci
  { type: 'cinema',       col: 29, row: 10, w: 1, h: 1, icon: '🎬', name: 'Cinema' },
  { type: 'gym',          col: 21, row: 16, w: 1, h: 1, icon: '🏋️', name: 'Gimnàs' },
  { type: 'restaurant',   col: 7,  row: 22, w: 1, h: 1, icon: '🍽️', name: 'Restaurant' },
  // Decoració — arbres
  { type: 'tree', col: 2, row: 5, w: 1, h: 1, icon: '🌲' },
  { type: 'tree', col: 3, row: 6, w: 1, h: 1, icon: '🌲' },
  { type: 'tree', col: 15, row: 28, w: 1, h: 1, icon: '🌳' },
  { type: 'tree', col: 17, row: 27, w: 1, h: 1, icon: '🌳' },
  { type: 'tree', col: 16, row: 29, w: 1, h: 1, icon: '🌴' },
  { type: 'tree', col: 30, row: 12, w: 1, h: 1, icon: '🌳' },
  { type: 'tree', col: 32, row: 13, w: 1, h: 1, icon: '🌲' },
  { type: 'tree', col: 24, row: 5, w: 1, h: 1, icon: '🌳' },
  { type: 'tree', col: 8, row: 17, w: 1, h: 1, icon: '🌳' },
  { type: 'tree', col: 9, row: 18, w: 1, h: 1, icon: '🌲' },
];

// Slots on es col·loquen les empreses — AMPLIAT a 30 slots
// Cada empresa ocupa 2×2 caselles (edifici més compacte però amb més detall visual)
const COMPANY_SLOTS = [
  // ZONA CENTRE-FINANCER (rows 4-8, prop del banc) — prime locations
  { col: 7,  row: 4, zone: 'downtown' },
  { col: 9,  row: 4, zone: 'downtown' },
  { col: 14, row: 5, zone: 'downtown' },
  { col: 16, row: 5, zone: 'downtown' },
  { col: 18, row: 5, zone: 'downtown' },
  { col: 21, row: 5, zone: 'downtown' },
  // ZONA COMERCIAL (rows 10-14, est)
  { col: 22, row: 10, zone: 'commercial' },
  { col: 24, row: 10, zone: 'commercial' },
  { col: 28, row: 12, zone: 'commercial' },
  { col: 30, row: 12, zone: 'commercial' },
  { col: 35, row: 10, zone: 'commercial' },
  { col: 37, row: 10, zone: 'commercial' },
  // ZONA INDUSTRIAL (cols 0-4, rows 16-22)
  { col: 0,  row: 16, zone: 'industrial' },
  { col: 2,  row: 16, zone: 'industrial' },
  { col: 0,  row: 18, zone: 'industrial' },
  { col: 2,  row: 18, zone: 'industrial' },
  { col: 0,  row: 22, zone: 'industrial' },
  { col: 2,  row: 22, zone: 'industrial' },
  // ZONA RESIDENCIAL-COMERCIAL (rows 16-20, centre)
  { col: 13, row: 16, zone: 'residential' },
  { col: 15, row: 16, zone: 'residential' },
  { col: 17, row: 16, zone: 'residential' },
  { col: 13, row: 18, zone: 'residential' },
  { col: 15, row: 18, zone: 'residential' },
  { col: 17, row: 18, zone: 'residential' },
  // ZONA EST (cols 24-32, rows 16-20)
  { col: 28, row: 16, zone: 'mixed' },
  { col: 30, row: 16, zone: 'mixed' },
  { col: 32, row: 16, zone: 'mixed' },
  { col: 28, row: 18, zone: 'mixed' },
  // ZONA OEST-SUD (rows 22-27)
  { col: 6,  row: 22, zone: 'residential' },
  { col: 8,  row: 22, zone: 'residential' },
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
  
  // Assignar slots (màxim 30 empreses)
  const result = [];
  sorted.forEach((student, i) => {
    if (i >= COMPANY_SLOTS.length) return;
    const slot = COMPANY_SLOTS[i];
    // Els edificis fan 2×2 caselles (més compactes, més detalls visibles)
    // PERÒ els de tipus skyscraper són més alts (2 ample × 3 alt)
    const sector = (student.company?.sector || '').toLowerCase();
    const isSkyscraper = sector.includes('tecnologia') || sector.includes('tech') || sector.includes('software') || slot.zone === 'downtown';
    const w = 2;
    const h = isSkyscraper ? 3 : 2;
    
    result.push({
      uid: student.uid,
      student: student,
      col: slot.col,
      row: slot.row,
      w, h,
      zone: slot.zone,
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

// Tipus d'edifici segons sector de l'empresa o zona del mapa
function getBuildingStyle(co) {
  const sector = (co.student?.company?.sector || '').toLowerCase();
  const zone = co.zone || '';
  
  // Mapeig sector → tipus d'edifici
  if (sector.includes('tecnologia') || sector.includes('tech') || sector.includes('software')) return 'skyscraper';
  if (sector.includes('indústria') || sector.includes('industria') || sector.includes('manufactur') || sector.includes('constr')) return 'factory';
  if (sector.includes('restaurant') || sector.includes('aliment') || sector.includes('cafeteria')) return 'restaurant';
  if (sector.includes('comerç') || sector.includes('comer') || sector.includes('moda') || sector.includes('botiga')) return 'shop';
  if (sector.includes('serveis') || sector.includes('consultor') || sector.includes('finan')) return 'office';
  
  // Fallback per zona
  if (zone === 'downtown') return 'skyscraper';
  if (zone === 'industrial') return 'factory';
  if (zone === 'commercial') return 'shop';
  return 'office';
}

// ─── Dibuixar un edifici detallat segons tipus ───
function drawDetailedBuilding(ctx, x, y, w, h, co, style, palette) {
  const isNight = palette === PALETTES.night;
  const isDusk = palette === PALETTES.dusk;
  
  const baseColor = co.inCrisis ? '#5a2a28' : co.color;
  const darkBase = shadeColor(baseColor, -35);
  const lightBase = shadeColor(baseColor, 25);
  const windowLitColor = isNight ? 'rgba(255,220,100,.95)' : isDusk ? 'rgba(255,220,100,.55)' : 'rgba(255,255,255,.35)';
  const windowDarkColor = isNight ? 'rgba(30,35,55,.9)' : 'rgba(80,100,130,.55)';
  
  // ═══ SKYSCRAPER — gratacels corporatiu ═══
  if (style === 'skyscraper') {
    // Silueta general: base ampla + torre estreta
    // Base (1/3 inferior)
    const baseH = h * 0.35;
    ctx.fillStyle = darkBase;
    ctx.fillRect(x, y + h - baseH, w, baseH);
    // Torre
    const towerW = w * 0.75;
    const towerX = x + (w - towerW) / 2;
    ctx.fillStyle = baseColor;
    ctx.fillRect(towerX, y, towerW, h - baseH);
    // Frontal brillant (simula llum)
    const grad = ctx.createLinearGradient(towerX, y, towerX + towerW, y);
    grad.addColorStop(0, shadeColor(baseColor, -15));
    grad.addColorStop(0.5, lightBase);
    grad.addColorStop(1, shadeColor(baseColor, -15));
    ctx.fillStyle = grad;
    ctx.fillRect(towerX, y, towerW, h - baseH);
    
    // Rengles de finestres (graella densa)
    const winCols = 4, winRows = 10;
    const winW = (towerW - 8) / winCols * 0.75;
    const winGapX = (towerW - 8) / winCols * 0.25;
    const winH = (h - baseH - 8) / winRows * 0.70;
    const winGapY = (h - baseH - 8) / winRows * 0.30;
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        const wx = towerX + 4 + c * (winW + winGapX);
        const wy = y + 4 + r * (winH + winGapY);
        const lit = isNight ? Math.random() < 0.55 : true;
        ctx.fillStyle = lit ? windowLitColor : windowDarkColor;
        ctx.fillRect(wx, wy, winW, winH);
      }
    }
    // Finestres base (2 files més grans)
    const basewinW = (w - 8) / 5 * 0.75;
    const basegapX = (w - 8) / 5 * 0.25;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 5; c++) {
        const wx = x + 4 + c * (basewinW + basegapX);
        const wy = y + h - baseH + 5 + r * 13;
        ctx.fillStyle = isNight && Math.random() < 0.3 ? windowDarkColor : windowLitColor;
        ctx.fillRect(wx, wy, basewinW, 10);
      }
    }
    // Porta entrada (centre del base)
    ctx.fillStyle = isNight ? 'rgba(255,220,100,.8)' : '#2a2530';
    ctx.fillRect(x + w/2 - 7, y + h - 14, 14, 14);
    // Antena al sostre
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w/2, y);
    ctx.lineTo(x + w/2, y - 8);
    ctx.stroke();
    // Llum parpellejant al cim
    const blink = Math.sin(gameTime * 3) > 0;
    ctx.fillStyle = blink ? '#ef4444' : '#7a1a16';
    ctx.beginPath();
    ctx.arc(x + w/2, y - 9, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // ═══ FACTORY — fàbrica industrial ═══
  else if (style === 'factory') {
    // Edifici base rectangular baix
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y + h * 0.15, w, h * 0.85);
    // Teulada amb patró dent de serra (característic de fàbrica)
    ctx.fillStyle = darkBase;
    const teeth = 4;
    const toothW = w / teeth;
    for (let i = 0; i < teeth; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * toothW, y + h * 0.15);
      ctx.lineTo(x + i * toothW + toothW * 0.5, y);
      ctx.lineTo(x + (i + 1) * toothW, y + h * 0.15);
      ctx.closePath();
      ctx.fill();
    }
    // Finestres finestrals amples (2 per teula)
    ctx.fillStyle = windowLitColor;
    for (let i = 0; i < teeth; i++) {
      const fx = x + i * toothW + toothW * 0.15;
      const fy = y + h * 0.05;
      ctx.fillRect(fx, fy, toothW * 0.7, 6);
    }
    // Paret: portes grans de garatge
    ctx.fillStyle = darkBase;
    ctx.fillRect(x + w * 0.1, y + h * 0.55, w * 0.35, h * 0.45);
    ctx.fillRect(x + w * 0.55, y + h * 0.55, w * 0.35, h * 0.45);
    // Ratlles de porta
    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const ly = y + h * 0.55 + (h * 0.45) * (i/5);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.1, ly);
      ctx.lineTo(x + w * 0.45, ly);
      ctx.moveTo(x + w * 0.55, ly);
      ctx.lineTo(x + w * 0.90, ly);
      ctx.stroke();
    }
    // Finestres petites laterals
    ctx.fillStyle = windowLitColor;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 4 + i * 6, y + h * 0.30, 4, 6);
      ctx.fillRect(x + w - 22 + i * 6, y + h * 0.30, 4, 6);
    }
    // Xemeneia gran amb fum
    const chimX = x + w * 0.8;
    const chimY = y - h * 0.15;
    ctx.fillStyle = '#888';
    ctx.fillRect(chimX, chimY, w * 0.12, h * 0.35);
    ctx.fillStyle = '#555';
    ctx.fillRect(chimX - 2, chimY, w * 0.12 + 4, 4);
    // Fum que puja (animat)
    if (!co.inCrisis) {
      for (let i = 0; i < 3; i++) {
        const puffY = chimY - 10 - i * 10 - (gameTime * 15) % 30;
        const puffX = chimX + w * 0.06 + Math.sin(gameTime * 2 + i) * 4;
        ctx.globalAlpha = Math.max(0, 0.4 - i * 0.12);
        ctx.fillStyle = '#ccc';
        ctx.beginPath();
        ctx.arc(puffX, puffY, 5 + i, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Logo gran al mig
    ctx.font = `bold ${Math.floor(w * 0.14)}px system-ui`;
    ctx.fillStyle = lightBase;
    ctx.textAlign = 'center';
    ctx.fillText((co.student?.company?.name || '?').substring(0, 6).toUpperCase(), x + w/2, y + h * 0.45);
  }
  
  // ═══ SHOP — local comercial amb aparador ═══
  else if (style === 'shop') {
    // Parets laterals
    ctx.fillStyle = darkBase;
    ctx.fillRect(x, y, w, h);
    // Façana frontal amb color
    ctx.fillStyle = baseColor;
    ctx.fillRect(x + 4, y + h * 0.40, w - 8, h * 0.60);
    // Tendal a franges (toldo)
    const stripes = 6;
    const stripeW = (w - 8) / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? baseColor : '#fff';
      ctx.beginPath();
      ctx.moveTo(x + 4 + i * stripeW, y + h * 0.40);
      ctx.lineTo(x + 4 + (i + 0.5) * stripeW, y + h * 0.40 + 8);
      ctx.lineTo(x + 4 + (i + 1) * stripeW, y + h * 0.40);
      ctx.closePath();
      ctx.fill();
    }
    // Aparador (gran finestra)
    const showX = x + 8;
    const showY = y + h * 0.55;
    const showW = w - 16;
    const showH = h * 0.35;
    ctx.fillStyle = isNight ? 'rgba(255,220,100,.95)' : 'rgba(200,230,255,.85)';
    ctx.fillRect(showX, showY, showW, showH);
    // Creu central de l'aparador
    ctx.strokeStyle = darkBase;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(showX + showW/2, showY);
    ctx.lineTo(showX + showW/2, showY + showH);
    ctx.stroke();
    // Contingut de l'aparador (emoji de l'empresa, gran)
    ctx.font = `${Math.floor(showH * 0.7)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(co.icon, showX + showW/2, showY + showH/2);
    // Rètol amb nom
    ctx.fillStyle = darkBase;
    ctx.fillRect(x + 4, y + h * 0.40 + 8, w - 8, 12);
    ctx.fillStyle = '#fff';
    ctx.font = `bold 9px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText((co.student?.company?.name || '').substring(0, 14).toUpperCase(), x + w/2, y + h * 0.40 + 17);
    // Teulada superior (sostre)
    ctx.fillStyle = shadeColor(darkBase, -15);
    ctx.fillRect(x - 2, y, w + 4, h * 0.10);
    // Finestres dalt (pis superior)
    ctx.fillStyle = windowLitColor;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 6 + i * ((w - 12) / 3) + 2, y + h * 0.18, (w - 12) / 3 - 4, h * 0.15);
    }
  }
  
  // ═══ RESTAURANT — local amb terrassa ═══
  else if (style === 'restaurant') {
    // Edifici base
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, w, h);
    // Teulada vermella
    ctx.fillStyle = '#a43c2c';
    ctx.fillRect(x - 2, y, w + 4, h * 0.12);
    // Tegules
    ctx.strokeStyle = 'rgba(0,0,0,.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
      const lx = x + i * w/6;
      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(lx, y + h * 0.12);
      ctx.stroke();
    }
    // Porta ampla (doble batent)
    ctx.fillStyle = darkBase;
    ctx.fillRect(x + w/2 - w * 0.12, y + h * 0.50, w * 0.24, h * 0.50);
    // Finestres amb marcs
    ctx.fillStyle = windowLitColor;
    const winRH = h * 0.25;
    ctx.fillRect(x + 5, y + h * 0.20, w * 0.30, winRH);
    ctx.fillRect(x + w - 5 - w * 0.30, y + h * 0.20, w * 0.30, winRH);
    ctx.strokeStyle = darkBase;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 5, y + h * 0.20, w * 0.30, winRH);
    ctx.strokeRect(x + w - 5 - w * 0.30, y + h * 0.20, w * 0.30, winRH);
    // Creu finestres
    ctx.beginPath();
    ctx.moveTo(x + 5 + w * 0.15, y + h * 0.20); ctx.lineTo(x + 5 + w * 0.15, y + h * 0.45);
    ctx.moveTo(x + w - 5 - w * 0.15, y + h * 0.20); ctx.lineTo(x + w - 5 - w * 0.15, y + h * 0.45);
    ctx.stroke();
    // Rètol
    ctx.fillStyle = '#f5d547';
    ctx.fillRect(x + 4, y + h * 0.14, w - 8, 10);
    ctx.fillStyle = '#000';
    ctx.font = `bold 9px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('🍽️ ' + (co.student?.company?.name || '').substring(0, 10), x + w/2, y + h * 0.14 + 7);
    // Terrassa davant (taules amb cadires)
    if (w >= 50) {
      const tY = y + h - 6;
      for (let i = 0; i < 3; i++) {
        const tX = x + 6 + i * (w - 12) / 3 + ((w - 12) / 6);
        ctx.fillStyle = '#8b6f47';
        ctx.fillRect(tX - 3, tY, 6, 4);
        ctx.fillStyle = '#5a3e1f';
        ctx.fillRect(tX - 5, tY + 4, 2, 3);
        ctx.fillRect(tX + 3, tY + 4, 2, 3);
      }
    }
  }
  
  // ═══ OFFICE — edifici d'oficines clàssic ═══
  else {
    // Base
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, y, w, h);
    // Gradient frontal
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, lightBase);
    grad.addColorStop(1, darkBase);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    // Estructura de graella (pisos)
    const floors = 5;
    const floorH = h / floors;
    // Línies entre pisos
    ctx.strokeStyle = shadeColor(baseColor, -25);
    ctx.lineWidth = 1;
    for (let f = 1; f < floors; f++) {
      ctx.beginPath();
      ctx.moveTo(x, y + f * floorH);
      ctx.lineTo(x + w, y + f * floorH);
      ctx.stroke();
    }
    // Finestres grans amb reflex
    const winCols = 3;
    const winW = (w - 8) / winCols * 0.80;
    const winGapX = (w - 8) / winCols * 0.20;
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < winCols; c++) {
        const wx = x + 4 + c * (winW + winGapX);
        const wy = y + f * floorH + floorH * 0.25;
        const wH = floorH * 0.50;
        const lit = isNight ? Math.random() < 0.65 : true;
        ctx.fillStyle = lit ? windowLitColor : windowDarkColor;
        ctx.fillRect(wx, wy, winW, wH);
        // Reflex
        if (!isNight) {
          ctx.fillStyle = 'rgba(255,255,255,.3)';
          ctx.fillRect(wx + 2, wy + 2, winW * 0.3, 2);
        }
      }
    }
    // Rètol al sostre (nom empresa)
    ctx.fillStyle = darkBase;
    ctx.fillRect(x - 2, y - 2, w + 4, 5);
    ctx.fillStyle = lightBase;
    ctx.font = `bold 8px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText((co.student?.company?.name || '').substring(0, 12).toUpperCase(), x + w/2, y + 2);
    // Porta principal
    ctx.fillStyle = isNight ? 'rgba(255,220,100,.9)' : darkBase;
    ctx.fillRect(x + w/2 - 6, y + h - 10, 12, 10);
  }
  
  // ─── OVERLAYS COMUNS A TOTS ELS EDIFICIS ───
  
  // Logo/emoji al damunt (flotant)
  ctx.font = `${Math.max(14, w * 0.30)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Cercle de fons perquè es llegeixi
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath();
  ctx.arc(x + w/2, y - 12, Math.max(9, w * 0.18), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText(co.icon, x + w/2, y - 12);
}


function drawCompanies(ctx, pal) {
  // Ordenar per row per dibuixar primer els de dalt (efecte profunditat)
  const sorted = [...companies].sort((a, b) => a.row - b.row);
  
  sorted.forEach(co => {
    const x = co.col * MAP_CONFIG.tileSize;
    const y = co.row * MAP_CONFIG.tileSize;
    const s = MAP_CONFIG.tileSize;
    const w = co.w * s;
    const h = co.h * s;
    
    const isHovered = hoveredBuilding && hoveredBuilding.uid === co.uid;
    const isSelected = selectedCompanyUid === co.uid;
    const isNight = pal === PALETTES.night;
    
    // Ombra (allargada si és de dia)
    const shadowOffset = isNight ? 2 : 4;
    ctx.fillStyle = 'rgba(0,0,0,.40)';
    ctx.beginPath();
    ctx.ellipse(x + w/2 + shadowOffset, y + h + 2, w * 0.55, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibuixar edifici detallat
    const style = getBuildingStyle(co);
    drawDetailedBuilding(ctx, x, y, w, h, co, style, pal);
    
    // ─ BORDES SEGONS ESTAT ─
    if (isSelected) {
      // Glow daurat fort
      ctx.save();
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
      ctx.restore();
    } else if (isHovered) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
      ctx.setLineDash([]);
    } else if (co.isMe) {
      // Cercle blau fi al voltant
      ctx.strokeStyle = '#4f7fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    } else if (co.isLeader) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    } else if (co.inCrisis) {
      const blink = Math.sin(gameTime * 2) > 0;
      ctx.strokeStyle = blink ? '#ef4444' : '#7a1a16';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    }
    
    // ─ NOM SOTA L'EDIFICI ─ (amb fons per llegibilitat)
    const labelY = y + h + 16;
    const labelText = co.name.length > 14 ? co.name.substring(0, 13) + '…' : co.name;
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    // Fons
    const textWidth = ctx.measureText(labelText).width;
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(x + w/2 - textWidth/2 - 4, labelY - 7, textWidth + 8, 14);
    // Text
    ctx.fillStyle = co.isMe ? '#4f7fff' : co.isLeader ? '#ffd700' : '#fff';
    ctx.fillText(labelText, x + w/2, labelY);
    
    // ─ BADGES (TU / #1 / CRISI) ─
    if (co.isLeader) {
      ctx.font = '20px serif';
      ctx.fillText('👑', x + w - 6, y - 22);
    }
    if (co.isMe) {
      ctx.fillStyle = '#4f7fff';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x - 2, y - 4, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TU', x - 2, y - 4);
    } else {
      // Badge de rànquing
      const badgeColor = co.rank <= 3 ? (co.rank === 1 ? '#ffd700' : co.rank === 2 ? '#c0c0c0' : '#cd7f32') : 'rgba(0,0,0,.7)';
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('#' + co.rank, x + 8, y + 9);
    }
    
    if (co.inCrisis) {
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚨', x + w - 8, y + 8);
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
  
  // Neteja el canvas sencer (fons negre de fora del viewport)
  ctx.fillStyle = '#0a0d15';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // ★ Aplicar zoom + pan ★
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(zoomLevel, zoomLevel);
  
  // Cel de fons
  ctx.fillStyle = pal.sky;
  ctx.fillRect(0, 0, MAP_CONFIG.width, MAP_CONFIG.height);
  
  // Capes
  drawCityBase(ctx, pal);
  drawPOI(ctx, pal);
  drawSprites(ctx);
  drawCompanies(ctx, pal);
  drawVisualEvents(ctx);
  drawNightOverlay(ctx, pal);
  
  ctx.restore();
  
  // Mini-mapa (fora de la transformació) en cantonada
  drawMinimap(ctx);
}

// ─── Mini-mapa ─── (fix, no afectat per zoom)
function drawMinimap(ctx) {
  const w = 130;
  const h = 98;
  const margin = 8;
  const x = canvas.width - w - margin;
  const y = margin;
  
  // Fons
  ctx.fillStyle = 'rgba(0,0,0,.75)';
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.strokeStyle = 'rgba(255,255,255,.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 2, y - 2, w + 4, h + 4);
  
  // Escala mini del mapa
  const scaleX = w / MAP_CONFIG.width;
  const scaleY = h / MAP_CONFIG.height;
  
  // Mapa de tiles simplificat
  for (let r = 0; r < MAP_CONFIG.rows; r++) {
    for (let c = 0; c < MAP_CONFIG.cols; c++) {
      const t = CITY_LAYOUT[r]?.[c] ?? 0;
      let color = '#2d4d2a'; // gespa per defecte
      if (t === 1 || t === 2 || t === 8 || t === 9) color = '#3a3f4a'; // carreteres
      else if (t === 3) color = '#606672'; // voreres
      else if (t === 4) color = '#7a8595'; // plaça
      else if (t === 5) color = '#2a4a80'; // aigua
      else if (t === 6) color = '#2d5a2a'; // parc
      else if (t === 7) color = '#6b5030'; // pont
      ctx.fillStyle = color;
      ctx.fillRect(
        x + c * MAP_CONFIG.tileSize * scaleX,
        y + r * MAP_CONFIG.tileSize * scaleY,
        MAP_CONFIG.tileSize * scaleX + 0.5,
        MAP_CONFIG.tileSize * scaleY + 0.5
      );
    }
  }
  
  // Empreses com a punts
  companies.forEach(co => {
    const cx = x + (co.col + co.w/2) * MAP_CONFIG.tileSize * scaleX;
    const cy = y + (co.row + co.h/2) * MAP_CONFIG.tileSize * scaleY;
    ctx.fillStyle = co.isMe ? '#4f7fff' : co.isLeader ? '#ffd700' : co.inCrisis ? '#ef4444' : '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, co.isMe || co.isLeader ? 3 : 2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Viewport actual (rectangle)
  const vpX = x + (-panX / zoomLevel) * scaleX;
  const vpY = y + (-panY / zoomLevel) * scaleY;
  const vpW = (canvas.width / zoomLevel) * scaleX;
  const vpH = (canvas.height / zoomLevel) * scaleY;
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(vpX, vpY, vpW, vpH);
  
  // Etiqueta
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = 'bold 9px system-ui';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('VALLNOVA', x + 4, y + 4);
}

function animationLoop(timestamp) {
  if (!lastFrameTime) lastFrameTime = timestamp;
  const delta = Math.min(0.1, (timestamp - lastFrameTime) / 1000);
  lastFrameTime = timestamp;
  
  gameTime += delta * (86400 / DAY_LENGTH_SECONDS);
  if (gameTime >= 86400) gameTime -= 86400;
  
  updateSprites(delta);
  
  render();
  updateClock();
  
  // Indicador de zoom
  const zoomEl = document.getElementById('zoom-indicator');
  if (zoomEl) zoomEl.textContent = Math.round(zoomLevel * 100) + '%';
  
  animationFrame = requestAnimationFrame(animationLoop);
}


// ════════════════════════════════════════════════════════════
//  INTERACCIÓ — CLICS I HOVER
// ════════════════════════════════════════════════════════════

function getMouseTile(evt) {
  const rect = canvas.getBoundingClientRect();
  // Coordenades dins del canvas en píxels del bitmap (no CSS)
  const canvasX = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const canvasY = (evt.clientY - rect.top) * (canvas.height / rect.height);
  // Aplicar inversa del zoom+pan per obtenir coords del món
  const worldX = (canvasX - panX) / zoomLevel;
  const worldY = (canvasY - panY) / zoomLevel;
  return {
    col: Math.floor(worldX / MAP_CONFIG.tileSize),
    row: Math.floor(worldY / MAP_CONFIG.tileSize),
    px: worldX, py: worldY,
  };
}

function getCompanyAt(col, row) {
  return companies.find(co => 
    col >= co.col && col < co.col + co.w &&
    row >= co.row && row < co.row + co.h
  );
}

// ════════════════════════════════════════════════════════════
//  ZOOM I PAN
// ════════════════════════════════════════════════════════════

function clampPan() {
  // Evitar que es pugui arrossegar el mapa massa fora
  const minX = canvas.width - MAP_CONFIG.width * zoomLevel;
  const minY = canvas.height - MAP_CONFIG.height * zoomLevel;
  // Si el mapa és més petit que el canvas, centrar-lo
  if (minX > 0) panX = minX / 2;
  else panX = Math.max(minX, Math.min(0, panX));
  if (minY > 0) panY = minY / 2;
  else panY = Math.max(minY, Math.min(0, panY));
}

function setZoom(newZoom, centerX, centerY) {
  const oldZoom = zoomLevel;
  newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  if (newZoom === oldZoom) return;
  
  // Si no passen centre, usar centre canvas
  if (centerX === undefined) centerX = canvas.width / 2;
  if (centerY === undefined) centerY = canvas.height / 2;
  
  // Mantenir el punt sota el cursor al mateix lloc després del zoom
  const worldX = (centerX - panX) / oldZoom;
  const worldY = (centerY - panY) / oldZoom;
  zoomLevel = newZoom;
  panX = centerX - worldX * zoomLevel;
  panY = centerY - worldY * zoomLevel;
  
  clampPan();
}

function handleWheel(evt) {
  evt.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const cx = (evt.clientX - rect.left) * (canvas.width / rect.width);
  const cy = (evt.clientY - rect.top) * (canvas.height / rect.height);
  const factor = evt.deltaY < 0 ? 1.15 : 0.87;
  setZoom(zoomLevel * factor, cx, cy);
}

// Drag state per detectar si un clic és realment click o pan
let dragMoved = false;
const DRAG_THRESHOLD = 5; // píxels
let dragStartClientX = 0;
let dragStartClientY = 0;

function handleMouseDown(evt) {
  if (evt.button !== 0) return; // només botó esquerre
  isDragging = true;
  dragMoved = false;
  dragStartClientX = evt.clientX;
  dragStartClientY = evt.clientY;
  dragStartPanX = panX;
  dragStartPanY = panY;
  canvas.style.cursor = 'grabbing';
}

function handleMouseUp(evt) {
  if (isDragging) {
    isDragging = false;
    canvas.style.cursor = 'grab';
    // Si no hi ha hagut drag real, tractar com clic
    if (!dragMoved) {
      handleCanvasClick(evt);
    }
  }
}

function handlePanMove(evt) {
  const dx = evt.clientX - dragStartClientX;
  const dy = evt.clientY - dragStartClientY;
  if (!dragMoved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
    dragMoved = true;
  }
  if (dragMoved) {
    const rect = canvas.getBoundingClientRect();
    const scaleMul = canvas.width / rect.width;
    panX = dragStartPanX + dx * scaleMul;
    panY = dragStartPanY + dy * scaleMul;
    clampPan();
  }
}

// Zoom funcions exposades
window._zoomIn  = () => setZoom(zoomLevel * 1.25);
window._zoomOut = () => setZoom(zoomLevel * 0.80);
window._zoomFit = () => {
  const fitX = canvas.width / MAP_CONFIG.width;
  const fitY = canvas.height / MAP_CONFIG.height;
  zoomLevel = Math.min(fitX, fitY) * 0.98;
  panX = (canvas.width - MAP_CONFIG.width * zoomLevel) / 2;
  panY = (canvas.height - MAP_CONFIG.height * zoomLevel) / 2;
};
window._centerOnMe = () => {
  const me = companies.find(c => c.isMe);
  if (!me) return;
  zoomLevel = 1.2;
  const meX = (me.col + me.w/2) * MAP_CONFIG.tileSize;
  const meY = (me.row + me.h/2) * MAP_CONFIG.tileSize;
  panX = canvas.width / 2 - meX * zoomLevel;
  panY = canvas.height / 2 - meY * zoomLevel;
  clampPan();
};


// ════════════════════════════════════════════════════════════
//  INTERACCIÓ — CLICS I HOVER
// ════════════════════════════════════════════════════════════

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
  // Si estem arrossegant, aplicar pan
  if (isDragging) {
    handlePanMove(evt);
    return;
  }
  
  const pos = getMouseTile(evt);
  const co = getCompanyAt(pos.col, pos.row);
  
  hoveredBuilding = co || null;
  canvas.style.cursor = co ? 'pointer' : 'grab';
  
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
  
  const recentEvents = (gd?._mapEvents || []).slice(-6).reverse();
  const opsHistory = (gd?._ops?.history || []).slice(0, 5);
  const securityLevel = gd?._security?.level || 'baixa';
  const securityIcon = securityLevel === 'alta' ? '🏰' : securityLevel === 'mitjana' ? '🛡️' : '🔓';
  const securityColor = securityLevel === 'alta' ? 'var(--green)' : securityLevel === 'mitjana' ? 'var(--gold)' : 'var(--red)';
  const isConditional = gd?._conditional?.active;
  
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
    
    <div class="sidebar-section" style="border-color:${isConditional?'rgba(239,68,68,.4)':'var(--border)'}">
      <h3>🛡️ La meva seguretat</h3>
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0">
        <div style="font-size:28px">${securityIcon}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:800;color:${securityColor};text-transform:uppercase">${securityLevel}</div>
          <div style="font-size:10px;color:var(--text2)">${
            securityLevel === 'alta' ? '-60% èxit atacs rebuts' :
            securityLevel === 'mitjana' ? '-30% èxit atacs rebuts' :
            'Sense protecció'
          }</div>
        </div>
        <button onclick="window._goToMySecurity()" style="background:var(--accent);color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;font-family:var(--font)">Canviar</button>
      </div>
      ${isConditional ? `
        <div style="margin-top:8px;padding:8px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);border-radius:8px;font-size:10px;color:#ffaaaa">
          ⚖️ <strong>Llibertat condicional</strong>: ${gd._conditional.weeksLeft} setm restants. +20% risc detecció.
        </div>
      ` : ''}
    </div>
    
    ${opsHistory.length > 0 ? `
      <div class="sidebar-section">
        <h3>🕵️ Les meves operacions</h3>
        ${opsHistory.map(h => `
          <div style="font-size:10px;padding:6px 0;border-bottom:1px solid var(--border);line-height:1.5">
            <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
              <span>${h.opIcon}</span>
              <span style="color:${h.success?'var(--green)':'var(--red)'};font-weight:700">${h.success?'✅':'❌'}</span>
              <span style="color:var(--text);font-size:11px;font-weight:700">${h.opName}</span>
              <span style="color:var(--text3);margin-left:auto;font-size:9px">S${h.week}</span>
            </div>
            <div style="color:var(--text2);padding-left:18px">→ ${h.targetName}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="sidebar-section">
      <h3>🔥 Activitat a Vallnova</h3>
      ${recentEvents.length === 0 ? `
        <div style="font-size:11px;color:var(--text3);font-style:italic;padding:8px 0">
          Encara no hi ha activitat sospitosa...
        </div>
      ` : recentEvents.map(e => `
        <div style="font-size:11px;padding:6px 0;border-bottom:1px solid var(--border);color:var(--text2);line-height:1.5">
          <span>${e.icon || '📌'}</span> ${e.text || e.desc}
          ${e.time ? `<span style="color:var(--text3);float:right;font-size:9px">${e.time}</span>` : ''}
        </div>
      `).join('')}
    </div>
    
    <div class="sidebar-section">
      <h3>ℹ️ Com jugar</h3>
      <div style="font-size:11px;color:var(--text2);line-height:1.6">
        • <strong>Roda ratolí</strong>: zoom<br>
        • <strong>Arrossegar</strong>: moure la càmera<br>
        • <strong>Clic edifici</strong>: veure info i accions<br>
        • <strong>🎯 Jo</strong>: centrar a la meva empresa<br>
        • <strong>🕐 Nit</strong>: atacs més efectius però més risc<br>
        • <strong>🛡️ Seguretat</strong>: redueix atacs rebuts
      </div>
    </div>
    
    <div class="sidebar-section" style="border-color:rgba(124,58,237,.3)">
      <h3>🎬 Demo efectes</h3>
      <div style="font-size:10px;color:var(--text3);margin-bottom:8px">Selecciona una empresa al mapa i clica un botó per veure l'animació.</div>
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
            <button class="vallnova-ctrl-btn" onclick="window._zoomIn()" title="Ampliar">🔍+</button>
            <button class="vallnova-ctrl-btn" onclick="window._zoomOut()" title="Reduir">🔍−</button>
            <button class="vallnova-ctrl-btn" onclick="window._zoomFit()" title="Veure tot el mapa">⛶</button>
            <button class="vallnova-ctrl-btn" onclick="window._centerOnMe()" title="Centrar a la meva empresa">🎯 Jo</button>
            <button class="vallnova-ctrl-btn" onclick="window._resetMapTime()" title="Sincronitzar amb l'hora actual">🕐</button>
            <button class="vallnova-ctrl-btn" onclick="window._refreshMap()" title="Actualitzar empreses">🔄</button>
          </div>
          <div style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,.6);padding:4px 8px;border-radius:6px;font-size:10px;color:#fff;backdrop-filter:blur(8px);pointer-events:none" id="zoom-indicator">100%</div>
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
    
    // ★ Listeners complets: zoom amb roda, pan arrossegant, clic ★
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', (e) => {
      // Si estava arrossegant i sortim, tractar com finalitzar drag
      if (isDragging) {
        isDragging = false;
        canvas.style.cursor = 'grab';
      }
      handleCanvasMouseLeave();
    });
    
    // ★ Suport touch per mòbils: pinch zoom + drag ★
    let lastTouchDist = 0;
    let lastTouchCenter = null;
    let touchStartTime = 0;
    let touchMoved = false;
    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
      touchMoved = false;
      if (e.touches.length === 1) {
        // Preparar drag
        const t = e.touches[0];
        isDragging = true;
        dragStartClientX = t.clientX;
        dragStartClientY = t.clientY;
        dragStartPanX = panX;
        dragStartPanY = panY;
      } else if (e.touches.length === 2) {
        // Preparar pinch
        const t1 = e.touches[0], t2 = e.touches[1];
        lastTouchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const rect = canvas.getBoundingClientRect();
        lastTouchCenter = {
          x: ((t1.clientX + t2.clientX) / 2 - rect.left) * (canvas.width / rect.width),
          y: ((t1.clientY + t2.clientY) / 2 - rect.top) * (canvas.height / rect.height),
        };
        isDragging = false;
      }
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        touchMoved = true;
        handlePanMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (lastTouchDist > 0 && lastTouchCenter) {
          const factor = dist / lastTouchDist;
          setZoom(zoomLevel * factor, lastTouchCenter.x, lastTouchCenter.y);
        }
        lastTouchDist = dist;
        touchMoved = true;
      }
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const duration = Date.now() - touchStartTime;
      // Si ha estat un toc ràpid sense moure → clic
      if (!touchMoved && duration < 300 && e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        handleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
      }
      isDragging = false;
      lastTouchDist = 0;
    }, { passive: false });
    
    // Cursor inicial
    canvas.style.cursor = 'grab';
    
    // ★ Fer fit al viewport la primera vegada ★
    setTimeout(() => { window._zoomFit(); }, 50);
    
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


// ════════════════════════════════════════════════════════════
//  🕵️ OPERACIONS ENCOBERTES — SESSIÓ 3
// ════════════════════════════════════════════════════════════
//  6 accions de competència deslleial amb sistema d'èxit/càstig
// ════════════════════════════════════════════════════════════

const OPERACIONS = [
  {
    id: 'espionatge',
    icon: '🕵️',
    name: 'Espionatge industrial',
    cost: 3000,
    successBase: 0.60,
    nightBonus: 0.15,
    description: 'Envia un infiltrat a robar informació estratègica del rival. Pots fer-te amb clients seus i conèixer els seus moviments futurs.',
    damageDesc: 'Robes 1 client i info 3 setm',
    penaltyDesc: '-10 prestigi · multa 5.000€',
    cooldown: 4, // setmanes
    successEffect: (myGd, targetGd) => {
      const stolen = Math.min(2500, (targetGd.finances?.monthly_revenue||0) * 0.08);
      myGd.finances.cash = (myGd.finances.cash||0) + stolen;
      targetGd.finances.cash = (targetGd.finances.cash||0) - stolen;
      return { msg: `Has robat ${fmt(Math.round(stolen))}€ de clients. Saps el seu pla 3 setmanes.`, stolen };
    },
    failEffect: (myGd, targetGd) => {
      myGd.prestigi = Math.max(0, (myGd.prestigi||0) - 10);
      myGd.finances.cash = (myGd.finances.cash||0) - 5000;
      return { msg: 'T\'han enxampat! -10 prestigi i multa 5.000€.' };
    },
  },
  {
    id: 'difamacio',
    icon: '📰',
    name: 'Campanya de difamació',
    cost: 2000,
    successBase: 0.50,
    nightBonus: 0.05,
    description: 'Paga mitjans i influencers per publicar articles negatius sobre el rival. La reputació cau, les vendes també.',
    damageDesc: '-8 prestigi rival · -10% vendes 2 setm',
    penaltyDesc: '-15 prestigi · viral en contra',
    cooldown: 5,
    successEffect: (myGd, targetGd) => {
      targetGd.prestigi = Math.max(0, (targetGd.prestigi||0) - 8);
      (targetGd.events = targetGd.events||[]).push({ name: 'Campanya difamatòria', impact: -0.10, weeksLeft: 2 });
      return { msg: 'Difamació exitosa. El rival perd reputació i ingressos.' };
    },
    failEffect: (myGd) => {
      myGd.prestigi = Math.max(0, (myGd.prestigi||0) - 15);
      (myGd.events = myGd.events||[]).push({ name: 'Backlash viral', impact: -0.08, weeksLeft: 2 });
      return { msg: 'S\'ha descobert! La campanya es gira contra tu.' };
    },
  },
  {
    id: 'fakereviews',
    icon: '🎭',
    name: 'Fake reviews massives',
    cost: 800,
    successBase: 0.70,
    nightBonus: 0.05,
    description: 'Contracta una granja de reviews per omplir Google, Yelp i redes amb valoracions negatives del rival.',
    damageDesc: '-3 prestigi rival',
    penaltyDesc: '-5 prestigi · multa 1.500€',
    cooldown: 3,
    successEffect: (myGd, targetGd) => {
      targetGd.prestigi = Math.max(0, (targetGd.prestigi||0) - 3);
      return { msg: 'Reviews publicades. El rival perd 3 punts de prestigi.' };
    },
    failEffect: (myGd) => {
      myGd.prestigi = Math.max(0, (myGd.prestigi||0) - 5);
      myGd.finances.cash = (myGd.finances.cash||0) - 1500;
      return { msg: 'Google ha detectat les reviews falses. Multa 1.500€.' };
    },
  },
  {
    id: 'headhunting',
    icon: '💼',
    name: 'Head hunting agressiu',
    cost: 5000,
    successBase: 0.80,
    nightBonus: 0,
    description: '100% legal. Ofereixes un sou altíssim a un empleat estrella del rival per que canviï d\'empresa.',
    damageDesc: 'Rival perd un empleat',
    penaltyDesc: 'L\'empleat rebutja (sense altre càstig)',
    cooldown: 2,
    successEffect: (myGd, targetGd) => {
      // Moure un empleat del rival al nostre
      const emps = targetGd.employees||[];
      if (emps.length > 0) {
        const stolen = emps.shift();
        (myGd.employees = myGd.employees||[]).push({...stolen, morale: 85});
        return { msg: `${stolen.name||'Un empleat'} ara treballa per tu!`, stolen };
      }
      return { msg: 'El rival no tenia empleats per cercar.' };
    },
    failEffect: (myGd, targetGd) => {
      // L'empleat puja el sou al rival — cost indirecte però res dolent per a mi
      return { msg: 'L\'empleat ha rebutjat l\'oferta. El rival ara li puja el sou.' };
    },
  },
  {
    id: 'denuncia',
    icon: '🏛️',
    name: 'Denúncia falsa',
    cost: 4000,
    successBase: 0.40,
    nightBonus: 0,
    description: 'Denuncies el rival a Hisenda/Inspecció Laboral amb proves fabricades. Si cola, pateix una inspecció devastadora.',
    damageDesc: 'Multa 8-15k + 2 setm parat',
    penaltyDesc: '-30 prestigi · multa 12.000€ · escàndol públic',
    cooldown: 8,
    successEffect: (myGd, targetGd) => {
      const fine = 8000 + Math.floor(Math.random() * 7000);
      targetGd.finances.cash = (targetGd.finances.cash||0) - fine;
      targetGd.prestigi = Math.max(0, (targetGd.prestigi||0) - 10);
      (targetGd.events = targetGd.events||[]).push({ name: 'Inspecció', impact: -0.50, weeksLeft: 2 });
      return { msg: `Inspecció exitosa! Rival paga ${fmt(fine)}€ de multa i para 2 setmanes.` };
    },
    failEffect: (myGd) => {
      myGd.prestigi = Math.max(0, (myGd.prestigi||0) - 30);
      myGd.finances.cash = (myGd.finances.cash||0) - 12000;
      return { msg: 'Delicte de denúncia falsa! -30 prestigi i 12.000€ de multa. Surts als diaris.' };
    },
  },
  {
    id: 'incendi',
    icon: '🔥',
    name: '"Accident" sospitós',
    cost: 15000,
    successBase: 0.30,
    nightBonus: 0.20,
    description: '⚠️ L\'opció més extrema i arriscada. Un "accident" misteriós destrueix instal·lacions del rival.',
    damageDesc: '-30.000€ + 2 setm aturat',
    penaltyDesc: '⚠️ -30 prestigi · llibertat condicional · -50% cash temporada',
    cooldown: 16,
    isExtreme: true,
    successEffect: (myGd, targetGd) => {
      targetGd.finances.cash = (targetGd.finances.cash||0) - 30000;
      targetGd.prestigi = Math.max(0, (targetGd.prestigi||0) - 5);
      (targetGd.events = targetGd.events||[]).push({ name: 'Sinistre', impact: -0.85, weeksLeft: 2 });
      // Empleats perden la moral per por
      (targetGd.employees||[]).forEach(e => { e.morale = Math.max(20, (e.morale||60) - 30); });
      return { msg: 'El "sinistre" ha estat devastador. Rival perd 30.000€ i para 2 setmanes.' };
    },
    failEffect: (myGd) => {
      myGd.prestigi = Math.max(0, (myGd.prestigi||0) - 30);
      myGd._conditional = { active: true, weeksLeft: 8, cashPenalty: 0.5 };
      myGd.finances.cash = Math.floor((myGd.finances.cash||0) * 0.5);
      return { msg: 'T\'han enxampat! Llibertat condicional. Cash reduït al 50%. -30 prestigi.' };
    },
  },
];

// Estat d'operacions al gd: gd._ops = { cooldowns: { [opId+targetUid]: weekUntil } }

function initOpsState(gd) {
  if (!gd._ops) gd._ops = { cooldowns: {}, history: [] };
}

function isOnCooldown(gd, opId, targetUid) {
  initOpsState(gd);
  const key = opId + '_' + targetUid;
  const cdUntil = gd._ops.cooldowns[key];
  if (!cdUntil) return false;
  return (gd.week || 1) < cdUntil;
}

function getCooldownRemaining(gd, opId, targetUid) {
  initOpsState(gd);
  const key = opId + '_' + targetUid;
  const cdUntil = gd._ops.cooldowns[key];
  if (!cdUntil) return 0;
  return Math.max(0, cdUntil - (gd.week || 1));
}

// Calcular probabilitat real incloent factors (nit, seguretat del target)
function calculateSuccessChance(op, targetStudent) {
  let chance = op.successBase;
  
  // Bonus si és de nit
  const hour = (gameTime / 3600) % 24;
  const isNight = hour >= 22 || hour < 6;
  if (isNight) chance += op.nightBonus;
  
  // Reducció per seguretat del rival
  const secLevel = targetStudent._security?.level || 'baixa';
  if (secLevel === 'mitjana') chance -= 0.30 * (op.successBase); // proporcional
  else if (secLevel === 'alta') chance -= 0.60 * (op.successBase);
  
  return Math.max(0.05, Math.min(0.95, chance));
}

// Ampliar la funció _openEspionageMenu (ara sí que fa servir les operacions)
window._openEspionageMenu = function(targetUid) {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  const target = companies.find(c => c.uid === targetUid);
  if (!target) return;
  
  // Tancar modal anterior
  document.getElementById('company-select-modal')?.remove();
  document.getElementById('espionage-modal')?.remove();
  
  initOpsState(gd);
  
  const myCash = gd.finances?.cash || 0;
  const myPrestigi = gd.prestigi || 0;
  const isConditional = gd._conditional?.active;
  
  const modal = document.createElement('div');
  modal.id = 'espionage-modal';
  modal.className = 'company-select-modal';
  
  modal.innerHTML = `
    <div class="company-select-card" style="max-width:560px;background:linear-gradient(180deg, rgba(40,20,30,.99), rgba(15,8,12,.99));border-color:#b85545">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(184,85,69,.3)">
        <div style="font-size:36px">🕵️</div>
        <div style="flex:1">
          <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#fff">Operacions encobertes</div>
          <div style="font-size:11px;color:rgba(255,255,255,.65)">Objectiu: <strong style="color:#ffaa66">${target.name}</strong> (${target.ownerName})</div>
        </div>
        <button onclick="document.getElementById('espionage-modal').remove()" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer">✕</button>
      </div>
      
      <div style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;margin-bottom:12px;font-size:11px;color:rgba(255,255,255,.8);line-height:1.5">
        <strong style="color:#ffaa66">⚠️ Avís pedagògic:</strong> Aquestes accions representen pràctiques de <strong>competència deslleial</strong> reals al món empresarial. Totes tenen conseqüències legals greus si es descobreixen.
      </div>
      
      ${isConditional ? `
        <div style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);border-radius:10px;padding:10px;margin-bottom:12px;font-size:12px;color:#ffcccc">
          ⚖️ <strong>Estàs en llibertat condicional</strong> (${gd._conditional.weeksLeft} setm restants). Tots els atacs tenen +20% risc de detecció.
        </div>
      ` : ''}
      
      <div style="display:flex;flex-direction:column;gap:8px;max-height:52vh;overflow-y:auto">
        ${OPERACIONS.map(op => {
          const chance = calculateSuccessChance(op, target.student);
          const cdRem = getCooldownRemaining(gd, op.id, targetUid);
          const onCd = cdRem > 0;
          const canAfford = myCash >= op.cost;
          const disabled = onCd || !canAfford;
          const chancePct = Math.round(chance * 100);
          const chanceColor = chance >= 0.6 ? '#10b981' : chance >= 0.4 ? '#f5d547' : '#ef4444';
          
          return `
            <div style="background:${disabled?'rgba(255,255,255,.02)':'rgba(255,255,255,.05)'};border:1px solid ${op.isExtreme?'rgba(239,68,68,.3)':'rgba(255,255,255,.1)'};border-radius:10px;padding:12px;opacity:${disabled?0.5:1}">
              <div style="display:flex;align-items:flex-start;gap:10px">
                <div style="font-size:28px;flex-shrink:0">${op.icon}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
                    <span style="font-weight:800;color:#fff;font-size:13px">${op.name}</span>
                    ${op.isExtreme ? '<span style="font-size:9px;background:rgba(239,68,68,.25);color:#ff9999;padding:1px 6px;border-radius:5px;font-weight:800">EXTREM</span>' : ''}
                    ${op.id === 'headhunting' ? '<span style="font-size:9px;background:rgba(16,185,129,.20);color:#7ee2a8;padding:1px 6px;border-radius:5px;font-weight:800">LEGAL</span>' : ''}
                  </div>
                  <div style="font-size:11px;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:6px">${op.description}</div>
                  <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:10px;color:rgba(255,255,255,.6)">
                    <span>💰 <strong style="color:${canAfford?'#fff':'#ef4444'}">${fmt(op.cost)}€</strong></span>
                    <span>🎯 Èxit: <strong style="color:${chanceColor}">${chancePct}%</strong></span>
                    <span>⏱️ Cooldown: ${op.cooldown} setm</span>
                  </div>
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;font-size:10px">
                    <div style="color:#7ee2a8">✅ Èxit: ${op.damageDesc}</div>
                    <div style="color:#ff9999">❌ Fallida: ${op.penaltyDesc}</div>
                  </div>
                </div>
              </div>
              <button onclick="window._executeOp('${op.id}','${targetUid}')" 
                ${disabled?'disabled':''}
                style="width:100%;margin-top:10px;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:800;cursor:${disabled?'not-allowed':'pointer'};font-family:var(--font);background:${op.isExtreme?'linear-gradient(135deg, #c1352d, #7a1a16)':'linear-gradient(135deg, #8b5a44, #5e3a2e)'};color:#fff">
                ${onCd ? `⏱️ Cooldown: ${cdRem} setm` : !canAfford ? `💸 Falten ${fmt(op.cost - myCash)}€` : `${op.icon} Executar operació`}
              </button>
            </div>
          `;
        }).join('')}
      </div>
      
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1);text-align:center">
        <button onclick="document.getElementById('espionage-modal').remove()" style="background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.15);padding:10px 24px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">
          Cancel·lar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

// Executar una operació
window._executeOp = async function(opId, targetUid) {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  const op = OPERACIONS.find(o => o.id === opId);
  if (!op) return;
  
  const target = companies.find(c => c.uid === targetUid);
  if (!target) return;
  
  if ((gd.finances?.cash||0) < op.cost) {
    showToast('❌ Fons insuficients');
    return;
  }
  
  // Confirmació per operació extrema
  if (op.isExtreme) {
    if (!confirm(`⚠️ AVÍS: "${op.name}" és una acció EXTREMADAMENT arriscada. Si t'enxampen acabes en llibertat condicional i perds el 50% del cash. Continuar?`)) {
      return;
    }
  }
  
  initOpsState(gd);
  
  // Pagar cost
  gd.finances.cash -= op.cost;
  
  // Calcular èxit
  let chance = calculateSuccessChance(op, target.student);
  // +20% risc si estic en condicional
  if (gd._conditional?.active) chance -= 0.20;
  
  const success = Math.random() < chance;
  
  // Fer servir dades locals del target (NO podem modificar el seu gd remot des del client — en Firestore necessitaria backend)
  // Efecte es mostra visualment; la penalització al rival es queda com a "notificació" pendent
  const result = success 
    ? op.successEffect(gd, target.student)
    : op.failEffect(gd, target.student);
  
  // Establir cooldown
  const key = opId + '_' + targetUid;
  gd._ops.cooldowns[key] = (gd.week || 1) + op.cooldown;
  
  // Historial
  gd._ops.history = gd._ops.history || [];
  gd._ops.history.unshift({
    week: gd.week,
    opId, opName: op.name, opIcon: op.icon,
    targetUid, targetName: target.name,
    success,
    msg: result.msg,
    time: Date.now(),
  });
  if (gd._ops.history.length > 20) gd._ops.history.pop();
  
  // Afegir a map events (visibles per a tots)
  gd._mapEvents = gd._mapEvents || [];
  gd._mapEvents.push({
    icon: success ? op.icon : '🚨',
    text: success 
      ? `Operació ${op.name} exitosa contra ${target.name}` 
      : `T'han enxampat fent ${op.name.toLowerCase()}!`,
    time: 'S' + gd.week,
    urgent: !success,
  });
  if (gd._mapEvents.length > 50) gd._mapEvents = gd._mapEvents.slice(-50);
  
  // Animació visual al mapa
  const visualType = 
    opId === 'incendi' ? 'fire' :
    opId === 'denuncia' ? 'inspection' :
    opId === 'difamacio' ? 'news-bad' :
    opId === 'fakereviews' ? 'review' :
    opId === 'headhunting' && success ? 'migration' :
    opId === 'espionatge' ? 'police' : // si fallida mostra policia
    'success';
  
  const ev = {
    id: Date.now() + Math.random(),
    type: success ? visualType : 'police', // si falla, sempre sirenes
    targetUid: success ? targetUid : G.uid, // si falla, sirenes a MEVA casa
    col: success ? target.col : (companies.find(c => c.isMe)?.col || target.col),
    row: success ? target.row : (companies.find(c => c.isMe)?.row || target.row),
    w: 2, h: 2,
    duration: 8,
    age: 0,
  };
  // Migració necessita uid2
  if (visualType === 'migration' && success) {
    ev.targetUid2 = G.uid; // l'empleat va cap a mi
    const me = companies.find(c => c.isMe);
    if (me) { ev.col = target.col; ev.row = target.row; }
  }
  visualEvents.push(ev);
  
  if (window.saveGameData) await saveGameData();
  
  // Tancar modal operacions
  document.getElementById('espionage-modal')?.remove();
  
  // Toast i so segons resultat
  if (success) {
    if (window.showEventToast) window.showEventToast(op.icon, 'Operació exitosa!', result.msg, true);
    if (window.playSfx) window.playSfx('success');
  } else {
    if (window.showEventToast) window.showEventToast('🚨', 'T\'han enxampat!', result.msg, false);
    if (window.playSfx) window.playSfx('fail');
  }
  
  // Centrar càmera al target per que l'usuari vegi l'efecte
  if (target) {
    selectedCompanyUid = targetUid;
    zoomLevel = Math.max(1.2, zoomLevel);
    panX = canvas.width / 2 - ((target.col + target.w/2) * MAP_CONFIG.tileSize) * zoomLevel;
    panY = canvas.height / 2 - ((target.row + target.h/2) * MAP_CONFIG.tileSize) * zoomLevel;
    clampPan();
  }
  
  // Refrescar sidebar
  const sb = document.querySelector('.vallnova-sidebar');
  if (sb) sb.innerHTML = renderSidebar();
};

// Panel de seguretat defensiva
window._goToMySecurity = function() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  document.getElementById('company-select-modal')?.remove();
  document.getElementById('security-modal')?.remove();
  
  if (!gd._security) gd._security = { level: 'baixa' };
  const currentLevel = gd._security.level;
  const myCash = gd.finances?.cash || 0;
  
  const LEVELS = [
    { id: 'baixa',   name: 'Baixa', icon: '🔓', cost: 0,     protection: 0,    desc: 'Sense protecció. Qualsevol pot atacar-te fàcilment.' },
    { id: 'mitjana', name: 'Mitjana', icon: '🛡️', cost: 1500,  protection: 30,   desc: 'Guàrdia de seguretat + antivirus corporatiu. Redueix èxit atacs -30%.' },
    { id: 'alta',    name: 'Alta',   icon: '🏰', cost: 4000,  protection: 60,   desc: 'Seguretat privada 24/7 + alertes d\'intents d\'atac. Redueix èxit atacs -60%.' },
  ];
  
  const modal = document.createElement('div');
  modal.id = 'security-modal';
  modal.className = 'company-select-modal';
  modal.innerHTML = `
    <div class="company-select-card" style="max-width:500px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
        <div style="font-size:36px">🛡️</div>
        <div style="flex:1">
          <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text)">Seguretat corporativa</div>
          <div style="font-size:11px;color:var(--text2)">Protegeix-te de les operacions encobertes dels rivals</div>
        </div>
        <button onclick="document.getElementById('security-modal').remove()" style="background:none;border:none;color:var(--text2);font-size:22px;cursor:pointer">✕</button>
      </div>
      
      <div style="display:flex;flex-direction:column;gap:8px">
        ${LEVELS.map(l => {
          const selected = currentLevel === l.id;
          const canAfford = myCash >= l.cost;
          return `
            <div style="background:${selected?'rgba(16,185,129,.10)':'rgba(255,255,255,.04)'};border:2px solid ${selected?'var(--green)':'var(--border)'};border-radius:12px;padding:14px">
              <div style="display:flex;align-items:center;gap:12px">
                <div style="font-size:32px">${l.icon}</div>
                <div style="flex:1">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                    <span style="font-weight:800;color:var(--text);font-size:14px">Nivell: ${l.name}</span>
                    ${selected ? '<span style="font-size:10px;background:var(--green);color:#fff;padding:2px 8px;border-radius:6px;font-weight:800">ACTIU</span>' : ''}
                  </div>
                  <div style="font-size:11px;color:var(--text2);line-height:1.4;margin-bottom:4px">${l.desc}</div>
                  <div style="font-size:10px;color:var(--text3)">
                    💰 ${l.cost === 0 ? 'Gratis' : fmt(l.cost)+'€/setmana'} · 🛡️ -${l.protection}% èxit atacs rebuts
                  </div>
                </div>
              </div>
              ${!selected ? `
                <button onclick="window._setSecurityLevel('${l.id}')" 
                  ${!canAfford && l.cost > 0?'disabled':''}
                  style="width:100%;margin-top:10px;padding:8px;background:${canAfford || l.cost === 0?'var(--accent)':'rgba(255,255,255,.05)'};color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:${canAfford || l.cost === 0?'pointer':'not-allowed'};opacity:${canAfford || l.cost === 0?1:0.5};font-family:var(--font)">
                  ${!canAfford && l.cost > 0 ? `💸 Falten ${fmt(l.cost - myCash)}€` : `Activar ${l.name}`}
                </button>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
      
      <div style="margin-top:14px;font-size:11px;color:var(--text3);text-align:center;line-height:1.5">
        El cost es descompta setmanalment. Canviar a un nivell inferior és gratuït.
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window._setSecurityLevel = async function(levelId) {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  if (!gd._security) gd._security = {};
  gd._security.level = levelId;
  
  const LEVELS = { baixa: 0, mitjana: 1500, alta: 4000 };
  gd._security.weeklyCost = LEVELS[levelId] || 0;
  
  if (window.saveGameData) await saveGameData();
  
  showToast(`🛡️ Seguretat canviada a nivell: ${levelId.toUpperCase()}`);
  if (window.playSfx) window.playSfx('success');
  
  document.getElementById('security-modal')?.remove();
};

// ─── Hook a advanceWeek per cobrar seguretat i tick condicional ───
let _mapHooked = false;
function hookMapToAdvanceWeek() {
  if (_mapHooked) return;
  if (typeof window.advanceWeek !== 'function') return;
  _mapHooked = true;
  
  const orig = window.advanceWeek;
  window.advanceWeek = async function() {
    const G = getG();
    const gd = G?.gameData;
    
    // Tick condicional
    if (gd?._conditional?.active) {
      gd._conditional.weeksLeft = Math.max(0, (gd._conditional.weeksLeft||0) - 1);
      if (gd._conditional.weeksLeft <= 0) {
        gd._conditional.active = false;
        if (window.showEventToast) window.showEventToast('⚖️', 'Llibertat condicional finalitzada', 'Ja pots operar amb normalitat', true);
      }
    }
    
    // Cobrar seguretat setmanal
    if (gd?._security?.weeklyCost > 0 && gd.finances) {
      gd.finances.cash = (gd.finances.cash||0) - gd._security.weeklyCost;
    }
    
    return await orig.apply(this, arguments);
  };
}

setInterval(hookMapToAdvanceWeek, 800);

console.log('🗺️ ui-mapa.js carregat — Vallnova + 30 slots + zoom/pan + 6 operacions encobertes + seguretat');

})();
