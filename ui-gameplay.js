// ============================================================
//  ui-gameplay.js — MILLORES DE JUGABILITAT PER BATXILLERAT
//  Mòdul A: Missions guiades (storyline)
//  Mòdul B: Rànquing competitiu en temps real + lliga
//  Mòdul C: Esdeveniments interactius amb decisions
//  Mòdul D: Tutorial interactiu pas a pas
//  Mòdul E: Desbloquejat progressiu de pestanyes
//  Mòdul F: Interacció entre jugadors (comerç P2P)
//  Mòdul G: Minijocs ràpids
//  Mòdul H: Notificacions de retenció i recordatoris
// ============================================================

(function() {
'use strict';

const getG = () => window.G;
const saveGameData   = (...a) => window.saveGameData(...a);
const showToast      = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt = (n) => (n||0).toLocaleString('ca');

// ════════════════════════════════════════════════════════════
//  CSS GLOBAL PER TOTES LES MILLORES
// ════════════════════════════════════════════════════════════
const CSS = document.createElement('style');
CSS.textContent = `
/* ══ LEADERBOARD GRAN ══ */
.mega-leaderboard {
  background: linear-gradient(180deg, rgba(14,20,45,.98) 0%, rgba(6,8,15,.98) 100%);
  border: 1px solid var(--border2);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  margin-bottom: 14px;
}
.mega-lb-header {
  background: linear-gradient(135deg, rgba(79,127,255,.15), rgba(124,58,237,.1));
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.mega-lb-title {
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mega-lb-subtitle { font-size: 11px; color: var(--text2); }
.mega-lb-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,.04);
  border-radius: 8px;
  padding: 3px;
}
.mega-lb-tab {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: var(--text2);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border-radius: 6px;
  font-family: var(--font);
  transition: .2s;
}
.mega-lb-tab.active {
  background: var(--accent);
  color: #fff;
}
.mega-lb-body { padding: 12px 16px; max-height: 380px; overflow-y: auto; }
.mega-lb-row {
  display: grid;
  grid-template-columns: 40px 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  transition: .15s;
  border-bottom: 1px solid rgba(255,255,255,.03);
}
.mega-lb-row:hover { background: rgba(79,127,255,.06); }
.mega-lb-row.me {
  background: rgba(79,127,255,.08);
  border: 1px solid rgba(79,127,255,.2);
  border-bottom: 1px solid rgba(79,127,255,.2);
}
.mega-lb-pos {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
}
.mega-lb-pos.gold { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; }
.mega-lb-pos.silver { background: linear-gradient(135deg, #94a3b8, #64748b); color: #fff; }
.mega-lb-pos.bronze { background: linear-gradient(135deg, #d97706, #92400e); color: #fff; }
.mega-lb-pos.normal { background: rgba(255,255,255,.06); color: var(--text2); }
.mega-lb-name { font-weight: 700; font-size: 14px; color: var(--text); }
.mega-lb-company { font-size: 11px; color: var(--text2); margin-top: 2px; }
.mega-lb-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: .5px;
}
.mega-lb-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--gold);
  text-align: right;
}
.mega-lb-weekly-winner {
  background: linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.02));
  border: 1px solid rgba(245,158,11,.2);
  border-radius: 12px;
  padding: 14px 18px;
  margin: 0 16px 14px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.mega-lb-weekly-winner .trophy { font-size: 32px; }
.mega-lb-weekly-winner .info { flex: 1; }
.mega-lb-weekly-winner .winner-name { font-weight: 800; font-size: 15px; color: var(--gold); }
.mega-lb-weekly-winner .winner-desc { font-size: 11px; color: var(--text2); margin-top: 2px; }

/* ══ MISSIONS / STORYLINE ══ */
.mission-panel {
  background: var(--card);
  border: 1px solid var(--border2);
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}
.mission-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(79,127,255,.05), transparent 60%);
  pointer-events: none;
}
.mission-panel.completed {
  border-color: rgba(16,185,129,.3);
  background: rgba(16,185,129,.04);
}
.mission-panel.active {
  border-color: rgba(245,158,11,.3);
  animation: missionGlow 2s ease-in-out infinite alternate;
}
@keyframes missionGlow {
  from { box-shadow: 0 0 0 rgba(245,158,11,0); }
  to { box-shadow: 0 0 20px rgba(245,158,11,.08); }
}
.mission-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: .5px;
}
.mission-badge.active { background: rgba(245,158,11,.2); color: var(--gold); }
.mission-badge.done { background: rgba(16,185,129,.2); color: var(--green); }
.mission-badge.locked { background: rgba(255,255,255,.06); color: var(--text3); }
.mission-icon { font-size: 32px; margin-bottom: 10px; }
.mission-title {
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 6px;
}
.mission-desc { font-size: 12px; color: var(--text2); line-height: 1.6; margin-bottom: 12px; }
.mission-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mission-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,.08);
  border-radius: 4px;
  overflow: hidden;
}
.mission-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--accent), var(--gold));
  transition: width .4s;
}
.mission-pct { font-size: 12px; font-weight: 700; color: var(--gold); min-width: 40px; text-align: right; }
.mission-reward {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  background: rgba(79,127,255,.08);
  padding: 4px 10px;
  border-radius: 20px;
  margin-top: 8px;
}

/* ══ EVENTS INTERACTIUS ══ */
.event-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(8px);
  animation: fadeIn .3s ease;
  padding: 16px;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.event-card {
  background: var(--card);
  border: 2px solid var(--border2);
  border-radius: 20px;
  padding: 28px;
  max-width: 500px;
  width: 100%;
  position: relative;
  animation: slideUp .4s ease;
}
@keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.event-card-icon { font-size: 48px; text-align: center; margin-bottom: 12px; }
.event-card-title {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 800;
  text-align: center;
  color: var(--text);
  margin-bottom: 8px;
}
.event-card-desc {
  font-size: 13px;
  color: var(--text2);
  text-align: center;
  line-height: 1.7;
  margin-bottom: 20px;
}
.event-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.event-choice {
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 18px;
  cursor: pointer;
  transition: .2s;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-family: var(--font);
}
.event-choice:hover {
  background: rgba(79,127,255,.08);
  border-color: var(--accent);
  transform: translateX(4px);
}
.event-choice-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
.event-choice-text { flex: 1; }
.event-choice-title { font-size: 14px; font-weight: 700; color: var(--text); }
.event-choice-desc { font-size: 11px; color: var(--text2); margin-top: 3px; line-height: 1.5; }
.event-choice-cost {
  font-size: 10px;
  font-weight: 700;
  color: var(--gold);
  margin-top: 4px;
}
.event-timer {
  text-align: center;
  font-size: 11px;
  color: var(--text3);
  margin-top: 14px;
}

/* ══ TUTORIAL OVERLAY ══ */
.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  pointer-events: none;
}
.tutorial-spotlight {
  position: absolute;
  border: 3px solid var(--accent);
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(0,0,0,.65), 0 0 30px rgba(79,127,255,.3);
  pointer-events: none;
  transition: all .4s ease;
  z-index: 301;
}
.tutorial-bubble {
  position: absolute;
  background: var(--card);
  border: 1px solid var(--accent);
  border-radius: 16px;
  padding: 20px 24px;
  max-width: 360px;
  z-index: 302;
  pointer-events: all;
  animation: slideUp .4s ease;
  box-shadow: 0 12px 40px rgba(0,0,0,.4);
}
.tutorial-bubble::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--card);
  border-right: 1px solid var(--accent);
  border-bottom: 1px solid var(--accent);
  transform: rotate(45deg);
}
.tutorial-bubble.arrow-top::after { top: -7px; left: 30px; transform: rotate(-135deg); }
.tutorial-bubble.arrow-bottom::after { bottom: -7px; left: 30px; transform: rotate(45deg); }
.tutorial-bubble.arrow-left::after { left: -7px; top: 20px; transform: rotate(135deg); }
.tutorial-bubble-title {
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 6px;
}
.tutorial-bubble-text { font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 14px; }
.tutorial-bubble-actions { display: flex; gap: 8px; align-items: center; }
.tutorial-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font);
  transition: .2s;
}
.tutorial-btn.primary { background: var(--accent); color: #fff; }
.tutorial-btn.primary:hover { background: #3d6dee; }
.tutorial-btn.secondary { background: rgba(255,255,255,.06); color: var(--text2); }
.tutorial-steps {
  display: flex;
  gap: 4px;
  margin-left: auto;
}
.tutorial-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
}
.tutorial-dot.active { background: var(--accent); }
.tutorial-dot.done { background: var(--green); }

/* ══ MINIJOCS ══ */
.minigame-modal {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.75);
  backdrop-filter: blur(10px);
  padding: 16px;
}
.minigame-card {
  background: linear-gradient(180deg, rgba(14,20,45,.98), rgba(6,8,15,.98));
  border: 2px solid var(--border2);
  border-radius: 20px;
  padding: 28px;
  max-width: 520px;
  width: 100%;
  animation: slideUp .4s ease;
}
.minigame-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}
.minigame-timer-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,.08);
  border-radius: 3px;
  overflow: hidden;
}
.minigame-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--green), var(--gold), var(--red));
  border-radius: 3px;
  transition: width .1s linear;
}
.minigame-timer-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--gold);
  min-width: 35px;
}
.nego-option {
  padding: 14px 18px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: .2s;
  margin-bottom: 8px;
  font-family: var(--font);
}
.nego-option:hover {
  background: rgba(79,127,255,.08);
  border-color: var(--accent);
  transform: translateX(4px);
}
.nego-option-title { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 3px; }
.nego-option-desc { font-size: 11px; color: var(--text2); }

/* ══ TABS BLOQUEATS ══ */
.nav-btn.locked {
  opacity: .35;
  cursor: not-allowed;
  position: relative;
}
.nav-btn.locked::after {
  content: '🔒';
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 10px;
}

/* ══ P2P TRADE ══ */
.p2p-offer {
  background: rgba(124,58,237,.06);
  border: 1px solid rgba(124,58,237,.2);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: .2s;
}
.p2p-offer:hover { border-color: rgba(124,58,237,.4); }

/* ══ RETENTION BANNER ══ */
.retention-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  background: linear-gradient(135deg, rgba(245,158,11,.12), rgba(79,127,255,.12));
  border: 1px solid rgba(245,158,11,.3);
  border-radius: 16px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
  backdrop-filter: blur(16px);
  animation: slideUp .5s ease;
  max-width: 500px;
}
.retention-close {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}
`;
document.head.appendChild(CSS);


// ════════════════════════════════════════════════════════════
//  MÒDUL A: MISSIONS GUIADES (STORYLINE)
// ════════════════════════════════════════════════════════════

const MISSIONS = [
  // Capítol 1: Primeres passes
  {
    id: 'M01', chapter: 1, title: 'El teu primer negoci',
    icon: '🚀', desc: 'Tot gran imperi comença amb una idea. Crea la teva empresa escollint un sector i una forma jurídica.',
    hint: 'Ves a la pestanya Empresa i crea la teva companyia.',
    xp: 80, reward: { cash: 2000 },
    check: gd => !!gd.company,
    unlocks: ['M02'],
  },
  {
    id: 'M02', chapter: 1, title: 'Cap d\'equip',
    icon: '👥', desc: 'Una empresa sense gent no funciona. Contracta el teu primer empleat/da.',
    hint: 'A la secció RRHH pots veure candidats disponibles.',
    xp: 60, reward: { cash: 1000 },
    check: gd => (gd.employees||[]).length >= 1,
    unlocks: ['M03'],
  },
  {
    id: 'M03', chapter: 1, title: 'Els diners no creixen als arbres',
    icon: '🏦', desc: 'Necessites finançament per créixer. Demana un préstec al banc o posa capital propi.',
    hint: 'Ves a Finances i sol·licita un préstec bancari.',
    xp: 50, reward: { prestigi: 3 },
    check: gd => (gd.finances?.loans||[]).length >= 1 || (gd.finances?.cash||0) > 20000,
    unlocks: ['M04'],
  },
  {
    id: 'M04', chapter: 1, title: 'El primer client',
    icon: '🤝', desc: 'Algú confia en tu! Aconsegueix el teu primer client.',
    hint: 'Avança algunes setmanes. Un bon equip de vendes ajuda.',
    xp: 70, reward: { cash: 3000 },
    check: gd => (gd.clients||[]).length >= 1,
    unlocks: ['M05','M06'],
  },

  // Capítol 2: Creixement
  {
    id: 'M05', chapter: 2, title: 'Industrialització',
    icon: '🏭', desc: 'La producció artesanal no escala. Compra la teva primera màquina.',
    hint: 'Ves a Producció i compra una màquina al catàleg.',
    xp: 50, reward: { prestigi: 2 },
    check: gd => (gd.machines||[]).length >= 1,
    unlocks: ['M08'],
  },
  {
    id: 'M06', chapter: 2, title: 'Fes-te veure!',
    icon: '📣', desc: 'Sense màrqueting ets invisible. Destina pressupost a xarxes socials o Google Ads.',
    hint: 'Ves a Màrqueting i mou els sliders dels canals.',
    xp: 40, reward: { cash: 1500 },
    check: gd => Object.values(gd.marketing?.channels||{}).reduce((s,v)=>s+v,0) > 500,
    unlocks: ['M07'],
  },
  {
    id: 'M07', chapter: 2, title: 'Equip de 5',
    icon: '🏢', desc: 'Creix el teu equip fins a 5 treballadors. Diversifica departaments!',
    hint: 'Contracta empleats de vendes, producció i administració.',
    xp: 80, reward: { cash: 5000, prestigi: 3 },
    check: gd => (gd.employees||[]).length >= 5,
    unlocks: ['M09'],
  },
  {
    id: 'M08', chapter: 2, title: 'Setmanes verdes',
    icon: '💚', desc: 'Aconsegueix 4 setmanes consecutives amb beneficis.',
    hint: 'Controla els costos i augmenta les vendes.',
    xp: 100, reward: { cash: 8000 },
    check: gd => {
      const hist = gd.finances?.revenue_history || [];
      if (hist.length < 4) return false;
      const last4 = hist.slice(-4);
      return last4.every(h => h.result > 0);
    },
    unlocks: ['M10'],
  },

  // Capítol 3: Expansió
  {
    id: 'M09', chapter: 3, title: 'Conquereix el Vallès',
    icon: '🌍', desc: 'Arriba a 25 de prestigi. La teva marca ha de ser coneguda!',
    hint: 'Bons resultats, patrocinis i màrqueting pugen el prestigi.',
    xp: 120, reward: { cash: 10000 },
    check: gd => (gd.prestigi||0) >= 25,
    unlocks: ['M11','M12'],
  },
  {
    id: 'M10', chapter: 3, title: 'Caixa forta',
    icon: '💰', desc: 'Acumula 50.000€ de tresoreria. Necessitaràs reserva per als imprevistos.',
    hint: 'Estalvia i controla els costos.',
    xp: 100, reward: { prestigi: 5 },
    check: gd => (gd.finances?.cash||0) >= 50000,
    unlocks: ['M13'],
  },
  {
    id: 'M11', chapter: 3, title: 'Exportador/a',
    icon: '🚢', desc: 'Obre\'t a mercats internacionals. Fes la teva primera exportació.',
    hint: 'Ves a Comerç Exterior i tria un país per exportar.',
    xp: 80, reward: { cash: 6000 },
    check: gd => (gd.trade?.exports||[]).length >= 1,
    unlocks: [],
  },
  {
    id: 'M12', chapter: 3, title: 'Inversor/a a la borsa',
    icon: '📈', desc: 'Diversifica ingressos: compra les teves primeres accions.',
    hint: 'Ves a Borsa i compra accions de l\'IBEX.',
    xp: 60, reward: { prestigi: 3 },
    check: gd => Object.keys(gd.portfolio?.stocks||{}).length >= 1,
    unlocks: [],
  },
  {
    id: 'M13', chapter: 3, title: 'L\'any de l\'èxit',
    icon: '🏆', desc: 'Completa un any sencer (52 setmanes) amb l\'empresa en positiu.',
    hint: 'Aguanta! La persistència és clau.',
    xp: 200, reward: { cash: 20000, prestigi: 10 },
    check: gd => gd.week >= 52 && (gd.finances?.cash||0) > 0,
    unlocks: ['M14'],
  },

  // Capítol 4: Mestre empresarial
  {
    id: 'M14', chapter: 4, title: 'Magnata del Vallès',
    icon: '👑', desc: 'Arriba a 100.000€ de tresoreria, 50 de prestigi i 10 empleats.',
    hint: 'L\'objectiu final. Necessites excel·lència en tot.',
    xp: 500, reward: { cash: 50000, prestigi: 15 },
    check: gd => (gd.finances?.cash||0) >= 100000 && (gd.prestigi||0) >= 50 && (gd.employees||[]).length >= 10,
    unlocks: [],
  },
];

function initMissions(gd) {
  if (!gd.missions) {
    gd.missions = {
      completed: [],
      active: ['M01'],
      seen: [],
    };
  }
  // Assegurar que M01 sempre està disponible
  if (!gd.missions.active.includes('M01') && !gd.missions.completed.includes('M01')) {
    gd.missions.active.push('M01');
  }
}

function checkMissions(gd) {
  initMissions(gd);
  const ms = gd.missions;
  let newCompleted = false;
  
  ms.active.forEach(mid => {
    if (ms.completed.includes(mid)) return;
    const mission = MISSIONS.find(m => m.id === mid);
    if (!mission) return;
    try {
      if (mission.check(gd)) {
        ms.completed.push(mid);
        newCompleted = true;
        
        // Donar recompensa
        if (mission.reward) {
          if (mission.reward.cash) gd.finances.cash = (gd.finances.cash||0) + mission.reward.cash;
          if (mission.reward.prestigi) gd.prestigi = (gd.prestigi||0) + mission.reward.prestigi;
        }
        
        // XP
        if (window.awardXP) window.awardXP(gd, mission.xp, mission.title);
        
        // Desbloquejar noves missions
        (mission.unlocks || []).forEach(uid => {
          if (!ms.active.includes(uid) && !ms.completed.includes(uid)) {
            ms.active.push(uid);
          }
        });
        
        // Notificació i toast
        showEventToast('🎯', 'Missió completada!', mission.title + ' — +' + mission.xp + ' XP', true);
        showToast('🎯 ' + mission.title + ' completada!');
        
        // Mostrar modal de felicitació
        showMissionCompleteModal(mission);
      }
    } catch(e) { /* ignore */ }
  });
  
  return newCompleted;
}

function showMissionCompleteModal(mission) {
  const overlay = document.createElement('div');
  overlay.className = 'event-modal';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  
  let rewardText = '';
  if (mission.reward?.cash) rewardText += `+${fmt(mission.reward.cash)}€ `;
  if (mission.reward?.prestigi) rewardText += `+${mission.reward.prestigi} prestigi `;
  
  overlay.innerHTML = `
    <div class="event-card" style="text-align:center">
      <div style="font-size:56px;margin-bottom:8px;animation:float 2s ease-in-out infinite">${mission.icon}</div>
      <div style="font-size:12px;font-weight:800;color:var(--green);letter-spacing:2px;margin-bottom:6px">✅ MISSIÓ COMPLETADA</div>
      <div class="event-card-title">${mission.title}</div>
      <div class="event-card-desc">${mission.desc}</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:16px">
        <div class="mission-reward">⭐ +${mission.xp} XP</div>
        ${rewardText ? `<div class="mission-reward" style="color:var(--gold);background:rgba(245,158,11,.08)">${rewardText.trim()}</div>` : ''}
      </div>
      <button class="tutorial-btn primary" onclick="this.closest('.event-modal').remove()" style="width:100%">Continuar →</button>
    </div>`;
  document.body.appendChild(overlay);
}

function renderMissionsPanel() {
  const gd = getG()?.gameData;
  if (!gd) return '';
  initMissions(gd);
  const ms = gd.missions;
  
  // Missió activa actual (primera no completada)
  const activeMission = ms.active.find(mid => !ms.completed.includes(mid));
  const mission = MISSIONS.find(m => m.id === activeMission);
  
  if (!mission) {
    return `<div class="mission-panel completed">
      <div class="mission-icon">👑</div>
      <div class="mission-title">Totes les missions completades!</div>
      <div class="mission-desc">Ets un/a mestre/a empresarial. Continua creixent i competint amb els companys!</div>
    </div>`;
  }
  
  // Calcular progrés aproximat
  const totalMissions = MISSIONS.length;
  const completedCount = ms.completed.length;
  const chapter = mission.chapter;
  
  return `
    <div class="mission-panel active">
      <div class="mission-badge active">CAPÍTOL ${chapter} · MISSIÓ ACTIVA</div>
      <div class="mission-icon">${mission.icon}</div>
      <div class="mission-title">${mission.title}</div>
      <div class="mission-desc">${mission.desc}</div>
      <div style="font-size:11px;color:var(--gold);margin-bottom:6px">💡 <em>${mission.hint}</em></div>
      <div class="mission-reward">🎁 Recompensa: +${mission.xp} XP${mission.reward?.cash ? ' · +'+fmt(mission.reward.cash)+'€' : ''}${mission.reward?.prestigi ? ' · +'+mission.reward.prestigi+' prestigi' : ''}</div>
      <div class="mission-progress" style="margin-top:12px">
        <span style="font-size:11px;color:var(--text2)">Progrés global:</span>
        <div class="mission-bar"><div class="mission-bar-fill" style="width:${Math.round(completedCount/totalMissions*100)}%"></div></div>
        <div class="mission-pct">${completedCount}/${totalMissions}</div>
      </div>
    </div>`;
}


// ════════════════════════════════════════════════════════════
//  MÒDUL B: RÀNQUING COMPETITIU EN TEMPS REAL
// ════════════════════════════════════════════════════════════

function renderMegaLeaderboard(sortBy) {
  const gd = getG()?.gameData;
  if (!gd) return '';
  sortBy = sortBy || 'cash';
  
  let all = [...(getG()?.allStudents||[])].filter(p => p && p.company);
  
  // Ordenar
  if (sortBy === 'cash') all.sort((a,b) => (b.finances?.cash||0) - (a.finances?.cash||0));
  else if (sortBy === 'prestigi') all.sort((a,b) => (b.prestigi||0) - (a.prestigi||0));
  else if (sortBy === 'score') {
    all.sort((a,b) => {
      const scoreA = (a.finances?.cash||0)*0.3 + (a.prestigi||0)*1000 + (a.employees||[]).length*500 + (a.clients||[]).length*300;
      const scoreB = (b.finances?.cash||0)*0.3 + (b.prestigi||0)*1000 + (b.employees||[]).length*500 + (b.clients||[]).length*300;
      return scoreB - scoreA;
    });
  }
  
  // Trobar guanyador setmanal (el que més ha crescut en la última setmana)
  let weeklyWinner = null;
  let bestGrowth = -Infinity;
  all.forEach(p => {
    const hist = p.finances?.revenue_history || [];
    if (hist.length >= 2) {
      const lastResult = hist[hist.length-1]?.result || 0;
      if (lastResult > bestGrowth) { bestGrowth = lastResult; weeklyWinner = p; }
    }
  });
  
  const posClass = (i) => i===0 ? 'gold' : i===1 ? 'silver' : i===2 ? 'bronze' : 'normal';
  const uid = getG()?.uid;
  
  const getValue = (p) => {
    if (sortBy === 'cash') return fmt(Math.round(p.finances?.cash||0)) + '€';
    if (sortBy === 'prestigi') return '⭐ ' + (p.prestigi||0).toFixed(1);
    const score = Math.round((p.finances?.cash||0)*0.3 + (p.prestigi||0)*1000 + (p.employees||[]).length*500 + (p.clients||[]).length*300);
    return fmt(score) + ' pts';
  };
  
  return `
    <div class="mega-leaderboard">
      <div class="mega-lb-header">
        <div>
          <div class="mega-lb-title">🏆 Classificació de la classe</div>
          <div class="mega-lb-subtitle">${all.length} empreses actives · Actualitzat en temps real</div>
        </div>
        <div class="mega-lb-tabs">
          <button class="mega-lb-tab ${sortBy==='score'?'active':''}" onclick="window._lbSort='score';renderDashboard()">🏅 Puntuació</button>
          <button class="mega-lb-tab ${sortBy==='cash'?'active':''}" onclick="window._lbSort='cash';renderDashboard()">💰 Tresoreria</button>
          <button class="mega-lb-tab ${sortBy==='prestigi'?'active':''}" onclick="window._lbSort='prestigi';renderDashboard()">⭐ Prestigi</button>
        </div>
      </div>
      ${weeklyWinner ? `
        <div class="mega-lb-weekly-winner">
          <div class="trophy">🥇</div>
          <div class="info">
            <div class="winner-name">Empresa de la setmana: ${weeklyWinner.company?.name || weeklyWinner.displayName}</div>
            <div class="winner-desc">Millor resultat setmanal: +${fmt(Math.round(bestGrowth))}€ · Dirigida per ${weeklyWinner.displayName}</div>
          </div>
        </div>` : ''}
      <div class="mega-lb-body">
        ${all.length === 0 ? '<div style="text-align:center;padding:30px;color:var(--text2)">Encara ningú ha creat empresa. Sigues el primer! 🚀</div>' :
          all.slice(0,15).map((p, i) => `
            <div class="mega-lb-row ${p.uid===uid?'me':''}">
              <div class="mega-lb-pos ${posClass(i)}">${i+1}</div>
              <div>
                <div class="mega-lb-name">${p.company?.sectorData?.icon||'🏢'} ${p.displayName||'—'}</div>
                <div class="mega-lb-company">${p.company?.name||'Sense empresa'} · ${(p.employees||[]).length} emp. · S${p.week||1}</div>
              </div>
              <div>
                ${p.gamification?.level ? `<span class="mega-lb-badge" style="background:rgba(79,127,255,.15);color:var(--accent)">Nv.${p.gamification.level} ${p.gamification.title||''}</span>` : ''}
              </div>
              <div class="mega-lb-val">${getValue(p)}</div>
            </div>`).join('')}
      </div>
    </div>`;
}


// ════════════════════════════════════════════════════════════
//  MÒDUL C: ESDEVENIMENTS INTERACTIUS AMB DECISIONS
// ════════════════════════════════════════════════════════════

const INTERACTIVE_EVENTS = [
  {
    id: 'ev_hacker',
    icon: '🔓', title: 'Ciberatac!',
    desc: 'Un grup de hackers ha compromès la base de dades de clients. Les dades estan exposades i la premsa comença a fer-se ressò.',
    prob: 0.04,
    choices: [
      { icon: '💰', title: 'Pagar el rescat', desc: 'Paga 5.000€ als hackers per recuperar les dades ràpidament.', cost: 'Cost: 5.000€', effect: gd => { gd.finances.cash -= 5000; showToast('💰 Has pagat el rescat'); } },
      { icon: '🛡️', title: 'Contractar experts', desc: 'Contracta una empresa de ciberseguretat per 12.000€. Solució definitiva.', cost: 'Cost: 12.000€ · +5 prestigi', effect: gd => { gd.finances.cash -= 12000; gd.prestigi = Math.min(100,(gd.prestigi||0)+5); showToast('🛡️ Experts contractats! Seguretat reforçada'); } },
      { icon: '🤷', title: 'No fer res', desc: 'Ignorar el problema i esperar que passi. Risc de multa RGPD.', cost: 'Risc: multa fins a 20.000€ · -8 prestigi', effect: gd => { if(Math.random()<0.6){ gd.finances.cash -= 20000; gd.prestigi=Math.max(0,(gd.prestigi||0)-8); showToast('🚨 Multa RGPD de 20.000€!'); } else { gd.prestigi=Math.max(0,(gd.prestigi||0)-3); showToast('😰 Has tingut sort, però has perdut prestigi'); } } },
    ],
  },
  {
    id: 'ev_talent',
    icon: '🌟', title: 'Talent excepcional disponible',
    desc: 'Un/a directiu/va d\'una multinacional vol incorporar-se a la teva empresa. És brillant però demana un sou alt.',
    prob: 0.05,
    choices: [
      { icon: '🤝', title: 'Contractar-lo/la', desc: 'Sou de 5.500€/mes però aportarà molt.', cost: 'Cost: +5.500€/mes · +10 prestigi · +20% vendes', effect: gd => { gd.employees = gd.employees||[]; gd.employees.push({name:'Alex Talent',dept:'direccio',role:'Director/a Estratègia',salary:5500,morale:90,seniority:8,nivel:'directiu',avatar:'⭐',skills:['Lideratge','Estratègia']}); gd.prestigi=Math.min(100,(gd.prestigi||0)+10); showToast('🌟 Talent excepcional contractat!'); } },
      { icon: '❌', title: 'Rebutjar l\'oferta', desc: 'No t\'ho pots permetre ara. Potser un altre dia.', cost: 'Sense cost', effect: gd => { showToast('L\'oportunitat ha passat'); } },
    ],
  },
  {
    id: 'ev_dilema_etic',
    icon: '⚖️', title: 'Dilema ètic',
    desc: 'Un gran client vol que facis servir materials de baixa qualitat per abaratir costos. Si dius que no, marxarà a la competència.',
    prob: 0.05,
    choices: [
      { icon: '😇', title: 'Mantenir la qualitat', desc: 'Rebutjar la proposta i mantenir els estàndards.', cost: 'Perds el client · +8 prestigi', effect: gd => { if(gd.clients?.length>0) gd.clients.pop(); gd.prestigi=Math.min(100,(gd.prestigi||0)+8); showToast('😇 Has escollit la qualitat!'); showEventToast('⚖️','Decisió ètica','Has mantingut els teus principis',true); } },
      { icon: '💵', title: 'Acceptar el tracte', desc: 'Reduir qualitat per mantenir el client i guanyar més.', cost: 'Mantens el client · -5 prestigi · +3.000€', effect: gd => { gd.finances.cash=(gd.finances.cash||0)+3000; gd.prestigi=Math.max(0,(gd.prestigi||0)-5); showToast('💵 Has acceptat el tracte'); } },
      { icon: '🧠', title: 'Negociar un terme mig', desc: 'Proposar materials alternatius que siguin bons i econòmics.', cost: '50% de mantenir el client · +3 prestigi', effect: gd => { if(Math.random()<0.5 && gd.clients?.length>0) gd.clients.pop(); gd.prestigi=Math.min(100,(gd.prestigi||0)+3); gd.finances.cash=(gd.finances.cash||0)+1500; showToast('🧠 Proposta intermèdia'); } },
    ],
  },
  {
    id: 'ev_acomiadament',
    icon: '😰', title: 'Crisi de tresoreria',
    desc: 'Els costos superen els ingressos. El director financer proposa acomiadar personal per reduir despeses. L\'equip està preocupat.',
    prob: 0.04,
    minCondition: gd => (gd.finances?.cash||0) < 5000 && (gd.employees||[]).length >= 3,
    choices: [
      { icon: '🪓', title: 'Acomiadar 2 persones', desc: 'Reduir plantilla per salvar l\'empresa.', cost: 'Cost indemnització · -15 moral equip', effect: gd => { const e=gd.employees||[]; if(e.length>=2){const fired=e.splice(-2,2);const cost=fired.reduce((s,f)=>s+(f.salary||0)*2,0);gd.finances.cash-=cost;e.forEach(emp=>emp.morale=Math.max(0,(emp.morale||60)-15));}; showToast('😰 Personal acomiadat'); } },
      { icon: '💪', title: 'Aguantar sense acomiadar', desc: 'Buscar alternatives: renegociar costos, buscar nous clients.', cost: 'Risc alt però equip motivat · +5 moral', effect: gd => { (gd.employees||[]).forEach(e=>e.morale=Math.min(100,(e.morale||60)+5)); showToast('💪 L\'equip ho valora!'); showEventToast('💪','Lideratge','Has decidit lluitar amb l\'equip!',true); } },
      { icon: '🏦', title: 'Demanar crèdit d\'urgència', desc: 'Anar al banc per una línia de crèdit ràpida (interès alt).', cost: '+15.000€ al 8% interès', effect: gd => { gd.finances.cash=(gd.finances.cash||0)+15000; gd.finances.loans=gd.finances.loans||[]; gd.finances.loans.push({amount:15000,interest:8,monthlyPayment:500,remaining:15000,monthsLeft:36}); gd.finances.passiu.deutes_llarg=(gd.finances.passiu.deutes_llarg||0)+15000; showToast('🏦 Crèdit d\'urgència concedit!'); } },
    ],
  },
  {
    id: 'ev_oportunitat_gran',
    icon: '🎯', title: 'Contracte públic disponible!',
    desc: 'L\'Ajuntament de Granollers ha obert una licitació per a un contracte de 50.000€. Necessites preparar una proposta.',
    prob: 0.04,
    choices: [
      { icon: '📋', title: 'Presentar oferta bàsica', desc: 'Prepara una proposta estàndard. Probabilitat moderada.', cost: 'Cost: 500€ · 40% probabilitat', effect: gd => { gd.finances.cash-=500; if(Math.random()<0.4){gd.finances.cash+=50000; gd.prestigi=Math.min(100,(gd.prestigi||0)+10); showToast('🎉 Has guanyat el contracte públic!'); showEventToast('🎯','Contracte públic!','+50.000€!',true);} else showToast('😔 No has guanyat la licitació'); } },
      { icon: '🏆', title: 'Proposta premium', desc: 'Inverteix en una proposta detallada amb assessorament.', cost: 'Cost: 3.000€ · 75% probabilitat', effect: gd => { gd.finances.cash-=3000; if(Math.random()<0.75){gd.finances.cash+=50000; gd.prestigi=Math.min(100,(gd.prestigi||0)+12); showToast('🏆 Contracte públic guanyat amb proposta premium!'); showEventToast('🎯','Contracte públic!','+50.000€!',true);} else { showToast('😔 Bona proposta però no ha estat suficient'); gd.prestigi=Math.min(100,(gd.prestigi||0)+2); } } },
      { icon: '⏭️', title: 'Passar d\'aquesta oportunitat', desc: 'No tens temps ni recursos ara.', cost: 'Sense cost', effect: gd => { showToast('Has passat de la licitació'); } },
    ],
  },
  {
    id: 'ev_premsa',
    icon: '📰', title: 'La premsa truca!',
    desc: 'Un periodista del diari local vol fer-te una entrevista sobre la teva empresa. Com la enfoques?',
    prob: 0.06,
    choices: [
      { icon: '😎', title: 'Entrevista positiva i honesta', desc: 'Parla dels èxits i dels reptes amb transparència.', cost: '+6 prestigi', effect: gd => { gd.prestigi=Math.min(100,(gd.prestigi||0)+6); showToast('📰 Bona premsa!'); showEventToast('📰','Entrevista publicada','Bona cobertura mediàtica!',true); } },
      { icon: '🤥', title: 'Exagerar els èxits', desc: 'Inflar els números per impressionar. Risc de descrèdit.', cost: '50% +10 prestigi / 50% -8 prestigi', effect: gd => { if(Math.random()<0.5){gd.prestigi=Math.min(100,(gd.prestigi||0)+10); showToast('😎 T\'ho han comprat!');} else {gd.prestigi=Math.max(0,(gd.prestigi||0)-8); showToast('🤥 T\'han pillat exagerant!'); showEventToast('📰','Escàndol mediàtic','Has perdut credibilitat',false);} } },
      { icon: '🙅', title: 'Rebutjar l\'entrevista', desc: 'No vols exposar-te. Sense risc però sense benefici.', cost: 'Sense efecte', effect: gd => { showToast('Has declinat l\'entrevista'); } },
    ],
  },
];

function triggerInteractiveEvent(gd) {
  if (Math.random() > 0.15) return false; // 15% per setmana
  
  // Filtrar events que no s'han vist recentment
  const recentEvents = gd._recentInteractiveEvents || [];
  const available = INTERACTIVE_EVENTS.filter(ev => {
    if (recentEvents.includes(ev.id)) return false;
    if (ev.minCondition && !ev.minCondition(gd)) return false;
    return Math.random() < ev.prob * 5;
  });
  
  if (available.length === 0) return false;
  
  const ev = available[Math.floor(Math.random() * available.length)];
  
  // Recordar que l'hem vist
  if (!gd._recentInteractiveEvents) gd._recentInteractiveEvents = [];
  gd._recentInteractiveEvents.push(ev.id);
  if (gd._recentInteractiveEvents.length > 5) gd._recentInteractiveEvents.shift();
  
  showInteractiveEvent(ev, gd);
  return true;
}

function showInteractiveEvent(ev, gd) {
  const overlay = document.createElement('div');
  overlay.className = 'event-modal';
  overlay.id = 'interactive-event-modal';
  
  overlay.innerHTML = `
    <div class="event-card">
      <div class="event-card-icon">${ev.icon}</div>
      <div class="event-card-title">${ev.title}</div>
      <div class="event-card-desc">${ev.desc}</div>
      <div class="event-choices">
        ${ev.choices.map((ch, i) => `
          <div class="event-choice" onclick="window._resolveInteractiveEvent(${i})">
            <div class="event-choice-icon">${ch.icon}</div>
            <div class="event-choice-text">
              <div class="event-choice-title">${ch.title}</div>
              <div class="event-choice-desc">${ch.desc}</div>
              <div class="event-choice-cost">${ch.cost}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="event-timer">⏱️ Has de decidir ara — no pots avançar setmana sense respondre</div>
    </div>`;
  
  document.body.appendChild(overlay);
  
  // Guardar referència a l'event
  window._currentInteractiveEvent = ev;
}

window._resolveInteractiveEvent = function(choiceIdx) {
  const ev = window._currentInteractiveEvent;
  if (!ev) return;
  const gd = getG()?.gameData;
  if (!gd) return;
  
  const choice = ev.choices[choiceIdx];
  if (choice && choice.effect) {
    choice.effect(gd);
    saveGameData();
  }
  
  const modal = document.getElementById('interactive-event-modal');
  if (modal) modal.remove();
  window._currentInteractiveEvent = null;
};


// ════════════════════════════════════════════════════════════
//  MÒDUL D: TUTORIAL INTERACTIU
// ════════════════════════════════════════════════════════════

// Tutorial steps — cada pas pot tenir un 'tab' per navegar-hi primer
const TUTORIAL_STEPS = [
  {
    target: null,
    tab: null,
    title: '👋 Benvingut/da a EmpresaBat!',
    text: 'En aquest simulador gestionaràs la teva pròpia empresa al Vallès. Prendràs decisions reals: contractar, invertir, vendre, demanar préstecs... T\'ensenyem com funciona?',
    img: '🏢',
  },
  {
    target: '#tab-setup',
    tab: 'setup',
    title: '🚀 El primer pas: tria el teu camí',
    text: 'Aquí decideixes com començar. Pots <strong>crear la teva empresa des de zero</strong> (més complex) o <strong>ser contractat/da</strong> per una empresa existent del Vallès. Tria la que vulguis!',
    img: '🎯',
  },
  {
    target: '.sidebar',
    tab: null,
    title: '📋 El menú lateral',
    text: 'Aquestes icones són els <strong>departaments de la teva empresa</strong>: Finances, RRHH, Producció, Màrqueting, Vendes... Al principi només en tindràs alguns. <strong>Se\'n desbloquejaran més</strong> a mesura que cresquis!',
    img: '📂',
  },
  {
    target: '.topbar',
    tab: null,
    title: '📊 La barra superior',
    text: 'Aquí veus les <strong>dades clau</strong> de la teva empresa en tot moment: la setmana actual, la tresoreria (diners disponibles), el resultat mensual i el prestigi. Si el resultat és verd, vas bé!',
    img: '💰',
  },
  {
    target: '.week-advance-btn',
    tab: null,
    title: '⏩ Avançar el temps',
    text: 'Aquest botó fa <strong>passar una setmana</strong>. L\'empresa cobrarà clients, pagarà sous, i passaran coses. Cada setmana és una oportunitat de prendre decisions. <strong>Prova\'l quan tinguis empresa!</strong>',
    img: '⏱️',
  },
  {
    target: null,
    tab: null,
    title: '🎯 Les missions et guien!',
    text: 'Al <strong>Dashboard</strong> sempre tindràs una <strong>missió activa</strong> que t\'indica què fer a continuació. Segueix-les per aprendre tots els conceptes econòmics jugant. Cada missió dóna XP i recompenses!',
    img: '🏆',
  },
  {
    target: null,
    tab: null,
    title: '🏁 A jugar!',
    text: 'Ara ja ho saps tot. Comença triant el teu camí empresarial. Recorda: el <strong>rànquing</strong> compara la teva empresa amb les dels companys de classe. Molta sort i bona gestió!',
    img: '🚀',
  },
];

let tutorialStep = 0;
let tutorialOverlay = null;

function startTutorial() {
  const gd = getG()?.gameData;
  if (!gd || gd._tutorialDone) return;
  
  tutorialStep = 0;
  showTutorialStep();
}

function showTutorialStep() {
  if (tutorialStep >= TUTORIAL_STEPS.length) {
    endTutorial();
    return;
  }
  
  const step = TUTORIAL_STEPS[tutorialStep];
  
  // Navegar al tab correcte si cal
  if (step.tab && typeof window.showTab === 'function') {
    window.showTab(step.tab);
  }
  
  // Eliminar overlay anterior
  if (tutorialOverlay) tutorialOverlay.remove();
  
  // Petit delay per deixar que el DOM es renderitzi
  setTimeout(() => {
    _renderTutorialBubble(step);
  }, step.tab ? 300 : 50);
}

function _renderTutorialBubble(step) {
  if (tutorialOverlay) tutorialOverlay.remove();
  
  tutorialOverlay = document.createElement('div');
  tutorialOverlay.style.cssText = 'position:fixed;inset:0;z-index:300;pointer-events:none;';
  
  // Spotlight sobre l'element target si existeix
  let spotlightHTML = '';
  let bubblePos = {};
  let targetFound = false;
  
  if (step.target) {
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      targetFound = true;
      
      // Overlay fosc amb forat
      spotlightHTML = `
        <div style="position:fixed;inset:0;pointer-events:all;z-index:300" onclick="event.stopPropagation()">
          <svg style="position:fixed;inset:0;width:100%;height:100%">
            <defs>
              <mask id="tut-mask">
                <rect width="100%" height="100%" fill="white"/>
                <rect x="${rect.left-8}" y="${rect.top-8}" width="${rect.width+16}" height="${rect.height+16}" rx="12" fill="black"/>
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tut-mask)"/>
          </svg>
          <div style="position:fixed;left:${rect.left-10}px;top:${rect.top-10}px;width:${rect.width+20}px;height:${rect.height+20}px;
            border:2px solid var(--accent);border-radius:14px;box-shadow:0 0 30px rgba(79,127,255,.3);pointer-events:none;z-index:301"></div>
        </div>`;
      
      // Posicionar bombolla a la dreta o a sota de l'element
      if (rect.right + 400 < window.innerWidth) {
        bubblePos = { left: rect.right + 20, top: Math.max(20, rect.top - 20) };
      } else if (rect.bottom + 250 < window.innerHeight) {
        bubblePos = { left: Math.max(20, rect.left), top: rect.bottom + 20 };
      } else {
        bubblePos = { left: Math.max(20, Math.min(rect.left, window.innerWidth - 400)), top: Math.max(20, rect.top - 260) };
      }
    }
  }
  
  // Si no hi ha target o no s'ha trobat, centrar
  if (!targetFound) {
    spotlightHTML = `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.75);pointer-events:all;z-index:300" onclick="event.stopPropagation()"></div>`;
    bubblePos = { left: '50%', top: '50%', transform: 'translate(-50%,-50%)' };
  }
  
  const totalSteps = TUTORIAL_STEPS.length;
  const dots = TUTORIAL_STEPS.map((_, i) => 
    `<div style="width:${i===tutorialStep?'20px':'8px'};height:8px;border-radius:4px;background:${i<tutorialStep?'var(--green)':i===tutorialStep?'var(--accent)':'rgba(255,255,255,.15)'};transition:.3s"></div>`
  ).join('');
  
  const posStyle = bubblePos.transform 
    ? `left:${bubblePos.left};top:${bubblePos.top};transform:${bubblePos.transform}`
    : `left:${bubblePos.left}px;top:${bubblePos.top}px`;
  
  tutorialOverlay.innerHTML = `
    ${spotlightHTML}
    <div style="position:fixed;${posStyle};z-index:302;pointer-events:all;
      background:linear-gradient(135deg,rgba(14,20,45,.98),rgba(20,28,60,.98));
      border:1px solid var(--accent);border-radius:18px;padding:24px;max-width:380px;width:calc(100vw - 40px);
      box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 40px rgba(79,127,255,.15);
      animation:slideUp .4s ease" id="tutorial-bubble-el">
      
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="font-size:36px;flex-shrink:0;animation:float 2s ease-in-out infinite">${step.img || '📘'}</div>
        <div>
          <div style="font-size:10px;font-weight:700;color:var(--accent);letter-spacing:1px;margin-bottom:2px">PAS ${tutorialStep+1} DE ${totalSteps}</div>
          <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:var(--text);line-height:1.3">${step.title}</div>
        </div>
      </div>
      
      <div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:18px">${step.text}</div>
      
      <div style="display:flex;gap:4px;margin-bottom:14px;justify-content:center">${dots}</div>
      
      <div style="display:flex;gap:8px;align-items:center">
        ${tutorialStep > 0 ? '<button class="tutorial-btn secondary" onclick="window._tutorialPrev()" style="padding:10px 16px;background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:10px;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">← Anterior</button>' : ''}
        <button onclick="window._tutorialNext()" style="flex:1;padding:10px 20px;background:var(--accent);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);transition:.2s">
          ${tutorialStep < TUTORIAL_STEPS.length-1 ? 'Següent →' : '🚀 Començar a jugar!'}
        </button>
      </div>
      
      <div style="text-align:center;margin-top:10px">
        <button onclick="window._tutorialSkip()" style="background:none;border:none;color:var(--text3);font-size:11px;cursor:pointer;font-family:var(--font);text-decoration:underline">
          Saltar tutorial
        </button>
      </div>
    </div>`;
  
  document.body.appendChild(tutorialOverlay);
}

window._tutorialNext = function() {
  tutorialStep++;
  showTutorialStep();
};
window._tutorialPrev = function() {
  tutorialStep = Math.max(0, tutorialStep - 1);
  showTutorialStep();
};
window._tutorialSkip = function() {
  endTutorial();
};

function endTutorial() {
  if (tutorialOverlay) tutorialOverlay.remove();
  tutorialOverlay = null;
  const gd = getG()?.gameData;
  if (gd) {
    gd._tutorialDone = true;
    saveGameData();
  }
  // Tornar al setup per començar
  if (window.showTab) window.showTab('setup');
  showToast('🎓 Tutorial completat! Ara tria el teu camí empresarial!');
}


// ════════════════════════════════════════════════════════════
//  MÒDUL E: DESBLOQUEJAT PROGRESSIU DE PESTANYES
// ════════════════════════════════════════════════════════════

const TAB_UNLOCK_CONDITIONS = {
  // Always available
  dashboard: { always: true },
  setup: { always: true },
  finances: { always: true },
  hr: { always: true },
  production: { always: true },
  marketing: { always: true },
  
  // Unlock conditions
  sales:       { week: 3, label: 'Setmana 3', desc: 'Avança fins a la setmana 3 per desbloquejar Vendes' },
  borsa:       { week: 8, prestigi: 10, label: 'S8 + Prestigi 10', desc: 'Arriba a la setmana 8 amb prestigi 10 per desbloquejar la Borsa' },
  junta:       { week: 6, employees: 3, label: 'S6 + 3 empleats', desc: 'Setmana 6 amb 3 empleats per desbloquejar la Junta' },
  trade:       { week: 12, prestigi: 20, label: 'S12 + Prestigi 20', desc: 'Setmana 12 amb prestigi 20 per al Comerç Exterior' },
  franquicies: { week: 16, cash: 50000, label: 'S16 + 50k€', desc: 'Setmana 16 amb 50.000€ per desbloquejar Franquícies' },
  proveidors:  { week: 4, label: 'Setmana 4', desc: 'Avança fins a la setmana 4 per desbloquejar Proveïdors' },
  laborals:    { week: 10, employees: 5, label: 'S10 + 5 empleats', desc: 'Setmana 10 amb 5 empleats per a Relacions Laborals' },
  rdi:         { week: 14, prestigi: 15, label: 'S14 + Prestigi 15', desc: 'Setmana 14 amb prestigi 15 per desbloquejar R+D+I' },
  map:         { always: true },
};

function checkTabUnlocked(tabId, gd) {
  const cond = TAB_UNLOCK_CONDITIONS[tabId];
  if (!cond) return true;
  if (cond.always) return true;
  
  let unlocked = true;
  if (cond.week && (gd.week||1) < cond.week) unlocked = false;
  if (cond.prestigi && (gd.prestigi||0) < cond.prestigi) unlocked = false;
  if (cond.cash && (gd.finances?.cash||0) < cond.cash) unlocked = false;
  if (cond.employees && (gd.employees||[]).length < cond.employees) unlocked = false;
  
  return unlocked;
}

// Set per guardar quins tabs estan bloquejats (NO toquem mai l'onclick dels botons)
const _lockedTabs = new Set();

function updateTabLocks() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return;
  
  let justUnlocked = [];
  
  Object.keys(TAB_UNLOCK_CONDITIONS).forEach(tabId => {
    const nav = document.getElementById('nav-' + tabId);
    if (!nav) return;
    
    const wasLocked = _lockedTabs.has(tabId);
    const isUnlocked = checkTabUnlocked(tabId, gd);
    
    if (isUnlocked) {
      nav.classList.remove('locked');
      _lockedTabs.delete(tabId);
      if (wasLocked) {
        justUnlocked.push(tabId);
      }
    } else {
      nav.classList.add('locked');
      _lockedTabs.add(tabId);
    }
  });
  
  // Animació de desbloquejat
  justUnlocked.forEach(tabId => {
    const nav = document.getElementById('nav-' + tabId);
    if (nav) {
      nav.style.animation = 'none';
      requestAnimationFrame(() => {
        nav.style.animation = 'missionGlow 1s ease-in-out 3';
        nav.style.borderColor = 'var(--green)';
        setTimeout(() => { nav.style.borderColor = ''; nav.style.animation = ''; }, 3000);
      });
    }
    showEventToast('🔓', 'Nova secció!', `Has desbloquejat: ${tabId.toUpperCase()}`, true);
    showToast('🔓 Nova secció desbloquejada: ' + tabId);
  });
}

// Interceptor al sidebar — capturem el click ABANS que arribi al botó
// Si el tab està bloquejat, bloquegem l'event. Si no, el deixem passar.
(function installSidebarInterceptor() {
  function tryInstall() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) { setTimeout(tryInstall, 500); return; }
    
    sidebar.addEventListener('click', function(e) {
      // Trobar el nav-btn clicat (pot ser un fill)
      const btn = e.target.closest('.nav-btn');
      if (!btn) return;
      
      // Extreure el tabId del id="nav-xxx"
      const tabId = btn.id?.replace('nav-', '');
      if (!tabId) return;
      
      // Si està bloquejat, cancel·lar l'event
      if (_lockedTabs.has(tabId)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const cond = TAB_UNLOCK_CONDITIONS[tabId];
        showToast('🔒 ' + (cond?.desc || 'Secció bloquejada'));
        return false;
      }
      // Si no està bloquejat, deixar passar — l'onclick="showTab(...)" original funciona
    }, true); // 'true' = fase de CAPTURA, s'executa ABANS que l'onclick inline
    
    console.log('🔒 Sidebar interceptor instal·lat');
  }
  tryInstall();
})();


// ════════════════════════════════════════════════════════════
//  MÒDUL F: INTERACCIÓ ENTRE JUGADORS (P2P)
// ════════════════════════════════════════════════════════════

function renderP2PSection() {
  const gd = getG()?.gameData;
  const others = (getG()?.allStudents||[]).filter(p => p && p.company && p.uid !== getG()?.uid);
  
  if (others.length === 0) {
    return `<div style="text-align:center;padding:20px;color:var(--text2);font-size:13px">
      Encara no hi ha altres empreses a la classe. Quan n'hi hagi, podràs comerciar amb elles!
    </div>`;
  }
  
  return `
    <div class="section-card" style="border-color:rgba(124,58,237,.2)">
      <div class="section-title">🤝 Comerç entre alumnes <span>Beta</span></div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:14px">
        Envia ofertes comercials als teus companys. Si un fa alimentació i tu fas logística, podeu ser socis!
      </div>
      ${others.slice(0,5).map(p => `
        <div class="p2p-offer">
          <div style="font-size:28px">${p.company?.sectorData?.icon||'🏢'}</div>
          <div style="flex:1">
            <div style="font-weight:700;color:var(--text);font-size:14px">${p.company?.name||'—'}</div>
            <div style="font-size:11px;color:var(--text2)">${p.displayName} · ${p.company?.sectorData?.name||'—'} · ⭐${(p.prestigi||0).toFixed(1)}</div>
          </div>
          <button class="offer-btn" style="width:auto;padding:8px 14px;font-size:12px" 
            onclick="window._sendP2POffer('${p.uid}','${(p.company?.name||'').replace(/'/g,'')}')">
            📤 Enviar oferta
          </button>
        </div>`).join('')}
    </div>`;
}

window._sendP2POffer = function(targetUid, targetName) {
  const gd = getG()?.gameData;
  if (!gd) return;
  
  const offerValue = Math.round((gd.finances?.monthly_revenue||5000) * 0.08);
  
  showToast(`📤 Oferta de col·laboració enviada a ${targetName} (${fmt(offerValue)}€/mes)`);
  showEventToast('🤝', 'Oferta enviada!', `Has proposat una aliança comercial a ${targetName}`, true);
  
  // Simular resposta (en producció, això aniria per Firebase)
  setTimeout(() => {
    if (Math.random() < 0.6) {
      gd.finances.cash = (gd.finances.cash||0) + offerValue;
      gd.prestigi = Math.min(100, (gd.prestigi||0) + 2);
      showEventToast('🤝', 'Aliança acceptada!', `${targetName} ha acceptat! +${fmt(offerValue)}€`, true);
      showToast('🤝 Aliança amb ' + targetName + ' activada!');
      saveGameData();
    } else {
      showToast('😔 ' + targetName + ' ha rebutjat l\'oferta per ara');
    }
  }, 3000 + Math.random() * 4000);
};


// ════════════════════════════════════════════════════════════
//  MÒDUL G: MINIJOCS RÀPIDS
// ════════════════════════════════════════════════════════════

function triggerMinigame(gd) {
  if (Math.random() > 0.08) return false; // 8% per setmana
  if (gd.week < 4) return false; // No abans de la setmana 4
  
  const minigames = ['negotiation', 'pricing', 'hiring'];
  const type = minigames[Math.floor(Math.random() * minigames.length)];
  
  showMinigame(type, gd);
  return true;
}

function showMinigame(type, gd) {
  if (type === 'negotiation') showNegotiationMinigame(gd);
  else if (type === 'pricing') showPricingMinigame(gd);
  else if (type === 'hiring') showHiringMinigame(gd);
}

function showNegotiationMinigame(gd) {
  const clientName = 'Empresa Vallès ' + Math.floor(Math.random()*99+1);
  const contractValue = Math.round(3000 + Math.random() * 15000);
  let timerValue = 100;
  
  const overlay = document.createElement('div');
  overlay.className = 'minigame-modal';
  overlay.id = 'minigame-modal';
  
  overlay.innerHTML = `
    <div class="minigame-card">
      <div class="minigame-timer">
        <span style="font-size:12px;color:var(--text2)">⏱️ Temps:</span>
        <div class="minigame-timer-bar"><div class="minigame-timer-fill" id="mg-timer-fill" style="width:100%"></div></div>
        <div class="minigame-timer-text" id="mg-timer-text">15s</div>
      </div>
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:40px;margin-bottom:8px">🤝</div>
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">Negociació amb ${clientName}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:6px">Vol contractar els teus serveis per <strong style="color:var(--gold)">${fmt(contractValue)}€/mes</strong>. Quin to adoptes?</div>
      </div>
      <div class="nego-option" onclick="window._resolveMinigame('agressiu',${contractValue})">
        <div class="nego-option-title">😤 Agressiu — "Val ${fmt(Math.round(contractValue*1.4))}€ o res"</div>
        <div class="nego-option-desc">Alt risc: 40% aconsegueixes +40% valor, 60% perds el client</div>
      </div>
      <div class="nego-option" onclick="window._resolveMinigame('diplomatic',${contractValue})">
        <div class="nego-option-title">🤝 Diplomàtic — "Podem trobar un bon acord"</div>
        <div class="nego-option-desc">Equilibrat: 70% aconsegueixes +15% valor, 30% valor base</div>
      </div>
      <div class="nego-option" onclick="window._resolveMinigame('flexible',${contractValue})">
        <div class="nego-option-title">😊 Flexible — "M'adapto al teu pressupost"</div>
        <div class="nego-option-desc">Segur: 90% tanques el tracte, però sense increment</div>
      </div>
    </div>`;
  
  document.body.appendChild(overlay);
  
  // Timer
  const startTime = Date.now();
  const totalTime = 15000; // 15 segons
  const timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, totalTime - elapsed);
    const pct = (remaining / totalTime) * 100;
    const el = document.getElementById('mg-timer-fill');
    const textEl = document.getElementById('mg-timer-text');
    if (el) el.style.width = pct + '%';
    if (textEl) textEl.textContent = Math.ceil(remaining/1000) + 's';
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      // Temps esgotat - perds l'oportunitat
      const modal = document.getElementById('minigame-modal');
      if (modal) modal.remove();
      showToast('⏰ Temps esgotat! Has perdut l\'oportunitat de negociació');
    }
  }, 100);
  
  window._currentMinigameTimer = timerInterval;
}

function showPricingMinigame(gd) {
  const productName = ['Producte Premium', 'Servei Plus', 'Pack Empreses', 'Solució Total'][Math.floor(Math.random()*4)];
  const costBase = Math.round(800 + Math.random() * 2000);
  const marketPrice = Math.round(costBase * (1.3 + Math.random() * 0.5));
  
  const overlay = document.createElement('div');
  overlay.className = 'minigame-modal';
  overlay.id = 'minigame-modal';
  
  overlay.innerHTML = `
    <div class="minigame-card">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:40px;margin-bottom:8px">💲</div>
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">Fixa el preu: ${productName}</div>
        <div style="font-size:13px;color:var(--text2);margin-top:6px">Cost de producció: <strong>${fmt(costBase)}€</strong>. Preu de mercat estimat: ~${fmt(marketPrice)}€</div>
      </div>
      <div class="nego-option" onclick="window._resolvePricing('barat',${costBase},${marketPrice})">
        <div class="nego-option-title">📉 Preu baix: ${fmt(Math.round(costBase*1.1))}€</div>
        <div class="nego-option-desc">Vendes molt, marge baix. +3 clients potencials.</div>
      </div>
      <div class="nego-option" onclick="window._resolvePricing('mercat',${costBase},${marketPrice})">
        <div class="nego-option-title">⚖️ Preu de mercat: ${fmt(marketPrice)}€</div>
        <div class="nego-option-desc">Competitiu i rendible. Estratègia equilibrada.</div>
      </div>
      <div class="nego-option" onclick="window._resolvePricing('premium',${costBase},${marketPrice})">
        <div class="nego-option-title">📈 Preu premium: ${fmt(Math.round(marketPrice*1.35))}€</div>
        <div class="nego-option-desc">Marge alt, poques vendes. Necessites prestigi >30 perquè funcioni.</div>
      </div>
    </div>`;
  
  document.body.appendChild(overlay);
}

function showHiringMinigame(gd) {
  const candidates = [
    { name: 'Maria López', exp: 8, salary: 3200, skills: 'Lideratge, Estratègia', icon: '👩‍💼', risk: 'Podria marxar en 6 mesos' },
    { name: 'Pol Martí', exp: 2, salary: 1800, skills: 'Motivació, Idiomes', icon: '👨‍💻', risk: 'Poca experiència' },
    { name: 'Anna Roca', exp: 5, salary: 2500, skills: 'Analítica, Vendes', icon: '👩‍🔬', risk: 'Demana teletreeball parcial' },
  ];
  
  const overlay = document.createElement('div');
  overlay.className = 'minigame-modal';
  overlay.id = 'minigame-modal';
  
  overlay.innerHTML = `
    <div class="minigame-card">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:40px;margin-bottom:8px">👥</div>
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">Entrevista exprés!</div>
        <div style="font-size:13px;color:var(--text2);margin-top:6px">Tres candidats per a una posició clau. Qui contractes?</div>
      </div>
      ${candidates.map((c,i) => `
        <div class="nego-option" onclick="window._resolveHiring(${i})">
          <div class="nego-option-title">${c.icon} ${c.name} — ${c.exp} anys exp. — ${fmt(c.salary)}€/mes</div>
          <div class="nego-option-desc">🎯 ${c.skills} · ⚠️ ${c.risk}</div>
        </div>`).join('')}
    </div>`;
  
  document.body.appendChild(overlay);
  
  window._hiringCandidates = candidates;
}

window._resolveMinigame = function(style, value) {
  if (window._currentMinigameTimer) clearInterval(window._currentMinigameTimer);
  const gd = getG()?.gameData;
  if (!gd) return;
  
  let result = '';
  if (style === 'agressiu') {
    if (Math.random() < 0.4) {
      const bigValue = Math.round(value * 1.4);
      gd.clients = gd.clients||[];
      gd.clients.push({id:'cl_mg_'+Date.now(),icon:'🤝',name:'Client negociat',type:'B2B',monthly_value:bigValue,satisfaction:80});
      result = `🎉 Negociació agressiva exitosa! Client per ${fmt(bigValue)}€/mes!`;
      gd.prestigi = Math.min(100,(gd.prestigi||0)+2);
    } else {
      result = '😤 El client s\'ha ofès i ha marxat. Massa agressiu!';
      gd.prestigi = Math.max(0,(gd.prestigi||0)-1);
    }
  } else if (style === 'diplomatic') {
    if (Math.random() < 0.7) {
      const dipValue = Math.round(value * 1.15);
      gd.clients = gd.clients||[];
      gd.clients.push({id:'cl_mg_'+Date.now(),icon:'🤝',name:'Client negociat',type:'B2B',monthly_value:dipValue,satisfaction:85});
      result = `🤝 Bon tracte! Client per ${fmt(dipValue)}€/mes`;
    } else {
      gd.clients = gd.clients||[];
      gd.clients.push({id:'cl_mg_'+Date.now(),icon:'🤝',name:'Client negociat',type:'B2B',monthly_value:value,satisfaction:75});
      result = `📋 Tracte tancat al preu base: ${fmt(value)}€/mes`;
    }
  } else {
    if (Math.random() < 0.9) {
      gd.clients = gd.clients||[];
      gd.clients.push({id:'cl_mg_'+Date.now(),icon:'🤝',name:'Client negociat',type:'B2B',monthly_value:value,satisfaction:90});
      result = `😊 Client content! ${fmt(value)}€/mes amb alta satisfacció`;
    } else {
      result = '🤷 Fins i tot sent flexible, el client ha triat la competència';
    }
  }
  
  showToast(result);
  saveGameData();
  
  const modal = document.getElementById('minigame-modal');
  if (modal) modal.remove();
};

window._resolvePricing = function(strategy, cost, marketPrice) {
  const gd = getG()?.gameData;
  if (!gd) return;
  
  if (strategy === 'barat') {
    gd.finances.cash = (gd.finances.cash||0) + Math.round(cost * 0.1 * 3);
    showToast('📉 Vendes altes, marge baix. +' + fmt(Math.round(cost*0.3)) + '€');
  } else if (strategy === 'mercat') {
    gd.finances.cash = (gd.finances.cash||0) + Math.round((marketPrice-cost) * 2);
    showToast('⚖️ Bona estratègia! +' + fmt(Math.round((marketPrice-cost)*2)) + '€');
  } else {
    if ((gd.prestigi||0) >= 30) {
      gd.finances.cash = (gd.finances.cash||0) + Math.round(marketPrice * 0.35 * 1.5);
      gd.prestigi = Math.min(100,(gd.prestigi||0)+2);
      showToast('📈 Premium funciona! +' + fmt(Math.round(marketPrice*0.525)) + '€');
    } else {
      gd.finances.cash = (gd.finances.cash||0) + Math.round(marketPrice * 0.35 * 0.3);
      showToast('📈 Preu massa alt pel teu prestigi. Poques vendes.');
    }
  }
  
  saveGameData();
  const modal = document.getElementById('minigame-modal');
  if (modal) modal.remove();
};

window._resolveHiring = function(idx) {
  const gd = getG()?.gameData;
  if (!gd) return;
  const candidates = window._hiringCandidates;
  if (!candidates) return;
  
  const c = candidates[idx];
  gd.employees = gd.employees||[];
  gd.employees.push({
    name: c.name, dept: 'vendes', role: 'Comercial',
    salary: c.salary, morale: 70 + c.exp*2, seniority: c.exp,
    nivel: c.exp >= 5 ? 'intermedi' : 'base',
    avatar: c.icon, skills: c.skills.split(', '),
  });
  
  showToast('✅ ' + c.name + ' contractat/da! Benvingut/da a l\'equip!');
  showEventToast('👥', 'Nou fitxatge!', c.name + ' s\'incorpora', true);
  saveGameData();
  
  const modal = document.getElementById('minigame-modal');
  if (modal) modal.remove();
};


// ════════════════════════════════════════════════════════════
//  MÒDUL H: RETENCIÓ I RECORDATORIS
// ════════════════════════════════════════════════════════════

function checkRetention(gd) {
  if (!gd || !gd.mode) return;
  
  // Comprovar si fa estona que no juga
  const lastPlayed = gd._lastPlayTimestamp || Date.now();
  const hoursSince = (Date.now() - lastPlayed) / (1000 * 60 * 60);
  
  gd._lastPlayTimestamp = Date.now();
  
  // Mostrar banner de benvinguda si fa >24h
  if (hoursSince > 24 && !gd._welcomeBackShown) {
    gd._welcomeBackShown = true;
    const lostCash = Math.round(hoursSince * (gd.finances?.monthly_costs || 1000) / (30*24));
    
    setTimeout(() => {
      const banner = document.createElement('div');
      banner.className = 'retention-banner';
      banner.innerHTML = `
        <div style="font-size:28px">👋</div>
        <div style="flex:1">
          <div style="font-weight:700;color:var(--text);font-size:14px">Benvingut/da de nou!</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">
            La teva empresa t'ha trobat a faltar. 
            ${lostCash > 0 ? `S'han acumulat ~${fmt(lostCash)}€ en costos mentre no hi eres.` : ''}
            ${gd.gamification?.streak > 1 ? ` Ratxa: ${gd.gamification.streak} dies!` : ''}
          </div>
        </div>
        <button class="retention-close" onclick="this.parentElement.remove()">✕</button>`;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 8000);
    }, 2000);
  } else {
    gd._welcomeBackShown = false;
  }
}


// ════════════════════════════════════════════════════════════
//  INTEGRACIÓ AMB EL JOC PRINCIPAL
// ════════════════════════════════════════════════════════════

// Les funcions del joc (advanceWeek, renderDashboard) es defineixen
// dins un <script type="module"> que pot carregar-se DESPRÉS d'aquest fitxer.
// Per tant, fem polling fins que existeixin i llavors les hookem.

let _hooked = false;

function hookGameFunctions() {
  if (_hooked) return;
  
  // Esperar que window.advanceWeek existeixi
  if (typeof window.advanceWeek !== 'function') return;
  if (typeof window.renderDashboard !== 'function') return;
  
  _hooked = true;
  console.log('🎮 Hooking advanceWeek i renderDashboard...');
  
  // Hook a advanceWeek
  const originalAdvanceWeek = window.advanceWeek;
  window.advanceWeek = async function() {
    // Comprovar si hi ha event interactiu pendent
    if (window._currentInteractiveEvent) {
      showToast('⚠️ Has de resoldre l\'esdeveniment primer!');
      return;
    }
    
    await originalAdvanceWeek.call(this);
    
    const gd = getG()?.gameData;
    if (!gd) return;
    
    // Comprovar missions
    checkMissions(gd);
    
    // Trigger events interactius
    triggerInteractiveEvent(gd);
    
    // Trigger minijocs
    triggerMinigame(gd);
    
    // Actualitzar locks de tabs
    updateTabLocks();
    
    // Guardar
    await saveGameData();
  };

  // Hook a renderDashboard per injectar missions i leaderboard
  const originalRenderDashboard = window.renderDashboard;
  window.renderDashboard = function() {
    originalRenderDashboard();
    injectDashboardExtras();
  };
  
  console.log('🎮 Hooks instal·lats correctament!');
}

// Polling: intentar hookar cada 300ms fins que funcioni
const hookInterval = setInterval(() => {
  hookGameFunctions();
  if (_hooked) clearInterval(hookInterval);
}, 300);

function injectDashboardExtras() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return;
  
  const dashWrap = document.querySelector('.dash-wrap');
  if (!dashWrap) return;
  
  // Injectar missions panel ABANS del dashboard
  const existingMission = document.getElementById('mission-inject');
  if (existingMission) existingMission.remove();
  
  const missionDiv = document.createElement('div');
  missionDiv.id = 'mission-inject';
  missionDiv.innerHTML = renderMissionsPanel();
  dashWrap.insertBefore(missionDiv, dashWrap.firstChild);
  
  // Injectar leaderboard DESPRÉS dels KPIs
  const existingLB = document.getElementById('leaderboard-inject');
  if (existingLB) existingLB.remove();
  
  const lbDiv = document.createElement('div');
  lbDiv.id = 'leaderboard-inject';
  lbDiv.innerHTML = renderMegaLeaderboard(window._lbSort || 'score');
  
  const dashMid = dashWrap.querySelector('.dash-mid');
  if (dashMid) dashWrap.insertBefore(lbDiv, dashMid);
  else dashWrap.appendChild(lbDiv);
  
  // Injectar P2P section
  const existingP2P = document.getElementById('p2p-inject');
  if (existingP2P) existingP2P.remove();
  
  const p2pDiv = document.createElement('div');
  p2pDiv.id = 'p2p-inject';
  p2pDiv.innerHTML = renderP2PSection();
  dashWrap.appendChild(p2pDiv);
}

// Hook a initUI per activar tutorial i locks
const originalInitUI = window.initUI;
if (typeof originalInitUI === 'function') {
  // initUI no és accessible directament, ho fem amb un observer
}

// Observar quan el joc s'inicialitza
const gameObserver = new MutationObserver(() => {
  const gd = getG()?.gameData;
  if (!gd) return;
  
  if (gd.mode && !window._gameplayInitialized) {
    window._gameplayInitialized = true;
    
    // Inicialitzar missions
    initMissions(gd);
    
    // Actualitzar locks
    setTimeout(() => updateTabLocks(), 500);
    
    // Tutorial (només primera vegada)
    if (!gd._tutorialDone && gd.mode) {
      setTimeout(() => startTutorial(), 1500);
    }
    
    // Retention check
    checkRetention(gd);
    
    // Comprovar missions
    checkMissions(gd);
    
    console.log('🎮 ui-gameplay.js — Totes les millores carregades!');
  }
});

// Observar canvis al game screen
const gameScreen = document.getElementById('game-screen');
if (gameScreen) {
  gameObserver.observe(gameScreen, { attributes: true, childList: true, subtree: false });
}

// Backup: inicialitzar quan G estigui llest
const checkReady = setInterval(() => {
  const gd = getG()?.gameData;
  if (gd && gd.mode && !window._gameplayInitialized) {
    window._gameplayInitialized = true;
    clearInterval(checkReady);
    
    initMissions(gd);
    setTimeout(() => updateTabLocks(), 500);
    
    if (!gd._tutorialDone) {
      setTimeout(() => startTutorial(), 1500);
    }
    
    checkRetention(gd);
    checkMissions(gd);
    
    // Injectar al dashboard si ja està renderitzat
    setTimeout(() => injectDashboardExtras(), 1000);
    
    console.log('🎮 ui-gameplay.js — Millores inicialitzades!');
  }
}, 1000);

// Exposar funcions globals
window.startTutorial = startTutorial;
window.checkMissions = checkMissions;
window.updateTabLocks = updateTabLocks;
window._lbSort = 'score';

console.log('🎮 ui-gameplay.js carregat — Missions, Rànquing, Events, Tutorial, Locks, P2P, Minijocs, Retenció');

})();
