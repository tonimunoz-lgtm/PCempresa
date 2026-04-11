// Accés a l'estat global i funcions via window (exposats per index.html)
const getG = () => window.G;
const saveGameData  = (...a) => window.saveGameData(...a);
const showToast     = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt  = (...a) => window.fmt(...a);
const fmtPct = (...a) => window.fmtPct(...a);


// ============================================================
//  ui-junta.js  —  Junta d'accionistes + Decisions corporatives
// ============================================================

export function renderJunta() {
  const gd = getG()?.gameData;
  if (!gd) return;
  if (!gd.company) {
    document.getElementById('tab-junta').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">🏛️</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Sense empresa activa</div>
        <div style="font-size:12px;margin-top:6px">Crea o incorpora't a una empresa per accedir a la Junta d'Accionistes.</div>
      </div>`;
    return;
  }

  const forma = gd.company?.legalForm;
  const shareholders = gd.shareholders || [];
  const myPct = Math.max(0, 1 - shareholders.reduce((s, sh) => s+sh.pct, 0));
  const decisions = gd.boardDecisions || [];
  const avgSat = shareholders.length > 0
    ? Math.round(shareholders.reduce((s, sh) => s+sh.satisfaction, 0) / shareholders.length) : 100;
  const lastMeeting = decisions[decisions.length-1];

  document.getElementById('tab-junta').innerHTML = `
  <div class="junta-wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">🏛️ Junta d'Accionistes</h2>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">${gd.company.name} · ${gd.company.legalFormName}</div>
      </div>
      <div style="display:flex;gap:8px">
        <div class="tstat">👥 Satisfacció: <span class="tstat-v" style="color:${avgSat>=70?'var(--green)':avgSat>=40?'var(--gold)':'var(--red)'}">${avgSat}%</span></div>
        <div class="tstat">🗳️ La teva part: <span class="tstat-v">${(myPct*100).toFixed(0)}%</span></div>
      </div>
    </div>

    ${forma === 'autonomia' ? renderAutonomNote() : renderJuntaContent(shareholders, myPct, avgSat, lastMeeting, decisions, gd)}
  </div>`;
}

function renderAutonomNote() {
  return `<div class="info-box">ℹ️ Com a <strong>autònom/a</strong>, ets l'únic titular de l'empresa. No hi ha accionistes ni junta. Si vols canviar la forma jurídica a SL o SA, has de contactar un notari i modificar l'escriptura de constitució.</div>`;
}

function renderJuntaContent(shareholders, myPct, avgSat, lastMeeting, decisions, gd) {
  return `
    <!-- Estructura accionariat -->
    <div class="section-card" style="margin-bottom:12px">
      <div class="section-title">📊 Estructura de l'accionariat</div>
      <div style="margin-bottom:10px">
        <div style="font-size:12px;color:var(--text2);margin-bottom:6px">Distribució del capital:</div>
        <div style="height:24px;border-radius:6px;overflow:hidden;display:flex;width:100%">
          <div style="background:var(--accent);width:${myPct*100}%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;padding:0 6px">
            Tu ${(myPct*100).toFixed(0)}%
          </div>
          ${shareholders.map((sh,i) => {
            const colors = ['#7c3aed','#10b981','#f59e0b','#ef4444','#06b6d4'];
            return `<div style="background:${colors[i%colors.length]};width:${sh.pct*100}%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;padding:0 4px">${(sh.pct*100).toFixed(0)}%</div>`;
          }).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <!-- Tu mateix -->
        <div class="junta-card" style="padding:12px">
          <div class="junta-header" style="margin-bottom:0">
            <div class="accionista-avatar" style="background:linear-gradient(135deg,var(--accent),var(--accent2))">👤</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:13px;color:var(--text)">${gd.displayName} (Tu)</div>
              <div style="font-size:11px;color:var(--text2)">Soci fundador · CEO · ${(myPct*100).toFixed(0)}% del capital</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:12px;font-weight:700;color:var(--gold)">${(myPct*100).toFixed(0)}%</div>
              <div style="font-size:10px;color:var(--text2)">Vots: ${(myPct*100).toFixed(0)}</div>
            </div>
          </div>
        </div>
        ${shareholders.map((sh, i) => {
          const colors = ['#7c3aed','#10b981','#f59e0b','#ef4444','#06b6d4'];
          const satColor = sh.satisfaction>=70?'var(--green)':sh.satisfaction>=40?'var(--gold)':'var(--red)';
          return `
          <div class="junta-card" style="padding:12px">
            <div class="junta-header" style="margin-bottom:8px">
              <div class="accionista-avatar" style="background:${colors[i%colors.length]}">${sh.icon}</div>
              <div style="flex:1">
                <div style="font-weight:700;font-size:13px;color:var(--text)">${sh.name}</div>
                <div style="font-size:11px;color:var(--text2)">${sh.type} · Estil: ${sh.style}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:12px;font-weight:700;color:var(--gold)">${(sh.pct*100).toFixed(0)}%</div>
                <div style="font-size:10px;color:${satColor}">Satisfacció: ${sh.satisfaction}%</div>
              </div>
            </div>
            <div style="display:flex;gap:8px;font-size:10px;color:var(--text2)">
              <span>⏳ Paciència: ${sh.patience}/10</span>
              <span>📉 Risc tolerat: ${sh.risk}</span>
              <span>🗳️ Vots: ${(sh.pct*100).toFixed(0)}</span>
            </div>
            ${sh.satisfaction < 40 ? `<div style="margin-top:8px;padding:6px 10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:6px;font-size:11px;color:#f87171">⚠️ Accionista descontento. Risc d'intervenció si persisteix.</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${shareholders.length === 0 ? `
        <div class="warn-box" style="margin-top:12px">
          ℹ️ L'empresa no té socis externs. Pots captar inversors a través de la secció de finances.
          <button class="btn-primary" style="margin-top:10px;width:100%" onclick="openAddShareholder()">+ Buscar inversors</button>
        </div>` : ''}
    </div>

    <!-- Ordre del dia / Decisions pendents -->
    <div class="section-card" style="margin-bottom:12px">
      <div class="section-title">📋 Ordre del dia — Decisions pendents</div>
      <div id="agenda-items">
        ${renderAgendaItems(gd, myPct)}
      </div>
      <button class="btn-secondary" style="width:100%;margin-top:10px;font-size:12px" onclick="addCustomAgendaItem()">+ Afegir punt a l'ordre del dia</button>
    </div>

    <!-- Historial de juntes -->
    <div class="section-card">
      <div class="section-title">🗂️ Historial de Juntes <span>${decisions.length} reunions</span></div>
      ${decisions.length === 0 ? `<div style="color:var(--text2);font-size:12px;text-align:center;padding:20px">Encara no hi ha hagut cap junta. La primera es convoca al cap de 13 setmanes.</div>` :
        decisions.slice().reverse().map(d => `
        <div style="padding:12px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="font-weight:700;font-size:13px;color:var(--text)">🏛️ Junta trimestral — S${d.week}/${d.year}</div>
            <div style="font-size:11px;color:${parseFloat(d.avgSat)>=50?'var(--green)':'var(--red)'}">Satisfacció: ${d.avgSat}%</div>
          </div>
          ${(d.agenda||[]).map(a => `
            <div style="font-size:11px;color:var(--text2);padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04)">
              ${a.urgent?'🔴':'🟢'} ${a.title}: ${a.desc}
            </div>`).join('')}
        </div>`).join('')}
    </div>
  `;
}

function renderAgendaItems(gd, myPct) {
  const items = [
    {
      id:'dividends', icon:'💰', title:'Distribució de dividends',
      desc:'Proposta de distribució del 20% dels beneficis acumulats.',
      type:'vote', options:['Aprovada','Rebutjada'],
      urgent: false, condition: (gd.finances?.passiu?.reserves||0) > 5000,
    },
    {
      id:'ampliacio', icon:'📈', title:'Ampliació de capital',
      desc:'Emissió de noves accions per finançar creixement. Dilueix accionistes actuals.',
      type:'vote', options:['Aprovada','Rebutjada','Ajornar'],
      urgent: false, condition: true,
    },
    {
      id:'relleu', icon:'👔', title:'Rellevament de la Direcció',
      desc:'Els accionistes consideren un canvi en la gestió de l\'empresa.',
      type:'vote', options:['Mantenir direcció','Canviar CEO'],
      urgent: (gd.shareholders||[]).some(sh=>sh.satisfaction<30),
      condition: (gd.shareholders||[]).some(sh=>sh.satisfaction<40),
    },
    {
      id:'fusion', icon:'🤝', title:'Explorar fusió/adquisició',
      desc:'Estudi de possibles operacions corporatives amb empreses del sector.',
      type:'vote', options:['Iniciar estudi','Descartar'],
      urgent: false, condition: (gd.finances?.cash||0) > 200000,
    },
    {
      id:'bonus', icon:'🎁', title:'Pla de retribució variable',
      desc:'Aprovació de bonus anuals per a la direcció i empleats clau.',
      type:'vote', options:['Aprovar','Modificar','Rebutjar'],
      urgent: false, condition: (gd.employees||[]).length > 5,
    },
  ].filter(i => i.condition);

  if (items.length === 0) return `<div style="color:var(--text2);font-size:12px;text-align:center;padding:16px">Sense punts pendents. Tot correcte ✅</div>`;

  return items.map(item => `
    <div class="agenda-item ${item.urgent?'urgent':''}" style="margin-bottom:8px">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <span style="font-size:22px">${item.icon}</span>
        <div style="flex:1">
          <div class="agenda-item-title">${item.urgent?'<span class="crisis-badge" style="margin-right:6px">URGENT</span>':''}${item.title}</div>
          <div class="agenda-item-desc">${item.desc}</div>
          ${item.type === 'vote' ? `
            <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
              ${item.options.map((opt,i) => `
                <button class="emp-btn ${i===0?'promote':i===1?'fire':'raise'}" onclick="voteDecision('${item.id}','${opt}')">${opt}</button>`).join('')}
            </div>` : ''}
        </div>
      </div>
    </div>`).join('');
}

window.voteDecision = async function(id, option) {
  const gd = getG().gameData;
  const shareholders = gd.shareholders || [];
  const myPct = Math.max(0, 1 - shareholders.reduce((s, sh) => s+sh.pct, 0));

  // Simulem vot dels accionistes
  let votesYes = myPct * 100;
  let votesNo = 0, votesAbs = 0;
  shareholders.forEach(sh => {
    const vote = Math.random();
    const threshold = sh.satisfaction / 100;
    if (vote < threshold * 0.7) votesYes += sh.pct * 100;
    else if (vote < threshold) votesAbs += sh.pct * 100;
    else votesNo += sh.pct * 100;
  });

  const approved = votesYes > 50;

  // Efectes de la decisió
  if (id === 'dividends' && option === 'Aprovada' && approved) {
    const amount = Math.round((gd.finances?.passiu?.reserves||0) * 0.20);
    gd.finances.cash -= amount;
    gd.finances.passiu.reserves = (gd.finances.passiu.reserves||0) - amount;
    shareholders.forEach(sh => { sh.satisfaction = Math.min(100, sh.satisfaction + 10); });
    showToast(`💰 Dividends distribuïts: ${fmt(amount)}€`);
  } else if (id === 'relleu' && option === 'Canviar CEO' && approved) {
    showEventToast('🚨','Acomiadament!','La junta ha votat relleu en la direcció. Has perdut el control executiu.', false);
    gd.notifications.push({id:Date.now(), icon:'🚨', title:'Acomiadament executiu', desc:'La junta ha votat en contra teu. Pots mantenir les accions però perds el control.', time:`S${gd.week}`, urgent:true});
  } else if (id === 'bonus' && option === 'Aprovar' && approved) {
    const bonus = (gd.employees||[]).length * 500;
    gd.finances.cash -= bonus;
    (gd.employees||[]).forEach(e => { e.morale = Math.min(100, (e.morale||60)+15); });
    showToast(`🎁 Bonus aprovats: ${fmt(bonus)}€. Moral dels empleats puja!`);
  }

  // Enregistrar decisió
  if (!gd.boardDecisions) gd.boardDecisions = [];
  gd.boardDecisions.push({
    week:gd.week, year:gd.year, type:id, option, approved,
    votesYes:votesYes.toFixed(0), votesNo:votesNo.toFixed(0),
    agenda:[{title:`Votació: ${id}`, desc:`Opció escollida: ${option}. Resultat: ${approved?'APROVADA':'REBUTJADA'}.`, urgent:false}],
    avgSat: (gd.shareholders||[]).length > 0
      ? (gd.shareholders.reduce((s,sh)=>s+sh.satisfaction,0)/gd.shareholders.length).toFixed(0) : '100',
  });

  await saveGameData();
  showToast(`🗳️ Decisió: ${option} — ${approved?'✅ Aprovada':'❌ Rebutjada'} (${votesYes.toFixed(0)}% a favor)`);
  renderJunta();
};

window.openAddShareholder = async function() {
  const gd = getG().gameData;
  const investors = [
    {name:'Fons Inversió Vallès SA',    icon:'🏦', type:'fons',    pct:0.15, capital:50000, patience:4, risk:'mig',   style:'equilibrat', satisfaction:70},
    {name:'Business Angel Sr. Puig',    icon:'👔', type:'angel',   pct:0.10, capital:30000, patience:6, risk:'mig',   style:'estratègic', satisfaction:75},
    {name:'Acceleradora TecVIC',        icon:'🚀', type:'venture', pct:0.20, capital:80000, patience:3, risk:'alt',   style:'agressiu',   satisfaction:80},
    {name:'Familia Roca (familiar)',    icon:'👨‍👩‍👧', type:'familiar',pct:0.08, capital:20000, patience:9, risk:'baix',  style:'conservador',satisfaction:85},
  ];

  // Mostrar modal
  const existing = document.getElementById('add-shareholder-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'add-shareholder-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span style="font-size:36px">💼</span>
        <div><div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text)">Captar Inversors</div>
        <div style="font-size:12px;color:var(--text2)">Diluiràs la teva participació a canvi de capital</div></div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      ${investors.map(inv => `
        <div class="offer-card" style="padding:14px;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:30px">${inv.icon}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px;color:var(--text)">${inv.name}</div>
              <div style="font-size:11px;color:var(--text2)">Injecció: ${fmt(inv.capital)}€ a canvi del ${(inv.pct*100)}% del capital</div>
              <div style="font-size:10px;color:var(--text3)">Paciència: ${inv.patience}/10 · Estil: ${inv.style}</div>
            </div>
            <button class="btn-primary" style="white-space:nowrap;font-size:12px;padding:8px 14px" onclick="acceptInvestor(${JSON.stringify(inv).replace(/"/g,'&quot;')})">Acceptar</button>
          </div>
        </div>`).join('')}
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.acceptInvestor = async function(inv) {
  const gd = getG().gameData;
  if (!gd.shareholders) gd.shareholders = [];
  gd.shareholders.push({...inv});
  gd.finances.cash += inv.capital;
  gd.finances.passiu.capital = (gd.finances.passiu.capital||0) + inv.capital;
  await saveGameData();
  document.getElementById('add-shareholder-modal')?.remove();
  showToast(`✅ ${inv.name} entra com a accionista. +${fmt(inv.capital)}€`);
  renderJunta();
};

window.addCustomAgendaItem = function() {
  showToast('📋 Funcionalitat disponible en la pròxima versió');
};
