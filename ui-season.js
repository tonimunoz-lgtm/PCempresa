// ============================================================
//  ui-season.js — NIVELL 3: La transformació en battle royale
//  
//  Mòdul O: Temporades i battle royale de classe
//  Mòdul P: Esdeveniments sincronitzats del professor
//  Mòdul Q: Missions diàries tipus Duolingo
//  Mòdul R: Personalització de l'avatar empresa (logo, slogan, skin)
//  Mòdul S: Panel "narrator" del professor — breaking news
//  Mòdul T: Reaccions emoji entre alumnes
// ============================================================

(function() {
'use strict';

const getG = () => window.G;
const saveGameData   = (...a) => window.saveGameData?.(...a);
const showToast      = (...a) => window.showToast?.(...a);
const showEventToast = (...a) => window.showEventToast?.(...a);
const playSfx        = (...a) => window.playSfx?.(...a);
const fmt            = (n) => (n||0).toLocaleString('ca');

// ════════════════════════════════════════════════════════════
//  CSS GLOBAL DE TOTS ELS MÒDULS DEL NIVELL 3
// ════════════════════════════════════════════════════════════
const CSS = document.createElement('style');
CSS.textContent = `
/* ═══ TEMPORADES — Battle royale de classe ═══ */
.season-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  background: linear-gradient(135deg, rgba(124,58,237,.16), rgba(245,158,11,.12), rgba(239,68,68,.10));
  border-bottom: 2px solid rgba(124,58,237,.30);
  position: relative;
  overflow: hidden;
}
.season-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(245,158,11,.12), transparent 70%);
  animation: seasonGlow 3.5s linear infinite;
  pointer-events: none;
}
@keyframes seasonGlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.season-icon {
  font-size: 32px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 12px rgba(245,158,11,.4));
}
.season-info { flex: 1; min-width: 0; position: relative; z-index: 2; }
.season-name {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
  margin-bottom: 2px;
}
.season-meta {
  font-size: 11px;
  color: var(--text2);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.season-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.season-progress-bar {
  flex: 1;
  max-width: 200px;
  height: 8px;
  background: rgba(255,255,255,.08);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  z-index: 2;
}
.season-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--gold), #ff6b6b);
  border-radius: 4px;
  transition: width .8s ease;
}
.season-end-soon {
  background: rgba(239,68,68,.12);
  color: var(--red);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  animation: pulseRed 1.2s ease-in-out infinite;
  position: relative;
  z-index: 2;
}
@keyframes pulseRed {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* ═══ Modal final de temporada ═══ */
.season-end-modal {
  position: fixed; inset: 0; z-index: 600;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at center, rgba(20,28,60,.96), rgba(0,0,0,.99));
  backdrop-filter: blur(15px);
  animation: fadeIn .5s ease;
}
.season-end-card {
  background: linear-gradient(180deg, rgba(20,28,60,.99), rgba(8,12,24,.99));
  border: 2px solid var(--gold);
  border-radius: 24px;
  padding: 36px 38px;
  max-width: 580px;
  width: calc(100vw - 32px);
  text-align: center;
  box-shadow: 0 30px 100px rgba(0,0,0,.8), 0 0 100px rgba(245,158,11,.25);
  animation: splashIn .6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.confetti {
  position: absolute;
  width: 8px; height: 14px;
  pointer-events: none;
  animation: confettiFall 4s linear infinite;
}
@keyframes confettiFall {
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* ═══ ESDEVENIMENTS DEL PROFESSOR — Breaking news classe ═══ */
.prof-event-modal {
  position: fixed; inset: 0; z-index: 550;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.85);
  backdrop-filter: blur(15px);
  padding: 16px;
  animation: fadeIn .3s ease;
}
.prof-event-card {
  background: linear-gradient(180deg, rgba(40,8,8,.99), rgba(20,4,4,.99));
  border: 3px solid var(--red);
  border-radius: 20px;
  padding: 28px;
  max-width: 540px;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: emergencySlide .6s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 30px 80px rgba(239,68,68,.30);
}
@keyframes emergencySlide {
  from { transform: scale(0.85) translateY(-30px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.breaking-news-tag {
  display: inline-block;
  background: var(--red);
  color: #fff;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
  border-radius: 6px;
  margin-bottom: 12px;
  animation: blinkRed 1s ease-in-out infinite;
}
@keyframes blinkRed {
  0%,100% { opacity: 1; }
  50% { opacity: .55; }
}
.prof-event-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 10px;
  line-height: 1.2;
}
.prof-event-desc {
  font-size: 14px;
  color: rgba(255,255,255,.85);
  line-height: 1.6;
  margin-bottom: 20px;
}
.prof-event-timer {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 10px;
  padding: 10px 14px;
  text-align: center;
  margin-bottom: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--gold);
  font-weight: 700;
}
.prof-event-choices {
  display: flex; flex-direction: column; gap: 10px;
}
.prof-event-choice {
  background: rgba(255,255,255,.08);
  border: 2px solid rgba(255,255,255,.15);
  border-radius: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: .2s;
  display: flex; align-items: center; gap: 12px;
  font-family: var(--font);
}
.prof-event-choice:hover {
  background: rgba(255,255,255,.15);
  border-color: var(--gold);
  transform: translateX(3px);
}
.prof-event-choice-icon { font-size: 28px; }
.prof-event-choice-text { flex: 1; color: #fff; font-weight: 700; font-size: 13px; }
.prof-event-choice-effect { font-size: 10px; color: rgba(255,255,255,.6); margin-top: 2px; }

/* ═══ MISSIONS DIÀRIES — Tipus Duolingo ═══ */
.daily-missions {
  background: linear-gradient(135deg, rgba(16,185,129,.08), rgba(79,127,255,.08));
  border: 1px solid rgba(16,185,129,.25);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}
.daily-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
}
.daily-streak-badge {
  margin-left: auto;
  background: linear-gradient(135deg, var(--gold), #ff6b35);
  color: #fff;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 3px;
}
.daily-mission {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 6px;
  transition: .25s;
}
.daily-mission.done {
  background: rgba(16,185,129,.10);
  border-color: rgba(16,185,129,.35);
}
.daily-mission.done .daily-mission-text { text-decoration: line-through; opacity: .6; }
.daily-mission-icon { font-size: 22px; }
.daily-mission-body { flex: 1; min-width: 0; }
.daily-mission-text {
  font-size: 12px;
  color: var(--text);
  font-weight: 600;
  margin-bottom: 3px;
}
.daily-mission-progress {
  height: 4px;
  background: rgba(255,255,255,.06);
  border-radius: 2px;
  overflow: hidden;
}
.daily-mission-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--green));
  border-radius: 2px;
  transition: width .4s;
}
.daily-mission-reward {
  font-size: 11px;
  color: var(--gold);
  font-weight: 700;
  white-space: nowrap;
}
.daily-mission-check {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
}

/* ═══ AVATAR DE L'EMPRESA — Personalització ═══ */
.avatar-customizer {
  background: var(--card);
  border: 1px solid var(--border2);
  border-radius: 18px;
  padding: 24px;
  max-width: 520px;
  margin: 0 auto;
}
.avatar-preview {
  background: linear-gradient(135deg, var(--bg2), var(--bg3));
  border-radius: 18px;
  padding: 32px 18px;
  text-align: center;
  margin-bottom: 18px;
  border: 1px solid var(--border);
}
.avatar-preview-emoji {
  font-size: 80px;
  margin-bottom: 8px;
  display: inline-block;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,.4));
}
.avatar-preview-name {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}
.avatar-preview-slogan {
  font-size: 12px;
  font-style: italic;
  color: var(--text2);
}
.avatar-section { margin-bottom: 18px; }
.avatar-section-title {
  font-size: 11px;
  color: var(--text3);
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.avatar-emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(46px, 1fr));
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
  padding: 4px;
}
.avatar-emoji-option {
  width: 46px; height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: rgba(255,255,255,.04);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: .15s;
}
.avatar-emoji-option:hover { background: rgba(79,127,255,.10); transform: scale(1.1); }
.avatar-emoji-option.selected {
  border-color: var(--accent);
  background: rgba(79,127,255,.15);
  transform: scale(1.05);
}
.avatar-color-grid {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.avatar-color {
  width: 36px; height: 36px;
  border-radius: 10px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: .15s;
}
.avatar-color:hover { transform: scale(1.1); }
.avatar-color.selected { border-color: #fff; transform: scale(1.1); box-shadow: 0 0 16px rgba(255,255,255,.4); }
.avatar-skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}
.avatar-skin-option {
  background: rgba(255,255,255,.04);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: .2s;
  position: relative;
}
.avatar-skin-option:hover { background: rgba(79,127,255,.06); border-color: var(--border2); }
.avatar-skin-option.selected { border-color: var(--accent); background: rgba(79,127,255,.10); }
.avatar-skin-option.locked { opacity: .4; cursor: not-allowed; }
.avatar-skin-option.locked::after {
  content: '🔒';
  position: absolute;
  top: 4px; right: 4px;
  font-size: 12px;
}
.avatar-skin-icon { font-size: 36px; margin-bottom: 4px; }
.avatar-skin-name { font-size: 11px; font-weight: 700; color: var(--text); }
.avatar-skin-req { font-size: 9px; color: var(--text3); margin-top: 2px; }
.avatar-slogan-input {
  width: 100%;
  background: rgba(255,255,255,.06);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--text);
  font-size: 13px;
  font-family: var(--font);
  outline: none;
}
.avatar-slogan-input:focus { border-color: var(--accent); }

/* ═══ PROFESSOR NARRATOR — Panel del professor per llançar esdeveniments ═══ */
.prof-narrator {
  background: linear-gradient(135deg, rgba(245,158,11,.08), rgba(239,68,68,.06));
  border: 2px solid rgba(245,158,11,.25);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 14px;
}
.prof-narrator-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
}
.prof-event-template {
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 6px;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer;
  transition: .2s;
}
.prof-event-template:hover { background: rgba(245,158,11,.06); border-color: rgba(245,158,11,.30); }
.prof-event-template-icon { font-size: 26px; flex-shrink: 0; }
.prof-event-template-body { flex: 1; }
.prof-event-template-title { font-size: 13px; font-weight: 700; color: var(--text); }
.prof-event-template-desc { font-size: 11px; color: var(--text2); margin-top: 2px; }
.prof-event-template-launch {
  background: var(--gold);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

/* ═══ REACCIONS EMOJI ═══ */
.reactions-bar {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.reaction-btn {
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  padding: 3px 8px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: .15s;
  font-family: var(--font);
}
.reaction-btn:hover { background: rgba(255,255,255,.08); border-color: var(--border2); transform: scale(1.05); }
.reaction-btn.mine { background: rgba(79,127,255,.12); border-color: var(--accent); }
.reaction-count { font-size: 10px; font-weight: 700; color: var(--text2); }
`;
document.head.appendChild(CSS);


// ════════════════════════════════════════════════════════════
//  ★ MÒDUL O: TEMPORADES — Battle royale de classe ★
// ════════════════════════════════════════════════════════════

const SEASONS = [
  {
    id: 'season_1',
    name: 'Crisi del Vallès',
    icon: '🌪️',
    desc: 'Crisi econòmica regional. Costos més alts, demanda més baixa, però oportunitats per als valents.',
    weeks: 12,
    modifiers: {
      revMultiplier: 0.85,
      costMultiplier: 1.10,
      eventFreq: 1.3,
    },
    reward: 'Insígnia "Supervivent"',
  },
  {
    id: 'season_2',
    name: 'Boom del E-commerce',
    icon: '📦',
    desc: 'Era daurada del comerç online. Vendes pels núvols, però la competència és ferotge.',
    weeks: 12,
    modifiers: {
      revMultiplier: 1.20,
      costMultiplier: 1.05,
      eventFreq: 1.0,
    },
    reward: 'Insígnia "Magnata Digital"',
  },
  {
    id: 'season_3',
    name: 'Revolució Verda',
    icon: '🌱',
    desc: 'Sostenibilitat obligatòria. Multes per contaminar, bonificacions per ser eco.',
    weeks: 12,
    modifiers: {
      revMultiplier: 1.0,
      costMultiplier: 1.0,
      eventFreq: 1.2,
    },
    reward: 'Insígnia "EcoLíder"',
  },
];

function getCurrentSeason() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return null;
  
  // Si no hi ha temporada activa o ha caducat, agafar la primera
  if (!gd._season) {
    gd._season = {
      id: SEASONS[0].id,
      startWeek: gd.week || 1,
      startCash: gd.finances?.cash || 0,
    };
  }
  
  return SEASONS.find(s => s.id === gd._season.id) || SEASONS[0];
}

function getSeasonProgress() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd?._season) return { current: 0, total: 12, pct: 0 };
  
  const season = getCurrentSeason();
  if (!season) return { current: 0, total: 12, pct: 0 };
  
  const elapsed = (gd.week || 1) - gd._season.startWeek;
  return {
    current: Math.max(0, elapsed),
    total: season.weeks,
    pct: Math.min(100, (elapsed / season.weeks) * 100),
    weeksLeft: Math.max(0, season.weeks - elapsed),
  };
}

function checkSeasonEnd() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd?._season) return;
  
  const progress = getSeasonProgress();
  if (progress.weeksLeft > 0) return;
  
  // Temporada acabada — calcular guanyador i mostrar modal
  const season = getCurrentSeason();
  const allStudents = (G.allStudents || []).filter(s => s && s.company);
  const ranked = [...allStudents].sort((a, b) => 
    ((b.finances?.cash||0) - (a.finances?.cash||0))
  );
  
  const myPosition = ranked.findIndex(s => s.uid === G.uid) + 1;
  const winner = ranked[0];
  
  showSeasonEndModal(season, ranked, myPosition, winner, gd);
}

function showSeasonEndModal(season, ranked, myPosition, winner, gd) {
  // Confetti effect
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.cssText = `
      left: ${Math.random()*100}vw;
      background: hsl(${Math.random()*360}, 80%, 60%);
      animation-delay: ${Math.random()*2}s;
      animation-duration: ${3+Math.random()*2}s;
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 6000);
  }
  
  if (window.playSfx) {
    setTimeout(() => playSfx('success'), 200);
    setTimeout(() => playSfx('cling'), 600);
    setTimeout(() => playSfx('success'), 1000);
  }
  
  const isWinner = myPosition === 1;
  const isPodium = myPosition <= 3;
  
  const modal = document.createElement('div');
  modal.className = 'season-end-modal';
  modal.innerHTML = `
    <div class="season-end-card">
      <div style="font-size:64px;margin-bottom:8px">${season.icon}</div>
      <div style="font-size:11px;font-weight:800;color:var(--gold);letter-spacing:2px;margin-bottom:4px">TEMPORADA FINALITZADA</div>
      <div style="font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:var(--text);margin-bottom:6px">${season.name}</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:22px">${season.weeks} setmanes · ${ranked.length} empreses competint</div>
      
      <div style="background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(255,107,53,.10));border:1px solid rgba(245,158,11,.30);border-radius:14px;padding:18px;margin-bottom:18px">
        <div style="font-size:12px;color:var(--gold);font-weight:700;margin-bottom:8px">🏆 GUANYADOR/A DE LA TEMPORADA</div>
        <div style="font-size:36px;margin-bottom:4px">${winner?.company?.sectorData?.icon || '👑'}</div>
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text);margin-bottom:2px">${winner?.displayName || '—'}</div>
        <div style="font-size:13px;color:var(--text2)">${winner?.company?.name || ''} · ${fmt(winner?.finances?.cash||0)}€</div>
      </div>
      
      <div style="background:rgba(${isPodium?'16,185,129':'255,255,255'},.06);border:1px solid rgba(${isPodium?'16,185,129':'255,255,255'},.15);border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="font-size:11px;color:var(--text3);font-weight:700;letter-spacing:1px;margin-bottom:6px">LA TEVA POSICIÓ FINAL</div>
        <div style="font-size:48px;font-weight:900;font-family:'JetBrains Mono',monospace;color:${isWinner?'var(--gold)':isPodium?'var(--green)':'var(--text)'};line-height:1">
          ${isWinner ? '🥇 #1' : myPosition === 2 ? '🥈 #2' : myPosition === 3 ? '🥉 #3' : '#'+myPosition}
        </div>
        <div style="font-size:13px;color:var(--text2);margin-top:8px">
          ${isWinner ? '👑 ETS EL/LA CAMPIÓ/A!' : isPodium ? '🏆 Al podi! Excel·lent feina' : 'Pots millorar la propera temporada'}
        </div>
      </div>
      
      ${isWinner || isPodium ? `
        <div style="background:rgba(124,58,237,.10);border:1px solid rgba(124,58,237,.30);border-radius:10px;padding:12px;margin-bottom:18px">
          <div style="font-size:11px;color:#a78bfa;font-weight:800;margin-bottom:4px">🎁 RECOMPENSA DESBLOQUEJADA</div>
          <div style="font-size:13px;color:var(--text);font-weight:700">${season.reward}</div>
        </div>
      ` : ''}
      
      <button onclick="window._startNextSeason()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:var(--font)">
        🚀 Començar nova temporada
      </button>
    </div>
  `;
  document.body.appendChild(modal);
}

window._startNextSeason = async function() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  // Acumular insígnies guanyades
  if (!gd._badges) gd._badges = [];
  const currentSeason = getCurrentSeason();
  const allStudents = (G.allStudents || []).filter(s => s && s.company);
  const ranked = [...allStudents].sort((a,b) => (b.finances?.cash||0) - (a.finances?.cash||0));
  const myPos = ranked.findIndex(s => s.uid === G.uid) + 1;
  if (myPos <= 3 && currentSeason) {
    gd._badges.push({
      seasonId: currentSeason.id,
      seasonName: currentSeason.name,
      position: myPos,
      reward: currentSeason.reward,
      week: gd.week,
    });
  }
  
  // Avançar a la propera temporada (cíclic)
  const idx = SEASONS.findIndex(s => s.id === currentSeason?.id);
  const nextSeason = SEASONS[(idx + 1) % SEASONS.length];
  
  gd._season = {
    id: nextSeason.id,
    startWeek: gd.week,
    startCash: gd.finances?.cash || 0,
  };
  
  // Tancar modal
  document.querySelector('.season-end-modal')?.remove();
  
  // Mostrar anunci de la nova temporada
  showEventToast(nextSeason.icon, 'Nova temporada!', nextSeason.name + ' ha començat', true);
  if (window.playSfx) playSfx('success');
  
  await saveGameData();
  injectSeasonBanner();
};

function injectSeasonBanner() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return;
  
  const season = getCurrentSeason();
  if (!season) return;
  
  const progress = getSeasonProgress();
  
  let banner = document.getElementById('season-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'season-banner';
    banner.className = 'season-banner';
    // Inserir DESPRÉS de la mission-bar (que va sota el topbar)
    const missionBar = document.getElementById('mission-bar');
    const topbar = document.querySelector('.topbar');
    if (missionBar && missionBar.parentNode) {
      missionBar.parentNode.insertBefore(banner, missionBar.nextSibling);
    } else if (topbar && topbar.parentNode) {
      topbar.parentNode.insertBefore(banner, topbar.nextSibling);
    } else {
      return;
    }
  }
  
  const isEndingSoon = progress.weeksLeft <= 2 && progress.weeksLeft > 0;
  
  banner.innerHTML = `
    <div class="season-icon">${season.icon}</div>
    <div class="season-info">
      <div class="season-name">📅 Temporada: ${season.name}</div>
      <div class="season-meta">
        <span>⏳ Setmana ${progress.current}/${progress.total}</span>
        <span>🏁 Falten ${progress.weeksLeft} setm.</span>
        <span style="color:var(--text3)">${season.desc.substring(0,50)}...</span>
      </div>
    </div>
    <div class="season-progress-bar">
      <div class="season-progress-fill" style="width:${progress.pct}%"></div>
    </div>
    ${isEndingSoon ? '<div class="season-end-soon">🏁 ACABA AVIAT!</div>' : ''}
  `;
}

window.injectSeasonBanner = injectSeasonBanner;
window.checkSeasonEnd = checkSeasonEnd;


// ════════════════════════════════════════════════════════════
//  ★ MÒDUL P: ESDEVENIMENTS DEL PROFESSOR ★
//  Plantilles que el professor pot llançar a tota la classe
// ════════════════════════════════════════════════════════════

const PROF_EVENT_TEMPLATES = [
  {
    id: 'energy_crisis',
    icon: '⚡',
    title: 'Crisi energètica!',
    desc: 'Els preus de l\'energia es disparen un 200% durant 2 setmanes a tota la regió. Tots els alumnes hauran de pagar més per subministraments i decidir com reaccionar.',
    duration: 2,
    forAll: true,
    choices: [
      { icon: '🔌', text: 'Pagar i aguantar', desc: 'Cost normal x3 durant 2 setmanes', effect: gd => { gd._pendingFines = gd._pendingFines||[]; gd._pendingFines.push({ amount: 2500, reason: 'Energia' }); } },
      { icon: '☀️', text: 'Invertir en plaques solars', desc: 'Cost inicial 8.000€ però estalvi futur', effect: gd => { gd.finances.cash -= 8000; gd.prestigi = Math.min(100, (gd.prestigi||0)+5); } },
      { icon: '🌚', text: 'Reduir activitat', desc: 'Tanca caps de setmana, ingressos -25% durant 2 setmanes', effect: gd => { (gd.events = gd.events||[]).push({ name: 'Reducció activitat', impact: -0.25, weeksLeft: 2 }); } },
    ],
  },
  {
    id: 'pandemic',
    icon: '🦠',
    title: 'Brot epidèmic',
    desc: 'Una nova epidèmia obliga a tancaments parcials. Confinament 3 setmanes amb impactes diferents segons el sector.',
    duration: 3,
    forAll: true,
    choices: [
      { icon: '🏠', text: 'Teletreball total', desc: 'Manté ingressos 70% sense pèrdua personal', effect: gd => { (gd.events = gd.events||[]).push({ name: 'Teletreball', impact: -0.30, weeksLeft: 3 }); } },
      { icon: '😷', text: 'Mantenir obert amb mesures', desc: 'Ingressos -15% i cost extra 1.500€', effect: gd => { (gd.events = gd.events||[]).push({ name: 'Mesures sanitàries', impact: -0.15, weeksLeft: 3 }); gd.finances.cash -= 1500; } },
      { icon: '⛔', text: 'Tancament total temporal', desc: 'Sense ingressos 3 setmanes però sense costos extra', effect: gd => { (gd.events = gd.events||[]).push({ name: 'Tancament COVID', impact: -0.85, weeksLeft: 3 }); } },
    ],
  },
  {
    id: 'subvencio',
    icon: '🎁',
    title: 'Subvenció pública!',
    desc: 'L\'Ajuntament del Vallès anuncia ajuts a empreses joves. Heu de presentar projecte i triar prioritat estratègica.',
    duration: 1,
    forAll: true,
    choices: [
      { icon: '💼', text: 'Inversió en plantilla', desc: '+10.000€ però has de mantenir contractacions', effect: gd => { gd.finances.cash += 10000; gd.prestigi = Math.min(100, (gd.prestigi||0)+3); } },
      { icon: '🔬', text: 'Inversió en innovació', desc: '+8.000€ + 5 prestigi + bonus R+D', effect: gd => { gd.finances.cash += 8000; gd.prestigi = Math.min(100, (gd.prestigi||0)+5); } },
      { icon: '🌱', text: 'Inversió en sostenibilitat', desc: '+12.000€ i imatge de marca verda', effect: gd => { gd.finances.cash += 12000; gd.prestigi = Math.min(100, (gd.prestigi||0)+8); } },
      { icon: '🙅', text: 'No sol·licitar', desc: 'No vull paperassa', effect: gd => {} },
    ],
  },
  {
    id: 'inspeccio',
    icon: '👮',
    title: 'Inspecció laboral!',
    desc: 'Inspecció sorpresa a totes les empreses de la classe. S\'examinaran contractes, jornades i condicions.',
    duration: 1,
    forAll: true,
    choices: [
      { icon: '📋', text: 'Tot en regla', desc: 'Has complert sempre. Sense efecte', effect: gd => {} },
      { icon: '💰', text: 'Pagar multa lleu', desc: '-3.000€ per petites irregularitats', effect: gd => { gd.finances.cash -= 3000; gd.prestigi = Math.max(0, (gd.prestigi||0)-3); } },
      { icon: '🚨', text: 'Greu sanció', desc: '-12.000€, prestigi greument afectat', effect: gd => { gd.finances.cash -= 12000; gd.prestigi = Math.max(0, (gd.prestigi||0)-15); } },
    ],
  },
  {
    id: 'guerra_preus',
    icon: '⚔️',
    title: 'Guerra de preus!',
    desc: 'La competència ha rebaixat preus dràsticament. Decideix la teva estratègia.',
    duration: 2,
    forAll: true,
    choices: [
      { icon: '⚔️', text: 'Igualar preus', desc: 'Mantens clients però marges -40% (2 setm)', effect: gd => { (gd.events = gd.events||[]).push({ name: 'Guerra preus', impact: -0.40, weeksLeft: 2 }); } },
      { icon: '👑', text: 'Apostar per qualitat', desc: 'Perds 30% clients però mantens marges', effect: gd => { (gd.events = gd.events||[]).push({ name: 'Premium', impact: -0.30, weeksLeft: 2 }); gd.prestigi = Math.min(100,(gd.prestigi||0)+5); } },
      { icon: '🤝', text: 'Buscar nínxol diferent', desc: 'Costs +2k pivot, sense pèrdues després', effect: gd => { gd.finances.cash -= 2000; gd.prestigi = Math.min(100,(gd.prestigi||0)+3); } },
    ],
  },
];

// Sistema de polling per detectar esdeveniments del professor
// Format: gd._classEvents = [{eventId, launchedBy, launchedAt, week, applied:false}]
function checkProfEvents() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd || !gd.mode) return;
  
  // Buscar esdeveniments pendents (no aplicats)
  const pending = (gd._classEvents || []).filter(e => !e.applied);
  if (pending.length === 0) return;
  
  // Mostrar el primer pendent
  const event = pending[0];
  const template = PROF_EVENT_TEMPLATES.find(t => t.id === event.eventId);
  if (!template) {
    event.applied = true;
    saveGameData();
    return;
  }
  
  showProfEventModal(template, event);
}

function showProfEventModal(template, event) {
  // No duplicar si ja hi ha modal
  if (document.querySelector('.prof-event-modal')) return;
  
  if (window.playSfx) playSfx('alert');
  
  const modal = document.createElement('div');
  modal.className = 'prof-event-modal';
  modal.innerHTML = `
    <div class="prof-event-card">
      <div class="breaking-news-tag">🚨 BREAKING NEWS · CLASSE</div>
      <div style="font-size:48px;text-align:center;margin-bottom:6px">${template.icon}</div>
      <div class="prof-event-title">${template.title}</div>
      <div class="prof-event-desc">${template.desc}</div>
      <div class="prof-event-timer">⏱️ Has de decidir AVUI! Llançat pel professor/a</div>
      <div class="prof-event-choices">
        ${template.choices.map((c, i) => `
          <div class="prof-event-choice" onclick="window._resolveProfEvent('${event.eventId}', ${i})">
            <div class="prof-event-choice-icon">${c.icon}</div>
            <div style="flex:1">
              <div class="prof-event-choice-text">${c.text}</div>
              <div class="prof-event-choice-effect">${c.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

window._resolveProfEvent = async function(eventId, choiceIdx) {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  const template = PROF_EVENT_TEMPLATES.find(t => t.id === eventId);
  const event = (gd._classEvents||[]).find(e => e.eventId === eventId && !e.applied);
  if (!template || !event) return;
  
  const choice = template.choices[choiceIdx];
  if (!choice) return;
  
  // Aplicar efecte
  try { choice.effect(gd); } catch(e) { console.error('Error applying prof event', e); }
  
  // Marcar com aplicat
  event.applied = true;
  event.choiceIdx = choiceIdx;
  
  // Guardar acció a notificacions
  gd.notifications = gd.notifications || [];
  gd.notifications.push({
    id: Date.now(),
    icon: template.icon,
    title: 'Esdeveniment classe: ' + template.title,
    desc: 'Has triat: ' + choice.text,
    time: 'S' + gd.week,
    urgent: false,
  });
  
  await saveGameData();
  
  document.querySelector('.prof-event-modal')?.remove();
  showEventToast(template.icon, 'Decisió aplicada', choice.text, true);
  if (window.playSfx) playSfx('cling');
};

// Llançar esdeveniment des del panell del professor
window.launchClassEvent = async function(eventId) {
  const G = getG();
  if (!G?.gameData?.isProf) {
    showToast('❌ Només el professor/a pot llançar esdeveniments');
    return;
  }
  
  const template = PROF_EVENT_TEMPLATES.find(t => t.id === eventId);
  if (!template) return;
  
  if (!confirm(`Confirmes llançar "${template.title}" a tota la classe? Els alumnes hauran de prendre una decisió.`)) return;
  
  // Per a tots els alumnes de la classe, afegir l'event
  const classCode = G.gameData.classCode || '';
  const allStudents = (G.allStudents || []).filter(s => s && !s.isProf && (!classCode || s.classCode === classCode));
  
  // En una implementació real, aquí s'enviaria a Firebase per a tots els alumnes
  // Aquí ho simulem afegint a la pròpia gd com a primera prova
  const G2 = getG();
  if (!G2.gameData._classEvents) G2.gameData._classEvents = [];
  G2.gameData._classEvents.push({
    eventId: eventId,
    launchedBy: G2.uid,
    launchedAt: Date.now(),
    week: G2.gameData.week,
    applied: false,
  });
  
  await saveGameData();
  
  showEventToast('📢', 'Esdeveniment llançat!', `"${template.title}" enviat a ${allStudents.length} alumnes`, true);
  showToast(`📢 Esdeveniment "${template.title}" enviat a la classe (${allStudents.length} alumnes). En una versió completa, s'enviaria via Firebase a tots simultàniament.`);
  
  // Re-renderitzar panell professor
  if (typeof window.renderProfNarratorPanel === 'function') window.renderProfNarratorPanel();
};

// Renderitzar el panell del professor amb plantilles d'esdeveniments
function renderProfNarratorPanel() {
  const G = getG();
  if (!G?.gameData?.isProf) return '';
  
  return `
    <div class="prof-narrator">
      <div class="prof-narrator-header">
        <span style="font-size:28px">🎬</span>
        <div style="flex:1">
          <div>Panell de Director/a de Classe</div>
          <div style="font-size:11px;color:var(--text2);font-weight:400;margin-top:2px">Llança esdeveniments sincronitzats per a tota la classe</div>
        </div>
      </div>
      ${PROF_EVENT_TEMPLATES.map(t => `
        <div class="prof-event-template">
          <div class="prof-event-template-icon">${t.icon}</div>
          <div class="prof-event-template-body">
            <div class="prof-event-template-title">${t.title}</div>
            <div class="prof-event-template-desc">${t.desc.substring(0,90)}...</div>
          </div>
          <button class="prof-event-template-launch" onclick="launchClassEvent('${t.id}')">📢 Llançar</button>
        </div>
      `).join('')}
    </div>
  `;
}

window.renderProfNarratorPanel = renderProfNarratorPanel;
window.checkProfEvents = checkProfEvents;


// ════════════════════════════════════════════════════════════
//  ★ MÒDUL Q: MISSIONS DIÀRIES — Tipus Duolingo ★
// ════════════════════════════════════════════════════════════

const DAILY_MISSION_POOL = [
  { id: 'play_3_weeks',      icon: '⏩', text: 'Avança 3 setmanes',                     target: 3,    xp: 30,  type: 'weeks' },
  { id: 'earn_5k',           icon: '💰', text: 'Guanya 5.000€ avui',                    target: 5000, xp: 40,  type: 'cash' },
  { id: 'hire_1',            icon: '👥', text: 'Contracta 1 empleat',                   target: 1,    xp: 25,  type: 'hires' },
  { id: 'check_borsa',       icon: '📈', text: 'Visita la pestanya Borsa',               target: 1,    xp: 15,  type: 'visit_borsa' },
  { id: 'visit_news',        icon: '📰', text: 'Llegeix les notícies del Vallès',        target: 1,    xp: 10,  type: 'visit_news' },
  { id: 'positive_week',     icon: '✅', text: 'Acaba 2 setmanes en positiu',           target: 2,    xp: 35,  type: 'positive_weeks' },
  { id: 'invest_borsa',      icon: '💸', text: 'Compra accions o cripto avui',          target: 1,    xp: 30,  type: 'invest' },
  { id: 'place_bet',         icon: '🎰', text: 'Fes una aposta setmanal',                target: 1,    xp: 20,  type: 'bet' },
  { id: 'beat_someone',      icon: '⚔️', text: 'Supera 1 company al rànquing',           target: 1,    xp: 50,  type: 'rank_up' },
];

function getTodayDateStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function initDailyMissions(gd) {
  if (!gd._dailyMissions) gd._dailyMissions = { date: '', list: [], streak: 0, lastDay: '' };
  
  const today = getTodayDateStr();
  
  // Si és un nou dia, generar noves missions
  if (gd._dailyMissions.date !== today) {
    // Comprovar si trenca ratxa (no jugava ahir)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (gd._dailyMissions.lastDay && gd._dailyMissions.lastDay !== yesterdayStr) {
      gd._dailyMissions.streak = 0; // Trencada
    }
    
    // Generar 3 missions aleatòries del pool
    const shuffled = [...DAILY_MISSION_POOL].sort(() => Math.random() - 0.5);
    gd._dailyMissions = {
      date: today,
      streak: gd._dailyMissions.streak || 0,
      lastDay: gd._dailyMissions.lastDay || '',
      list: shuffled.slice(0, 3).map(m => ({
        ...m, progress: 0, done: false,
      })),
    };
  }
}

function trackDailyAction(type, value = 1) {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  initDailyMissions(gd);
  
  let anyCompleted = false;
  gd._dailyMissions.list.forEach(m => {
    if (m.done || m.type !== type) return;
    m.progress = (m.progress || 0) + value;
    if (m.progress >= m.target) {
      m.done = true;
      anyCompleted = true;
      // Recompensa XP
      if (window.awardXP) window.awardXP(gd, m.xp, 'Missió diària: ' + m.text);
      showEventToast(m.icon, 'Missió diària!', m.text + ' · +' + m.xp + ' XP', true);
      if (window.playSfx) playSfx('cling');
    }
  });
  
  // Si totes les missions del dia estan completes, augmentar ratxa
  const allDone = gd._dailyMissions.list.every(m => m.done);
  if (allDone && gd._dailyMissions.lastDay !== gd._dailyMissions.date) {
    gd._dailyMissions.streak = (gd._dailyMissions.streak || 0) + 1;
    gd._dailyMissions.lastDay = gd._dailyMissions.date;
    
    // Recompensa per ratxa
    const streakBonus = gd._dailyMissions.streak * 10;
    gd.finances.cash = (gd.finances.cash||0) + streakBonus * 100;
    showEventToast('🔥', 'Ratxa diària: ' + gd._dailyMissions.streak + '!', '+' + (streakBonus*100) + '€ bonus ratxa!', true);
    if (window.playSfx) playSfx('success');
  }
  
  if (anyCompleted) {
    saveGameData();
    injectDailyMissions();
  }
}

window.trackDailyAction = trackDailyAction;

function renderDailyMissions() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return '';
  
  initDailyMissions(gd);
  const dm = gd._dailyMissions;
  const allDone = dm.list.every(m => m.done);
  
  return `
    <div class="daily-missions">
      <div class="daily-header">
        🎯 Missions d'avui
        <span style="font-size:10px;color:var(--text3);font-weight:400">(es renoven cada dia)</span>
        ${dm.streak > 0 ? `<span class="daily-streak-badge">🔥 ${dm.streak}d</span>` : ''}
      </div>
      ${allDone ? `
        <div style="text-align:center;padding:14px;color:var(--green);font-size:13px;font-weight:700">
          ✅ Totes completades! Torna demà per noves missions.
        </div>
      ` : ''}
      ${dm.list.map(m => `
        <div class="daily-mission ${m.done?'done':''}">
          <div class="daily-mission-icon">${m.done ? '✅' : m.icon}</div>
          <div class="daily-mission-body">
            <div class="daily-mission-text">${m.text}</div>
            <div class="daily-mission-progress">
              <div class="daily-mission-progress-fill" style="width:${Math.min(100,(m.progress/m.target)*100)}%"></div>
            </div>
          </div>
          <div class="daily-mission-reward">+${m.xp} XP</div>
        </div>
      `).join('')}
    </div>
  `;
}

function injectDailyMissions() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return;
  
  const dashWrap = document.querySelector('.dash-wrap');
  if (!dashWrap) return;
  
  let panel = document.getElementById('daily-missions-inject');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'daily-missions-inject';
    // Inserir DESPRÉS del panel de missió principal
    const missionInject = document.getElementById('mission-inject');
    if (missionInject && missionInject.nextSibling) {
      dashWrap.insertBefore(panel, missionInject.nextSibling);
    } else if (missionInject) {
      missionInject.parentNode.insertBefore(panel, missionInject.nextSibling);
    } else {
      dashWrap.insertBefore(panel, dashWrap.firstChild);
    }
  }
  panel.innerHTML = renderDailyMissions();
}

window.injectDailyMissions = injectDailyMissions;
window.renderDailyMissions = renderDailyMissions;


// ════════════════════════════════════════════════════════════
//  ★ MÒDUL R: PERSONALITZACIÓ DE L'AVATAR EMPRESA ★
// ════════════════════════════════════════════════════════════

const AVATAR_EMOJIS = ['🏢','🏪','🏭','🚀','💎','🦄','🐉','🔥','⚡','🌟','💫','🎯','🎨','🎮','🎵','🎬','📱','💻','🖥️','⌚','🎧','📷','🎁','🍕','☕','🍔','🌮','🍜','🍣','🍩','🍰','🧁','🥑','🌶️','🥕','🍎','🍊','🍓','🍇','🥥','🌳','🌲','🌵','🌺','🌸','🌻','🌹','🌈','☀️','🌙','⭐','✨','💥','💯','🎪','🎭','🎰','♠️','♥️','♦️','♣️','🃏','🎲','⚽','🏀','🏈','⚾','🎾','🏐','🏉','🥋','🥊','🚗','🚕','🚙','🚌','🚀','✈️','🛸','🚁','⛵','🚢','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🦄','🐲','🦅'];

const AVATAR_COLORS = [
  '#4f7fff','#7c3aed','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6',
  '#14b8a6','#f97316','#84cc16','#6366f1','#d946ef','#0ea5e9','#22c55e','#eab308',
];

const AVATAR_SKINS = [
  { id: 'garage',    name: 'Garatge',     icon: '🚪', req: { cash: 0 },          desc: 'Començament' },
  { id: 'office',    name: 'Oficina',     icon: '🏢', req: { cash: 20000 },      desc: 'PYME consolidada' },
  { id: 'factory',   name: 'Fàbrica',     icon: '🏭', req: { cash: 50000 },      desc: 'Empresa industrial' },
  { id: 'corporate', name: 'Corporatiu',  icon: '🏬', req: { cash: 100000 },     desc: 'Multinacional' },
  { id: 'tower',     name: 'Gratacels',   icon: '🏙️', req: { cash: 250000, prestigi: 50 }, desc: 'Imperi global' },
];

function openAvatarCustomizer() {
  const gd = getG()?.gameData;
  if (!gd) return;
  
  if (!gd._avatar) {
    gd._avatar = {
      emoji: gd.company?.sectorData?.icon || '🏢',
      color: AVATAR_COLORS[0],
      slogan: 'Construïm el futur',
      skin: 'garage',
    };
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);padding:16px;animation:fadeIn .3s ease';
  modal.id = 'avatar-modal';
  
  modal.innerHTML = `
    <div class="avatar-customizer" id="avatar-customizer-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
        <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text)">🎨 Personalitza la teva empresa</div>
        <button onclick="document.getElementById('avatar-modal').remove()" style="background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer">✕</button>
      </div>
      <div id="avatar-preview-section"></div>
      <div id="avatar-controls-section"></div>
      <button onclick="window._saveAvatar()" style="width:100%;padding:14px;background:var(--accent);border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:var(--font);margin-top:14px">💾 Desar canvis</button>
    </div>
  `;
  document.body.appendChild(modal);
  
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
  
  renderAvatarPreview();
  renderAvatarControls();
}

function renderAvatarPreview() {
  const gd = getG()?.gameData;
  const av = gd._avatar;
  const previewEl = document.getElementById('avatar-preview-section');
  if (!previewEl) return;
  
  const skin = AVATAR_SKINS.find(s => s.id === av.skin) || AVATAR_SKINS[0];
  
  previewEl.innerHTML = `
    <div class="avatar-preview" style="background:linear-gradient(135deg, ${av.color}30, ${av.color}10)">
      <div class="avatar-preview-emoji" style="filter:drop-shadow(0 8px 24px ${av.color}80)">${av.emoji}</div>
      <div class="avatar-preview-name" style="color:${av.color}">${gd.company?.name || 'La meva empresa'}</div>
      <div class="avatar-preview-slogan">"${av.slogan || 'El meu eslògan'}"</div>
      <div style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--text2);background:rgba(255,255,255,.06);padding:4px 10px;border-radius:12px">
        ${skin.icon} ${skin.name}
      </div>
    </div>
  `;
}

function renderAvatarControls() {
  const gd = getG()?.gameData;
  const av = gd._avatar;
  const cash = gd.finances?.cash || 0;
  const prestigi = gd.prestigi || 0;
  
  const controlsEl = document.getElementById('avatar-controls-section');
  if (!controlsEl) return;
  
  controlsEl.innerHTML = `
    <div class="avatar-section">
      <div class="avatar-section-title">Icona empresa</div>
      <div class="avatar-emoji-grid">
        ${AVATAR_EMOJIS.map(e => `
          <div class="avatar-emoji-option ${av.emoji===e?'selected':''}" onclick="window._setAvatarEmoji('${e}')">${e}</div>
        `).join('')}
      </div>
    </div>
    
    <div class="avatar-section">
      <div class="avatar-section-title">Color de marca</div>
      <div class="avatar-color-grid">
        ${AVATAR_COLORS.map(c => `
          <div class="avatar-color ${av.color===c?'selected':''}" style="background:${c}" onclick="window._setAvatarColor('${c}')"></div>
        `).join('')}
      </div>
    </div>
    
    <div class="avatar-section">
      <div class="avatar-section-title">Eslògan empresa</div>
      <input type="text" class="avatar-slogan-input" id="avatar-slogan-input" maxlength="48"
             placeholder="Ex: Construïm el futur" 
             value="${av.slogan||''}"
             oninput="window._setAvatarSlogan(this.value)">
    </div>
    
    <div class="avatar-section">
      <div class="avatar-section-title">Skin de seu (es desbloquegen amb el progrés)</div>
      <div class="avatar-skin-grid">
        ${AVATAR_SKINS.map(s => {
          const unlocked = (cash >= (s.req.cash||0)) && (prestigi >= (s.req.prestigi||0));
          return `
            <div class="avatar-skin-option ${av.skin===s.id?'selected':''} ${unlocked?'':'locked'}"
                 onclick="${unlocked?`window._setAvatarSkin('${s.id}')`:''}">
              <div class="avatar-skin-icon">${s.icon}</div>
              <div class="avatar-skin-name">${s.name}</div>
              <div class="avatar-skin-req">${unlocked ? s.desc : `Cal ${fmt(s.req.cash)}€${s.req.prestigi?' + '+s.req.prestigi+'⭐':''}`}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window._setAvatarEmoji = function(e) {
  const gd = getG()?.gameData;
  if (!gd) return;
  gd._avatar.emoji = e;
  renderAvatarPreview();
  renderAvatarControls();
};
window._setAvatarColor = function(c) {
  const gd = getG()?.gameData;
  if (!gd) return;
  gd._avatar.color = c;
  renderAvatarPreview();
  renderAvatarControls();
};
window._setAvatarSlogan = function(s) {
  const gd = getG()?.gameData;
  if (!gd) return;
  gd._avatar.slogan = s;
  renderAvatarPreview();
};
window._setAvatarSkin = function(sid) {
  const gd = getG()?.gameData;
  if (!gd) return;
  gd._avatar.skin = sid;
  renderAvatarPreview();
  renderAvatarControls();
  if (window.playSfx) playSfx('success');
};
window._saveAvatar = async function() {
  await saveGameData();
  showEventToast('🎨', 'Avatar actualitzat!', 'La teva imatge de marca està guardada', true);
  if (window.playSfx) playSfx('cling');
  document.getElementById('avatar-modal')?.remove();
  // Re-renderitzar dashboard per actualitzar el banner amb el nou avatar
  if (window.renderDashboard) window.renderDashboard();
};

window.openAvatarCustomizer = openAvatarCustomizer;

// Inserir botó "Personalitzar" al banner de l'empresa
function injectAvatarButton() {
  const banner = document.getElementById('company-banner');
  if (!banner) return;
  if (document.getElementById('avatar-customize-btn')) return;
  
  const btn = document.createElement('button');
  btn.id = 'avatar-customize-btn';
  btn.style.cssText = 'margin-left:auto;background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.30);color:#a78bfa;padding:6px 12px;border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);transition:.2s';
  btn.textContent = '🎨 Personalitzar';
  btn.onclick = openAvatarCustomizer;
  banner.appendChild(btn);
}

window.injectAvatarButton = injectAvatarButton;


// ════════════════════════════════════════════════════════════
//  ★ MÒDUL T: REACCIONS EMOJI ENTRE ALUMNES ★
// ════════════════════════════════════════════════════════════

const REACTION_EMOJIS = ['👏', '🔥', '💪', '😱', '😂', '🤯', '👀'];

// Estructura: gd._reactionsReceived = { [eventId]: { [emoji]: count } }
// Estructura: gd._reactionsGiven    = { [targetUid + '_' + eventId]: emoji }

function reactToNewsItem(targetUid, eventKey, emoji) {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  if (!gd._reactionsGiven) gd._reactionsGiven = {};
  const key = targetUid + '_' + eventKey;
  
  // Si ja he reaccionat amb el mateix emoji, treure'l (toggle)
  // Si era amb un altre emoji, canviar-lo
  const previous = gd._reactionsGiven[key];
  
  if (previous === emoji) {
    delete gd._reactionsGiven[key];
    showToast('Reacció retirada');
  } else {
    gd._reactionsGiven[key] = emoji;
    showToast(emoji + ' Reacció enviada!');
    if (window.playSfx) playSfx('click');
  }
  
  saveGameData();
  
  // Refrescar el feed de notícies
  if (window.injectNewsFeed) window.injectNewsFeed();
}

window.reactToNewsItem = reactToNewsItem;

// Comptar reaccions agregades de tots els alumnes per a un item
function getReactionCounts(targetUid, eventKey) {
  const G = getG();
  if (!G) return {};
  const allStudents = G.allStudents || [];
  const counts = {};
  
  allStudents.forEach(s => {
    if (!s._reactionsGiven) return;
    const reaction = s._reactionsGiven[targetUid + '_' + eventKey];
    if (reaction) counts[reaction] = (counts[reaction] || 0) + 1;
  });
  
  return counts;
}

window.getReactionCounts = getReactionCounts;

// Renderitzar la barra de reaccions per a un item del feed
function renderReactionsBar(targetUid, eventKey) {
  const G = getG();
  const myReaction = G?.gameData?._reactionsGiven?.[targetUid + '_' + eventKey];
  const counts = getReactionCounts(targetUid, eventKey);
  
  return `
    <div class="reactions-bar">
      ${REACTION_EMOJIS.map(e => {
        const count = counts[e] || 0;
        const isMine = myReaction === e;
        return `<button class="reaction-btn ${isMine?'mine':''}" onclick="reactToNewsItem('${targetUid}','${eventKey}','${e}')">${e}${count>0?`<span class="reaction-count">${count}</span>`:''}</button>`;
      }).join('')}
    </div>
  `;
}

window.renderReactionsBar = renderReactionsBar;


// ════════════════════════════════════════════════════════════
//  HOOKS — Integració amb el joc principal
// ════════════════════════════════════════════════════════════

let _seasonHooked = false;

function hookSeasonSystem() {
  if (_seasonHooked) return;
  if (typeof window.advanceWeek !== 'function') return;
  if (typeof window.renderDashboard !== 'function') return;
  
  _seasonHooked = true;
  console.log('🏆 ui-season.js — Hooks instal·lats');
  
  // Hook a advanceWeek per checkSeasonEnd, esdeveniments prof, missions diàries
  const origAdvance = window.advanceWeek;
  window.advanceWeek = async function() {
    await origAdvance.call(this);
    
    const gd = getG()?.gameData;
    if (!gd) return;
    
    // Tracking missions diàries — avançar setmana
    trackDailyAction('weeks');
    
    // Tracking missió "positive_week"
    const lb = gd._lastRevenueBreakdown;
    const result = (gd.finances?.monthly_revenue||0) - (gd.finances?.monthly_costs||0);
    if (result > 0) trackDailyAction('positive_weeks');
    
    // Comprovar fi de temporada
    checkSeasonEnd();
    
    // Comprovar esdeveniments del professor
    setTimeout(() => checkProfEvents(), 500);
    
    // Refrescar banner temporada
    injectSeasonBanner();
  };
  
  // Hook a renderDashboard per injectar mòduls del nivell 3
  const origRender = window.renderDashboard;
  window.renderDashboard = function() {
    origRender();
    
    setTimeout(() => {
      injectSeasonBanner();
      injectDailyMissions();
      injectAvatarButton();
      
      // Si sóc professor, mostrar panel narrator
      const gd = getG()?.gameData;
      if (gd?.isProf) {
        injectProfNarratorPanel();
      }
    }, 100);
  };
}

function injectProfNarratorPanel() {
  const dashWrap = document.querySelector('.dash-wrap');
  if (!dashWrap) return;
  
  let panel = document.getElementById('prof-narrator-inject');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'prof-narrator-inject';
    // Inserir al principi del dashboard per professors
    dashWrap.insertBefore(panel, dashWrap.firstChild);
  }
  panel.innerHTML = renderProfNarratorPanel();
}

// Polling per esperar que advanceWeek estigui disponible
const seasonHookInterval = setInterval(() => {
  hookSeasonSystem();
  if (_seasonHooked) clearInterval(seasonHookInterval);
}, 400);

// Inicialització: comprovar al carregar
const checkSeasonReady = setInterval(() => {
  const gd = getG()?.gameData;
  if (gd && gd.mode && _seasonHooked) {
    clearInterval(checkSeasonReady);
    setTimeout(() => {
      injectSeasonBanner();
      injectDailyMissions();
      injectAvatarButton();
      checkProfEvents();
      
      const gd2 = getG()?.gameData;
      if (gd2?.isProf) {
        injectProfNarratorPanel();
      }
    }, 1500);
  }
}, 1000);

// Trackings addicionals — interceptar accions clau
function setupActionTracking() {
  // Tracking de visita a Borsa
  const origShowTab = window.showTab;
  if (origShowTab && !origShowTab._tracked) {
    window.showTab = function(tab) {
      origShowTab.apply(this, arguments);
      if (tab === 'borsa') trackDailyAction('visit_borsa');
    };
    window.showTab._tracked = true;
  }
  
  // Tracking de comprar accions (buyStock)
  if (window.buyStock && !window.buyStock._tracked) {
    const orig = window.buyStock;
    window.buyStock = async function() {
      const cashBefore = getG()?.gameData?.finances?.cash || 0;
      const result = await orig.apply(this, arguments);
      const cashAfter = getG()?.gameData?.finances?.cash || 0;
      if (cashAfter < cashBefore) trackDailyAction('invest');
      return result;
    };
    window.buyStock._tracked = true;
  }
  
  // Tracking de comprar cripto
  if (window.buyCrypto && !window.buyCrypto._tracked) {
    const orig = window.buyCrypto;
    window.buyCrypto = async function() {
      const cashBefore = getG()?.gameData?.finances?.cash || 0;
      const result = await orig.apply(this, arguments);
      const cashAfter = getG()?.gameData?.finances?.cash || 0;
      if (cashAfter < cashBefore) trackDailyAction('invest');
      return result;
    };
    window.buyCrypto._tracked = true;
  }
  
  // Tracking d'aposta
  if (window._placeBet && !window._placeBet._tracked) {
    const orig = window._placeBet;
    window._placeBet = function() {
      orig.apply(this, arguments);
      trackDailyAction('bet');
    };
    window._placeBet._tracked = true;
  }
}

// Reintentar setup tracking durant uns segons (els scripts es carreguen async)
let trackingAttempts = 0;
const trackingInterval = setInterval(() => {
  setupActionTracking();
  trackingAttempts++;
  if (trackingAttempts > 20) clearInterval(trackingInterval);
}, 500);

// Tracking de contractacions per observació
let _lastEmpCount = -1;
setInterval(() => {
  const gd = getG()?.gameData;
  if (!gd?.mode) return;
  const current = (gd.employees||[]).length;
  if (_lastEmpCount === -1) { _lastEmpCount = current; return; }
  if (current > _lastEmpCount) {
    trackDailyAction('hires', current - _lastEmpCount);
  }
  _lastEmpCount = current;
}, 2000);

console.log('🏆 ui-season.js carregat — Temporades, esdeveniments classe, missions diàries, avatar, reaccions');

})();
