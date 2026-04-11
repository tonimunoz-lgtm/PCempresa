// ============================================================
//  ui-laborals.js  —  Relacions laborals, vagues i negociació
// ============================================================
const getG = () => window.G;
const saveGameData   = (...a) => window.saveGameData(...a);
const showToast      = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt = (...a) => window.fmt(...a);

// Possibles reclamacions dels treballadors
const RECLAMACIONS_POOL = [
  { id:'sou',    titol:'Augment salarial',          desc:'Els treballadors reclamen un augment del SMI+3% per cobrir l\'IPC.',      cost_perc:0.05, importancia:'alta'  },
  { id:'jorn',   titol:'Reducció jornada laboral',  desc:'Proposta de reducció a 37,5 hores setmanals sense reducció salarial.',    cost_perc:0.04, importancia:'alta'  },
  { id:'tele',   titol:'Teletreball parcial',       desc:'Demanen 2 dies de teletreball per setmana pels llocs compatibles.',        cost_perc:0.01, importancia:'mitja' },
  { id:'vacces', titol:'Millora del conveni',       desc:'Actualització del conveni col·lectiu: millors condicions de conciliació.', cost_perc:0.03, importancia:'alta'  },
  { id:'segure', titol:'Millora PRL i seguretat',   desc:'Inversió en equips de protecció i millora condicions ergonòmiques.',      cost_perc:0.02, importancia:'mitja' },
  { id:'form',   titol:'Pla de formació',           desc:'Sol·liciten un pla de formació contínua i certificacions.',               cost_perc:0.015,importancia:'baixa' },
  { id:'bonus',  titol:'Participació beneficis',    desc:'Reclamen participació en beneficis: 5% del resultat net repartit.',       cost_perc:0.05, importancia:'alta'  },
];

window.renderLaborals = function renderLaborals() {
  const gd = getG()?.gameData;
  if (!gd) return;
  if (!gd?.company) {
    document.getElementById('tab-laborals').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">⚖️</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Sense empresa activa</div>
      </div>`;
    return;
  }

  const lr = gd.laborRelations || { satisfaccio: 72, convenis: [], negociacio: null, vaga: null };
  const emps = gd.employees || [];
  const avgMorale = emps.length > 0 ? Math.round(emps.reduce((s,e)=>s+(e.morale||70),0)/emps.length) : 70;
  const satColor = lr.satisfaccio >= 70 ? 'var(--green)' : lr.satisfaccio >= 50 ? 'var(--gold)' : 'var(--red)';
  const vagaActiva = lr.vaga?.activa;

  document.getElementById('tab-laborals').innerHTML = `
  <div style="padding:16px;max-width:900px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">⚖️ Relacions Laborals</h2>
        <div style="font-size:12px;color:var(--text2)">Clima laboral i negociació col·lectiva</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <div class="tstat" style="${lr.satisfaccio<50?'border-color:rgba(239,68,68,.4)':''}">
          😊 Satisfacció: <span class="tstat-v" style="color:${satColor}">${lr.satisfaccio}%</span>
        </div>
        <div class="tstat">🧠 Moral: <span class="tstat-v">${avgMorale}%</span></div>
      </div>
    </div>

    ${vagaActiva ? renderVagaActiva(lr.vaga, gd) : ''}

    ${lr.negociacio && !vagaActiva ? renderNegociacioActiva(lr.negociacio, gd) : ''}

    <!-- Estat general -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div class="section-card">
        <div class="section-title">🌡️ Termòmetre laboral</div>
        <div style="margin-bottom:10px">
          <div style="height:20px;background:rgba(255,255,255,.08);border-radius:10px;overflow:hidden;position:relative">
            <div style="height:100%;background:linear-gradient(90deg,var(--red),var(--gold),var(--green));width:${lr.satisfaccio}%;border-radius:10px;transition:.5s"></div>
            <div style="position:absolute;top:50%;left:${lr.satisfaccio}%;transform:translate(-50%,-50%);font-size:10px;font-weight:800;color:#fff">${lr.satisfaccio}%</div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:3px">
            <span>Vaga imminent</span><span>Neutral</span><span>Excel·lent</span>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text2);line-height:1.8">
          Empleats: <strong style="color:var(--text)">${emps.length}</strong><br>
          Convenis actius: <strong style="color:var(--accent)">${(lr.convenis||[]).length}</strong><br>
          Sindicat: <strong style="color:${lr.sindicat?'var(--gold)':'var(--text3)'}">${lr.sindicat||'Sense representació sindical'}</strong>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">📋 Accions disponibles</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${!lr.negociacio && !vagaActiva ? `
            <button class="btn-primary" style="font-size:12px;text-align:left" onclick="openNovaConvocatoria()">
              📢 Convocar mesa de negociació
            </button>` : ''}
          <button class="btn-secondary" style="font-size:12px;text-align:left" onclick="openPlaFormacio()">
            🎓 Llançar pla de formació
          </button>
          <button class="btn-secondary" style="font-size:12px;text-align:left" onclick="openBonusEspecial()">
            🎁 Bonus extraordinari (puja moral)
          </button>
          ${lr.satisfaccio < 50 && !lr.negociacio ? `
            <div class="danger-box" style="margin-top:4px;font-size:11px">
              ⚠️ Satisfacció crítica! Risc de vaga. Obre una negociació.
            </div>` : ''}
        </div>
      </div>
    </div>

    <!-- Historial de convenis -->
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-title">📜 Convenis i acords signats</div>
      ${(lr.convenis||[]).length === 0
        ? `<div style="color:var(--text2);font-size:12px;text-align:center;padding:16px">Sense acords firmats. La negociació col·lectiva millora el clima laboral.</div>`
        : (lr.convenis||[]).slice().reverse().map(c => `
          <div style="padding:10px;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:8px;margin-bottom:8px;font-size:12px">
            <div style="font-weight:700;color:var(--text)">${c.titol}</div>
            <div style="color:var(--text2);margin-top:3px">${c.desc}</div>
            <div style="display:flex;gap:12px;margin-top:4px;font-size:10px;color:var(--text3)">
              <span>Signat: S${c.week}</span>
              <span>Cost: +${c.cost_perc ? (c.cost_perc*100).toFixed(1)+'%' : '0%'} nòmines</span>
              <span style="color:var(--green)">+${c.sat_gain||10}% satisfacció</span>
            </div>
          </div>`).join('')}
    </div>

    <!-- Possibles reivindicacions -->
    <div class="section-card">
      <div class="section-title">📣 Reivindicacions del comitè d'empresa</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px">
        ${lr.satisfaccio < 60
          ? '⚠️ El comitè d\'empresa ha presentat les següents reivindicacions. Ignorar-les pot derivar en vaga.'
          : 'Els treballadors mantenen reivindicacions obertes. Atendre-les millora el clima laboral.'}
      </div>
      ${getReivindicacionsActives(lr, gd).map((r, i) => `
        <div style="padding:12px;background:rgba(255,255,255,.03);border:1px solid ${lr.satisfaccio<50?'rgba(239,68,68,.3)':'var(--border)'};border-radius:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-weight:700;font-size:13px;color:var(--text)">${r.titol}</div>
              <div style="font-size:11px;color:var(--text2);margin-top:3px">${r.desc}</div>
              <div style="font-size:10px;margin-top:5px">
                <span style="color:${r.importancia==='alta'?'var(--red)':r.importancia==='mitja'?'var(--gold)':'var(--text3)'}">
                  Importància: ${r.importancia.toUpperCase()}
                </span>
                <span style="color:var(--text3);margin-left:10px">Cost estimat: +${(r.cost_perc*100).toFixed(1)}% nòmines</span>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;margin-left:10px">
              <button class="emp-btn promote" onclick="acceptarReivindicacio('${r.id}')">Acceptar</button>
              <button class="emp-btn raise" onclick="negociarReivindicacio('${r.id}')">Negociar</button>
              <button class="emp-btn fire" onclick="rebutjarReivindicacio('${r.id}')">Rebutjar</button>
            </div>
          </div>
        </div>`).join('')}
      ${getReivindicacionsActives(lr, gd).length === 0 ? `<div style="color:var(--green);font-size:12px;text-align:center;padding:12px">✅ Sense reivindicacions pendents</div>` : ''}
    </div>
  </div>`;
}

function getReivindicacionsActives(lr, gd) {
  const satisfaccio = lr.satisfaccio || 72;
  const convSignats = (lr.convenis || []).map(c => c.id);
  let pool = RECLAMACIONS_POOL.filter(r => !convSignats.includes(r.id));
  if (satisfaccio >= 80) return pool.slice(0, 1); // Poca pressió
  if (satisfaccio >= 60) return pool.slice(0, 2);
  if (satisfaccio >= 40) return pool.slice(0, 4);
  return pool; // Molt mal clima: totes les reivindicacions
}

function renderNegociacioActiva(neg, gd) {
  const round = neg.round || 1;
  const maxRounds = 4;
  return `
  <div style="background:rgba(79,127,255,.08);border:1px solid rgba(79,127,255,.3);border-radius:14px;padding:18px;margin-bottom:14px">
    <div style="font-weight:800;font-size:15px;color:var(--accent);margin-bottom:10px">🔄 Negociació en curs — Ronda ${round}/${maxRounds}</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:14px">
      <strong style="color:var(--text)">Punt en discussió:</strong> ${neg.titol}<br>
      <strong style="color:var(--text)">Proposta comitè:</strong> ${neg.proposta_sindicat}<br>
      <strong style="color:var(--text)">Última contraoferta empresa:</strong> ${neg.proposta_empresa || 'Pendent primera oferta'}
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn-primary" style="font-size:12px;flex:1" onclick="ferContraofertaLaboral()">
        🤝 Fer contraoferta
      </button>
      <button class="btn-gold" style="font-size:12px;flex:1" onclick="acceptarConveni()">
        ✅ Acceptar condicions i signar
      </button>
      <button class="btn-danger" style="font-size:12px;flex:1" onclick="trencareNegociacio()">
        💥 Trencar negociació
      </button>
    </div>
    ${round >= maxRounds ? `<div class="danger-box" style="margin-top:10px;font-size:11px">
      ⚠️ Última ronda! Si no s'arriba a acord, el sindicat pot convocar vaga.</div>` : ''}
  </div>`;
}

function renderVagaActiva(vaga, gd) {
  const impactPct = Math.round((vaga.adherencia || 0.6) * 100);
  const costDiari  = Math.round((gd.finances?.monthly_revenue || 0) / 22 * (vaga.adherencia || 0.6));
  return `
  <div style="background:rgba(239,68,68,.12);border:2px solid rgba(239,68,68,.4);border-radius:14px;padding:18px;margin-bottom:14px;animation:pulseBorder 1.5s ease-in-out infinite alternate">
    <div style="font-weight:800;font-size:16px;color:var(--red);margin-bottom:8px">🔴 VAGA EN CURS — Dia ${vaga.dia_vaga || 1}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="ratio-box" style="border-color:rgba(239,68,68,.3)">
        <div class="ratio-val" style="color:var(--red)">${impactPct}%</div>
        <div class="ratio-label">Adherència vaga</div>
      </div>
      <div class="ratio-box" style="border-color:rgba(239,68,68,.3)">
        <div class="ratio-val" style="color:var(--red)">-${fmt(costDiari)}€</div>
        <div class="ratio-label">Pèrdua/dia</div>
      </div>
      <div class="ratio-box" style="border-color:rgba(239,68,68,.3)">
        <div class="ratio-val" style="color:var(--text)">${vaga.motiu?.split(' ').slice(0,2).join(' ')}</div>
        <div class="ratio-label">Motiu</div>
      </div>
    </div>
    <div class="danger-box" style="margin-bottom:12px">
      La producció s'ha reduït un ${impactPct}%. Cada dia de vaga costa aprox. ${fmt(costDiari)}€.
      Pots aturar la vaga acceptant les reivindicacions o esperant que s'esgoti.
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn-gold" style="flex:1;font-size:12px" onclick="acceptarPerAtutarVaga()">
        ✅ Acceptar reivindicacions i aturar vaga
      </button>
      <button class="btn-secondary" style="flex:1;font-size:12px" onclick="ignorarVaga()">
        ⏳ Aguantar (risc escalada)
      </button>
      <button class="btn-danger" style="flex:1;font-size:12px" onclick="serveisMinimsVaga()">
        🔒 Decretar serveis mínims
      </button>
    </div>
  </div>`;
}

// ---- Operacions ----
window.acceptarReivindicacio = async function(id) {
  const r = RECLAMACIONS_POOL.find(r => r.id === id);
  if (!r) return;
  const costExtra = Math.round((gd.finances?.monthly_costs||0) * r.cost_perc);
  if (!gd.laborRelations) gd.laborRelations = { satisfaccio:72, convenis:[], negociacio:null, vaga:null };
  gd.laborRelations.convenis.push({ id:r.id, titol:r.titol, desc:r.desc, cost_perc:r.cost_perc, sat_gain:15, week:gd.week });
  gd.laborRelations.satisfaccio = Math.min(100, (gd.laborRelations.satisfaccio||72) + 15);
  gd.laborRelations.negociacio = null;
  // Augmentar nòmines
  (gd.employees||[]).forEach(e => { e.salary = Math.round((e.salary||2000) * (1 + r.cost_perc)); e.morale = Math.min(100,(e.morale||70)+10); });
  await saveGameData();
  showToast(`✅ Reivindicació acceptada! Satisfacció +15%. Cost +${fmt(costExtra)}€/mes`);
  showEventToast('✅','Acord laboral signat!',`${r.titol} — Satisfacció dels treballadors millora.`, true);
  renderLaborals();
};

window.negociarReivindicacio = function(id) {
  const r = RECLAMACIONS_POOL.find(r=>r.id===id);
  if (!r) return;
  const gd = getG().gameData;
  if (!gd.laborRelations) gd.laborRelations = {satisfaccio:72,convenis:[],negociacio:null,vaga:null};
  gd.laborRelations.negociacio = {
    id: r.id, titol: r.titol, round: 1,
    proposta_sindicat: `${(r.cost_perc*100).toFixed(1)}% augment cost laboral`,
    proposta_empresa: null,
  };
  saveGameData();
  showToast('🤝 Mesa de negociació oberta');
  renderLaborals();
};

window.rebutjarReivindicacio = async function(id) {
  const r = RECLAMACIONS_POOL.find(r=>r.id===id);
  const gd = getG().gameData;
  if (!gd.laborRelations) gd.laborRelations = {satisfaccio:72,convenis:[],negociacio:null,vaga:null};
  const sat = gd.laborRelations.satisfaccio || 72;
  const newSat = Math.max(0, sat - (r?.importancia==='alta'?15:r?.importancia==='mitja'?8:4));
  gd.laborRelations.satisfaccio = newSat;
  if (newSat < 30) {
    // Risc de vaga!
    showEventToast('⚠️','Clima laboral crític!','La satisfacció dels treballadors és molt baixa. Risc de vaga imminent.', false);
    gd.laborRelations.vaga_imminent = true;
  }
  await saveGameData();
  showToast(`❌ Reivindicació rebutjada. Satisfacció -${sat-newSat}%`);
  renderLaborals();
};

window.ferContraofertaLaboral = function() {
  const gd = getG().gameData;
  const neg = gd.laborRelations?.negociacio;
  if (!neg) return;
  const r = RECLAMACIONS_POOL.find(r=>r.id===neg.id);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'contra-modal';
  modal.innerHTML = `
    <div class="modal-card narrow">
      <div class="modal-header">
        <span style="font-size:30px">🤝</span>
        <div><div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--text)">Contraoferta — ${neg.titol}</div>
        <div style="font-size:11px;color:var(--text2)">Sindicat demana: ${neg.proposta_sindicat}</div></div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="form-group2">
        <label>La teva proposta (% augment cost laboral)</label>
        <input class="form-input" id="contra-val" type="number" min="0" max="${(r?.cost_perc||0.05)*100}" step="0.5"
          value="${((r?.cost_perc||0.05)*100/2).toFixed(1)}" placeholder="Ex: 2.5">
      </div>
      <div class="form-group2">
        <label>Argumentació addicional</label>
        <textarea class="form-textarea" id="contra-text" placeholder="Ex: L'empresa necessita temps per implementar-ho progressivament..."></textarea>
      </div>
      <button class="btn-primary" style="width:100%" onclick="enviarContraofertaLaboral()">Enviar contraoferta</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.enviarContraofertaLaboral = async function() {
  const val = parseFloat(document.getElementById('contra-val')?.value || 0);
  document.getElementById('contra-modal')?.remove();
  const gd = getG().gameData;
  const neg = gd.laborRelations?.negociacio;
  if (!neg) return;
  const r = RECLAMACIONS_POOL.find(r=>r.id===neg.id);
  neg.proposta_empresa = `${val.toFixed(1)}% augment cost laboral`;
  neg.round = (neg.round||1) + 1;
  // Simulem resposta sindicat
  const ratioAcept = val / ((r?.cost_perc||0.05)*100);
  if (ratioAcept >= 0.7 || Math.random() < ratioAcept * 0.8) {
    // Accepta la contraoferta
    await acceptarConveniInternal(neg, val/100);
  } else if (neg.round >= 4) {
    // Última ronda: si no accepten → vaga
    showToast(`💥 El sindicat ha trencat les negociacions. Convocada VAGA!`);
    iniciarVaga(gd, neg);
    gd.laborRelations.negociacio = null;
    await saveGameData();
    renderLaborals();
  } else {
    showToast(`🔄 El sindicat no accepta. Nova ronda de negociació.`);
    gd.laborRelations.satisfaccio = Math.max(0, (gd.laborRelations.satisfaccio||72) - 5);
    await saveGameData();
    renderLaborals();
  }
};

window.acceptarConveni = async function() {
  const gd = getG().gameData;
  const neg = gd.laborRelations?.negociacio;
  if (!neg) return;
  const r = RECLAMACIONS_POOL.find(r=>r.id===neg.id);
  await acceptarConveniInternal(neg, r?.cost_perc || 0.03);
};

async function acceptarConveniInternal(neg, costPerc) {
  const gd = getG().gameData;
  gd.laborRelations.convenis.push({ id:neg.id, titol:neg.titol, cost_perc:costPerc, sat_gain:12, week:gd.week, desc:neg.proposta_empresa||neg.proposta_sindicat });
  gd.laborRelations.satisfaccio = Math.min(100,(gd.laborRelations.satisfaccio||72)+12);
  gd.laborRelations.negociacio = null;
  (gd.employees||[]).forEach(e => { e.salary = Math.round((e.salary||2000)*(1+costPerc)); e.morale = Math.min(100,(e.morale||70)+8); });
  await saveGameData();
  showToast(`✅ Conveni signat! Satisfacció +12%`);
  showEventToast('✅','Conveni col·lectiu signat!','Les dues parts han arribat a un acord. Bon clima laboral.',true);
  renderLaborals();
}

window.trencareNegociacio = async function() {
  const gd = getG().gameData;
  if (!gd.laborRelations) return;
  const neg = gd.laborRelations.negociacio;
  gd.laborRelations.negociacio = null;
  gd.laborRelations.satisfaccio = Math.max(0,(gd.laborRelations.satisfaccio||72)-20);
  // Alta probabilitat de vaga
  if (Math.random() < 0.75) {
    iniciarVaga(gd, neg);
    showEventToast('💥','VAGA CONVOCADA!','El sindicat ha convocat vaga per trencament de negociacions.',false);
  } else {
    showToast('❌ Negociació trencada. El sindicat es replanteja la situació.');
  }
  await saveGameData();
  renderLaborals();
};

function iniciarVaga(gd, neg) {
  const emps = gd.employees || [];
  const adherencia = 0.4 + Math.random() * 0.45; // 40-85%
  gd.laborRelations.vaga = {
    activa: true, dia_vaga: 1, adherencia,
    motiu: neg?.titol || 'Condicions laborals',
    reivindicacions: [neg?.id],
  };
  (gd.employees||[]).forEach(e => { if(Math.random()<adherencia) e.en_vaga = true; });
  gd.laborRelations.satisfaccio = Math.max(0,(gd.laborRelations.satisfaccio||72)-25);
}

window.acceptarPerAtutarVaga = async function() {
  const gd = getG().gameData;
  const vaga = gd.laborRelations?.vaga;
  if (!vaga) return;
  // Acceptar les reivindicacions que causaven la vaga
  const costPerc = 0.05;
  (gd.employees||[]).forEach(e => { e.en_vaga=false; e.salary=Math.round((e.salary||2000)*(1+costPerc)); e.morale=Math.min(100,(e.morale||70)+15); });
  gd.laborRelations.vaga = null;
  gd.laborRelations.satisfaccio = Math.min(100,(gd.laborRelations.satisfaccio||40)+25);
  gd.laborRelations.convenis.push({ id:'vaga_atur_'+Date.now(), titol:'Acord post-vaga', cost_perc:costPerc, sat_gain:25, week:gd.week, desc:'Acord d\'urgència per aturar la vaga.' });
  await saveGameData();
  showToast('✅ Vaga aturada. Acord signat. Nòmines +5%.');
  showEventToast('✅','Vaga aturada!','S\'ha arribat a un acord i els treballadors tornen a la feina.',true);
  renderLaborals();
};

window.ignorarVaga = async function() {
  const gd = getG().gameData;
  const vaga = gd.laborRelations?.vaga;
  if (!vaga) return;
  vaga.dia_vaga = (vaga.dia_vaga||1) + 7; // passa una setmana
  // Possibilitat que la vaga s'esgoti
  if (vaga.dia_vaga > 28 || Math.random() < 0.2) {
    vaga.activa = false;
    gd.laborRelations.vaga = null;
    (gd.employees||[]).forEach(e => { e.en_vaga=false; e.morale=Math.max(20,(e.morale||60)-15); });
    gd.laborRelations.satisfaccio = Math.max(10,(gd.laborRelations.satisfaccio||40)-10);
    showToast('⏳ La vaga s\'ha esgotat. Clima molt deteriorat.');
  } else {
    showToast(`⏳ Vaga continua — Dia ${vaga.dia_vaga}. Pèrdues acumulant-se.`);
  }
  await saveGameData();
  renderLaborals();
};

window.serveisMinimsVaga = async function() {
  const gd = getG().gameData;
  const vaga = gd.laborRelations?.vaga;
  if (!vaga) return;
  vaga.adherencia = Math.max(0.1, (vaga.adherencia||0.6) * 0.5);
  gd.laborRelations.satisfaccio = Math.max(5,(gd.laborRelations.satisfaccio||40)-15);
  await saveGameData();
  showToast('🔒 Serveis mínims decretats. Impacte reduït però relació molt deteriorada.');
  renderLaborals();
};

window.openNovaConvocatoria = function() {
  showToast('📢 Obre el panell de reivindicacions i tria una per negociar');
};

window.openPlaFormacio = async function() {
  const gd = getG().gameData;
  const cost = Math.round((gd.employees?.length||1) * 500);
  if (!confirm(`Pla de formació per a tots els empleats: ${fmt(cost)}€. Puja moral +8%.`)) return;
  gd.finances.cash -= cost;
  (gd.employees||[]).forEach(e => { e.morale = Math.min(100,(e.morale||70)+8); });
  gd.laborRelations = gd.laborRelations || {satisfaccio:72,convenis:[],negociacio:null};
  gd.laborRelations.satisfaccio = Math.min(100,(gd.laborRelations.satisfaccio||72)+5);
  await saveGameData();
  showToast(`🎓 Pla de formació llançat! -${fmt(cost)}€ · Moral +8%`);
  renderLaborals();
};

window.openBonusEspecial = async function() {
  const gd = getG().gameData;
  const bonus = Math.round((gd.employees||[]).reduce((s,e)=>s+(e.salary||2000),0) * 0.5);
  if (!confirm(`Bonus extraordinari equivalent a mitja mensualitat: ${fmt(bonus)}€. Moral +15%.`)) return;
  gd.finances.cash -= bonus;
  (gd.employees||[]).forEach(e => { e.morale = Math.min(100,(e.morale||70)+15); });
  gd.laborRelations = gd.laborRelations || {satisfaccio:72,convenis:[],negociacio:null};
  gd.laborRelations.satisfaccio = Math.min(100,(gd.laborRelations.satisfaccio||72)+10);
  await saveGameData();
  showToast(`🎁 Bonus pagat! -${fmt(bonus)}€ · Moral +15%`);
  renderLaborals();
};
