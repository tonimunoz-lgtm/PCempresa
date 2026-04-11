// Accés a l'estat global i funcions via window (exposats per index.html)
const getG = () => window.G;
const saveGameData  = (...a) => window.saveGameData(...a);
const showToast     = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt  = (...a) => window.fmt(...a);
const fmtPct = (...a) => window.fmtPct(...a);
const getFRANCHISES = () => window.FRANCHISES_DATA || [];

// ============================================================
//  ui-franquicies.js  —  Sistema de Franquícies
// ============================================================

export function renderFranquicies() {
  const gd = getG()?.gameData;
  if (!gd) return;
  const gd = getG().gameData;
  const franchise = gd.franchise;

  document.getElementById('tab-franquicies').innerHTML = `
  <div class="franc-wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">🏪 Franquícies</h2>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">Opera sota una marca establerta o crea la teva pròpia xarxa</div>
      </div>
    </div>

    ${franchise ? renderActiveFranchise(franchise, gd) : renderFranchiseMarket(gd)}
  </div>`;
}

function renderActiveFranchise(franchise, gd) {
  const fr = getFRANCHISES().find(f=>f.id===franchise.id) || franchise;
  const weeklyRoyalty = Math.round((gd.finances?.monthly_revenue||0)/4.33 * (fr.royalty||0.06));
  const mode = franchise.mode || 'franquiciat';

  return `
  <div class="info-box" style="margin-bottom:16px">
    ✅ <strong>Franquícia activa:</strong> ${mode==='franquiciat'?'Ets franquiciat de':'Ets franquiciador de'} <strong>${fr.name}</strong>
    ${mode==='franquiciat' ? `· Royalty: ${((fr.royalty||0.06)*100).toFixed(0)}%/setmana · ~${fmt(weeklyRoyalty)}€` : ''}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
    <div class="section-card">
      <div class="section-title">📊 Dades de la franquícia</div>
      <div style="font-size:12px;color:var(--text2);line-height:2.2">
        Marca: <strong style="color:var(--text)">${fr.icon} ${fr.name}</strong><br>
        Sector: <strong style="color:var(--text)">${fr.sector}</strong><br>
        Mode: <strong style="color:var(--accent)">${mode==='franquiciat'?'Franquiciat/da':'Franquiciador/a'}</strong><br>
        ${mode==='franquiciat'?`Royalty: <strong style="color:var(--red)">${((fr.royalty||0.06)*100).toFixed(0)}% vendes</strong><br>Fons publicitat: <strong style="color:var(--red)">${((fr.adFund||0.02)*100).toFixed(0)}% vendes</strong>`:
        `Franquiciats actius: <strong style="color:var(--green)">${franchise.franchisees||0}</strong><br>Ingressos royalties: <strong style="color:var(--green)">+${fmt(franchise.royaltyWeekly||0)}€/setmana</strong>`}
      </div>
    </div>
    <div class="section-card">
      <div class="section-title">📈 Rendiment</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="ratio-box"><div class="ratio-val" style="color:var(--gold)">${fmt(gd.finances?.monthly_revenue||0)}€</div><div class="ratio-label">Ingressos/mes</div></div>
        <div class="ratio-box"><div class="ratio-val" style="color:var(--red)">${fmt(weeklyRoyalty*4.33)}€</div><div class="ratio-label">Royalties/mes</div></div>
        <div class="ratio-box"><div class="ratio-val" style="color:var(--text)">${(fr.margin||0.2)*100}%</div><div class="ratio-label">Marge estimat</div></div>
        <div class="ratio-box"><div class="ratio-val" style="color:var(--text)">${fr.contract||5} anys</div><div class="ratio-label">Durada contracte</div></div>
      </div>
    </div>
  </div>

  ${mode==='franquiciador' ? renderFranquiciadorPanel(franchise) : ''}

  <div class="danger-box">
    ⚠️ <strong>Vols sortir de la franquícia?</strong> Trencar el contracte abans d'hora comporta penalitzacions.
    <button class="btn-danger" style="margin-top:10px;font-size:12px" onclick="exitFranchise()">Sortir de la franquícia</button>
  </div>`;
}

function renderFranquiciadorPanel(franchise) {
  return `
  <div class="section-card" style="margin-bottom:16px">
    <div class="section-title">🏗️ Gestió de la xarxa de franquiciats</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div style="font-size:13px;color:var(--text2)">Franquiciats actuals: <strong style="color:var(--text)">${franchise.franchisees||0}</strong></div>
      <button class="btn-primary" style="font-size:12px;padding:8px 14px" onclick="recruitFranchisee()">+ Reclutar franquiciat</button>
    </div>
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:14px">
      <div style="font-size:12px;color:var(--text2);line-height:1.8">
        Cada nou franquiciat porta:<br>
        • Quota d'entrada: <strong style="color:var(--gold)">${fmt(franchise.entryFeeRecurring||15000)}€</strong> (única)<br>
        • Royalties setmanals: <strong style="color:var(--green)">+${fmt(franchise.royaltyWeekly||0)}€</strong><br>
        • Fons publicitat compartit<br>
        • Formació i suport (cost: ${fmt(franchise.trainingCost||3000)}€/franquiciat)
      </div>
    </div>
  </div>`;
}

function renderFranchiseMarket(gd) {
  const cash    = gd.finances?.cash || 0;
  const prest   = gd.prestigi || 0;
  const hasComp = !!gd.company;

  return `
  <!-- Dues opcions: ser franquiciat o crear xarxa -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">
    <div class="choice-card" style="border:2px solid var(--border)">
      <span class="choice-icon">🏪</span>
      <div class="choice-title">Ser franquiciat/da</div>
      <div class="choice-desc">Opera sota una marca establerta. Menys risc, però pagues royalties i perds llibertat estratègica.</div>
    </div>
    <div class="choice-card" style="border:2px solid var(--border)">
      <span class="choice-icon">👑</span>
      <div class="choice-title">Crear la teva xarxa</div>
      <div class="choice-desc">Converteix la teva empresa en una franquícia i recull royalties de cada franquiciat.</div>
      ${prest >= 40 && hasComp ? `<button class="btn-gold" style="width:100%;margin-top:12px;font-size:12px" onclick="createOwnFranchise()">Crear franquícia pròpia</button>` :
        `<div style="margin-top:10px;font-size:11px;color:var(--text3)">⭐ Necessites ≥40 prestigi i empresa activa</div>`}
    </div>
  </div>

  <div class="section-title" style="margin-bottom:12px">📋 Franquícies disponibles al mercat</div>
  ${!hasComp ? `<div class="warn-box">⚠️ Necessites tenir una empresa activa per contractar una franquícia.</div>` : ''}

  <div style="display:grid;gap:12px">
    ${getFRANCHISES().map(fr => {
      const canAfford = cash >= fr.entryFee;
      const canOperate = cash >= fr.minCapital;
      return `
      <div class="franc-card">
        <div class="franc-header">
          <div class="franc-logo" style="background:${fr.color}">${fr.icon}</div>
          <div style="flex:1">
            <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text)">${fr.name}</div>
            <div style="font-size:12px;color:var(--text2);margin-top:2px">${fr.desc}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:3px">🏪 ${fr.stores} establiments actuals · Sector: ${fr.sector}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700;color:var(--gold)">${fmt(fr.entryFee)}€</div>
            <div style="font-size:10px;color:var(--text2)">quota entrada</div>
          </div>
        </div>

        <div class="franc-conditions">
          <div class="franc-cond"><div class="franc-cond-val">${fmt(fr.minCapital)}€</div><div class="franc-cond-label">Capital mínim</div></div>
          <div class="franc-cond"><div class="franc-cond-val">${(fr.royalty*100).toFixed(0)}%</div><div class="franc-cond-label">Royalty vendes</div></div>
          <div class="franc-cond"><div class="franc-cond-val">${(fr.adFund*100*100/fr.royalty/100).toFixed(0)}%</div><div class="franc-cond-label">Fons publicitat</div></div>
          <div class="franc-cond"><div class="franc-cond-val">${fr.contract} anys</div><div class="franc-cond-label">Durada</div></div>
          <div class="franc-cond"><div class="franc-cond-val">${fmt(fr.expectedRevenue)}€</div><div class="franc-cond-label">Ingressos estimats/any</div></div>
          <div class="franc-cond"><div class="franc-cond-val">${(fr.margin*100).toFixed(0)}%</div><div class="franc-cond-label">Marge net est.</div></div>
        </div>

        <div style="margin-top:12px">
          <div class="royalty-meter" style="margin-bottom:4px"><div class="royalty-fill" style="width:${fr.royalty*500}%"></div></div>
          <div style="font-size:10px;color:var(--text2)">Royalty visual: ${(fr.royalty*100).toFixed(0)}% de les vendes van al franquiciador</div>
        </div>

        <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:10px;margin-top:10px;font-size:11px;color:var(--text2)">
          <strong style="color:var(--text)">Requisits:</strong> ${fr.requirements}
        </div>

        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          ${!hasComp ? `<div style="font-size:11px;color:var(--text3);align-self:center">Necessites empresa activa</div>` :
            !canOperate ? `<div style="font-size:11px;color:var(--red)">❌ Necessites mínim ${fmt(fr.minCapital)}€ de capital</div>` :
            !canAfford  ? `<div style="font-size:11px;color:var(--gold)">⚠️ No tens ${fmt(fr.entryFee)}€ per la quota d'entrada</div>` :
            `<button class="btn-primary" style="flex:1" onclick="joinFranchise('${fr.id}')">🏪 Convertir empresa en franquícia →</button>`}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

window.joinFranchise = async function(franchiseId) {
  const gd = getG().gameData;
  const fr = getFRANCHISES().find(f=>f.id===franchiseId);
  if (!fr) return;
  if ((gd.finances?.cash||0) < fr.entryFee) { showToast('❌ No tens prou capital'); return; }
  if (!confirm(`Vols convertir ${gd.company.name} en franquícia de ${fr.name}? Cost: ${fmt(fr.entryFee)}€ + ${(fr.royalty*100).toFixed(0)}% royalties`)) return;

  gd.finances.cash -= fr.entryFee;
  gd.franchise = { id:fr.id, mode:'franquiciat', royaltyRate:fr.royalty, adFundRate:fr.adFund, contract:fr.contract, startWeek:gd.week };
  gd.prestigi = Math.min(100, (gd.prestigi||0)+8);

  await saveGameData();
  showEventToast('🏪','Franquícia activada!',`${gd.company.name} ara opera sota la marca ${fr.name}`,true);
  renderFranquicies();
};

window.createOwnFranchise = async function() {
  const gd = getG().gameData;
  const royaltyWeekly = Math.round((gd.finances?.monthly_revenue||0)/4.33 * 0.07);
  if (!confirm(`Vols convertir ${gd.company.name} en una marca de franquícia? Necessitaràs un manual d'operacions i capacitat formativa.`)) return;

  gd.franchise = {
    id: 'custom_'+Date.now(), mode:'franquiciador',
    name: gd.company.name, icon: gd.company.sectorData?.icon || '🏪',
    royaltyRate:0.07, adFundRate:0.02, entryFeeRecurring:15000,
    royaltyWeekly, trainingCost:3000, franchisees:0, startWeek:gd.week,
  };
  gd.prestigi = Math.min(100, (gd.prestigi||0)+15);

  await saveGameData();
  showEventToast('👑','Xarxa de franquícies creada!',`${gd.company.name} ara és una marca de franquícia!`,true);
  renderFranquicies();
};

window.recruitFranchisee = async function() {
  const gd = getG().gameData;
  const fr = gd.franchise;
  if (!fr) return;
  const trainingCost = fr.trainingCost || 3000;
  if ((gd.finances?.cash||0) < trainingCost) { showToast('❌ No tens prou per la formació del franquiciat'); return; }

  gd.finances.cash -= trainingCost;
  gd.finances.cash += fr.entryFeeRecurring || 15000;
  fr.franchisees = (fr.franchisees||0) + 1;
  fr.royaltyWeekly = Math.round(fr.franchisees * (fr.royaltyWeekly||500));
  gd.prestigi = Math.min(100,(gd.prestigi||0)+2);

  await saveGameData();
  showToast(`🏪 Nou franquiciat reclutat! Ara tens ${fr.franchisees} franquiciats.`);
  renderFranquicies();
};

window.exitFranchise = async function() {
  const gd = getG().gameData;
  if (!gd.franchise) return;
  const penalty = 15000;
  if (!confirm(`Sortir de la franquícia comporta una penalització de ${fmt(penalty)}€. Continuar?`)) return;

  gd.finances.cash -= penalty;
  gd.franchise = null;

  await saveGameData();
  showToast('❌ Has sortit de la franquícia');
  renderFranquicies();
};
