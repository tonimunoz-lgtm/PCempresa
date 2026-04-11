(function() {
// ui-visuals.js — Il·lustracions SVG dinàmiques de les instal·lacions

const G = window.G;

// Paleta de colors per sector
const SECTOR_COLORS = {
  alimentacio: { primary: '#16a34a', secondary: '#dcfce7', accent: '#4ade80' },
  tecnologia:  { primary: '#2563eb', secondary: '#dbeafe', accent: '#60a5fa' },
  construccio: { primary: '#d97706', secondary: '#fef3c7', accent: '#fbbf24' },
  comerc:      { primary: '#7c3aed', secondary: '#ede9fe', accent: '#a78bfa' },
  logistica:   { primary: '#0891b2', secondary: '#cffafe', accent: '#22d3ee' },
  turisme:     { primary: '#db2777', secondary: '#fce7f3', accent: '#f472b6' },
  salut:       { primary: '#059669', secondary: '#d1fae5', accent: '#34d399' },
  educacio:    { primary: '#7c3aed', secondary: '#ede9fe', accent: '#a78bfa' },
  moda:        { primary: '#be185d', secondary: '#fce7f3', accent: '#f472b6' },
  quimica:     { primary: '#6d28d9', secondary: '#ede9fe', accent: '#8b5cf6' },
  default:     { primary: '#4f7fff', secondary: '#dbeafe', accent: '#93bbff' },
};

window.renderFacilityIllustration = function renderFacilityIllustration(containerId) {
  const gd = G?.gameData;
  if (!gd?.company) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const sector = gd.company.sector || 'default';
  const size   = gd.company.size   || 'medium';
  const prestigi = gd.prestigi || 0;
  const cash   = gd.finances?.cash || 0;
  const emps   = gd.employees?.length || 0;
  const machines = gd.machines?.length || 0;

  const colors = SECTOR_COLORS[sector] || SECTOR_COLORS.default;

  // Nivell de creixement visual (0-4)
  const growth = prestigi < 15 ? 0 : prestigi < 30 ? 1 : prestigi < 50 ? 2 : prestigi < 75 ? 3 : 4;

  const svg = buildFacilitySVG(sector, size, growth, colors, emps, machines, cash, gd.company.name);

  container.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:12px;position:relative">
      <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border)">
        <div style="font-size:12px;font-weight:700;color:var(--text)">${gd.company.sectorData?.icon||'🏢'} ${gd.company.name}</div>
        <div style="display:flex;gap:8px;font-size:10px;color:var(--text2)">
          <span>Nivell: <strong style="color:${colors.accent}">${['Inicial','Creixement','Establerta','Consolidada','Líder'][growth]}</strong></span>
          <span>👥 ${emps}</span>
          <span>⚙️ ${machines}</span>
        </div>
      </div>
      ${svg}
    </div>`;
}

function buildFacilitySVG(sector, size, growth, colors, emps, machines, cash, name) {
  const w = 600, h = 160;
  const isNegative = cash < 0;

  // Edifici principal (creix amb el growth)
  const buildW = 80 + growth * 20;
  const buildH = 60 + growth * 15;
  const buildX = 40;
  const buildY = h - buildH - 20;

  // Elements per sector
  const sectorElements = getSectorElements(sector, w, h, growth, colors);

  // Personetes (empleats)
  const people = Math.min(emps, 8);
  const peopleHTML = Array.from({length:people},(_,i) => {
    const x = 280 + i * 32;
    const y = h - 35;
    return `<g transform="translate(${x},${y})">
      <circle cx="0" cy="-14" r="6" fill="${colors.primary}" opacity=".8"/>
      <rect x="-5" y="-8" width="10" height="14" rx="2" fill="${colors.primary}" opacity=".7"/>
    </g>`;
  }).join('');

  // Màquines
  const machinesHTML = Array.from({length:Math.min(machines,4)},(_,i) => {
    const x = 160 + i * 28;
    const y = h - 30;
    return `<g transform="translate(${x},${y})">
      <rect x="-10" y="-18" width="20" height="18" rx="2" fill="${colors.secondary}" stroke="${colors.accent}" stroke-width="1.5"/>
      <rect x="-6" y="-14" width="8" height="8" rx="1" fill="${colors.accent}" opacity=".6"/>
      <rect x="-6" y="-3" width="12" height="2" rx="1" fill="${colors.primary}" opacity=".4"/>
    </g>`;
  }).join('');

  // Estat financer visual
  const statusColor = isNegative ? '#ef4444' : cash > 50000 ? '#10b981' : '#f59e0b';
  const statusText  = isNegative ? '⚠️ CRISI' : cash > 50000 ? '✅ ESTABLE' : '⚠️ VIGILAR';

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${h}px;display:block">
    <!-- Fons -->
    <rect width="${w}" height="${h}" fill="#06080f"/>
    <!-- Terra -->
    <rect x="0" y="${h-20}" width="${w}" height="20" fill="#0d1120"/>
    <rect x="0" y="${h-21}" width="${w}" height="2" fill="${colors.primary}" opacity=".2"/>

    <!-- Cel / fons ambient -->
    <rect width="${w}" height="${h-20}" fill="${colors.secondary}" opacity=".04"/>

    <!-- Edifici principal -->
    <rect x="${buildX}" y="${buildY}" width="${buildW}" height="${buildH}" rx="4"
      fill="${colors.primary}" opacity=".7"/>
    <!-- Finestres edifici -->
    ${Array.from({length:Math.min(3,1+growth)},(_,row) =>
      Array.from({length:Math.min(4,2+growth)},(_,col) =>
        `<rect x="${buildX+8+col*18}" y="${buildY+8+row*16}" width="10" height="10" rx="1"
          fill="${isNegative?'#1f2937':'#dbeafe'}" opacity="${isNegative?'.3':'.8'}"/>`
      ).join('')
    ).join('')}
    <!-- Porta edifici -->
    <rect x="${buildX+buildW/2-8}" y="${buildY+buildH-24}" width="16" height="24" rx="2"
      fill="#1e3a5f" opacity=".9"/>

    <!-- Rètol empresa -->
    <rect x="${buildX}" y="${buildY-18}" width="${buildW}" height="14" rx="3"
      fill="${colors.primary}" opacity=".9"/>
    <text x="${buildX+buildW/2}" y="${buildY-7}" text-anchor="middle"
      font-family="Space Grotesk,sans-serif" font-size="8" font-weight="700"
      fill="white" opacity=".9">${name.slice(0,18)}</text>

    <!-- Elements específics del sector -->
    ${sectorElements}

    <!-- Màquines -->
    ${machinesHTML}

    <!-- Persones -->
    ${peopleHTML}

    <!-- Indicador d'estat -->
    <rect x="${w-80}" y="8" width="72" height="20" rx="10"
      fill="${statusColor}" opacity=".15" stroke="${statusColor}" stroke-width="1"/>
    <text x="${w-44}" y="22" text-anchor="middle"
      font-family="Space Grotesk,sans-serif" font-size="9" font-weight="700"
      fill="${statusColor}">${statusText}</text>

    <!-- Xemeneia / vapor si hi ha producció -->
    ${machines > 0 ? `
    <rect x="${buildX+buildW-12}" y="${buildY-30}" width="8" height="30" rx="2" fill="#374151" opacity=".6"/>
    <ellipse cx="${buildX+buildW-8}" cy="${buildY-32}" rx="12" ry="6" fill="#6b7280" opacity=".15"/>
    <ellipse cx="${buildX+buildW-8}" cy="${buildY-40}" rx="8" ry="4" fill="#6b7280" opacity=".10"/>` : ''}

    <!-- Línia prestigi -->
    <text x="12" y="${h-6}" font-family="Space Grotesk,sans-serif" font-size="9" fill="${colors.accent}" opacity=".7">
      Prestigi ★ ${Math.round(G?.gameData?.prestigi||0)}/100
    </text>
  </svg>`;
}

function getSectorElements(sector, w, h, growth, colors) {
  const baseY = h - 20;
  switch(sector) {
    case 'alimentacio':
      return `
        <!-- Arbres / camps -->
        ${[1,2,3].map(i=>`
          <ellipse cx="${w-60-i*45}" cy="${baseY-25}" rx="18" ry="22" fill="#15803d" opacity="${.3+i*.1}"/>
          <rect x="${w-63-i*45}" y="${baseY-5}" width="6" height="10" rx="1" fill="#854d0e" opacity=".6"/>
        `).join('')}
        <!-- Silo -->
        ${growth>=2?`<ellipse cx="${w-30}" cy="${baseY-40}" rx="14" ry="14" fill="${colors.primary}" opacity=".5"/>
        <rect x="${w-44}" y="${baseY-40}" width="28" height="40" rx="2" fill="${colors.primary}" opacity=".4"/>`:''}`;

    case 'tecnologia':
      return `
        <!-- Servidor / antena -->
        <rect x="${w-60}" y="${baseY-50}" width="30" height="50" rx="3" fill="#1e293b" opacity=".8" stroke="${colors.accent}" stroke-width="1"/>
        ${Array.from({length:4},(_,i)=>`
          <rect x="${w-56}" y="${baseY-45+i*10}" width="22" height="6" rx="1" fill="${colors.primary}" opacity=".5"/>
          <circle cx="${w-36}" cy="${baseY-42+i*10}" r="2" fill="${i%2===0?colors.accent:'#ef4444'}" opacity=".8"/>
        `).join('')}
        <!-- Wifi/antena -->
        ${growth>=2?`<line x1="${w-45}" y1="${baseY-52}" x2="${w-45}" y2="${baseY-65}" stroke="${colors.accent}" stroke-width="2" opacity=".5"/>
        <circle cx="${w-45}" cy="${baseY-65}" r="4" fill="${colors.accent}" opacity=".4"/>`:''}`;

    case 'construccio':
      return `
        <!-- Grua -->
        ${growth>=1?`
          <rect x="${w-70}" y="${baseY-80}" width="6" height="80" rx="2" fill="#f59e0b" opacity=".7"/>
          <rect x="${w-70}" y="${baseY-80}" width="50" height="6" rx="2" fill="#f59e0b" opacity=".7"/>
          <line x1="${w-20}" y1="${baseY-80}" x2="${w-20}" y2="${baseY-30}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,2" opacity=".5"/>
          <rect x="${w-28}" y="${baseY-30}" width="16" height="12" rx="1" fill="#374151" opacity=".8"/>
        `:''}
        <!-- Material de construcció -->
        <rect x="${w-100}" y="${baseY-12}" width="30" height="12" rx="1" fill="#b45309" opacity=".6"/>
        <rect x="${w-100}" y="${baseY-20}" width="30" height="8" rx="1" fill="#d97706" opacity=".5"/>`;

    case 'logistica':
      return `
        <!-- Camió -->
        <rect x="${w-110}" y="${baseY-28}" width="70" height="24" rx="3" fill="#1e40af" opacity=".7"/>
        <rect x="${w-40}" y="${baseY-20}" width="28" height="16" rx="3" fill="#2563eb" opacity=".8"/>
        <circle cx="${w-100}" cy="${baseY-2}" r="8" fill="#1f2937" opacity=".9"/>
        <circle cx="${w-100}" cy="${baseY-2}" r="4" fill="#6b7280" opacity=".7"/>
        <circle cx="${w-55}" cy="${baseY-2}" r="8" fill="#1f2937" opacity=".9"/>
        <circle cx="${w-55}" cy="${baseY-2}" r="4" fill="#6b7280" opacity=".7"/>
        <!-- Paleta -->
        <rect x="${w-140}" y="${baseY-18}" width="20" height="18" rx="1" fill="#854d0e" opacity=".5"/>`;

    case 'salut':
      return `
        <!-- Creu mèdica -->
        <rect x="${w-55}" y="${baseY-65}" width="30" height="10" rx="2" fill="white" opacity=".6"/>
        <rect x="${w-46}" y="${baseY-74}" width="10" height="30" rx="2" fill="white" opacity=".6"/>
        <!-- Ambulància -->
        ${growth>=2?`
          <rect x="${w-120}" y="${baseY-22}" width="55" height="18" rx="3" fill="white" opacity=".7"/>
          <rect x="${w-65}" y="${baseY-18}" width="18" height="14" rx="2" fill="#93c5fd" opacity=".8"/>
          <rect x="${w-113}" y="${baseY-18}" width="12" height="8" rx="1" fill="#ef4444" opacity=".5"/>
          <circle cx="${w-105}" cy="${baseY-2}" r="5" fill="#1f2937" opacity=".9"/>
          <circle cx="${w-80}" cy="${baseY-2}" r="5" fill="#1f2937" opacity=".9"/>
        `:''}`;

    case 'turisme':
      return `
        <!-- Piscina -->
        <ellipse cx="${w-60}" cy="${baseY-15}" rx="35" ry="12" fill="#0ea5e9" opacity=".35"/>
        <ellipse cx="${w-60}" cy="${baseY-15}" rx="35" ry="12" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity=".6"/>
        <!-- Palmeres -->
        ${[1,0].map(i=>`
          <rect x="${w-115+i*90}" y="${baseY-45}" width="5" height="30" rx="2" fill="#854d0e" opacity=".7"/>
          <ellipse cx="${w-113+i*90}" cy="${baseY-50}" rx="15" ry="10" fill="#16a34a" opacity=".6"/>
        `).join('')}`;

    case 'moda':
      return `
        <!-- Aparador -->
        <rect x="${w-80}" y="${baseY-55}" width="50" height="55" rx="4" fill="${colors.secondary}" opacity=".15" stroke="${colors.accent}" stroke-width="1.5"/>
        <!-- Maniquí -->
        <circle cx="${w-55}" cy="${baseY-48}" r="8" fill="${colors.primary}" opacity=".5"/>
        <rect x="${w-60}" y="${baseY-40}" width="10" height="20" rx="2" fill="${colors.primary}" opacity=".4"/>
        <rect x="${w-65}" y="${baseY-38}" width="20" height="8" rx="2" fill="${colors.primary}" opacity=".3"/>`;

    default:
      return `
        <!-- Decoració genèrica -->
        <rect x="${w-80}" y="${baseY-40}" width="40" height="40" rx="4" fill="${colors.primary}" opacity=".2" stroke="${colors.accent}" stroke-width="1"/>
        <text x="${w-60}" y="${baseY-16}" text-anchor="middle" font-size="20">${'📊'}</text>`;
  }
}
})();
