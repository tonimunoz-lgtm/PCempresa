// ============================================================
//  icons-gamification.js — Icones SVG custom + Sistema de gamificació
//  EmpresaBat · Simulador Empresarial
// ============================================================

(function() {

// ════════════════════════════════════════════════════════════
//  1. ICONES SVG PERSONALITZADES
// ════════════════════════════════════════════════════════════

const ICONS = {
  // ── Navegació sidebar ──
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="4" rx="1.5"/><rect x="13" y="9" width="8" height="12" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/></svg>`,
  
  empresa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l7-5 7 5v13"/><path d="M17 21V12l4-2.5V21"/><line x1="7" y1="12" x2="7" y2="12.01"/><line x1="10" y1="12" x2="10" y2="12.01"/><line x1="13" y1="12" x2="13" y2="12.01"/><line x1="7" y1="16" x2="7" y2="16.01"/><line x1="10" y1="16" x2="10" y2="16.01"/><line x1="13" y1="16" x2="13" y2="16.01"/><rect x="9" y="17" width="4" height="4"/></svg>`,

  finances: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.7 0-3 1-3 2.3 0 1.3 1.3 2 3 2.2 1.7.2 3 .9 3 2.3 0 1.3-1.3 2.2-3 2.2-1.2 0-2.2-.5-2.7-1.5"/><line x1="12" y1="6.5" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="17.5"/></svg>`,

  rrhh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="18" cy="9" r="2.5"/><path d="M21 21v-1.5a3 3 0 00-3-3h-.5"/></svg>`,

  produccio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17V7l5 4V7l5 4V7l5 4v6"/><rect x="2" y="17" width="20" height="4" rx="1"/><circle cx="7" cy="17" r="1" fill="currentColor"/><circle cx="12" cy="17" r="1" fill="currentColor"/><circle cx="17" cy="17" r="1" fill="currentColor"/></svg>`,

  marketing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5L12 14 8.5 10.5 2 17"/><polyline points="21 11 21 5 15 5"/><circle cx="6" cy="19" r="2"/><circle cx="14" cy="15" r="1.5"/></svg>`,

  vendes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,

  mapa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,

  borsa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 8 11 13 15 21 6"/><polyline points="17 6 21 6 21 10"/><line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="21" x2="3" y2="6"/></svg>`,

  junta: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v4H4z"/><path d="M6 8v12h12V8"/><line x1="8" y1="4" x2="8" y2="2"/><line x1="12" y1="4" x2="12" y2="2"/><line x1="16" y1="4" x2="16" y2="2"/><circle cx="12" cy="14" r="2"/><path d="M10 18h4"/></svg>`,

  comerc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M4.5 7h15M4.5 17h15"/></svg>`,

  franquicies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="8" height="11" rx="1.5"/><rect x="14" y="10" width="8" height="11" rx="1.5"/><path d="M6 10V6a6 6 0 0112 0v4"/><circle cx="6" cy="15" r="1" fill="currentColor"/><circle cx="18" cy="15" r="1" fill="currentColor"/><line x1="6" y1="6" x2="18" y2="6" stroke-dasharray="2 2"/></svg>`,

  proveidors: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="14" width="8" height="7" rx="1"/><rect x="15" y="14" width="8" height="7" rx="1"/><rect x="8" y="3" width="8" height="7" rx="1"/><line x1="12" y1="10" x2="5" y2="14" marker-end="url(#a)"/><line x1="12" y1="10" x2="19" y2="14" marker-end="url(#a)"/></svg>`,

  laborals: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4m0 14v-4"/><path d="M4 8l3 3m10-3l-3 3"/><rect x="8" y="11" width="8" height="6" rx="1.5"/><circle cx="12" cy="14" r="1.5"/><path d="M8 17l-4 4m12-4l4 4"/></svg>`,

  professor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-6 10 6-10 6z"/><path d="M6 12.5V18c0 1 2.7 3 6 3s6-2 6-3v-5.5"/><line x1="22" y1="10" x2="22" y2="18"/></svg>`,

  // ── Topbar stats ──
  calendari: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/></svg>`,

  tresoreria: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><circle cx="12" cy="13" r="3"/><path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2"/><line x1="6" y1="13" x2="6.01" y2="13"/><line x1="18" y1="13" x2="18.01" y2="13"/></svg>`,

  resultat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20l4-8 4 4 4-8 6 6"/><circle cx="7" cy="12" r="1.5" fill="currentColor" opacity="0.3"/><circle cx="11" cy="16" r="1.5" fill="currentColor" opacity="0.3"/><circle cx="15" cy="8" r="1.5" fill="currentColor" opacity="0.3"/></svg>`,

  prestigi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.3"/></svg>`,

  empleats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M16 3.1a3 3 0 010 5.8"/><path d="M21 21v-2a4 4 0 00-3-3.85"/></svg>`,

  // ── KPI dashboard ──
  kpi_cash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M12 8v8m-2-6h4a2 2 0 010 4h-4"/></svg>`,

  kpi_rev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-8 4 4 5-9"/><polyline points="15 4 21 4 21 10"/><line x1="15" y1="4" x2="21" y2="4"/></svg>`,

  kpi_costs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l5 8 4-4 5 9"/><polyline points="15 20 21 20 21 14"/></svg>`,

  kpi_prestigi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z"/></svg>`,

  kpi_result: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8m-4-4v8"/></svg>`,

  // ── Accions ──
  avançar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20" fill="currentColor" opacity="0.15" stroke="none"/><polygon points="5 4 15 12 5 20"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,

  perfil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>`,

  // ── Brand ──
  logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M7 8V5a5 5 0 0110 0v3"/><path d="M8 14h2m4 0h2"/><path d="M9 17h6"/></svg>`,

  // ── Departaments (dashboard) ──
  dept_finances: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 17V10m4 7V7m4 10v-4"/></svg>`,

  dept_rrhh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20v-1a4 4 0 014-4h4m2 5v-1a4 4 0 014-4h4"/></svg>`,

  dept_produccio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10-2.8l-2.8 2.8M1 12h4m14 0h4M4.2 19.8l2.8-2.8m10 2.8l-2.8-2.8"/></svg>`,

  dept_vendes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>`,

  dept_marketing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9v20L3 13v-2z"/><circle cx="11" cy="16" r="4"/></svg>`,

  dept_instal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="10" width="20" height="11" rx="2"/><path d="M6 10V6a2 2 0 012-2h8a2 2 0 012 2v4"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>`,

  // ── Auth / misc ──
  alumne: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10l10-6 10 6-10 6z"/><path d="M6 12.5V18c0 1 2.7 3 6 3s6-2 6-3v-5.5"/></svg>`,
  
  candau: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>`,

  // ── Gamificació ──
  xp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.3" fill="currentColor" opacity="0.15"/><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.3"/></svg>`,

  trofeu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v6a6 6 0 01-12 0V2z"/><path d="M6 4H3v2a3 3 0 003 3"/><path d="M18 4h3v2a3 3 0 01-3 3"/><line x1="12" y1="14" x2="12" y2="18"/><path d="M8 22h8v-2a2 2 0 00-2-2h-4a2 2 0 00-2 2v2z"/></svg>`,

  llamp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>`,

  foc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4-2 7-6 7-11 0-3-2-5-3.5-6.5C14 3 12 2 12 2s-2 1-3.5 2.5C7 6 5 8 5 11c0 5 3 9 7 11z"/><path d="M12 22c-2-1.5-3.5-3.5-3.5-6 0-1.5 1-3 2-3.5.5-.3 1-.5 1.5-.5s1 .2 1.5.5c1 .5 2 2 2 3.5 0 2.5-1.5 4.5-3.5 6z"/></svg>`,

  corona: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18l3-12 5 6 2-8 2 8 5-6 3 12z"/><rect x="2" y="18" width="20" height="3" rx="1"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="12" cy="4" r="1" fill="currentColor"/><circle cx="19" cy="6" r="1" fill="currentColor"/></svg>`,

  badge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="7"/><path d="M8.21 13.9L7 23l5-3 5 3-1.21-9.1"/><path d="M10 8l1 2h2.5L12 11.5l.5 2.5L10 12.5 7.5 14l.5-2.5L6.5 10H9z"/></svg>`,
};

// Funció helper per crear un element SVG amb les dimensions correctes
function icon(name, size) {
  size = size || 20;
  const svg = ICONS[name];
  if (!svg) return '';
  // Afegim width/height inline
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" style="display:inline-block;vertical-align:middle;flex-shrink:0" `);
}

// Exposar globalment
window.EBIcon = icon;
window.ICONS = ICONS;


// ════════════════════════════════════════════════════════════
//  2. SISTEMA DE GAMIFICACIÓ (XP, Nivells, Badges, Streaks)
// ════════════════════════════════════════════════════════════

// ── Definició de nivells ──
const LEVELS = [
  { level: 1,  title: 'Becari',              xpReq: 0,     icon: 'alumne' },
  { level: 2,  title: 'Auxiliar administratiu', xpReq: 100,  icon: 'empresa' },
  { level: 3,  title: 'Responsable d\'àrea', xpReq: 300,   icon: 'rrhh' },
  { level: 4,  title: 'Cap de departament',   xpReq: 600,   icon: 'produccio' },
  { level: 5,  title: 'Director/a',          xpReq: 1000,   icon: 'borsa' },
  { level: 6,  title: 'Director/a General',  xpReq: 1600,   icon: 'junta' },
  { level: 7,  title: 'CEO',                 xpReq: 2500,   icon: 'corona' },
  { level: 8,  title: 'Magnata del Vallès',  xpReq: 4000,   icon: 'trofeu' },
  { level: 9,  title: 'Emperador/a empresarial', xpReq: 6000, icon: 'foc' },
  { level: 10, title: 'Llegenda',            xpReq: 10000,  icon: 'llamp' },
];

// ── Definició d'assoliments ──
const ACHIEVEMENTS = [
  // Primeres accions
  { id: 'first_company',    name: 'Primer pas',           desc: 'Crea la teva primera empresa',        icon: 'empresa',    xp: 50,  check: gd => !!gd.company },
  { id: 'first_employee',   name: 'Cap d\'equip',         desc: 'Contracta el primer empleat',         icon: 'rrhh',       xp: 30,  check: gd => (gd.employees||[]).length >= 1 },
  { id: 'first_sale',       name: 'Primera venda',        desc: 'Genera ingressos per primera vegada', icon: 'vendes',     xp: 40,  check: gd => (gd.finances?.monthly_revenue||0) > 0 },
  { id: 'first_loan',       name: 'Crèdit aprovat',       desc: 'Sol·licita i rep el primer préstec',  icon: 'finances',   xp: 30,  check: gd => (gd.finances?.loans||[]).length >= 1 },
  { id: 'first_machine',    name: 'Revolució industrial', desc: 'Compra la primera màquina',           icon: 'produccio',  xp: 25,  check: gd => (gd.machines||[]).length >= 1 },
  
  // Creixement
  { id: 'cash_10k',         name: 'Butxaca plena',        desc: 'Arriba a 10.000€ en tresoreria',      icon: 'tresoreria', xp: 50,  check: gd => (gd.finances?.cash||0) >= 10000 },
  { id: 'cash_100k',        name: 'Caixa forta',          desc: 'Arriba a 100.000€ en tresoreria',     icon: 'tresoreria', xp: 150, check: gd => (gd.finances?.cash||0) >= 100000 },
  { id: 'cash_1m',          name: 'Milionari/a',          desc: 'Arriba a 1.000.000€ en tresoreria',   icon: 'corona',     xp: 500, check: gd => (gd.finances?.cash||0) >= 1000000 },
  { id: 'employees_5',      name: 'Equip consolidat',     desc: 'Contracta 5 empleats',                icon: 'rrhh',       xp: 60,  check: gd => (gd.employees||[]).length >= 5 },
  { id: 'employees_20',     name: 'Macro empresa',        desc: 'Arriba a 20 empleats',                icon: 'rrhh',       xp: 200, check: gd => (gd.employees||[]).length >= 20 },
  { id: 'prestigi_25',      name: 'Bona reputació',       desc: 'Arriba a 25 de prestigi',             icon: 'prestigi',   xp: 80,  check: gd => (gd.prestigi||0) >= 25 },
  { id: 'prestigi_50',      name: 'Empresa referent',     desc: 'Arriba a 50 de prestigi',             icon: 'prestigi',   xp: 200, check: gd => (gd.prestigi||0) >= 50 },
  { id: 'prestigi_90',      name: 'Marca llegendària',    desc: 'Arriba a 90 de prestigi',             icon: 'corona',     xp: 500, check: gd => (gd.prestigi||0) >= 90 },
  
  // Mòduls avançats
  { id: 'first_export',     name: 'Exportador/a',         desc: 'Fes la primera exportació',           icon: 'comerc',     xp: 60,  check: gd => (gd.trade?.exports||[]).length >= 1 },
  { id: 'first_import',     name: 'Importador/a',         desc: 'Fes la primera importació',           icon: 'comerc',     xp: 40,  check: gd => (gd.trade?.imports||[]).length >= 1 },
  { id: 'stock_profit',     name: 'Inversor/a astut/a',   desc: 'Obté beneficis a la borsa',           icon: 'borsa',      xp: 80,  check: gd => { const p = gd.portfolio; if (!p) return false; const total = Object.values(p.stocks||{}).reduce((s,st) => s + ((st.currentValue||0)-(st.invested||0)), 0) + Object.values(p.crypto||{}).reduce((s,cr) => s + ((cr.currentValue||0)-(cr.invested||0)), 0); return total > 0; } },
  { id: 'franchise_open',   name: 'Franquiciat/da',       desc: 'Obre o uneix-te a una franquícia',    icon: 'franquicies',xp: 100, check: gd => !!gd.franchise },
  { id: 'proveidor_3',      name: 'Cadena de valor',      desc: 'Contracta 3 proveïdors',              icon: 'proveidors', xp: 60,  check: gd => (gd.proveidors||[]).length >= 3 },
  
  // Supervivència
  { id: 'survive_crisis',   name: 'Supervivent',          desc: 'Sobreviu una crisi financera',        icon: 'llamp',      xp: 100, check: gd => gd._survivedCrisis },
  { id: 'week_26',          name: 'Mig any',              desc: 'Arriba a la setmana 26',              icon: 'calendari',  xp: 40,  check: gd => gd.week >= 26 },
  { id: 'week_52',          name: 'Primer aniversari',    desc: 'Completa un any sencer',              icon: 'trofeu',     xp: 100, check: gd => gd.week >= 52 },
  { id: 'week_104',         name: 'Veterà/na',            desc: 'Completa 2 anys (104 setmanes)',      icon: 'corona',     xp: 250, check: gd => gd.week >= 104 },
  
  // Streak
  { id: 'streak_3',         name: 'Ratxa de 3!',          desc: 'Juga 3 dies consecutius',             icon: 'foc',        xp: 30,  check: gd => (gd.gamification?.streak||0) >= 3 },
  { id: 'streak_7',         name: 'Setmana completa',     desc: 'Juga 7 dies consecutius',             icon: 'foc',        xp: 80,  check: gd => (gd.gamification?.streak||0) >= 7 },
  { id: 'streak_30',        name: 'Imparable',            desc: 'Juga 30 dies consecutius',            icon: 'llamp',      xp: 300, check: gd => (gd.gamification?.streak||0) >= 30 },
];

// ── Reptes setmanals ──
const WEEKLY_CHALLENGES = [
  { id: 'ch_revenue',  name: 'Objectiu d\'ingressos',  desc: 'Genera {target}€ d\'ingressos aquesta setmana', calcTarget: gd => Math.max(5000, Math.round((gd.finances?.monthly_revenue||5000)*0.3)), check: (gd, target) => (gd._weekRevenue||0) >= target, xp: 50 },
  { id: 'ch_hire',     name: 'Amplia l\'equip',         desc: 'Contracta {target} empleat(s) nous',            calcTarget: () => 1 + Math.floor(Math.random()*2), check: (gd, target) => (gd._weekHires||0) >= target, xp: 40 },
  { id: 'ch_prestige', name: 'Millora la imatge',       desc: 'Augmenta el prestigi {target} punts',           calcTarget: () => 2 + Math.floor(Math.random()*3), check: (gd, target) => (gd._weekPrestigeGain||0) >= target, xp: 60 },
  { id: 'ch_advance',  name: 'Productivitat',           desc: 'Avança {target} setmanes',                     calcTarget: () => 3 + Math.floor(Math.random()*4), check: (gd, target) => (gd._weekAdvances||0) >= target, xp: 35 },
  { id: 'ch_positive', name: 'Setmana verda',           desc: 'Acaba {target} setmanes amb resultat positiu',  calcTarget: () => 2 + Math.floor(Math.random()*2), check: (gd, target) => (gd._weekPositiveWeeks||0) >= target, xp: 45 },
];


// ── Inicialitzar gamificació ──
function initGamification(gd) {
  if (!gd.gamification) {
    gd.gamification = {
      xp: 0,
      level: 1,
      title: 'Becari',
      achievements: [],
      streak: 0,
      lastPlayDate: null,
      weeklyChallenge: null,
      weeklyChallengeTarget: 0,
      totalWeeksPlayed: 0,
      xpHistory: [],
    };
  }
  return gd.gamification;
}

// ── Donar XP amb animació ──
function awardXP(gd, amount, reason) {
  const gf = initGamification(gd);
  const oldLevel = getCurrentLevel(gf.xp);
  gf.xp += amount;
  const newLevel = getCurrentLevel(gf.xp);
  
  // Animació flotant
  showXPFloat('+' + amount + ' XP', reason);
  
  // Level up?
  if (newLevel.level > oldLevel.level) {
    gf.level = newLevel.level;
    gf.title = newLevel.title;
    showLevelUpAnimation(newLevel);
  }
  
  // Actualitzar barra XP
  updateXPBar(gf);
}

function getCurrentLevel(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpReq) current = l;
    else break;
  }
  return current;
}

function getNextLevel(xp) {
  for (const l of LEVELS) {
    if (xp < l.xpReq) return l;
  }
  return null;
}

// ── Comprovar assoliments ──
function checkAchievements(gd) {
  const gf = initGamification(gd);
  const unlocked = gf.achievements || [];
  
  for (const ach of ACHIEVEMENTS) {
    if (unlocked.includes(ach.id)) continue;
    try {
      if (ach.check(gd)) {
        unlocked.push(ach.id);
        gf.achievements = unlocked;
        awardXP(gd, ach.xp, ach.name);
        showAchievementUnlock(ach);
      }
    } catch(e) { /* ignorar errors de check */ }
  }
}

// ── Streak ──
function updateStreak(gd) {
  const gf = initGamification(gd);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (gf.lastPlayDate === today) return; // Ja actualitzat avui
  
  if (gf.lastPlayDate === yesterday) {
    gf.streak++;
    if (gf.streak > 1) {
      showXPFloat('Ratxa ' + gf.streak + ' dies!', '');
      // Bonus XP per streak
      const bonus = Math.min(gf.streak * 5, 50);
      awardXP(gd, bonus, 'Bonus ratxa');
    }
  } else if (gf.lastPlayDate !== today) {
    gf.streak = 1;
  }
  
  gf.lastPlayDate = today;
}

// ── Repte setmanal ──
function checkWeeklyChallenge(gd) {
  const gf = initGamification(gd);
  if (!gf.weeklyChallenge) generateWeeklyChallenge(gd);
  
  const ch = WEEKLY_CHALLENGES.find(c => c.id === gf.weeklyChallenge);
  if (ch && ch.check(gd, gf.weeklyChallengeTarget)) {
    awardXP(gd, ch.xp, 'Repte setmanal!');
    window.showEventToast && window.showEventToast(icon('trofeu', 20), 'Repte completat!', ch.name + ' — ' + ch.xp + ' XP', true);
    generateWeeklyChallenge(gd); // Nou repte
  }
}

function generateWeeklyChallenge(gd) {
  const gf = initGamification(gd);
  const ch = WEEKLY_CHALLENGES[Math.floor(Math.random() * WEEKLY_CHALLENGES.length)];
  gf.weeklyChallenge = ch.id;
  gf.weeklyChallengeTarget = ch.calcTarget(gd);
}


// ════════════════════════════════════════════════════════════
//  3. ANIMACIONS I UI
// ════════════════════════════════════════════════════════════

// ── XP flotant ──
function showXPFloat(text, subtext) {
  const float = document.createElement('div');
  float.className = 'xp-float';
  float.innerHTML = `
    <div class="xp-float-main">${icon('xp', 16)} ${text}</div>
    ${subtext ? `<div class="xp-float-sub">${subtext}</div>` : ''}
  `;
  document.body.appendChild(float);
  
  requestAnimationFrame(() => {
    float.style.opacity = '1';
    float.style.transform = 'translateY(-40px)';
  });
  
  setTimeout(() => {
    float.style.opacity = '0';
    float.style.transform = 'translateY(-80px)';
    setTimeout(() => float.remove(), 500);
  }, 1800);
}

// ── Level up ──
function showLevelUpAnimation(level) {
  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.innerHTML = `
    <div class="levelup-card">
      <div class="levelup-glow"></div>
      <div class="levelup-icon">${icon(level.icon, 48)}</div>
      <div class="levelup-title">NIVELL ${level.level}</div>
      <div class="levelup-name">${level.title}</div>
      <div class="levelup-particles"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Partícules
  const particles = overlay.querySelector('.levelup-particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'levelup-particle';
    p.style.setProperty('--x', (Math.random() - 0.5) * 200 + 'px');
    p.style.setProperty('--y', (Math.random() - 0.5) * 200 + 'px');
    p.style.setProperty('--d', Math.random() * 0.5 + 's');
    p.style.background = ['var(--accent)', 'var(--accent2)', 'var(--gold)', 'var(--green)'][Math.floor(Math.random() * 4)];
    particles.appendChild(p);
  }
  
  requestAnimationFrame(() => overlay.classList.add('show'));
  
  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 600);
  }, 2500);
}

// ── Achievement unlock ──
function showAchievementUnlock(ach) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-toast-icon">${icon(ach.icon, 28)}</div>
    <div class="achievement-toast-body">
      <div class="achievement-toast-label">ASSOLIMENT DESBLOQUEJAT</div>
      <div class="achievement-toast-name">${ach.name}</div>
      <div class="achievement-toast-desc">${ach.desc}</div>
    </div>
    <div class="achievement-toast-xp">+${ach.xp} XP</div>
  `;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

// ── Barra XP topbar ──
function updateXPBar(gf) {
  const bar = document.getElementById('xp-bar-fill');
  const label = document.getElementById('xp-bar-label');
  const levelLabel = document.getElementById('xp-level-label');
  if (!bar) return;
  
  const current = getCurrentLevel(gf.xp);
  const next = getNextLevel(gf.xp);
  
  if (next) {
    const progress = (gf.xp - current.xpReq) / (next.xpReq - current.xpReq);
    bar.style.width = Math.min(100, Math.max(2, progress * 100)) + '%';
    label.textContent = gf.xp + ' / ' + next.xpReq + ' XP';
  } else {
    bar.style.width = '100%';
    label.textContent = gf.xp + ' XP (MAX)';
  }
  
  if (levelLabel) {
    levelLabel.innerHTML = icon(current.icon, 14) + ' Nv.' + current.level + ' ' + current.title;
  }
}


// ════════════════════════════════════════════════════════════
//  4. INJECTAR CSS
// ════════════════════════════════════════════════════════════

const css = document.createElement('style');
css.textContent = `
/* ── Icones SVG als nav-btn ── */
.nav-icon svg { width: 20px; height: 20px; }
.nav-icon { display: flex; align-items: center; justify-content: center; }
.kpi-icon svg { width: 22px; height: 22px; }
.kpi-icon { color: var(--accent); }
.dept-icon svg { width: 22px; height: 22px; }
.tstat svg { width: 14px; height: 14px; flex-shrink: 0; }

/* ── XP Bar a la topbar ── */
.xp-bar-wrap {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.04); border: 1px solid var(--border);
  border-radius: 20px; padding: 4px 10px; font-size: 10px; min-width: 140px;
}
.xp-bar-track {
  flex: 1; height: 6px; background: rgba(255,255,255,.08);
  border-radius: 3px; overflow: hidden; min-width: 60px;
}
.xp-bar-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--accent), var(--accent2), var(--gold));
  border-radius: 3px; transition: width 0.8s cubic-bezier(.23,1,.32,1);
}
.xp-bar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; color: var(--text2); white-space: nowrap;
}
#xp-level-label {
  font-size: 9px; font-weight: 700; color: var(--gold);
  display: flex; align-items: center; gap: 3px; white-space: nowrap;
}
#xp-level-label svg { width: 12px; height: 12px; }

/* ── XP Float ── */
.xp-float {
  position: fixed; top: 60px; right: 20px; z-index: 1000;
  background: rgba(14,20,45,.95); border: 1px solid var(--accent);
  border-radius: 12px; padding: 8px 16px;
  opacity: 0; transform: translateY(0);
  transition: all 0.6s cubic-bezier(.23,1,.32,1);
  pointer-events: none; backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(79,127,255,.2);
}
.xp-float-main {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; font-size: 15px; color: var(--gold);
  font-family: 'JetBrains Mono', monospace;
}
.xp-float-main svg { width: 16px; height: 16px; color: var(--gold); }
.xp-float-sub { font-size: 10px; color: var(--text2); margin-top: 2px; }

/* ── Level Up Overlay ── */
.levelup-overlay {
  position: fixed; inset: 0; z-index: 600;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0); transition: background 0.5s;
  pointer-events: none;
}
.levelup-overlay.show { background: rgba(0,0,0,0.7); pointer-events: auto; }
.levelup-card {
  text-align: center; position: relative;
  transform: scale(0.5); opacity: 0;
  transition: all 0.6s cubic-bezier(.17,.67,.24,1.2);
}
.levelup-overlay.show .levelup-card { transform: scale(1); opacity: 1; }
.levelup-glow {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(79,127,255,.3) 0%, transparent 70%);
  animation: levelGlow 2s ease-in-out infinite;
}
@keyframes levelGlow { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.3)} }
.levelup-icon { position: relative; z-index: 2; margin-bottom: 16px; color: var(--gold); }
.levelup-icon svg { width: 48px; height: 48px; }
.levelup-title {
  position: relative; z-index: 2;
  font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800;
  letter-spacing: 4px; color: var(--gold);
  text-shadow: 0 0 40px rgba(245,158,11,.5);
}
.levelup-name {
  position: relative; z-index: 2;
  font-size: 16px; color: var(--text); margin-top: 8px; font-weight: 600;
}
.levelup-particles { position: absolute; top: 50%; left: 50%; }
.levelup-particle {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  animation: particleExplode 1.2s cubic-bezier(.23,1,.32,1) forwards;
  animation-delay: var(--d);
}
@keyframes particleExplode {
  0% { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--x), var(--y)) scale(0); opacity: 0; }
}

/* ── Achievement Toast ── */
.achievement-toast {
  position: fixed; bottom: 20px; left: 50%; z-index: 500;
  transform: translateX(-50%) translateY(100px);
  display: flex; align-items: center; gap: 12px;
  background: rgba(14,20,45,.97); border: 1px solid var(--gold);
  border-radius: 16px; padding: 12px 20px;
  opacity: 0; transition: all 0.5s cubic-bezier(.23,1,.32,1);
  backdrop-filter: blur(20px);
  box-shadow: 0 0 40px rgba(245,158,11,.15), inset 0 1px 0 rgba(255,255,255,.05);
  max-width: 440px;
}
.achievement-toast.show {
  opacity: 1; transform: translateX(-50%) translateY(0);
}
.achievement-toast-icon {
  width: 44px; height: 44px; min-width: 44px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(245,158,11,.12); border-radius: 12px;
  color: var(--gold);
}
.achievement-toast-icon svg { width: 28px; height: 28px; }
.achievement-toast-body { flex: 1; }
.achievement-toast-label {
  font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
  color: var(--gold); margin-bottom: 2px;
}
.achievement-toast-name { font-size: 14px; font-weight: 700; color: var(--text); }
.achievement-toast-desc { font-size: 11px; color: var(--text2); margin-top: 1px; }
.achievement-toast-xp {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; font-weight: 700; color: var(--gold);
  white-space: nowrap;
}

/* ── Streak badge ── */
.streak-badge {
  display: flex; align-items: center; gap: 4px;
  background: rgba(245,158,11,.1); border: 1px solid rgba(245,158,11,.25);
  border-radius: 20px; padding: 4px 10px;
  font-size: 11px; font-weight: 700; color: var(--gold);
}
.streak-badge svg { width: 14px; height: 14px; }

/* ── Weekly Challenge ── */
.weekly-challenge {
  background: linear-gradient(135deg, rgba(79,127,255,.08), rgba(124,58,237,.08));
  border: 1px solid rgba(79,127,255,.2); border-radius: 12px;
  padding: 12px 16px; margin-top: 8px;
}
.weekly-challenge-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 700; color: var(--accent);
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;
}
.weekly-challenge-header svg { width: 14px; height: 14px; }
.weekly-challenge-name { font-size: 13px; font-weight: 700; color: var(--text); }
.weekly-challenge-desc { font-size: 11px; color: var(--text2); margin-top: 2px; }
.weekly-challenge-reward { font-size: 11px; color: var(--gold); margin-top: 4px; font-weight: 600; }
`;
document.head.appendChild(css);


// ════════════════════════════════════════════════════════════
//  5. PATCH: REEMPLAÇAR EMOJIS I INJECTAR UI
// ════════════════════════════════════════════════════════════

// Esperar que el DOM estigui llest i l'app carregada
function patchUI() {
  // ── Sidebar navigation icons ──
  const navMap = {
    'nav-dashboard': 'dashboard',
    'nav-setup': 'empresa',
    'nav-finances': 'finances',
    'nav-hr': 'rrhh',
    'nav-production': 'produccio',
    'nav-marketing': 'marketing',
    'nav-sales': 'vendes',
    'nav-map': 'mapa',
    'nav-borsa': 'borsa',
    'nav-junta': 'junta',
    'nav-trade': 'comerc',
    'nav-franquicies': 'franquicies',
    'nav-proveidors': 'proveidors',
    'nav-laborals': 'laborals',
    'nav-professor': 'professor',
  };
  
  for (const [id, iconName] of Object.entries(navMap)) {
    const btn = document.getElementById(id);
    if (btn) {
      const iconEl = btn.querySelector('.nav-icon');
      if (iconEl) iconEl.innerHTML = icon(iconName, 20);
    }
  }
  
  // ── Topbar brand ──
  const brandIcon = document.querySelector('.topbar-brand-icon');
  if (brandIcon) brandIcon.innerHTML = icon('logo', 22);
  
  // ── Topbar stats ──
  const stats = document.querySelectorAll('.tstat');
  const statIcons = [icon('calendari',14), icon('tresoreria',14), icon('resultat',14), icon('prestigi',14), icon('empleats',14)];
  stats.forEach((s, i) => {
    if (statIcons[i]) {
      const text = s.innerHTML;
      // Reemplaçar el primer emoji amb la icona SVG
      s.innerHTML = text.replace(/^[^\w<]*/, statIcons[i] + ' ');
    }
  });
  
  // ── Avançar setmana ──
  const advBtn = document.querySelector('.week-advance-btn');
  if (advBtn) advBtn.innerHTML = icon('avançar', 14) + ' Avançar setmana';
  
  // ── Profile button ──
  const profBtn = document.querySelector('.profile-btn');
  if (profBtn) {
    const nameSpan = profBtn.querySelector('#profile-name');
    profBtn.innerHTML = '';
    const svgSpan = document.createElement('span');
    svgSpan.innerHTML = icon('perfil', 16);
    profBtn.appendChild(svgSpan);
    profBtn.appendChild(document.createTextNode(' '));
    if (nameSpan) profBtn.appendChild(nameSpan);
    else {
      const ns = document.createElement('span');
      ns.id = 'profile-name';
      ns.textContent = '—';
      profBtn.appendChild(ns);
    }
  }
  
  // ── KPI icons ──
  const kpiMap = ['kpi_cash', 'kpi_rev', 'kpi_costs', 'kpi_prestigi', 'kpi_result'];
  document.querySelectorAll('.kpi-icon').forEach((el, i) => {
    if (kpiMap[i]) el.innerHTML = icon(kpiMap[i], 22);
  });
  
  // ── Loading screen ──
  const loadLogo = document.querySelector('.loading-logo');
  if (loadLogo) loadLogo.innerHTML = icon('logo', 56);
  
  // ── Auth screen ──
  const authLogo = document.querySelector('.auth-logo-icon');
  if (authLogo) authLogo.innerHTML = icon('logo', 56);
  
  // ── Injectar barra XP a la topbar ──
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight) {
    const xpWrap = document.createElement('div');
    xpWrap.className = 'xp-bar-wrap';
    xpWrap.innerHTML = `
      <div id="xp-level-label">${icon('xp', 12)} Nv.1</div>
      <div class="xp-bar-track"><div class="xp-bar-fill" id="xp-bar-fill"></div></div>
      <div class="xp-bar-label" id="xp-bar-label">0 XP</div>
    `;
    topbarRight.insertBefore(xpWrap, topbarRight.firstChild);
  }
  
  // ── Streak badge (al costat de la setmana) ──
  const weekDisplay = document.getElementById('week-display');
  if (weekDisplay) {
    const streakEl = document.createElement('div');
    streakEl.className = 'streak-badge';
    streakEl.id = 'streak-badge';
    streakEl.innerHTML = icon('foc', 14) + ' <span id="streak-count">0</span>d';
    streakEl.style.display = 'none';
    weekDisplay.parentNode.insertBefore(streakEl, weekDisplay.nextSibling);
  }
}

// ── Hook: interceptar advanceWeek per donar XP ──
function hookAdvanceWeek() {
  const origAdvance = window.advanceWeek;
  if (!origAdvance) return;
  
  window.advanceWeek = async function() {
    const gd = window.G?.gameData;
    if (!gd) return origAdvance();
    
    const oldPrestigi = gd.prestigi || 0;
    const oldCash = gd.finances?.cash || 0;
    
    // Executar l'original
    await origAdvance();
    
    // XP per avançar setmana
    initGamification(gd);
    awardXP(gd, 10, 'Setmana avançada');
    
    // XP bonus si resultat positiu
    const rev = gd.finances?.monthly_revenue || 0;
    const costs = gd.finances?.monthly_costs || 0;
    if (rev > costs) awardXP(gd, 5, 'Resultat positiu');
    
    // Tracking per reptes
    gd._weekAdvances = (gd._weekAdvances || 0) + 1;
    gd._weekRevenue = (gd._weekRevenue || 0) + (rev / 4.33);
    if (rev > costs) gd._weekPositiveWeeks = (gd._weekPositiveWeeks || 0) + 1;
    gd._weekPrestigeGain = (gd.prestigi || 0) - oldPrestigi + (gd._weekPrestigeGain || 0);
    
    // Supervivència
    if (oldCash < 0 && gd.finances.cash >= 0) gd._survivedCrisis = true;
    
    // Comprovar tot
    updateStreak(gd);
    checkAchievements(gd);
    checkWeeklyChallenge(gd);
    
    // Actualitzar streak badge
    const streakEl = document.getElementById('streak-badge');
    const streakCount = document.getElementById('streak-count');
    if (streakEl && gd.gamification?.streak > 1) {
      streakEl.style.display = 'flex';
      streakCount.textContent = gd.gamification.streak;
    }
    
    // Guardar
    updateXPBar(gd.gamification);
  };
}

// ── Hook: interceptar renderDashboard per afegir repte setmanal ──  
function hookDashboard() {
  const origRender = window.renderDashboard;
  if (!origRender) return;
  
  // Patch dept icons
  const origDeptIcons = {
    '💰': icon('dept_finances', 22),
    '👥': icon('dept_rrhh', 22),
    '🏭': icon('dept_produccio', 22),
    '📦': icon('dept_vendes', 22),
    '📣': icon('dept_marketing', 22),
    '🏗️': icon('dept_instal', 22),
  };
  
  window.renderDashboard = function() {
    origRender();
    
    const gd = window.G?.gameData;
    if (!gd) return;
    
    // Reemplaçar dept icons
    document.querySelectorAll('.dept-icon').forEach(el => {
      const emoji = el.textContent.trim();
      if (origDeptIcons[emoji]) el.innerHTML = origDeptIcons[emoji];
    });
    
    // Afegir repte setmanal al dashboard
    const gf = initGamification(gd);
    const ch = WEEKLY_CHALLENGES.find(c => c.id === gf.weeklyChallenge);
    if (ch) {
      let challengeEl = document.getElementById('weekly-challenge-panel');
      if (!challengeEl) {
        challengeEl = document.createElement('div');
        challengeEl.id = 'weekly-challenge-panel';
        const notifSection = document.querySelector('.notif-list');
        if (notifSection) notifSection.parentElement.appendChild(challengeEl);
      }
      challengeEl.innerHTML = `
        <div class="weekly-challenge">
          <div class="weekly-challenge-header">${icon('trofeu', 14)} Repte setmanal</div>
          <div class="weekly-challenge-name">${ch.name}</div>
          <div class="weekly-challenge-desc">${ch.desc.replace('{target}', gf.weeklyChallengeTarget)}</div>
          <div class="weekly-challenge-reward">${icon('xp', 12)} +${ch.xp} XP</div>
        </div>
      `;
    }
    
    // Actualitzar XP bar
    updateXPBar(gf);
  };
}


// ════════════════════════════════════════════════════════════
//  6. INICIALITZAR QUAN L'APP ESTIGUI LLESTA
// ════════════════════════════════════════════════════════════

let patchAttempts = 0;
function tryPatch() {
  patchAttempts++;
  if (patchAttempts > 30) return; // Max 15s d'espera
  
  // Esperar que l'app estigui carregada
  if (!document.querySelector('.sidebar') || !window.G) {
    setTimeout(tryPatch, 500);
    return;
  }
  
  patchUI();
  hookAdvanceWeek();
  hookDashboard();
  
  // Inicialitzar gamificació si ja hi ha gameData
  if (window.G.gameData) {
    const gf = initGamification(window.G.gameData);
    updateStreak(window.G.gameData);
    updateXPBar(gf);
    
    const streakEl = document.getElementById('streak-badge');
    const streakCount = document.getElementById('streak-count');
    if (streakEl && gf.streak > 1) {
      streakEl.style.display = 'flex';
      streakCount.textContent = gf.streak;
    }
  }
  
  console.log('🎮 EmpresaBat Gamificació + Icones SVG carregat!');
}

// Començar a intentar
if (document.readyState === 'complete') tryPatch();
else window.addEventListener('load', () => setTimeout(tryPatch, 300));

// Exposar funcions per ús extern
window.EBGamification = {
  awardXP, checkAchievements, updateStreak, checkWeeklyChallenge,
  initGamification, getCurrentLevel, getNextLevel, ACHIEVEMENTS, LEVELS,
  WEEKLY_CHALLENGES, icon
};

})();
