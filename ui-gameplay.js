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
/* ══ TRANSICIÓ SETMANAL (carrega de "tornar la pàgina") ══ */
.week-transition {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(14,20,45,.96), rgba(0,0,0,.98));
  backdrop-filter: blur(20px);
  pointer-events: all;
  animation: fadeIn .25s ease;
}
.week-transition-content {
  text-align: center;
  animation: scaleIn .4s ease;
}
@keyframes scaleIn {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.week-transition-icon {
  font-size: 80px;
  margin-bottom: 12px;
  animation: spin360 0.8s ease-in-out;
  display: inline-block;
}
@keyframes spin360 {
  from { transform: rotate(0deg) scale(0.5); }
  to { transform: rotate(360deg) scale(1); }
}
.week-transition-text {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}
.week-transition-sub {
  font-size: 13px;
  color: var(--text2);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* ══ RECAP SETMANAL (el "sobre" que s'obre) ══ */
.week-recap {
  position: fixed;
  inset: 0;
  z-index: 350;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.78);
  backdrop-filter: blur(12px);
  padding: 16px;
  animation: fadeIn .3s ease;
  cursor: pointer;
}
.week-recap-card {
  background: linear-gradient(180deg, rgba(20,28,60,.99), rgba(8,12,24,.99));
  border: 2px solid var(--border2);
  border-radius: 20px;
  padding: 26px 28px;
  max-width: 460px;
  width: 100%;
  animation: recapSlide .5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  cursor: default;
}
.week-recap-card.positive { border-color: rgba(16,185,129,.5); box-shadow: 0 0 60px rgba(16,185,129,.15); }
.week-recap-card.negative { border-color: rgba(239,68,68,.5); box-shadow: 0 0 60px rgba(239,68,68,.15); }
.week-recap-card.neutral  { border-color: rgba(79,127,255,.5); box-shadow: 0 0 60px rgba(79,127,255,.15); }
@keyframes recapSlide {
  from { transform: translateY(40px) scale(0.9); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.week-recap-header {
  text-align: center;
  margin-bottom: 18px;
  position: relative;
}
.week-recap-week {
  font-size: 11px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.week-recap-date {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 6px;
}
.week-recap-mood {
  font-size: 36px;
  margin-bottom: 4px;
  display: inline-block;
  animation: moodBounce 1s ease-in-out infinite;
}
@keyframes moodBounce {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.week-recap-result {
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  font-weight: 800;
  margin: 8px 0 4px;
}
.week-recap-result.up { color: var(--green); }
.week-recap-result.down { color: var(--red); }
.week-recap-result.flat { color: var(--gold); }
.week-recap-subtitle {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 16px;
}
.week-recap-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.week-recap-event {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255,255,255,.04);
  border-radius: 10px;
  border-left: 3px solid var(--border2);
  font-size: 12px;
  animation: eventSlideIn .4s ease backwards;
}
.week-recap-event.good { border-left-color: var(--green); background: rgba(16,185,129,.06); }
.week-recap-event.bad { border-left-color: var(--red); background: rgba(239,68,68,.06); }
.week-recap-event.neutral { border-left-color: var(--accent); background: rgba(79,127,255,.04); }
@keyframes eventSlideIn {
  from { transform: translateX(-15px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.week-recap-event-icon { font-size: 22px; flex-shrink: 0; }
.week-recap-event-text { flex: 1; color: var(--text); line-height: 1.4; }
.week-recap-event-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 13px;
}
.week-recap-event-value.up { color: var(--green); }
.week-recap-event-value.down { color: var(--red); }
.week-recap-continue {
  width: 100%;
  padding: 12px;
  background: var(--accent);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  font-family: var(--font);
  cursor: pointer;
  transition: .2s;
}
.week-recap-continue:hover { background: #3d6dee; transform: translateY(-1px); }
.week-recap-tip {
  text-align: center;
  font-size: 10px;
  color: var(--text3);
  margin-top: 8px;
}

/* ══ NOTÍCIES DEL VALLÈS — Feed estil X amb moviments dels companys ══ */
.news-feed {
  background: linear-gradient(180deg, rgba(20,28,60,.6), rgba(8,12,24,.6));
  border: 1px solid var(--border2);
  border-radius: 16px;
  padding: 16px;
  max-height: 380px;
  overflow-y: auto;
}
.news-feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.news-feed-title {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.news-feed-live {
  font-size: 9px;
  font-weight: 800;
  color: #fff;
  background: var(--red);
  padding: 2px 7px;
  border-radius: 10px;
  letter-spacing: 1px;
  animation: livePulse 1.5s ease-in-out infinite;
}
@keyframes livePulse {
  0%,100% { opacity: 1; }
  50% { opacity: .55; }
}
@keyframes newTabPop {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* ══ APOSTES SETMANALS — Mini-event de risc ══ */
.bet-card {
  background: linear-gradient(135deg, rgba(124,58,237,.10), rgba(245,158,11,.08));
  border: 1px solid rgba(124,58,237,.30);
  border-radius: 16px;
  padding: 18px;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
}
.bet-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 40%, rgba(124,58,237,.08), transparent 60%);
  animation: quickGlow 4s linear infinite;
  pointer-events: none;
}
.bet-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}
.bet-icon {
  font-size: 28px;
}
.bet-title {
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  flex: 1;
}
.bet-tag {
  font-size: 9px;
  font-weight: 800;
  background: rgba(245,158,11,.20);
  color: var(--gold);
  padding: 3px 8px;
  border-radius: 10px;
  letter-spacing: 1px;
}
.bet-question {
  font-size: 13px;
  color: var(--text);
  margin-bottom: 14px;
  line-height: 1.5;
  position: relative;
  z-index: 2;
}
.bet-question strong { color: var(--gold); }
.bet-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  position: relative;
  z-index: 2;
}
.bet-option {
  padding: 12px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: .2s;
  text-align: center;
  font-family: var(--font);
}
.bet-option:hover {
  background: rgba(124,58,237,.10);
  border-color: rgba(124,58,237,.50);
  transform: translateY(-2px);
}
.bet-option-icon { font-size: 22px; display: block; margin-bottom: 4px; }
.bet-option-text { font-size: 12px; font-weight: 700; color: var(--text); }
.bet-option-payout { font-size: 10px; color: var(--gold); margin-top: 2px; font-weight: 700; }
.bet-result {
  text-align: center;
  padding: 14px;
  border-radius: 10px;
  margin-top: 8px;
}
.bet-result.win {
  background: rgba(16,185,129,.10);
  border: 1px solid rgba(16,185,129,.30);
}
.bet-result.lose {
  background: rgba(239,68,68,.10);
  border: 1px solid rgba(239,68,68,.30);
}

/* ══ SPLASH INICIAL — Ranking quan obres la sessió ══ */
.session-splash {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, rgba(14,20,45,.98), rgba(0,0,0,.99));
  backdrop-filter: blur(20px);
  cursor: pointer;
  animation: fadeIn .4s ease;
}
.session-splash-card {
  background: linear-gradient(180deg, rgba(20,28,60,.99), rgba(8,12,24,.99));
  border: 2px solid var(--accent);
  border-radius: 24px;
  padding: 32px 36px;
  max-width: 540px;
  width: calc(100vw - 32px);
  text-align: center;
  animation: splashIn .5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 30px 80px rgba(0,0,0,.7), 0 0 80px rgba(79,127,255,.25);
  cursor: default;
}
@keyframes splashIn {
  from { transform: scale(0.7) translateY(40px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.splash-greeting {
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}
.splash-name {
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 18px;
  letter-spacing: -0.5px;
}
.splash-position {
  font-size: 80px;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  background: linear-gradient(135deg, var(--gold), #ffae00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 4px;
  animation: rocketLaunch 1.5s ease-in-out infinite;
}
.splash-position-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text3);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 22px;
}
.splash-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
  margin-bottom: 22px;
  height: 130px;
}
.splash-podium-spot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 110px;
}
.splash-podium-bar {
  width: 100%;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 22px;
  color: #fff;
}
.splash-podium-spot.gold .splash-podium-bar {
  height: 110px;
  background: linear-gradient(180deg, #ffd700, #b8860b);
  box-shadow: 0 -4px 30px rgba(255,215,0,.4);
}
.splash-podium-spot.silver .splash-podium-bar {
  height: 80px;
  background: linear-gradient(180deg, #c0c0c0, #808080);
}
.splash-podium-spot.bronze .splash-podium-bar {
  height: 55px;
  background: linear-gradient(180deg, #cd7f32, #8b4513);
}
.splash-podium-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  line-height: 1.2;
}
.splash-podium-cash {
  font-size: 10px;
  color: var(--text2);
  font-family: 'JetBrains Mono', monospace;
}
.splash-rival-msg {
  background: rgba(245,158,11,.08);
  border: 1px solid rgba(245,158,11,.25);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 18px;
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
}
.splash-rival-msg strong { color: var(--gold); }
.splash-cta {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.splash-cta button {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  font-family: var(--font);
  transition: .2s;
}
.splash-cta-primary {
  background: var(--accent);
  color: #fff;
}
.splash-cta-primary:hover { background: #3d6dee; transform: translateY(-1px); }
.splash-cta-secondary {
  background: rgba(255,255,255,.06);
  color: var(--text);
  border: 1px solid var(--border);
}
.splash-cta-secondary:hover { background: rgba(255,255,255,.1); }
.news-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,.04);
  animation: newsSlide .4s ease backwards;
}
.news-item:last-child { border-bottom: none; }
@keyframes newsSlide {
  from { transform: translateX(-12px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.news-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 2px solid var(--border2);
}
.news-content {
  flex: 1;
  min-width: 0;
}
.news-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}
.news-name {
  font-weight: 800;
  font-size: 12px;
  color: var(--text);
}
.news-time {
  font-size: 10px;
  color: var(--text3);
}
.news-text {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.45;
}
.news-text strong { color: var(--text); }
.news-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 8px;
  margin-right: 4px;
  letter-spacing: .3px;
  text-transform: uppercase;
}
.news-tag.win    { background: rgba(16,185,129,.15); color: var(--green); }
.news-tag.fail   { background: rgba(239,68,68,.15); color: var(--red); }
.news-tag.market { background: rgba(245,158,11,.15); color: var(--gold); }
.news-tag.event  { background: rgba(124,58,237,.15); color: #a78bfa; }
.news-tag.you    { background: rgba(79,127,255,.20); color: var(--accent); }

/* ══ MISSIÓ PERSISTENT (sota topbar) ══ */
.topmission-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  background: linear-gradient(90deg, rgba(79,127,255,.10), rgba(124,58,237,.08), rgba(245,158,11,.06));
  border-bottom: 1px solid rgba(79,127,255,.20);
  border-top: 1px solid rgba(255,255,255,.04);
  font-family: var(--font);
  cursor: default;
  position: relative;
  overflow: hidden;
  min-height: 38px;
}
.topmission-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(79,127,255,.05), transparent);
  animation: missionShine 4s linear infinite;
  pointer-events: none;
}
@keyframes missionShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.topmission-icon {
  font-size: 18px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(245,158,11,.3));
}
.topmission-label {
  font-size: 9px;
  font-weight: 800;
  color: var(--gold);
  letter-spacing: 1px;
  text-transform: uppercase;
  display: inline-block;
  background: rgba(245,158,11,.10);
  padding: 1px 6px;
  border-radius: 6px;
  margin-right: 6px;
  flex-shrink: 0;
}
.topmission-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.topmission-desc {
  display: none; /* Ocult per defecte; només s'expandeix al hover */
}
.topmission-bar:hover .topmission-title {
  white-space: normal;
}
.topmission-action {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font);
  white-space: nowrap;
  transition: .2s;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.topmission-action:hover {
  background: #3d6dee;
  transform: translateY(-1px);
}
.topmission-reward {
  font-size: 10px;
  color: var(--gold);
  font-weight: 700;
  padding: 2px 7px;
  background: rgba(245,158,11,.10);
  border: 1px solid rgba(245,158,11,.20);
  border-radius: 5px;
  white-space: nowrap;
  flex-shrink: 0;
}
.topmission-bar.completed {
  background: linear-gradient(90deg, rgba(16,185,129,.10), rgba(16,185,129,.05));
  border-bottom-color: rgba(16,185,129,.20);
}
.topmission-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--gold));
  transition: width .5s ease;
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

// ★★★ Mapeo de cada missió a la pestanya on es completa ★★★
const MISSION_TO_TAB = {
  M01: 'setup',         // Crear empresa
  M02: 'hr',            // Contractar empleat
  M03: 'finances',      // Demanar préstec
  M04: 'sales',         // Primer client
  M05: 'production',    // Comprar màquina
  M06: 'marketing',     // Inversió màrqueting
  M07: 'hr',            // 5 empleats
  M08: 'dashboard',     // Setmanes positives (només cal avançar)
  M09: 'sales',         // Conquereix el Vallès
  M10: 'finances',      // Caixa forta (gestió general)
  M11: 'trade',         // Exportar
  M12: 'borsa',         // Inversió a borsa
  M13: 'dashboard',     // 52 setmanes (només avançar)
  M14: 'dashboard',     // Magnata (objectiu global)
};

// ★★★ Barra de missió persistent sota el topbar ★★★
function renderMissionBar() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) {
    const existing = document.getElementById('mission-bar');
    if (existing) existing.remove();
    return;
  }
  initMissions(gd);
  
  const ms = gd.missions;
  const totalMissions = MISSIONS.length;
  const completedCount = ms.completed.length;
  const progressPct = (completedCount / totalMissions) * 100;
  
  // Trobar la missió activa actual
  const activeMissionId = ms.active.find(mid => !ms.completed.includes(mid));
  const mission = MISSIONS.find(m => m.id === activeMissionId);
  
  // Buscar o crear la barra
  let bar = document.getElementById('mission-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'mission-bar';
    bar.className = 'topmission-bar';
    // Inserir-la JUST després del topbar
    const topbar = document.querySelector('.topbar');
    if (topbar && topbar.parentNode) {
      topbar.parentNode.insertBefore(bar, topbar.nextSibling);
    } else {
      // Si no hi ha topbar, no podem inserir-la
      return;
    }
  }
  
  // Si totes les missions estan completades
  if (!mission) {
    bar.className = 'topmission-bar completed';
    bar.innerHTML = `
      <span class="topmission-icon">👑</span>
      <span class="topmission-label" style="background:rgba(16,185,129,.10);color:var(--green)">COMPLETAT</span>
      <span class="topmission-title">Ets un/a mestre/a empresarial! ${completedCount}/${totalMissions} missions ✓</span>
    `;
    return;
  }
  
  const tab = MISSION_TO_TAB[mission.id] || 'dashboard';
  const rewardText = (mission.xp ? `+${mission.xp}XP` : '') 
    + (mission.reward?.cash ? ` +${fmt(mission.reward.cash)}€` : '')
    + (mission.reward?.prestigi ? ` +${mission.reward.prestigi}⭐` : '');
  
  bar.className = 'topmission-bar';
  // Format compacte: tot en una sola línia
  bar.innerHTML = `
    <span class="topmission-icon">${mission.icon}</span>
    <span class="topmission-label">M${completedCount+1}/${totalMissions}</span>
    <span class="topmission-title" title="${mission.desc.replace(/"/g,'&quot;')}"><strong>${mission.title}</strong> · ${mission.desc}</span>
    <span class="topmission-reward">🎁 ${rewardText}</span>
    <button class="topmission-action" onclick="window._goToMissionTab('${tab}')">
      ${tab === 'dashboard' ? '⏩ Avançar' : '→ Anar-hi'}
    </button>
    <div class="topmission-progress" style="width:${progressPct}%"></div>
  `;
}

// Funció global per navegar a la pestanya de la missió
window._goToMissionTab = function(tab) {
  if (tab === 'dashboard') {
    // Si la missió només requereix avançar setmanes, fes scroll cap al botó d'avançar
    const advBtn = document.querySelector('.week-advance-btn');
    if (advBtn) {
      advBtn.scrollIntoView({behavior:'smooth', block:'center'});
      advBtn.style.animation = 'missionPulse 0.6s ease 3';
      setTimeout(() => { advBtn.style.animation = ''; }, 2000);
    }
    return;
  }
  
  // Comprovar si la pestanya està bloquejada
  if (_lockedTabs && _lockedTabs.has(tab)) {
    const cond = TAB_UNLOCK_CONDITIONS[tab];
    showToast('🔒 Aquesta secció encara no està desbloquejada. ' + (cond?.desc || ''));
    return;
  }
  
  if (typeof window.showTab === 'function') {
    window.showTab(tab);
  }
};

window.renderMissionBar = renderMissionBar;

function initMissions(gd) {
  if (!gd.missions) {
    gd.missions = {
      completed: [],
      active: ['M01'],
      seen: [],
      // ★ Marca que indica si ja s'ha fet la "primera passada de calibració"
      _calibrated: false,
    };
  }
  
  // ★★★ FIX: PRIMERA PASSADA "DE CALIBRACIÓ" ★★★
  // Per a empreses ja existents (mode 'hired' o creades amb wizard amb empleats),
  // marquem TOTES les missions que ja es compleixen com a completades silenciosament,
  // SENSE donar XP ni mostrar modals. Així no es completen totes de cop quan l'usuari
  // entra per primera vegada.
  if (!gd.missions._calibrated) {
    // Recórrer missions en ordre i marcar com a "completades silenciosament" 
    // les que ja es compleixen al moment de la calibració
    const toCalibrate = ['M01']; // Comencem per M01
    const visited = new Set();
    
    while (toCalibrate.length > 0) {
      const mid = toCalibrate.shift();
      if (visited.has(mid)) continue;
      visited.add(mid);
      
      if (gd.missions.completed.includes(mid)) {
        // Ja completada — afegir desbloquejos
        const m = MISSIONS.find(x => x.id === mid);
        if (m) (m.unlocks||[]).forEach(u => toCalibrate.push(u));
        continue;
      }
      
      const mission = MISSIONS.find(m => m.id === mid);
      if (!mission) continue;
      
      try {
        // Si la missió ja es compleix, marcar com a completada SENSE recompensa
        if (mission.check(gd)) {
          gd.missions.completed.push(mid);
          // Treure de active si hi era
          gd.missions.active = gd.missions.active.filter(a => a !== mid);
          // Encadenar desbloquejos
          (mission.unlocks||[]).forEach(u => {
            toCalibrate.push(u);
            // Activar la propera missió
            if (!gd.missions.completed.includes(u) && !gd.missions.active.includes(u)) {
              gd.missions.active.push(u);
            }
          });
        } else {
          // No es compleix — activar-la per que sigui la propera missió real
          if (!gd.missions.active.includes(mid)) {
            gd.missions.active.push(mid);
          }
          // No continuar amb desbloquejos d'aquesta cadena fins que es compleixi
        }
      } catch(e) { /* ignore */ }
    }
    
    gd.missions._calibrated = true;
    console.log('🎯 Missions calibrades. Completades silenciosament:', gd.missions.completed.length);
  }
  
  // Assegurar que SEMPRE hi ha alguna missió activa (la primera no completada)
  const firstUncompleted = MISSIONS.find(m => !gd.missions.completed.includes(m.id));
  if (firstUncompleted && !gd.missions.active.includes(firstUncompleted.id)) {
    gd.missions.active.push(firstUncompleted.id);
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
  
  // ★ Si s'ha completat alguna missió, actualitzar la barra
  if (newCompleted) {
    setTimeout(() => renderMissionBar(), 100);
  }
  
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
  
  // ★★★ Unlock conditions REVISADES — més permissives ★★★
  // Filosofia: enganxar primer, complicar després
  sales:       { week: 2, label: 'Setmana 2', desc: 'Avança fins a la setmana 2 per desbloquejar Vendes' },
  borsa:       { week: 2, label: 'Setmana 2', desc: 'Avança fins a la setmana 2 — el que els alumnes voleu! 📈₿' },
  junta:       { week: 4, employees: 2, label: 'S4 + 2 empleats', desc: 'Setmana 4 amb 2 empleats per desbloquejar la Junta' },
  trade:       { week: 8, prestigi: 10, label: 'S8 + Prestigi 10', desc: 'Setmana 8 amb prestigi 10 per al Comerç Exterior' },
  franquicies: { week: 12, cash: 25000, label: 'S12 + 25k€', desc: 'Setmana 12 amb 25.000€ per desbloquejar Franquícies' },
  proveidors:  { week: 3, label: 'Setmana 3', desc: 'Avança fins a la setmana 3 per desbloquejar Proveïdors' },
  laborals:    { week: 6, employees: 3, label: 'S6 + 3 empleats', desc: 'Setmana 6 amb 3 empleats per a Relacions Laborals' },
  rdi:         { week: 10, prestigi: 10, label: 'S10 + Prestigi 10', desc: 'Setmana 10 amb prestigi 10 per desbloquejar R+D+I' },
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
      // ★ Mostrar el tab si abans estava ocult
      nav.style.display = '';
      _lockedTabs.delete(tabId);
      if (wasLocked) {
        justUnlocked.push(tabId);
      }
    } else {
      nav.classList.add('locked');
      // ★ MODE PRINCIPIANT: amagar completament els tabs bloquejats
      // així el menú lateral és menys aclaparador per a alumnes nous
      nav.style.display = 'none';
      _lockedTabs.add(tabId);
    }
  });
  
  // ★ Amagar separadors si tots els tabs del seu grup estan amagats ★
  // Si un nav-sep no té cap tab visible al seu costat, no cal mostrar-lo
  document.querySelectorAll('.nav-sep').forEach(sep => {
    let next = sep.nextElementSibling;
    let hasVisibleNext = false;
    while (next && !next.classList?.contains('nav-sep')) {
      if (next.classList?.contains('nav-btn') && next.style.display !== 'none') {
        hasVisibleNext = true; break;
      }
      next = next.nextElementSibling;
    }
    sep.style.display = hasVisibleNext ? '' : 'none';
  });
  
  // Animació de desbloquejat
  justUnlocked.forEach(tabId => {
    const nav = document.getElementById('nav-' + tabId);
    if (nav) {
      // ★ Animació "POOF" d'aparició + glow
      nav.style.animation = 'newTabPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      nav.style.borderColor = 'var(--green)';
      
      // Badge "NOU!" temporal
      const badge = document.createElement('div');
      badge.textContent = 'NOU';
      badge.style.cssText = 'position:absolute;top:-4px;right:-4px;background:linear-gradient(135deg,var(--green),#10dca3);color:#fff;font-size:8px;font-weight:800;padding:2px 5px;border-radius:8px;letter-spacing:0.5px;animation:moodBounce 1s ease-in-out infinite;z-index:5';
      nav.style.position = 'relative';
      nav.appendChild(badge);
      
      setTimeout(() => { 
        nav.style.borderColor = ''; 
        nav.style.animation = '';
        if (badge.parentNode) badge.remove();
      }, 8000);
    }
    showEventToast('🔓', 'Nova secció desbloquejada!', `Ara pots accedir a: ${tabId.toUpperCase()}`, true);
    if (window.playSfx) window.playSfx('success');
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

// ════════════════════════════════════════════════════════════
//  ★★★ MÒDUL J: AVANÇAR SETMANA AMB FEEDBACK EMOCIONAL ★★★
//  Transició dramàtica + recap visual + so
// ════════════════════════════════════════════════════════════

// — Sons sintètics generats amb Web Audio API (sense cap fitxer extern) —
let _audioCtx = null;
let _audioUnlocked = false;
function getAudio() {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return null; }
  }
  return _audioCtx;
}
// Desbloquejar àudio al primer clic/toc de l'usuari (Chrome policy)
function unlockAudio() {
  if (_audioUnlocked) return;
  const ctx = getAudio();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => { _audioUnlocked = true; }).catch(() => {});
  } else {
    _audioUnlocked = true;
  }
}
// Escoltar primera interacció per desbloquejar
['click', 'touchstart', 'keydown'].forEach(evt => {
  document.addEventListener(evt, unlockAudio, { once: false, capture: true });
});

function playSfx(type) {
  if (localStorage.getItem('sfx-disabled') === '1') return;
  const ctx = getAudio();
  if (!ctx) return;
  // Si encara no hi ha interacció de l'usuari, no intentem reproduir (evita spam a la consola)
  if (ctx.state === 'suspended' && !_audioUnlocked) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'cling') {
      // Cobrar: nota brillant
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'whoosh') {
      // Avançar setmana: swoosh greu
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'success') {
      // Èxit: arpegio ascendent ràpid
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0, now + i*0.06);
        g.gain.linearRampToValueAtTime(0.15, now + i*0.06 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + i*0.06 + 0.15);
        o.start(now + i*0.06); o.stop(now + i*0.06 + 0.15);
      });
      return;
    } else if (type === 'fail') {
      // Fallida: nota descendent greu
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'alert') {
      // Sirena d'alerta
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.15);
      osc.frequency.linearRampToValueAtTime(440, now + 0.30);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    }
  } catch(e) { /* silenci en cas d'error */ }
}
window.playSfx = playSfx;

// — Transició: pantalla "carregant setmana" —
function showWeekTransition(newWeek) {
  playSfx('whoosh');
  const existing = document.getElementById('week-transition');
  if (existing) existing.remove();
  
  const div = document.createElement('div');
  div.id = 'week-transition';
  div.className = 'week-transition';
  div.innerHTML = `
    <div class="week-transition-content">
      <div class="week-transition-icon">⏳</div>
      <div class="week-transition-text">Setmana ${newWeek}</div>
      <div class="week-transition-sub">Processant esdeveniments...</div>
    </div>
  `;
  document.body.appendChild(div);
}
function hideWeekTransition() {
  const el = document.getElementById('week-transition');
  if (el) {
    el.style.animation = 'fadeIn .3s ease reverse';
    setTimeout(() => el.remove(), 280);
  }
}

// — Recap: el "sobre" amb el resum de la setmana —
function showWeekRecap(before, after, diff, gd) {
  const existing = document.getElementById('week-recap');
  if (existing) existing.remove();
  
  // Calcular result setmanal aproximat
  const weekResult = Math.round(diff.cash);
  
  // Determinar mood emoji segons el resultat
  let mood, moodClass, moodLabel, sfx;
  if (weekResult >= 5000) { mood = '🚀'; moodClass = 'positive'; moodLabel = 'SETMANA INCREÏBLE'; sfx = 'success'; }
  else if (weekResult >= 1000) { mood = '😄'; moodClass = 'positive'; moodLabel = 'SETMANA BONA'; sfx = 'cling'; }
  else if (weekResult >= -500) { mood = '😐'; moodClass = 'neutral'; moodLabel = 'SETMANA NORMAL'; sfx = 'click'; }
  else if (weekResult >= -3000) { mood = '😟'; moodClass = 'negative'; moodLabel = 'SETMANA FLUIXA'; sfx = 'click'; }
  else { mood = '😱'; moodClass = 'negative'; moodLabel = 'SETMANA TERRIBLE'; sfx = 'fail'; }
  
  // Reproduir so
  setTimeout(() => playSfx(sfx), 200);
  
  // Construir llista d'esdeveniments d'aquesta setmana
  const events = [];
  
  // Ingressos / costos
  const rev = Math.round(after.monthly_revenue / 4.33);
  const costs = Math.round(after.monthly_costs / 4.33);
  if (rev > 0) {
    events.push({
      icon: '💰', text: `Ingressos cobrats`,
      value: `+${rev.toLocaleString('ca')}€`, type: 'good', cls: 'up',
    });
  }
  if (costs > 0) {
    events.push({
      icon: '💸', text: `Despeses pagades`,
      value: `-${costs.toLocaleString('ca')}€`, type: 'bad', cls: 'down',
    });
  }
  
  // Canvis de prestigi
  if (diff.prestigi > 0) {
    events.push({
      icon: '⭐', text: `Prestigi guanyat`,
      value: `+${diff.prestigi.toFixed(1)}`, type: 'good', cls: 'up',
    });
  } else if (diff.prestigi < -0.5) {
    events.push({
      icon: '⭐', text: `Prestigi perdut`,
      value: `${diff.prestigi.toFixed(1)}`, type: 'bad', cls: 'down',
    });
  }
  
  // Empleats nous
  if (diff.employees > 0) {
    events.push({
      icon: '👥', text: `Nous empleats incorporats`,
      value: `+${diff.employees}`, type: 'good', cls: 'up',
    });
  }
  
  // Notificacions noves importants (mostra fins a 2)
  const newNotifs = (gd.notifications||[]).slice(-diff.newNotifications);
  newNotifs.slice(0, 2).forEach(n => {
    events.push({
      icon: n.icon || '📋', text: n.title,
      value: '', type: n.urgent ? 'bad' : 'neutral', cls: '',
    });
  });
  
  // Avisos de penalització
  const breakdown = gd._lastRevenueBreakdown;
  if (breakdown && breakdown.avisos && breakdown.avisos.length > 0) {
    const critical = breakdown.avisos.find(a => a.severity === 'critic');
    if (critical) {
      events.push({
        icon: '🚨', text: critical.text,
        value: '', type: 'bad', cls: '',
      });
    }
  }
  
  // Si no hi ha cap event, missatge per defecte
  if (events.length === 0) {
    events.push({
      icon: '💤', text: 'Setmana sense esdeveniments destacats',
      value: '', type: 'neutral', cls: '',
    });
  }
  
  const recapDate = (() => {
    try {
      const d = new Date(gd.startDate || new Date());
      d.setDate(d.getDate() + (after.week - 1) * 7);
      return d.toLocaleDateString('ca-ES', {day:'numeric', month:'short', year:'numeric'});
    } catch(e) { return 'Setmana ' + after.week; }
  })();
  
  const div = document.createElement('div');
  div.id = 'week-recap';
  div.className = 'week-recap';
  div.innerHTML = `
    <div class="week-recap-card ${moodClass}">
      <div class="week-recap-header">
        <div class="week-recap-week">SETMANA ${after.week} · ANY ${gd.year}</div>
        <div class="week-recap-date">${recapDate}</div>
        <div class="week-recap-mood">${mood}</div>
        <div class="week-recap-result ${weekResult>=0?'up':'down'}">${weekResult>=0?'+':''}${weekResult.toLocaleString('ca')}€</div>
        <div class="week-recap-subtitle">${moodLabel}</div>
      </div>
      <div class="week-recap-events">
        ${events.map((e, i) => `
          <div class="week-recap-event ${e.type}" style="animation-delay:${i*0.08}s">
            <div class="week-recap-event-icon">${e.icon}</div>
            <div class="week-recap-event-text">${e.text}</div>
            ${e.value ? `<div class="week-recap-event-value ${e.cls}">${e.value}</div>` : ''}
          </div>
        `).join('')}
      </div>
      <button class="week-recap-continue" onclick="window._closeWeekRecap()">
        Continuar →
      </button>
      <div class="week-recap-tip">💡 Pots prémer Espai per avançar la setmana més ràpid</div>
    </div>
  `;
  document.body.appendChild(div);
  
  // Tancar amb clic al fons
  div.addEventListener('click', e => {
    if (e.target === div) window._closeWeekRecap();
  });
  
  // Tancar amb tecla Enter o Espai
  const closeOnKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      window._closeWeekRecap();
    }
  };
  document.addEventListener('keydown', closeOnKey, { once: true });
  window._weekRecapKeyHandler = closeOnKey;
}

window._closeWeekRecap = function() {
  const el = document.getElementById('week-recap');
  if (el) {
    el.style.animation = 'fadeIn .25s ease reverse';
    setTimeout(() => el.remove(), 240);
  }
  if (window._weekRecapKeyHandler) {
    document.removeEventListener('keydown', window._weekRecapKeyHandler);
    window._weekRecapKeyHandler = null;
  }
  playSfx('click');
};

// Botó per silenciar so (s'inserirà a la topbar)
window._toggleSfx = function() {
  const disabled = localStorage.getItem('sfx-disabled') === '1';
  localStorage.setItem('sfx-disabled', disabled ? '0' : '1');
  const btn = document.getElementById('sfx-toggle');
  if (btn) btn.textContent = disabled ? '🔊' : '🔇';
  if (disabled) playSfx('click');
};

// Inserir botó de so a la topbar (al costat del botó de perfil)
function injectSfxToggle() {
  if (document.getElementById('sfx-toggle')) return;
  const profileBtn = document.querySelector('.profile-btn');
  if (!profileBtn) return;
  const btn = document.createElement('button');
  btn.id = 'sfx-toggle';
  btn.className = 'profile-btn';
  btn.style.cssText = 'padding:6px 10px;min-width:auto';
  btn.title = 'Activar/desactivar sons';
  btn.textContent = localStorage.getItem('sfx-disabled') === '1' ? '🔇' : '🔊';
  btn.onclick = window._toggleSfx;
  profileBtn.parentNode.insertBefore(btn, profileBtn);
}


// ════════════════════════════════════════════════════════════
//  ★★★ MÒDUL K: NOTÍCIES DEL VALLÈS — Feed competitiu ★★★
//  Crea FOMO i visibilitat dels moviments dels companys
// ════════════════════════════════════════════════════════════

// Generar notícies basant-se en allStudents i el meu propi estat
function generateNewsItems() {
  const items = [];
  const G = getG();
  if (!G) return items;
  
  const gd = G.gameData;
  const myUid = G.uid;
  const allStudents = G.allStudents || [];
  const otherStudents = allStudents.filter(s => s && s.uid !== myUid && s.company);
  
  // ─── Notícies sobre companys ───
  otherStudents.forEach(s => {
    const cash = s.finances?.cash || 0;
    const rev = s.finances?.monthly_revenue || 0;
    const costs = s.finances?.monthly_costs || 0;
    const result = rev - costs;
    const week = s.week || 1;
    const empCount = (s.employees||[]).length;
    
    // Empresa molt rica
    if (cash >= 100000) {
      items.push({
        targetUid: s.uid,
        eventKey: 'rich100k_w' + week,
        avatar: s.company?.sectorData?.icon || '🏢',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'win',
        tag: 'BOOM',
        text: `<strong>${s.company?.name||'?'}</strong> supera els <strong>100.000€</strong> de tresoreria. Imperi en construcció!`,
        priority: 4,
      });
    } else if (cash >= 50000) {
      items.push({
        targetUid: s.uid,
        eventKey: 'rich50k_w' + week,
        avatar: s.company?.sectorData?.icon || '🏢',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'win',
        tag: 'TOP',
        text: `<strong>${s.company?.name||'?'}</strong> arriba a <strong>${(cash/1000).toFixed(0)}k€</strong> de tresoreria. Vigila la competència!`,
        priority: 3,
      });
    }
    
    // Empresa en crisi
    if (cash < 0) {
      items.push({
        targetUid: s.uid,
        eventKey: 'crisis_w' + week,
        avatar: '🚨',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'fail',
        tag: 'CRISI',
        text: `<strong>${s.company?.name||'?'}</strong> té tresoreria negativa (${cash.toLocaleString('ca')}€). Risc de fallida!`,
        priority: 4,
      });
    } else if (result < -2000) {
      items.push({
        targetUid: s.uid,
        eventKey: 'losses_w' + week,
        avatar: '📉',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'fail',
        tag: 'PÈRDUES',
        text: `<strong>${s.company?.name||'?'}</strong> perd <strong>${Math.abs(result).toLocaleString('ca')}€/mes</strong>. Què està passant?`,
        priority: 2,
      });
    }
    
    // Equip gran
    if (empCount >= 8) {
      items.push({
        targetUid: s.uid,
        eventKey: 'team8_w' + week,
        avatar: '👥',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'win',
        tag: 'EQUIP',
        text: `<strong>${s.company?.name||'?'}</strong> ja té <strong>${empCount} empleats</strong>. Negoci en expansió.`,
        priority: 2,
      });
    }
    
    // Prestigi alt
    if ((s.prestigi||0) >= 30) {
      items.push({
        targetUid: s.uid,
        eventKey: 'prestige30_w' + week,
        avatar: '⭐',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'win',
        tag: 'PRESTIGI',
        text: `<strong>${s.company?.name||'?'}</strong> arriba a <strong>${(s.prestigi||0).toFixed(0)} de prestigi</strong>. Reputació top.`,
        priority: 1,
      });
    }
    
    // Té cartera d'inversions
    const stocks = Object.keys(s.portfolio?.stocks||{});
    const cryptos = Object.keys(s.portfolio?.crypto||{});
    if (stocks.length >= 3 || cryptos.length >= 2) {
      items.push({
        targetUid: s.uid,
        eventKey: 'investor_w' + week,
        avatar: stocks.length > cryptos.length ? '📈' : '₿',
        name: s.displayName,
        company: s.company?.name,
        time: `S${week}`,
        type: 'market',
        tag: cryptos.length > 0 ? 'CRIPTO' : 'BORSA',
        text: `<strong>${s.displayName}</strong> està invertint a <strong>${stocks.length+cryptos.length} actius</strong>. Diversificant!`,
        priority: 1,
      });
    }
  });
  
  // ─── Notícies pròpies (autoreferencials per crear context) ───
  if (gd.company) {
    const myCash = gd.finances?.cash || 0;
    const lb = gd._lastRevenueBreakdown;
    
    // Avisos de penalització
    if (lb && lb.avisos && lb.avisos.some(a => a.severity === 'critic')) {
      const crit = lb.avisos.find(a => a.severity === 'critic');
      items.push({
        avatar: '⚠️',
        name: 'Tu',
        company: gd.company?.name,
        time: `Ara`,
        type: 'fail',
        tag: 'TU · ATENCIÓ',
        text: `<strong>${crit.text}</strong>. Estàs perdent ingressos!`,
        priority: 5,
        isMe: true,
      });
    }
    
    // Comparativa amb la mitjana
    const myCashRank = otherStudents.filter(s => (s.finances?.cash||0) > myCash).length + 1;
    if (otherStudents.length >= 2) {
      if (myCashRank === 1) {
        items.push({
          avatar: '👑',
          name: 'Tu',
          company: gd.company?.name,
          time: `Ara`,
          type: 'win',
          tag: 'TU · LÍDER',
          text: `Ets el <strong>#1 en tresoreria</strong> de la classe! Mantén el ritme.`,
          priority: 3,
          isMe: true,
        });
      } else if (myCashRank <= 3) {
        items.push({
          avatar: '🥉',
          name: 'Tu',
          company: gd.company?.name,
          time: `Ara`,
          type: 'win',
          tag: 'TU · TOP 3',
          text: `Ets <strong>#${myCashRank}</strong> en tresoreria de la classe. Falta poc per al podi!`,
          priority: 2,
          isMe: true,
        });
      } else if (myCashRank > otherStudents.length / 2) {
        // Quart competidor per davant
        const sorted = [...otherStudents].sort((a,b) => (b.finances?.cash||0) - (a.finances?.cash||0));
        const next = sorted[Math.max(0, myCashRank - 2)];
        if (next && next.finances?.cash > myCash) {
          const diff = next.finances.cash - myCash;
          items.push({
            avatar: '🎯',
            name: 'Tu',
            company: gd.company?.name,
            time: `Ara`,
            type: 'event',
            tag: 'TU · OBJECTIU',
            text: `<strong>${next.displayName}</strong> et porta <strong>${diff.toLocaleString('ca')}€</strong> d'avantatge. Pots remuntar!`,
            priority: 3,
            isMe: true,
          });
        }
      }
    }
  }
  
  // ─── Notícies de mercat (context global) ───
  const week = gd?.week || 1;
  const marketNews = [
    { tag: 'BORSA', text: 'L\'IBEX35 obre amb pujades del <strong>+0.8%</strong>. Bon dia per invertir.', avatar: '📈' },
    { tag: 'CRIPTO', text: 'Bitcoin marca màxims setmanals. Volatilitat alta!', avatar: '₿' },
    { tag: 'ECONOMIA', text: 'L\'Euríbor baixa al <strong>2.65%</strong>. Préstecs més barats.', avatar: '🏦' },
    { tag: 'VALLÈS', text: 'Granollers anuncia subvencions per a empreses joves del Vallès.', avatar: '🏛️' },
    { tag: 'MERCAT', text: 'Augment de la demanda en el sector tecnològic aquest trimestre.', avatar: '📊' },
  ];
  if (week % 3 === 0 && marketNews.length > 0) {
    const mn = marketNews[week % marketNews.length];
    items.push({
      avatar: mn.avatar,
      name: 'El Periòdic del Vallès',
      company: '',
      time: `S${week}`,
      type: 'market',
      tag: mn.tag,
      text: mn.text,
      priority: 1,
    });
  }
  
  // Ordenar per prioritat (descendent) i limitar
  items.sort((a, b) => (b.priority||0) - (a.priority||0));
  return items.slice(0, 12);
}

function renderNewsFeed() {
  const items = generateNewsItems();
  
  if (items.length === 0) {
    return `
      <div class="news-feed">
        <div class="news-feed-header">
          <div class="news-feed-title">📰 Notícies del Vallès</div>
          <div class="news-feed-live">LIVE</div>
        </div>
        <div style="text-align:center;padding:30px;color:var(--text3);font-size:12px">
          Encara no hi ha notícies. Quan els companys juguin apareixeran aquí!
        </div>
      </div>`;
  }
  
  return `
    <div class="news-feed">
      <div class="news-feed-header">
        <div class="news-feed-title">📰 Notícies del Vallès <span style="font-size:10px;color:var(--text3);font-weight:400">${items.length} actualitzacions</span></div>
        <div class="news-feed-live">LIVE</div>
      </div>
      ${items.map((it, i) => `
        <div class="news-item" style="animation-delay:${i*0.05}s;${it.isMe?'background:rgba(79,127,255,.04);border-radius:10px;padding:12px;border-bottom:none;margin-bottom:6px':''}">
          <div class="news-avatar" style="${it.isMe?'background:linear-gradient(135deg,var(--accent),var(--gold))':''}">${it.avatar}</div>
          <div class="news-content">
            <div class="news-meta">
              <span class="news-name">${it.name}</span>
              ${it.company ? `<span style="font-size:10px;color:var(--text3)">· ${it.company}</span>` : ''}
              <span class="news-time" style="margin-left:auto">${it.time}</span>
            </div>
            <div class="news-text">
              <span class="news-tag ${it.type}">${it.tag}</span>
              ${it.text}
            </div>
            ${(!it.isMe && it.targetUid && it.eventKey && typeof window.renderReactionsBar === 'function') 
              ? window.renderReactionsBar(it.targetUid, it.eventKey) 
              : ''}
          </div>
        </div>
      `).join('')}
    </div>`;
}

// Inyectar el feed en el dashboard
function injectNewsFeed() {
  const dashWrap = document.querySelector('.dash-wrap');
  if (!dashWrap) return;
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return;
  
  let panel = document.getElementById('news-feed-inject');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'news-feed-inject';
    panel.style.marginTop = '10px';
    // Inserir-lo al final, abans del P2P (que és l'últim element)
    const p2p = document.getElementById('p2p-inject');
    if (p2p) dashWrap.insertBefore(panel, p2p);
    else dashWrap.appendChild(panel);
  }
  panel.innerHTML = renderNewsFeed();
}

window.renderNewsFeed = renderNewsFeed;
window.injectNewsFeed = injectNewsFeed;


// ════════════════════════════════════════════════════════════
//  ★★★ MÒDUL L: SISTEMA DE RATXES (STREAKS) ★★★
//  Setmanes positives consecutives — efecte 🔥 visible
// ════════════════════════════════════════════════════════════

function updateProfitStreak(gd, weekResult) {
  if (!gd._profitStreak) gd._profitStreak = { current: 0, best: 0 };
  
  if (weekResult >= 0) {
    gd._profitStreak.current = (gd._profitStreak.current || 0) + 1;
    if (gd._profitStreak.current > (gd._profitStreak.best || 0)) {
      gd._profitStreak.best = gd._profitStreak.current;
    }
    
    // Notificacions especials de ratxa
    const c = gd._profitStreak.current;
    if (c === 3) {
      showEventToast('🔥', 'Ratxa de 3 setmanes!', 'Tres setmanes positives seguides. Continua!', true);
      playSfx('cling');
    } else if (c === 5) {
      showEventToast('🔥🔥', 'Ratxa de 5!', 'Cinc setmanes en positiu. La maquinària funciona!', true);
      playSfx('success');
      gd.prestigi = (gd.prestigi||0) + 2;
    } else if (c === 10) {
      showEventToast('🔥🔥🔥', 'Ratxa LLEGENDÀRIA!', '10 setmanes en positiu. Ets una llegenda!', true);
      playSfx('success');
      gd.prestigi = (gd.prestigi||0) + 5;
    } else if (c % 5 === 0 && c > 10) {
      showEventToast('🔥', `Ratxa de ${c} setmanes!`, 'Increïble. Continues imparable.', true);
    }
  } else {
    // Trencament de ratxa
    if ((gd._profitStreak.current||0) >= 3) {
      showEventToast('💔', 'Ratxa trencada!', `Has perdut una ratxa de ${gd._profitStreak.current} setmanes. Recupera-la!`, false);
      playSfx('fail');
    }
    gd._profitStreak.current = 0;
  }
}

// Renderitzar badge de ratxa al topbar
function injectStreakBadge() {
  const gd = getG()?.gameData;
  if (!gd) return;
  
  const streak = gd._profitStreak?.current || 0;
  let badge = document.getElementById('streak-badge-inject');
  
  // Si no hi ha ratxa significativa, no mostrar
  if (streak < 2) {
    if (badge) badge.remove();
    return;
  }
  
  // Crear si no existeix
  if (!badge) {
    const weekDisplay = document.getElementById('week-display');
    if (!weekDisplay) return;
    badge = document.createElement('div');
    badge.id = 'streak-badge-inject';
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,rgba(245,158,11,.20),rgba(239,68,68,.18));border:1px solid rgba(245,158,11,.40);padding:5px 10px;border-radius:20px;font-size:11px;font-weight:800;color:var(--gold);font-family:var(--font);margin-right:8px;animation:moodBounce 1.5s ease-in-out infinite;cursor:default';
    badge.title = 'Setmanes consecutives en positiu';
    weekDisplay.parentNode.insertBefore(badge, weekDisplay);
  }
  
  // Determinar emoji segons mida
  let fireIcon = '🔥';
  if (streak >= 10) fireIcon = '🔥🔥🔥';
  else if (streak >= 5) fireIcon = '🔥🔥';
  
  badge.innerHTML = `${fireIcon} <span style="font-family:'JetBrains Mono',monospace">${streak}</span>`;
}

window.injectStreakBadge = injectStreakBadge;


// ════════════════════════════════════════════════════════════
//  ★★★ MÒDUL M: SPLASH INICIAL — Rànquing en obrir sessió ★★★
//  El primer que veuen els alumnes = la seva posició
// ════════════════════════════════════════════════════════════

function showSessionSplash() {
  const G = getG();
  if (!G) return;
  const gd = G.gameData;
  if (!gd || !gd.mode || !gd.company) return;
  
  // Només mostrar un cop per sessió (no cada vegada que es renderitza)
  if (window._splashShown) return;
  window._splashShown = true;
  
  // Calcular el meu rànquing
  const allStudents = (G.allStudents || []).filter(s => s && s.company);
  
  // Si jo no apareixo a la llista (encara no s'ha sincronitzat), afegir-me
  if (!allStudents.find(s => s.uid === G.uid)) {
    allStudents.push(gd);
  }
  
  // Ordenar per cash (tresoreria) descendent
  const ranked = [...allStudents].sort((a, b) => 
    ((b.finances?.cash||0) - (a.finances?.cash||0))
  );
  
  // La meva posició
  const myPosition = ranked.findIndex(s => s.uid === G.uid) + 1;
  const myCash = gd.finances?.cash || 0;
  
  // Si sóc l'únic, no mostrar splash competitiu
  if (ranked.length < 2) {
    showSinglePlayerSplash();
    return;
  }
  
  // Trobar rival a perseguir (un per damunt) o defendre's de (un per sota)
  let rivalMsg = '';
  if (myPosition === 1) {
    const second = ranked[1];
    const lead = myCash - (second.finances?.cash||0);
    rivalMsg = `👑 Estàs al <strong>#1</strong>! <strong>${second.displayName}</strong> et persegueix amb una diferència de <strong>${lead.toLocaleString('ca')}€</strong>. Mantén el ritme!`;
  } else {
    const above = ranked[myPosition - 2]; // posició - 1 - 1 (índex base 0)
    const gap = (above.finances?.cash||0) - myCash;
    rivalMsg = `🎯 <strong>${above.displayName}</strong> (${above.company?.name||'?'}) et porta <strong>${gap.toLocaleString('ca')}€</strong> d'avantatge. Pots remuntar avui!`;
  }
  
  // Top 3 per al podi
  const top3 = ranked.slice(0, 3);
  while (top3.length < 3) top3.push(null);
  
  const podium = [
    { rank: 2, cls: 'silver', medal: '🥈', data: top3[1] },
    { rank: 1, cls: 'gold',   medal: '🥇', data: top3[0] },
    { rank: 3, cls: 'bronze', medal: '🥉', data: top3[2] },
  ];
  
  const positionEmoji = myPosition === 1 ? '🥇' : myPosition === 2 ? '🥈' : myPosition === 3 ? '🥉' : '#' + myPosition;
  const positionMood = myPosition === 1 ? '👑 LÍDER ABSOLUT' 
                     : myPosition <= 3 ? '🏆 AL PODI' 
                     : myPosition <= ranked.length / 2 ? '💪 EN LA LLUITA' 
                     : '🚀 A REMUNTAR';
  
  const splash = document.createElement('div');
  splash.id = 'session-splash';
  splash.className = 'session-splash';
  splash.innerHTML = `
    <div class="session-splash-card" onclick="event.stopPropagation()">
      <div class="splash-greeting">Benvingut/da de nou,</div>
      <div class="splash-name">${gd.displayName} 👋</div>
      
      <div class="splash-position">${positionEmoji}</div>
      <div class="splash-position-label">${positionMood} · ${ranked.length} EMPRESES</div>
      
      <div class="splash-podium">
        ${podium.map(p => `
          <div class="splash-podium-spot ${p.cls}">
            <div style="font-size:24px;margin-bottom:4px">${p.medal}</div>
            <div class="splash-podium-bar">${p.rank}</div>
            <div class="splash-podium-name">${p.data ? (p.data.uid === G.uid ? '<strong style="color:var(--accent)">TU</strong>' : (p.data.displayName||'?').split(' ')[0]) : '—'}</div>
            <div class="splash-podium-cash">${p.data ? Math.round((p.data.finances?.cash||0)/1000)+'k€' : '—'}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="splash-rival-msg">${rivalMsg}</div>
      
      <div class="splash-cta">
        <button class="splash-cta-secondary" onclick="window._closeSplash()">Tancar</button>
        <button class="splash-cta-primary" onclick="window._closeSplash();window.advanceWeek()">⏩ Avançar setmana</button>
      </div>
    </div>
  `;
  document.body.appendChild(splash);
  
  // Reproduir so motivador
  if (window.playSfx) {
    setTimeout(() => playSfx(myPosition <= 3 ? 'success' : 'cling'), 300);
  }
  
  splash.addEventListener('click', e => {
    if (e.target === splash) window._closeSplash();
  });
}

function showSinglePlayerSplash() {
  const G = getG();
  const gd = G?.gameData;
  if (!gd) return;
  
  const cash = gd.finances?.cash || 0;
  const week = gd.week || 1;
  
  const splash = document.createElement('div');
  splash.id = 'session-splash';
  splash.className = 'session-splash';
  splash.innerHTML = `
    <div class="session-splash-card" onclick="event.stopPropagation()">
      <div class="splash-greeting">Benvingut/da,</div>
      <div class="splash-name">${gd.displayName} 👋</div>
      
      <div style="font-size:60px;margin-bottom:8px">${gd.company?.sectorData?.icon||'🏢'}</div>
      <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px">${gd.company?.name||'La teva empresa'}</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:18px">Setmana ${week} · ${cash.toLocaleString('ca')}€ a tresoreria</div>
      
      <div class="splash-rival-msg" style="background:rgba(124,58,237,.08);border-color:rgba(124,58,237,.25)">
        ⏳ Encara no hi ha altres empreses a la classe. <strong>Quan els companys juguin, podràs competir-hi!</strong> Mentrestant, fes créixer la teva empresa.
      </div>
      
      <div class="splash-cta">
        <button class="splash-cta-secondary" onclick="window._closeSplash()">Tancar</button>
        <button class="splash-cta-primary" onclick="window._closeSplash();window.advanceWeek()">⏩ Avançar setmana</button>
      </div>
    </div>
  `;
  document.body.appendChild(splash);
  
  if (window.playSfx) setTimeout(() => playSfx('cling'), 300);
  
  splash.addEventListener('click', e => {
    if (e.target === splash) window._closeSplash();
  });
}

window._closeSplash = function() {
  const el = document.getElementById('session-splash');
  if (el) {
    el.style.animation = 'fadeIn .3s ease reverse';
    setTimeout(() => el.remove(), 280);
  }
  if (window.playSfx) playSfx('click');
};

window.showSessionSplash = showSessionSplash;


// ════════════════════════════════════════════════════════════
//  ★★★ MÒDUL N: APOSTES SETMANALS ★★★
//  Activa el gust pel risc i la competició
// ════════════════════════════════════════════════════════════

const BET_AMOUNT = 500; // Quantitat fixa per apostar

function generateWeeklyBet(gd) {
  if (!gd._weeklyBet) gd._weeklyBet = null;
  
  // Si ja hi ha aposta activa o ja s'ha fet aquesta setmana, no generar nova
  if (gd._weeklyBet && gd._weeklyBet.week === gd.week) return;
  
  const G = getG();
  const otherStudents = (G?.allStudents || []).filter(s => s && s.uid !== G.uid && s.company);
  
  // Necessitem almenys 1 altre alumne per generar apostes interessants
  if (otherStudents.length === 0) {
    gd._weeklyBet = null;
    return;
  }
  
  // Triar tipus d'aposta aleatori
  const types = ['ranking', 'bestWeek', 'classGrowth'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let bet = null;
  
  if (type === 'ranking') {
    // Triar un company aleatori
    const rival = otherStudents[Math.floor(Math.random() * otherStudents.length)];
    const myCash = gd.finances?.cash || 0;
    const rivalCash = rival.finances?.cash || 0;
    bet = {
      week: gd.week,
      type: 'ranking',
      icon: '⚔️',
      tag: 'DUEL',
      title: `Duel contra ${rival.displayName}`,
      question: `Qui tindrà més tresoreria al final de la setmana, tu o <strong>${rival.displayName}</strong> (${rival.company?.name||'?'})?`,
      rivalUid: rival.uid,
      rivalName: rival.displayName,
      rivalCash: rivalCash,
      myCash: myCash,
      options: [
        { id: 'me', icon: '😎', text: 'Jo guanyaré', payout: 'x2' },
        { id: 'them', icon: '🥋', text: rival.displayName.split(' ')[0]+' guanyarà', payout: 'x2' },
      ],
    };
  } else if (type === 'bestWeek') {
    bet = {
      week: gd.week,
      type: 'bestWeek',
      icon: '🏆',
      tag: 'PREDICCIÓ',
      title: 'Millor setmana de la classe',
      question: `Aquesta setmana, <strong>seré jo el qui guanyi més diners</strong> (resultat setmanal positiu) de tota la classe?`,
      options: [
        { id: 'yes', icon: '🚀', text: 'Sí, seré jo!', payout: 'x' + (otherStudents.length+1) },
        { id: 'no', icon: '🤷', text: 'No ho crec', payout: 'x1.3' },
      ],
    };
  } else if (type === 'classGrowth') {
    bet = {
      week: gd.week,
      type: 'classGrowth',
      icon: '📊',
      tag: 'TENDÈNCIA',
      title: 'Tendència de la classe',
      question: `Aquesta setmana, <strong>més de la meitat de la classe</strong> tindrà resultat positiu?`,
      options: [
        { id: 'yes', icon: '📈', text: 'Sí, anirem bé', payout: 'x1.8' },
        { id: 'no', icon: '📉', text: 'No, mala setmana', payout: 'x1.8' },
      ],
    };
  }
  
  gd._weeklyBet = bet;
}

function renderWeeklyBet() {
  const gd = getG()?.gameData;
  if (!gd || !gd._weeklyBet) return '';
  
  const bet = gd._weeklyBet;
  
  // Si ja s'ha resolt, mostrar el resultat
  if (bet.resolved) {
    const isWin = bet.won;
    return `
      <div class="bet-result ${isWin ? 'win' : 'lose'}">
        <div style="font-size:32px;margin-bottom:6px">${isWin ? '🎉' : '😔'}</div>
        <div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:${isWin?'var(--green)':'var(--red)'};margin-bottom:4px">
          ${isWin ? '✅ HAS GUANYAT L\'APOSTA' : '❌ Has perdut l\'aposta'}
        </div>
        <div style="font-size:12px;color:var(--text2)">${bet.title} · ${isWin ? '+' : '-'}${bet.payoutAmount.toLocaleString('ca')}€</div>
      </div>`;
  }
  
  // Si ja ha apostat però encara no s'ha resolt
  if (bet.choice) {
    const chosen = bet.options.find(o => o.id === bet.choice);
    return `
      <div class="bet-card" style="opacity:.85">
        <div class="bet-header">
          <span class="bet-icon">${bet.icon}</span>
          <div class="bet-title">${bet.title}</div>
          <span class="bet-tag" style="background:rgba(79,127,255,.20);color:var(--accent)">APOSTAT</span>
        </div>
        <div class="bet-question">
          ✅ Has apostat <strong>${BET_AMOUNT}€</strong> per: <strong style="color:var(--accent)">${chosen.icon} ${chosen.text}</strong>
        </div>
        <div style="font-size:11px;color:var(--text3);text-align:center">El resultat es resoldrà en avançar la setmana.</div>
      </div>`;
  }
  
  const cash = gd.finances?.cash || 0;
  const canBet = cash >= BET_AMOUNT;
  
  return `
    <div class="bet-card">
      <div class="bet-header">
        <span class="bet-icon">${bet.icon}</span>
        <div class="bet-title">${bet.title}</div>
        <span class="bet-tag">🎰 APOSTA · ${BET_AMOUNT}€</span>
      </div>
      <div class="bet-question">${bet.question}</div>
      ${canBet ? `
        <div class="bet-options">
          ${bet.options.map(o => `
            <div class="bet-option" onclick="window._placeBet('${o.id}')">
              <div class="bet-option-icon">${o.icon}</div>
              <div class="bet-option-text">${o.text}</div>
              <div class="bet-option-payout">Si guanyes: ${o.payout}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size:10px;color:var(--text3);text-align:center;margin-top:10px">⚠️ Aposta opcional · Risc: pots perdre els ${BET_AMOUNT}€</div>
      ` : `
        <div style="text-align:center;padding:14px;color:var(--text3);font-size:12px">
          Necessites almenys <strong style="color:var(--gold)">${BET_AMOUNT}€</strong> de tresoreria per apostar
        </div>
      `}
    </div>`;
}

window._placeBet = function(choiceId) {
  const gd = getG()?.gameData;
  if (!gd?._weeklyBet) return;
  if ((gd.finances?.cash||0) < BET_AMOUNT) {
    showToast('❌ Sense fons per apostar');
    return;
  }
  
  gd._weeklyBet.choice = choiceId;
  gd.finances.cash -= BET_AMOUNT; // Es paga al apostar
  
  showToast(`🎰 Has apostat ${BET_AMOUNT}€. Sort!`);
  if (window.playSfx) window.playSfx('cling');
  
  saveGameData();
  // Re-renderitzar el panel d'apostes
  if (typeof window.injectBetWidget === 'function') window.injectBetWidget();
};

function resolveWeeklyBet(gd) {
  if (!gd?._weeklyBet || !gd._weeklyBet.choice || gd._weeklyBet.resolved) return;
  
  const bet = gd._weeklyBet;
  const G = getG();
  const otherStudents = (G?.allStudents || []).filter(s => s && s.uid !== G.uid && s.company);
  let won = false;
  let payoutMult = 2;
  
  if (bet.type === 'ranking') {
    // Comprovar si tinc més cash que el rival
    const rival = otherStudents.find(s => s.uid === bet.rivalUid);
    if (!rival) {
      // Rival ha desaparegut, devolver l'aposta
      gd.finances.cash += BET_AMOUNT;
      bet.resolved = true; bet.won = false; bet.payoutAmount = 0;
      showEventToast('🎰', 'Aposta cancel·lada', 'El rival ha desaparegut. Diners retornats.', false);
      return;
    }
    const myWon = (gd.finances?.cash||0) > (rival.finances?.cash||0);
    won = (bet.choice === 'me' && myWon) || (bet.choice === 'them' && !myWon);
    payoutMult = 2;
  } else if (bet.type === 'bestWeek') {
    // Comprovar si he tingut el millor resultat
    const myResult = (gd.finances?.monthly_revenue||0) - (gd.finances?.monthly_costs||0);
    const allResults = otherStudents.map(s => (s.finances?.monthly_revenue||0) - (s.finances?.monthly_costs||0));
    const maxOther = Math.max(0, ...allResults);
    const iAmBest = myResult > maxOther;
    won = (bet.choice === 'yes' && iAmBest) || (bet.choice === 'no' && !iAmBest);
    payoutMult = bet.choice === 'yes' ? (otherStudents.length + 1) : 1.3;
  } else if (bet.type === 'classGrowth') {
    // Comprovar si > 50% han tingut resultat positiu
    const total = otherStudents.length + 1;
    const positives = otherStudents.filter(s => (s.finances?.monthly_revenue||0) > (s.finances?.monthly_costs||0)).length 
                    + (((gd.finances?.monthly_revenue||0) > (gd.finances?.monthly_costs||0)) ? 1 : 0);
    const majorityPositive = positives > total / 2;
    won = (bet.choice === 'yes' && majorityPositive) || (bet.choice === 'no' && !majorityPositive);
    payoutMult = 1.8;
  }
  
  bet.resolved = true;
  bet.won = won;
  
  if (won) {
    bet.payoutAmount = Math.round(BET_AMOUNT * payoutMult);
    gd.finances.cash += bet.payoutAmount;
    showEventToast('🎉', 'Aposta guanyada!', `+${bet.payoutAmount.toLocaleString('ca')}€ a tresoreria`, true);
    if (window.playSfx) playSfx('success');
    
    gd.notifications.push({
      id: Date.now()+Math.random(),
      icon: '🎰',
      title: 'Aposta guanyada!',
      desc: `${bet.title}: +${bet.payoutAmount.toLocaleString('ca')}€`,
      time: `S${gd.week}`,
      urgent: false,
    });
  } else {
    bet.payoutAmount = BET_AMOUNT; // El que has perdut
    showEventToast('💸', 'Aposta perduda', `Has perdut els ${BET_AMOUNT}€ apostats`, false);
    if (window.playSfx) playSfx('fail');
    
    gd.notifications.push({
      id: Date.now()+Math.random(),
      icon: '🎰',
      title: 'Aposta perduda',
      desc: `${bet.title}: -${BET_AMOUNT}€`,
      time: `S${gd.week}`,
      urgent: false,
    });
  }
}

// Injectar widget d'apostes al dashboard (sota el news feed)
function injectBetWidget() {
  const gd = getG()?.gameData;
  if (!gd || !gd.mode) return;
  
  // Generar aposta si no hi ha cap per aquesta setmana
  generateWeeklyBet(gd);
  
  // Si segueix sense haver-hi (cap company), no mostrar res
  if (!gd._weeklyBet) {
    const ex = document.getElementById('bet-widget-inject');
    if (ex) ex.remove();
    return;
  }
  
  const dashWrap = document.querySelector('.dash-wrap');
  if (!dashWrap) return;
  
  let widget = document.getElementById('bet-widget-inject');
  if (!widget) {
    widget = document.createElement('div');
    widget.id = 'bet-widget-inject';
    // Insertar després del news feed (o al final)
    const newsInject = document.getElementById('news-feed-inject');
    if (newsInject && newsInject.nextSibling) {
      dashWrap.insertBefore(widget, newsInject.nextSibling);
    } else if (newsInject) {
      newsInject.parentNode.insertBefore(widget, newsInject.nextSibling);
    } else {
      dashWrap.appendChild(widget);
    }
  }
  widget.innerHTML = renderWeeklyBet();
}

window.injectBetWidget = injectBetWidget;
window.resolveWeeklyBet = resolveWeeklyBet;


// ════════════════════════════════════════════════════════════
//  HOOKS AL JOC PRINCIPAL
// ════════════════════════════════════════════════════════════

let _hooked = false;

function hookGameFunctions() {
  if (_hooked) return;
  
  // Esperar que window.advanceWeek existeixi
  if (typeof window.advanceWeek !== 'function') return;
  if (typeof window.renderDashboard !== 'function') return;
  
  _hooked = true;
  console.log('🎮 Hooking advanceWeek i renderDashboard...');
  
  // Hook a advanceWeek — ★ AMB RECAP DRAMÀTIC ★
  const originalAdvanceWeek = window.advanceWeek;
  window.advanceWeek = async function() {
    // Comprovar si hi ha event interactiu pendent
    if (window._currentInteractiveEvent) {
      showToast('⚠️ Has de resoldre l\'esdeveniment primer!');
      return;
    }
    
    const gd = getG()?.gameData;
    if (!gd) return;
    
    // ★ Capturar estat ABANS d'avançar ★
    const before = {
      week: gd.week,
      cash: gd.finances?.cash || 0,
      monthly_revenue: gd.finances?.monthly_revenue || 0,
      monthly_costs: gd.finances?.monthly_costs || 0,
      prestigi: gd.prestigi || 0,
      employees: (gd.employees||[]).length,
      clients: (gd.clients||[]).length,
      notifications: (gd.notifications||[]).length,
    };
    
    // Mostrar pantalla de "carregant setmana" (suspense breu)
    showWeekTransition(before.week + 1);
    
    // Esperar 700ms perquè es vegi l'animació de transició
    await new Promise(r => setTimeout(r, 700));
    
    await originalAdvanceWeek.call(this);
    
    if (!gd) return;
    
    // ★ Capturar estat DESPRÉS i calcular diferències ★
    const after = {
      week: gd.week,
      cash: gd.finances?.cash || 0,
      monthly_revenue: gd.finances?.monthly_revenue || 0,
      monthly_costs: gd.finances?.monthly_costs || 0,
      prestigi: gd.prestigi || 0,
      employees: (gd.employees||[]).length,
      clients: (gd.clients||[]).length,
      notifications: (gd.notifications||[]).length,
    };
    
    const diff = {
      cash: after.cash - before.cash,
      prestigi: after.prestigi - before.prestigi,
      employees: after.employees - before.employees,
      clients: after.clients - before.clients,
      newNotifications: Math.max(0, after.notifications - before.notifications),
    };
    
    // ★ Actualitzar ratxa de setmanes positives ★
    updateProfitStreak(gd, diff.cash);
    
    // ★ Resoldre aposta si n'hi havia ★
    resolveWeeklyBet(gd);
    
    // Treure la pantalla de transició i mostrar el RECAP
    hideWeekTransition();
    showWeekRecap(before, after, diff, gd);
    
    // Comprovar missions
    checkMissions(gd);
    
    // Trigger events interactius
    triggerInteractiveEvent(gd);
    
    // Trigger minijocs
    triggerMinigame(gd);
    
    // Actualitzar locks de tabs
    updateTabLocks();
    
    // Refrescar barra de missió i streak badge
    renderMissionBar();
    injectStreakBadge();
    
    // ★ Refrescar widget d'aposta (es generarà nova per la propera setmana) ★
    injectBetWidget();
    
    // Guardar
    await saveGameData();
  };

  // Hook a renderDashboard per injectar missions i leaderboard
  const originalRenderDashboard = window.renderDashboard;
  window.renderDashboard = function() {
    originalRenderDashboard();
    injectDashboardExtras();
    renderMissionBar(); // ★ Actualitzar barra de missió
    injectStreakBadge(); // ★ Mostrar badge ratxa al topbar
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
  
  // ★ Injectar feed de notícies del Vallès ★
  injectNewsFeed();
  
  // ★ Injectar widget d'apostes setmanals ★
  injectBetWidget();
  
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
    setTimeout(() => renderMissionBar(), 1100); // ★ Crear barra missió
    setTimeout(() => injectSfxToggle(), 1200);  // ★ Botó de so
    setTimeout(() => injectStreakBadge(), 1300); // ★ Badge ratxa
    
    // ★ Splash de benvinguda — només si l'empresa ja existia abans (no Quick Start nou) ★
    // Detectem que és una empresa "ja madura" si té més d'una setmana o té dades acumulades
    if (gd.week > 1 || (gd.finances?.revenue_history||[]).length > 0) {
      setTimeout(() => showSessionSplash(), 1500);
    }
    
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
