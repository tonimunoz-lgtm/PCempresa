// ============================================================
//  ui-proveidors.js  —  Gestió completa de proveïdors
// ============================================================
const G = window.G;
const saveGameData   = (...a) => window.saveGameData(...a);
const showToast      = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt = (...a) => window.fmt(...a);

// Mercat de nous proveïdors potencials (es genera per sector)
const PROVEIDORS_MERCAT = {
  alimentacio: [
    { name:'Cooperativa Agrícola Osona',   product:'Matèries primeres locals',  cost_base:8000,  qualitat:88, termini:15 },
    { name:'Makro Cash & Carry SA',        product:'Productes alimentaris',      cost_base:12000, qualitat:78, termini:7  },
    { name:'Importadora Mediterrànea SL',  product:'Ingredients importats',      cost_base:6500,  qualitat:82, termini:21 },
  ],
  tecnologia: [
    { name:'Dell Technologies España',     product:'Maquinari i servidors',      cost_base:4500,  qualitat:92, termini:10 },
    { name:'Ingram Micro Iberia SL',       product:'Components i perifèrics',    cost_base:3200,  qualitat:85, termini:5  },
    { name:'AWS EMEA SARL',               product:'Cloud i infraestructura',    cost_base:2800,  qualitat:95, termini:0  },
  ],
  construccio: [
    { name:'LafargeHolcim Spain SA',       product:'Ciment i materials',         cost_base:18000, qualitat:90, termini:3  },
    { name:'Leroy Merlin España SL',       product:'Materials i ferreteria',     cost_base:5500,  qualitat:80, termini:2  },
    { name:'Arcelor Mittal Iberia SA',     product:'Acer i metalls',             cost_base:22000, qualitat:88, termini:7  },
  ],
  salut: [
    { name:'Alliance Healthcare España',   product:'Medicaments i material',     cost_base:15000, qualitat:92, termini:2  },
    { name:'Medline Industries Inc.',      product:'Fungibles mèdics',           cost_base:4200,  qualitat:88, termini:5  },
    { name:'Philips Medical Systems',      product:'Equipament diagnòstic',      cost_base:8500,  qualitat:95, termini:30 },
  ],
  logistica: [
    { name:'Repsol Combustibles SA',       product:'Gasoil i carburant',         cost_base:28000, qualitat:85, termini:7  },
    { name:'Bridgestone Hispanica SA',     product:'Pneumàtics vehicles',        cost_base:6800,  qualitat:90, termini:10 },
    { name:'Toyota Material Handling',    product:'Carretons elevadors',        cost_base:1800,  qualitat:93, termini:14 },
  ],
  moda: [
    { name:'Cotonifici Bustese SpA',       product:'Cotó i fibres naturals',     cost_base:18000, qualitat:92, termini:21 },
    { name:'Tintoreria Químics SA',        product:'Tints i productes',          cost_base:8500,  qualitat:80, termini:7  },
    { name:'YKK España SL',              product:'Cremalleres i complements',  cost_base:2800,  qualitat:95, termini:10 },
  ],
  turisme: [
    { name:'Makro Cash & Carry SA',        product:'Alimentació hostaleria',     cost_base:9500,  qualitat:80, termini:3  },
    { name:'Laundry Services Vallès SL',   product:'Bugaderia industrial',       cost_base:3800,  qualitat:85, termini:2  },
    { name:'Ecolab Europe GmbH',           product:'Neteja i higienització',     cost_base:2200,  qualitat:90, termini:7  },
  ],
  comerc: [
    { name:'Alibaba.com Spain SL',         product:'Productes importació xina',  cost_base:5500,  qualitat:72, termini:45 },
    { name:'Accenture Procurement',        product:'Gestió compres centralitz.',  cost_base:3200,  qualitat:88, termini:0  },
    { name:'Proveïdor local sector',       product:'Producte/servei sector',     cost_base:4000,  qualitat:82, termini:10 },
  ],
  quimica: [
    { name:'BASF Española SL',             product:'Químics industrials',        cost_base:24000, qualitat:92, termini:14 },
    { name:'Brenntag Química SA',          product:'Distribució químics',        cost_base:12000, qualitat:88, termini:7  },
    { name:'Univar Solutions SL',          product:'Especialitats químiques',    cost_base:8500,  qualitat:85, termini:10 },
  ],
  default: [
    { name:'Proveïdor genèric A',          product:'Subministraments generals',  cost_base:3500,  qualitat:78, termini:10 },
    { name:'Distribucions Vallès SL',      product:'Materials i consumibles',    cost_base:2800,  qualitat:82, termini:7  },
  ],
};

export function renderProveidors() {
  const gd = G.gameData;
  if (!gd?.company) {
    document.getElementById('tab-proveidors').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">🏭</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Sense empresa activa</div>
      </div>`;
    return;
  }

  const proveidors = gd.proveidors || [];
  const sector = gd.company?.sector || 'default';
  const costTotal = proveidors.reduce((s, p) => s + p.cost_mes, 0);

  document.getElementById('tab-proveidors').innerHTML = `
  <div style="padding:16px;max-width:1000px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">🏭 Gestió de Proveïdors</h2>
        <div style="font-size:12px;color:var(--text2)">Cost total proveïdors: <strong style="color:var(--red)">${fmt(costTotal)}€/mes</strong></div>
      </div>
      <button class="btn-primary" onclick="openBuscaProveidors()">🔍 Buscar nous proveïdors</button>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:16px;width:fit-content">
      <button class="auth-tab active" id="ptab-actius"  onclick="switchProvTab('actius')">📋 Proveïdors actius</button>
      <button class="auth-tab"        id="ptab-mercat"  onclick="switchProvTab('mercat')">🔍 Mercat proveïdors</button>
      <button class="auth-tab"        id="ptab-riscos"  onclick="switchProvTab('riscos')">⚠️ Anàlisi riscos</button>
    </div>

    <div id="prov-actius-panel">${renderProveïdorsActius(proveidors)}</div>
    <div id="prov-mercat-panel" style="display:none">${renderMercatProveidors(sector, proveidors)}</div>
    <div id="prov-riscos-panel" style="display:none">${renderRiscosProveidors(proveidors, costTotal)}</div>
  </div>`;

  window.switchProvTab = (tab) => {
    ['actius','mercat','riscos'].forEach(t => {
      document.getElementById(`prov-${t}-panel`).style.display = t===tab ? '' : 'none';
      document.getElementById(`ptab-${t}`).classList.toggle('active', t===tab);
    });
    if (tab === 'mercat') document.getElementById('prov-mercat-panel').innerHTML = renderMercatProveidors(G.gameData.company?.sector||'default', G.gameData.proveidors||[]);
  };
}

function renderProveïdorsActius(proveidors) {
  if (proveidors.length === 0) {
    return `<div class="section-card">
      <div style="text-align:center;padding:30px;color:var(--text2)">
        <div style="font-size:40px;margin-bottom:10px">🏭</div>
        <div>Sense proveïdors actius. Cerca'n al mercat.</div>
      </div>
    </div>`;
  }

  return `
  <div style="display:flex;flex-direction:column;gap:10px">
    ${proveidors.map((p, i) => {
      const critColor = p.criticitat==='alta'?'var(--red)':p.criticitat==='mitja'?'var(--gold)':'var(--green)';
      const qualColor = p.qualitat>=85?'var(--green)':p.qualitat>=70?'var(--gold)':'var(--red)';
      return `
      <div class="section-card" style="border-left:4px solid ${critColor}">
        <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap">
          <div style="flex:1;min-width:200px">
            <div style="font-weight:800;font-size:14px;color:var(--text)">${p.name}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px">${p.product}</div>
            <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;font-size:10px">
              <span style="color:${critColor};font-weight:700">⚠️ Criticitat: ${p.criticitat.toUpperCase()}</span>
              <span style="color:${qualColor}">⭐ Qualitat: ${p.qualitat}%</span>
              <span style="color:var(--text3)">📅 Pagament: ${p.termini_pagament||30} dies</span>
              ${p.descompte_actual ? `<span style="color:var(--green)">🏷️ Desc. negociat: -${p.descompte_actual}%</span>` : ''}
            </div>
          </div>
          <div style="text-align:right;min-width:120px">
            <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:var(--red)">${fmt(p.cost_mes)}€<span style="font-size:10px;color:var(--text2)">/mes</span></div>
            ${p.descompte_actual ? `<div style="font-size:11px;color:var(--green)">Estalvi: -${fmt(Math.round(p.cost_mes*p.descompte_actual/100))}€/mes</div>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
          <button class="emp-btn promote" onclick="openNegociacio(${i})">🤝 Negociar condicions</button>
          <button class="emp-btn raise" onclick="openAvaluacio(${i})">⭐ Avaluar qualitat</button>
          <button class="emp-btn fire" onclick="cancelProveidorConfirm(${i})">✕ Cancel·lar contracte</button>
        </div>
        ${p.negociant ? `<div style="margin-top:8px;padding:8px 12px;background:rgba(79,127,255,.08);border:1px solid rgba(79,127,255,.2);border-radius:8px;font-size:11px;color:var(--accent)">🔄 Negociació en curs...</div>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function renderMercatProveidors(sector, actius) {
  const list = PROVEIDORS_MERCAT[sector] || PROVEIDORS_MERCAT.default;
  const activesNames = actius.map(p => p.name);

  return `
  <div class="info-box" style="margin-bottom:14px">
    🔍 <strong>Mercat de proveïdors del sector ${sector}.</strong>
    Compara condicions i diversifica per reduir riscos. Contactar un proveïdor nou pot prendre 2-4 setmanes.
  </div>
  <div style="display:flex;flex-direction:column;gap:10px">
    ${list.map((p, i) => {
      const alreadyActive = activesNames.includes(p.name);
      const qualColor = p.qualitat>=85?'var(--green)':p.qualitat>=70?'var(--gold)':'var(--red)';
      return `
      <div class="section-card ${alreadyActive ? 'opacity:.5' : ''}">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div style="flex:1">
            <div style="font-weight:800;font-size:14px;color:var(--text)">${p.name}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px">${p.product}</div>
            <div style="display:flex;gap:12px;margin-top:8px;font-size:11px;flex-wrap:wrap">
              <span style="color:${qualColor}">⭐ Qualitat estimada: ${p.qualitat}%</span>
              <span style="color:var(--text3)">📅 Termini lliurament: ${p.termini} dies</span>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--text2)">~${fmt(p.cost_base)}€/mes</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px">Preu orientatiu</div>
            ${alreadyActive
              ? '<span style="color:var(--green);font-size:12px;font-weight:700">✅ Ja actiu</span>'
              : `<button class="btn-primary" style="margin-top:6px;font-size:12px;padding:7px 14px" onclick="contactarProveidor('${p.name}','${p.product}',${p.cost_base},${p.qualitat},${p.termini})">Contactar →</button>`}
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderRiscosProveidors(proveidors, costTotal) {
  const criticsAlta = proveidors.filter(p=>p.criticitat==='alta');
  const concentracio = criticsAlta.reduce((s,p)=>s+p.cost_mes,0)/Math.max(costTotal,1)*100;

  return `
  <div style="display:grid;gap:12px">
    <div class="section-card">
      <div class="section-title">⚠️ Mapa de riscos de la cadena de subministrament</div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
        <div class="ratio-box">
          <div class="ratio-val" style="color:${criticsAlta.length>2?'var(--red)':'var(--gold)'}">${criticsAlta.length}</div>
          <div class="ratio-label">Proveïdors crítics</div>
        </div>
        <div class="ratio-box">
          <div class="ratio-val" style="color:${concentracio>60?'var(--red)':'var(--gold)'}">${concentracio.toFixed(0)}%</div>
          <div class="ratio-label">Concentració crít.</div>
        </div>
        <div class="ratio-box">
          <div class="ratio-val" style="color:var(--text)">${proveidors.length}</div>
          <div class="ratio-label">Total proveïdors</div>
        </div>
      </div>

      ${criticsAlta.length > 0 ? `
      <div class="danger-box">
        🚨 <strong>Proveïdors d'alt risc sense alternativa:</strong><br>
        ${criticsAlta.map(p=>`• ${p.name} (${fmt(p.cost_mes)}€/mes)`).join('<br>')}
        <br><br>Recomanació: busca un proveïdor alternatiu per a cada un.
      </div>` : `<div style="padding:12px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:8px;font-size:12px;color:#34d399">✅ Cadena de subministrament amb risc moderat</div>`}
    </div>

    <div class="section-card">
      <div class="section-title">📊 Concentració de proveïdors</div>
      ${proveidors.map(p => {
        const pct = costTotal > 0 ? (p.cost_mes/costTotal*100) : 0;
        const c = p.criticitat==='alta'?'var(--red)':p.criticitat==='mitja'?'var(--gold)':'var(--green)';
        return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:12px">
          <div style="flex:1;color:var(--text)">${p.name}</div>
          <div style="width:100px;height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden">
            <div style="height:100%;background:${c};width:${pct}%;border-radius:4px"></div>
          </div>
          <div style="width:40px;text-align:right;color:${c};font-weight:700">${pct.toFixed(0)}%</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ---- Operacions ----
window.openNegociacio = function(idx) {
  const gd = G.gameData;
  const p = gd.proveidors?.[idx];
  if (!p) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'neg-modal';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span style="font-size:32px">🤝</span>
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:var(--text)">Negociació: ${p.name}</div>
          <div style="font-size:11px;color:var(--text2)">Cost actual: ${fmt(p.cost_mes)}€/mes · Qualitat: ${p.qualitat}%</div>
        </div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>

      <div class="info-box">
        💡 Pots negociar un descompte en preu, millora del termini de lliurament o un acord de volum.
        El proveïdor valorarà la teva lleialtat i el volum de compra.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group2">
          <label>Descompte sol·licitat (%)</label>
          <input class="form-input" id="neg-desc" type="number" min="0" max="30" value="10" placeholder="5-20%">
        </div>
        <div class="form-group2">
          <label>Millora termini lliurament (dies)</label>
          <input class="form-input" id="neg-term" type="number" min="0" max="30" value="5" placeholder="Dies">
        </div>
      </div>

      <div class="form-group2">
        <label>Compromís de volum (augment % compra)</label>
        <select class="form-select" id="neg-vol">
          <option value="0">Sense compromís de volum</option>
          <option value="10">+10% volum (argumentació moderada)</option>
          <option value="25">+25% volum (argumentació forta)</option>
          <option value="50">+50% volum (argumentació molt forta)</option>
        </select>
      </div>

      <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:14px;font-size:12px;color:var(--text2)">
        <strong style="color:var(--text)">Probabilitat d'èxit estimada:</strong> ${p.qualitat > 80 ? 'Moderada — Proveïdor de qualitat alt valora la relació.' : 'Alta — Proveïdor estàndard, possibilitats de millora.'}
        <br>Un major compromís de volum augmenta la probabilitat d'èxit.
      </div>

      <button class="btn-primary" style="width:100%" onclick="sendNegociacio(${idx})">📤 Enviar proposta de negociació</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.sendNegociacio = async function(idx) {
  const gd = G.gameData;
  const p = gd.proveidors?.[idx];
  const descSol = parseFloat(document.getElementById('neg-desc')?.value || 0);
  const termSol = parseInt(document.getElementById('neg-term')?.value || 0);
  const volComp = parseInt(document.getElementById('neg-vol')?.value || 0);
  document.getElementById('neg-modal')?.remove();

  // Simulem la resposta del proveïdor (depèn de volum i qualitat)
  const baseProb = 0.3 + (volComp / 100) * 0.5;
  const maxDesc  = Math.min(descSol, volComp > 25 ? 15 : volComp > 0 ? 8 : 4);
  const accepted = Math.random() < baseProb;

  if (accepted) {
    const descObt = Math.round(maxDesc * (0.5 + Math.random() * 0.5));
    p.descompte_actual = descObt;
    if (termSol > 0) p.termini_pagament = Math.max(7, (p.termini_pagament||30) + Math.floor(termSol/2));
    showToast(`✅ Negociació exitosa! ${p.name} ofereix -${descObt}% descompte`);
    showEventToast('🤝','Negociació exitosa!',`${p.name}: -${descObt}% descompte negociat`, true);
  } else {
    // Contraoferta
    const counterDesc = Math.round(maxDesc * 0.3);
    if (counterDesc > 0) {
      showToast(`🔄 ${p.name} fa contraoferta: -${counterDesc}% (tu demanaves -${descSol}%)`);
      showEventToast('🔄','Contraoferta proveïdor',`${p.name} ofereix -${counterDesc}% (tu demanaves -${descSol}%)`, false);
      // Guardar contraoferta per acceptar/rebutjar
      p.negociant = true;
      p.contraoferta = { desc: counterDesc };
    } else {
      showToast(`❌ ${p.name} ha rebutjat la negociació per ara.`);
      showEventToast('❌','Negociació rebutjada',`${p.name} no accepta les condicions proposades`, false);
    }
  }
  await saveGameData();
  renderProveidors();
};

window.openAvaluacio = function(idx) {
  showToast('⭐ Sistema d\'avaluació de qualitat — proper sprint');
};

window.cancelProveidorConfirm = async function(idx) {
  const gd = G.gameData;
  const p = gd.proveidors?.[idx];
  if (!p) return;
  if (p.criticitat === 'alta') {
    if (!confirm(`⚠️ ATENCIÓ: ${p.name} és un proveïdor CRÍTIC. Cancel·lar pot paralitzar la producció. Continuar?`)) return;
  } else {
    if (!confirm(`Cancel·lar contracte amb ${p.name}?`)) return;
  }
  gd.proveidors.splice(idx, 1);
  await saveGameData();
  showToast(`❌ Contracte cancel·lat amb ${p.name}`);
  renderProveidors();
};

window.contactarProveidor = async function(name, product, cost, qualitat, termini) {
  const gd = G.gameData;
  if (!gd.proveidors) gd.proveidors = [];
  // Simular procés de contacte (2-4 setmanes fins a activar)
  const nouProv = {
    id: 'prov_' + Date.now(),
    name, product,
    cost_mes: Math.round(cost * (0.9 + Math.random() * 0.2)), // variació ±10%
    qualitat, termini_lliurament: termini,
    termini_pagament: 30, criticitat: 'mitja',
    descompte_actual: 0, negociant: false,
  };
  gd.proveidors.push(nouProv);
  await saveGameData();
  showToast(`✅ ${name} afegit com a proveïdor. Primer lliurament en ${termini} dies.`);
  showEventToast('🏭','Nou proveïdor!',`${name} incorporat a la cadena de subministrament.`, true);
  renderProveidors();
};

window.openBuscaProveidors = function() {
  window.switchProvTab('mercat');
  document.getElementById('ptab-mercat').classList.add('active');
  document.getElementById('ptab-actius').classList.remove('active');
};
