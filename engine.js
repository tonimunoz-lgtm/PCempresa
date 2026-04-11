// ============================================================
//  engine.js  —  Motor setmanal, economia i simulació
// ============================================================
import { G, saveGameData, showToast, showEventToast, EVENT_POOL } from './state.js';

export async function advanceWeek() {
  const gd = G.gameData;
  if (!gd.mode) { showToast('⚠️ Crea o incorpora\'t a una empresa primer!'); return; }

  gd.week++;
  const weekInYear = ((gd.week - 1) % 52) + 1;
  gd.month = Math.ceil(weekInYear / 4.33);

  const isNewYear = gd.week > 1 && (gd.week - 1) % 52 === 0;
  if (isNewYear) { gd.year++; endOfYear(gd); }

  // ---- Càlcul base ingressos ----
  const emps        = gd.employees || [];
  const salesEmps   = emps.filter(e => e.dept === 'vendes').length;
  const machines    = gd.machines || [];
  const capacity    = machines.reduce((s, m) => s + (m.capacity||0), 0);
  const mktChannels = gd.marketing?.channels || {};
  const mktSpend    = Object.values(mktChannels).reduce((s, v) => s + v, 0);
  const sponsors    = gd.marketing?.sponsors || [];
  const prest       = gd.prestigi || 0;
  const franchise   = gd.franchise;
  const tradeExp    = (gd.trade?.exports || []).reduce((s, e) => s + (e.weeklyValue||0), 0);

  // Base revenue
  let baseRev = 0;
  baseRev += capacity * 0.8 * 5;         // producció
  baseRev += salesEmps * 3500;           // vendes
  baseRev += mktSpend * 2.5;            // ROI marketing
  baseRev += prest * 50;                // prestigi
  baseRev += tradeExp;                  // exportacions

  // Sponsors multiplier
  sponsors.forEach(sid => {
    const sp = (await import('./state.js')).SPONSORS?.find(s => s.id === sid);
    if (sp) baseRev *= (1 + sp.sales_mult);
  });

  // Franquícia royalties rebuts (si som franquiciadors)
  if (franchise?.mode === 'franquiciador') {
    baseRev += (franchise.franchisees || 0) * franchise.royaltyWeekly;
  }
  // Franquícia royalties pagats (si som franquiciats)
  if (franchise?.mode === 'franquiciat') {
    // Es resta a les despeses
  }

  // ---- Events actius ----
  let revMult = 1;
  (gd.events || []).forEach(ev => { if (ev.weeksLeft > 0) revMult += ev.impact; });
  gd.events = (gd.events || []).map(ev => ({...ev, weeksLeft: ev.weeksLeft - 1})).filter(ev => ev.weeksLeft > 0);
  const weekRev = Math.max(0, baseRev * revMult);

  // ---- Costos ----
  const salaries     = emps.reduce((s, e) => s + (e.salary||0) * 1.30, 0) / 4.33;
  const rent         = (gd.company?.monthlyRent || 0) / 4.33;
  const maintenance  = machines.reduce((s, m) => s + (m.maintenance||0), 0) / 4.33;
  const loanPayments = (gd.finances.loans || []).reduce((s, l) => s + l.monthlyPayment / 4.33, 0);
  const mktWeeklyCost = mktSpend / 4.33;
  const importCosts  = (gd.trade?.imports || []).reduce((s, i) => s + (i.weeklyCost||0), 0);
  const franchRoyalty = (franchise?.mode === 'franquiciat')
    ? (weekRev * (franchise.royaltyRate||0.06)) : 0;

  const totalCosts = salaries + rent + maintenance + loanPayments + mktWeeklyCost + importCosts + franchRoyalty;
  const weekResult = weekRev - totalCosts;

  // ---- Actualitzar finances ----
  gd.finances.cash            = (gd.finances.cash || 0) + weekResult;
  gd.finances.monthly_revenue = weekRev * 4.33;
  gd.finances.monthly_costs   = totalCosts * 4.33;
  gd.finances.annual_revenue  = (gd.finances.annual_revenue || 0) + weekRev;
  gd.finances.annual_costs    = (gd.finances.annual_costs || 0) + totalCosts;
  gd.finances.actiu.tresoreria = gd.finances.cash;

  // Historial
  if (!gd.finances.revenue_history) gd.finances.revenue_history = [];
  gd.finances.revenue_history.push({ week: gd.week, rev: weekRev, costs: totalCosts, result: weekResult });
  if (gd.finances.revenue_history.length > 52) gd.finances.revenue_history.shift();

  // ---- Borsa i criptos: actualitzar preus ----
  updateMarketPrices(gd);

  // ---- Morale i seniority dels empleats ----
  emps.forEach(e => {
    e.morale = gd.finances.cash < 0
      ? Math.max(0,  (e.morale||60) - 3)
      : Math.min(100,(e.morale||60) + 1);
    e.seniority = (e.seniority || 0) + 1/52;
  });

  // ---- Accionistes: satisfacció ----
  (gd.shareholders || []).forEach(sh => {
    sh.satisfaction = weekResult >= 0
      ? Math.min(100, sh.satisfaction + 1)
      : Math.max(0,   sh.satisfaction - 3);
  });

  // ---- Captació de clients ----
  if (Math.random() < 0.15 + prest * 0.008 + salesEmps * 0.02) {
    const types = ['🏢 Empresa industrial','🏪 Comerç local','🏥 Centre mèdic','🏫 Centre educatiu','🏨 Hotel','🏗️ Constructora'];
    const cl = {
      id: 'cl_'+Date.now(), icon:'🤝',
      name: types[Math.floor(Math.random()*types.length)],
      type: Math.random()>0.4 ? 'B2B' : 'B2C',
      monthly_value: Math.round(500 + Math.random()*6000),
      satisfaction: 70 + Math.floor(Math.random()*25),
    };
    if (!gd.clients) gd.clients = [];
    gd.clients.push(cl);
    notify(gd,'🤝','Nou client!',`${cl.name} vol contractar els teus serveis!`, false);
    showEventToast('🤝','Nou client!',`${cl.name}`,true);
  }

  // ---- Pèrdua de clients insatisfets ----
  if (gd.clients?.length > 0) {
    gd.clients = gd.clients.filter(cl => {
      cl.satisfaction = Math.max(0, (cl.satisfaction||70) + (weekResult>=0 ? 1 : -4));
      if (cl.satisfaction < 20 && Math.random() < 0.4) {
        notify(gd,'💔','Client perdut!',`${cl.name} ha cancel·lat el contracte.`, true);
        showEventToast('💔','Client perdut!',cl.name, false);
        return false;
      }
      return true;
    });
  }

  // ---- Reclamació aleatòria ----
  if (gd.clients?.length > 0 && Math.random() < 0.07) {
    const cl = gd.clients[Math.floor(Math.random()*gd.clients.length)];
    const issues = ['Retard en el lliurament','Defecte en el producte','Error en la facturació','Mala atenció al client','Producte no conforme'];
    const issue = issues[Math.floor(Math.random()*issues.length)];
    if (!gd.claims) gd.claims = [];
    gd.claims.push({ id:'claim_'+Date.now(), client:cl.name, issue, compensation: Math.round(200+Math.random()*1500) });
    notify(gd,'⚠️','Reclamació!',`${cl.name}: ${issue}`, true);
    showEventToast('⚠️','Reclamació!',`${cl.name}: ${issue}`, false);
  }

  // ---- Junta d'accionistes (cada 13 setmanes / trimestre) ----
  if (gd.week % 13 === 0 && (gd.shareholders||[]).length > 0) {
    triggerBoardMeeting(gd, weekResult);
  }

  // ---- Ofertes de treball entrants (mode contractat) ----
  if (gd.mode === 'hired' && Math.random() < 0.03 + prest * 0.005) {
    notify(gd,'💼','Nova oferta de feina!','Una empresa et fa una proposta. Revisa la secció "Empresa".', false);
  }

  // ---- Esdeveniments aleatoris ----
  triggerRandomEvent(gd);

  // ---- Prestigi ----
  if (weekResult > 1000) gd.prestigi = Math.min(100, (gd.prestigi||0) + 0.15);
  else if (weekResult > 0) gd.prestigi = Math.min(100, (gd.prestigi||0) + 0.05);
  else if (weekResult < -5000) gd.prestigi = Math.max(0, (gd.prestigi||0) - 0.3);

  // ---- Insolvència ----
  if (gd.finances.cash < -100000) {
    notify(gd,'🚨','ALERTA: Concurs de creditors','Tresoreria crítica. Risc de suspensió de pagaments imminent!', true);
    showEventToast('🚨','Alerta financera!','Tresoreria críticament negativa!', false);
  }

  // ---- Accionistes acomiaden CEO si gestió molt dolenta ----
  if ((gd.shareholders||[]).some(sh => sh.satisfaction < 20) && weekResult < -20000) {
    notify(gd,'🚨','Junta d\'accionistes convocada','Els accionistes estan considerant relleu en la direcció.', true);
  }

  // Actualitzar UI
  document.getElementById('week-display').textContent = `S${gd.week} · ${gd.year}`;
  updateTopStats();
  import('./ui-dashboard.js').then(m => m.renderDashboard());
  import('./ui-finances.js').then(m => m.renderFinances());

  showToast(`⏩ S${gd.week} — ${weekResult >= 0 ? '+':''}${Math.round(weekResult).toLocaleString('ca')}€`);
  await saveGameData();
}

function endOfYear(gd) {
  const annualResult = (gd.finances.annual_revenue||0) - (gd.finances.annual_costs||0);
  const taxRate = gd.company?.legalForm === 'cooperativa' ? 0.20 : 0.25;
  const tax = Math.max(0, annualResult * taxRate);
  gd.finances.cash -= tax;
  gd.finances.passiu.reserves = (gd.finances.passiu.reserves||0) + Math.max(0, annualResult - tax);
  gd.finances.annual_revenue = 0;
  gd.finances.annual_costs   = 0;
  notify(gd,'📊',`Tancament exercici ${gd.year-1}`,
    `Resultat: ${annualResult.toFixed(0)}€ · IS pagat: ${tax.toFixed(0)}€ · Reserva: ${Math.max(0,annualResult-tax).toFixed(0)}€`, false);
  showEventToast('📊',`Tancament ${gd.year-1}`,`Resultat: ${annualResult.toFixed(0)}€`, annualResult>=0);
}

function updateMarketPrices(gd) {
  // Actualitzar preus d'accions en cartera
  const port = gd.portfolio || {};
  if (port.stocks) {
    Object.keys(port.stocks).forEach(ticker => {
      const holding = port.stocks[ticker];
      const shock = (Math.random() - 0.48) * holding.volatility * 2;
      holding.currentPrice = Math.max(0.01, holding.currentPrice * (1 + shock));
      holding.history = [...(holding.history||[]), holding.currentPrice].slice(-30);
    });
  }
  if (port.crypto) {
    Object.keys(port.crypto).forEach(symbol => {
      const holding = port.crypto[symbol];
      const shock = (Math.random() - 0.47) * holding.volatility * 2;
      holding.currentPrice = Math.max(0.001, holding.currentPrice * (1 + shock));
      holding.history = [...(holding.history||[]), holding.currentPrice].slice(-30);
    });
  }
}

function triggerRandomEvent(gd) {
  if (Math.random() > 0.12) return;
  const ev = EVENT_POOL[Math.floor(Math.random()*EVENT_POOL.length)];
  if (Math.random() > ev.prob * 3) return;
  const activeEv = {...ev, id:'ev_'+Date.now(), weeksLeft: Math.max(1, ev.duration||1)};
  if (!gd.events) gd.events = [];
  gd.events.push(activeEv);
  const impact = ev.impact>=0 ? `+${(ev.impact*100).toFixed(0)}%` : `${(ev.impact*100).toFixed(0)}%`;
  notify(gd, ev.icon, ev.title, `${ev.desc} (Impacte vendes: ${impact})`, ev.impact<0);
  showEventToast(ev.icon, ev.title, ev.desc, ev.impact>=0);
}

function triggerBoardMeeting(gd, weekResult) {
  const avgSat = (gd.shareholders||[]).reduce((s,sh) => s+sh.satisfaction,0) / (gd.shareholders.length||1);
  const qResult = (gd.finances.annual_revenue||0)/4 - (gd.finances.annual_costs||0)/4;
  let agenda = [];
  if (weekResult < 0) agenda.push({title:'Resultats negatius', desc:`Pèrdues de ${Math.abs(weekResult).toFixed(0)}€ setmanals. Es demanen explicacions.`, urgent:true});
  if (avgSat < 50)   agenda.push({title:'Descontentament accionistes', desc:`Satisfacció mitjana: ${avgSat.toFixed(0)}%. Risc d'intervenció.`, urgent:true});
  if (qResult > 0)   agenda.push({title:'Distribució de dividends', desc:`Proposta: distribuir el 30% del benefici trimestral.`, urgent:false});
  agenda.push({title:'Estratègia proper trimestre', desc:'Aprovació del pressupost i objectius.', urgent:false});
  if (!gd.boardDecisions) gd.boardDecisions = [];
  gd.boardDecisions.push({ week:gd.week, year:gd.year, agenda, avgSat: avgSat.toFixed(0), result: qResult });
  notify(gd,'🏛️','Junta trimestral convocada!','Els accionistes es reuniran. Revisa la secció Junta.', avgSat<50);
  showEventToast('🏛️','Junta d\'accionistes!',`Satisfacció: ${avgSat.toFixed(0)}%`, avgSat>=50);
}

function notify(gd, icon, title, desc, urgent) {
  if (!gd.notifications) gd.notifications = [];
  gd.notifications.push({ id:Date.now(), icon, title, desc, time:`S${gd.week}`, urgent, read:false });
  if (gd.notifications.length > 30) gd.notifications.shift();
}

export function updateTopStats() {
  const gd = G.gameData;
  if (!gd) return;
  const rev  = gd.finances?.monthly_revenue || 0;
  const costs = gd.finances?.monthly_costs   || 0;
  const res  = rev - costs;
  const el = id => document.getElementById(id);
  el('stat-date')   && (el('stat-date').textContent    = `S${gd.week} · ${gd.year}`);
  el('stat-cash')   && (el('stat-cash').textContent    = `${(gd.finances?.cash||0).toLocaleString('ca')}€`);
  el('stat-result') && (el('stat-result').textContent  = `${res>=0?'+':''}${res.toFixed(0)}€/mes`);
  el('stat-prest')  && (el('stat-prest').textContent   = (gd.prestigi||0).toFixed(1));
  el('stat-emp')    && (el('stat-emp').textContent     = gd.employees?.length || 0);
  const rStat = el('stat-result')?.parentElement;
  if (rStat) rStat.className = 'tstat ' + (res>=0 ? 'green':'red');
}
