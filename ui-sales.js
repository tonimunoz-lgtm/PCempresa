// ============================================================
//  ui-sales.js  —  Vendes per sector, reclamacions interactives
// ============================================================
const G = window.G;
const saveGameData   = (...a) => window.saveGameData(...a);
const showToast      = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt = (...a) => window.fmt(...a);

export function renderSales() {
  const gd = G.gameData;
  if (!gd?.company) {
    document.getElementById('tab-sales').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">📦</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Sense empresa activa</div>
      </div>`;
    return;
  }

  const serveis  = gd.serveis || [];
  const clients  = gd.clients || [];
  const claims   = gd.claims  || [];
  const monthly  = gd.finances?.monthly_revenue || 0;
  const pendClaims = claims.filter(c => !c.resolved);

  document.getElementById('tab-sales').innerHTML = `
  <div style="padding:16px;max-width:1100px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">📦 Vendes i Clients</h2>
        <div style="font-size:12px;color:var(--text2)">${gd.company.name} · ${gd.company.sectorData?.name}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${pendClaims.length > 0 ? `<div class="tstat" style="border-color:rgba(239,68,68,.3)">⚠️ Reclamacions: <span class="tstat-v" style="color:var(--red)">${pendClaims.length}</span></div>` : ''}
        <div class="tstat">💰 Facturació/mes: <span class="tstat-v">${fmt(Math.round(monthly))}€</span></div>
        <button class="week-advance-btn" onclick="openNewClientModal()">+ Nou client</button>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:16px;width:fit-content">
      <button class="auth-tab active" id="stab-serveis"  onclick="switchSalesTab('serveis')">🛍️ Serveis/Productes</button>
      <button class="auth-tab"        id="stab-clients"  onclick="switchSalesTab('clients')">🤝 Clients (${clients.length})</button>
      <button class="auth-tab"        id="stab-claims"   onclick="switchSalesTab('claims')" style="${pendClaims.length>0?'color:var(--red)':''}">⚠️ Reclamacions ${pendClaims.length>0?`(${pendClaims.length})`:''}</button>
      <button class="auth-tab"        id="stab-analisi"  onclick="switchSalesTab('analisi')">📊 Anàlisi</button>
    </div>

    <div id="sales-serveis-panel">${renderServeisPanel(serveis, gd)}</div>
    <div id="sales-clients-panel" style="display:none">${renderClientsPanel(clients, gd)}</div>
    <div id="sales-claims-panel"  style="display:none">${renderClaimsPanel(claims, gd)}</div>
    <div id="sales-analisi-panel" style="display:none">${renderAnalisiPanel(serveis, clients, gd)}</div>
  </div>`;

  window.switchSalesTab = (tab) => {
    ['serveis','clients','claims','analisi'].forEach(t => {
      document.getElementById(`sales-${t}-panel`).style.display = t===tab ? '' : 'none';
      document.getElementById(`stab-${t}`).classList.toggle('active', t===tab);
    });
  };
}

function renderServeisPanel(serveis, gd) {
  if (serveis.length === 0) {
    return `<div class="section-card">
      <div style="text-align:center;padding:30px;color:var(--text2)">
        <div style="font-size:40px;margin-bottom:10px">🛍️</div>
        <div>Defineix els productes o serveis de la teva empresa</div>
        <button class="btn-primary" style="margin-top:14px" onclick="openAddServei()">+ Afegir producte/servei</button>
      </div>
    </div>`;
  }

  const totalMensual = serveis.reduce((s, sv) => s + sv.preu * sv.unitats_mes, 0);

  return `
  <div class="section-card" style="margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div class="section-title" style="margin-bottom:0">🛍️ Catàleg de productes/serveis</div>
      <button class="btn-primary" style="font-size:12px;padding:8px 14px" onclick="openAddServei()">+ Afegir</button>
    </div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:8px 10px;color:var(--text2);font-weight:600">Producte / Servei</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Preu unit.</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Unitats/mes</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Facturació/mes</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">% total</th>
            <th style="padding:8px 10px"></th>
          </tr>
        </thead>
        <tbody>
          ${serveis.map((sv, i) => {
            const facturacio = sv.preu * sv.unitats_mes;
            const pct = totalMensual > 0 ? (facturacio / totalMensual * 100).toFixed(1) : 0;
            const barW = Math.round(facturacio / totalMensual * 100);
            return `
            <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              <td style="padding:10px">
                <div style="font-weight:700;color:var(--text)">${sv.name}</div>
                <div style="height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin-top:5px;width:120px">
                  <div style="height:100%;background:var(--accent);width:${barW}%;border-radius:2px"></div>
                </div>
              </td>
              <td style="padding:10px;text-align:right">
                <input type="number" value="${sv.preu}" min="0.01" step="0.01"
                  style="width:80px;background:rgba(255,255,255,.06);border:1px solid var(--border2);border-radius:6px;padding:5px 8px;color:var(--gold);font-size:12px;font-family:'JetBrains Mono',monospace;text-align:right;outline:none"
                  onchange="updateServei(${i},'preu',parseFloat(this.value))" />€
              </td>
              <td style="padding:10px;text-align:right">
                <input type="number" value="${sv.unitats_mes}" min="0" step="1"
                  style="width:80px;background:rgba(255,255,255,.06);border:1px solid var(--border2);border-radius:6px;padding:5px 8px;color:var(--text);font-size:12px;font-family:'JetBrains Mono',monospace;text-align:right;outline:none"
                  onchange="updateServei(${i},'unitats_mes',parseInt(this.value))" />
              </td>
              <td style="padding:10px;text-align:right;font-family:'JetBrains Mono',monospace;color:var(--green);font-weight:700">${fmt(Math.round(facturacio))}€</td>
              <td style="padding:10px;text-align:right;color:var(--text2)">${pct}%</td>
              <td style="padding:10px;text-align:right">
                <button class="emp-btn fire" onclick="deleteServei(${i})">✕</button>
              </td>
            </tr>`;
          }).join('')}
          <tr style="border-top:2px solid var(--border2);font-weight:800">
            <td colspan="3" style="padding:10px;color:var(--text)">TOTAL FACTURACIÓ MENSUAL</td>
            <td style="padding:10px;text-align:right;font-family:'JetBrains Mono',monospace;color:var(--gold);font-size:15px">${fmt(Math.round(totalMensual))}€</td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="info-box">
    💡 <strong>Com es calculen els ingressos:</strong> Cada setmana s'acumulen les vendes de tots els productes.
    Les variacions venen del comportament de clients, campanyes de màrqueting i events del mercat.
    Canvia preus i quantitats per ajustar l'estratègia comercial.
  </div>`;
}

function renderClientsPanel(clients, gd) {
  if (clients.length === 0) {
    return `<div class="section-card">
      <div style="text-align:center;padding:30px;color:var(--text2)">
        <div style="font-size:40px;margin-bottom:10px">🤝</div>
        <div>Sense clients actius. Contracta comercials o fes campanyes de màrqueting per captar-ne.</div>
      </div>
    </div>`;
  }

  const totalB2B = clients.filter(c=>c.type==='B2B'||c.type==='B2G').reduce((s,c)=>s+c.monthly_value,0);
  const totalB2C = clients.filter(c=>c.type==='B2C').reduce((s,c)=>s+c.monthly_value,0);

  return `
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
    <div class="kpi-card">
      <div class="kpi-label">Total clients</div>
      <div class="kpi-val">${clients.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Facturació B2B/mes</div>
      <div class="kpi-val positive" style="font-size:16px">${fmt(Math.round(totalB2B))}€</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Facturació B2C/mes</div>
      <div class="kpi-val positive" style="font-size:16px">${fmt(Math.round(totalB2C))}€</div>
    </div>
  </div>
  <div class="section-card">
    <div class="section-title">🤝 Clients actius</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${clients.map((cl, i) => {
        const satColor = cl.satisfaction>=75?'var(--green)':cl.satisfaction>=50?'var(--gold)':'var(--red)';
        const satLabel = cl.satisfaction>=75?'Satisfet':'Satisfet':cl.satisfaction>=50?'Neutral':'En risc';
        return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px">
          <div style="font-size:26px">${cl.icon||'🤝'}</div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:13px;color:var(--text)">${cl.name}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">${cl.type} · ${fmt(cl.monthly_value)}€/mes</div>
            <div style="height:4px;background:rgba(255,255,255,.08);border-radius:2px;margin-top:6px;width:100px">
              <div style="height:100%;background:${satColor};width:${cl.satisfaction}%;border-radius:2px;transition:.4s"></div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:12px;font-weight:700;color:${satColor}">${cl.satisfaction}% ${cl.satisfaction>=75?'😊':cl.satisfaction>=50?'😐':'😟'}</div>
            <div style="font-size:10px;color:var(--text3);margin-top:2px">${cl.type}</div>
            <div style="display:flex;gap:4px;margin-top:6px">
              <button class="emp-btn promote" onclick="negotiateClient(${i})" style="font-size:10px">Negociar</button>
              <button class="emp-btn fire" onclick="loseClient(${i})" style="font-size:10px">✕</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderClaimsPanel(claims, gd) {
  const pending  = claims.filter(c => !c.resolved);
  const resolved = claims.filter(c => c.resolved);

  return `
  <div style="display:grid;gap:12px">
    ${pending.length === 0 ? `
      <div class="section-card">
        <div style="text-align:center;padding:24px;color:var(--green)">
          <div style="font-size:40px;margin-bottom:8px">✅</div>
          <div style="font-weight:700">Sense reclamacions pendents!</div>
        </div>
      </div>` : ''}

    ${pending.map((cl, i) => renderClaimCard(cl, i, claims, false)).join('')}

    ${resolved.length > 0 ? `
    <div class="section-card">
      <div class="section-title">📋 Historial reclamacions resoltes (${resolved.length})</div>
      ${resolved.slice(-5).reverse().map(cl => `
        <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:11px">
          <span>${cl.accepted ? '✅ Acceptada' : '❌ Rebutjada'}</span>
          <span style="flex:1;color:var(--text)">${cl.client}: ${cl.issue}</span>
          <span style="color:${cl.accepted?'var(--red)':'var(--gold)'}">
            ${cl.accepted ? '-'+fmt(cl.compensation)+'€' : 'Sense cost'}
          </span>
          <span style="color:var(--text3)">${cl.clientLeft ? ' · Client perdut' : ''}</span>
        </div>`).join('')}
    </div>` : ''}
  </div>`;
}

function renderClaimCard(cl, i, allClaims, resolved) {
  const globalIdx = allClaims.indexOf(cl);
  const sevColor = cl.compensation > 2000 ? 'var(--red)' : cl.compensation > 500 ? 'var(--gold)' : 'var(--text2)';
  const CLAIM_DOCS = {
    'Retard en el lliurament':    '📋 Podeu consultar l\'albarà de lliurament i el tracking del transport.',
    'Defecte en el producte':     '🔬 Reviseu el certificat de qualitat del lot afectat (QC-report).',
    'Error en la facturació':     '💳 Consulteu la factura original i el pedido de compra del client.',
    'Mala atenció al client':     '📞 Podeu revisar l\'historial de trucades i correus del SAT.',
    'Producte no conforme':       '📦 Consulteu les especificacions tècniques del contracte.',
    'Termini de garantia':        '🛡️ Reviseu el contracte i les condicions de garantia.',
  };
  const doc = CLAIM_DOCS[cl.issue] || '📁 Reviseu la documentació contractual.';

  return `
  <div class="section-card" style="border-color:rgba(239,68,68,.3)">
    <div style="display:flex;align-items:flex-start;gap:12px">
      <span style="font-size:28px">⚠️</span>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-weight:800;font-size:14px;color:var(--text)">${cl.client}</div>
            <div style="font-size:13px;color:var(--gold);margin-top:2px">${cl.issue}</div>
          </div>
          <div class="crisis-badge" style="animation:pulseBadge .8s ease-in-out infinite alternate">
            Compensació demanada: ${fmt(cl.compensation)}€
          </div>
        </div>

        <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:12px;margin:12px 0;font-size:12px;color:var(--text2);line-height:1.7">
          <strong style="color:var(--text)">📄 Documentació disponible:</strong><br>
          ${doc}
          <br><br>
          <strong style="color:var(--text)">⚖️ Risc jurídic:</strong>
          ${cl.compensation > 3000
            ? '🔴 ALT — El client pot portar el cas a arbitratge o jutjat de pau.'
            : cl.compensation > 800
            ? '🟡 MODERAT — Possible reclamació per via mediació.'
            : '🟢 BAIX — Resolució amistosa habitual en casos similars.'}
        </div>

        <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:12px;color:rgba(251,211,141,.9)">
          <strong>Impacte si no es resol:</strong>
          El client té una satisfacció actual de <strong>${cl.clientSat || 65}%</strong>.
          Si rebutgem i no restem, probabilitat de marxar: <strong style="color:${cl.clientSat<50?'var(--red)':'var(--gold)'}">${cl.clientSat<50?'75%':'40%'}</strong>.
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary" style="flex:1;font-size:12px" onclick="acceptClaim(${globalIdx})">
            ✅ Acceptar i pagar ${fmt(cl.compensation)}€
          </button>
          <button class="btn-secondary" style="flex:1;font-size:12px" onclick="counterOfferClaim(${globalIdx})">
            🤝 Contraoferta
          </button>
          <button class="btn-danger" style="flex:1;font-size:12px" onclick="rejectClaim(${globalIdx})">
            ❌ Rebutjar reclamació
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderAnalisiPanel(serveis, clients, gd) {
  const monthly = gd.finances?.monthly_revenue || 0;
  const hist = gd.finances?.revenue_history || [];
  const barH = 80;
  const maxRev = hist.length ? Math.max(...hist.map(h=>h.rev)) : monthly;

  return `
  <div style="display:grid;gap:12px">
    <div class="section-card">
      <div class="section-title">📊 Evolució facturació (últimes 12 setmanes)</div>
      <div style="display:flex;align-items:flex-end;gap:3px;height:${barH}px;margin-top:8px">
        ${hist.slice(-12).map(h => {
          const hPct = maxRev > 0 ? (h.rev / maxRev * barH) : 4;
          const isPos = h.result >= 0;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
            <div title="${fmt(h.rev)}€" style="flex:0 0 ${Math.round(hPct)}px;width:100%;background:${isPos?'var(--accent)':'var(--red)'};border-radius:3px 3px 0 0;opacity:.8;cursor:default"></div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:4px">
        <span>Fa 12 setmanes</span><span>Ara</span>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">🥧 Mix de facturació per producte</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${serveis.map(sv => {
          const f = sv.preu * sv.unitats_mes;
          const pct = monthly > 0 ? (f/monthly*100) : 0;
          return `
          <div style="display:flex;align-items:center;gap:10px;font-size:12px">
            <div style="flex:1;color:var(--text)">${sv.name}</div>
            <div style="width:120px;height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden">
              <div style="height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));width:${pct}%;border-radius:4px"></div>
            </div>
            <div style="width:45px;text-align:right;color:var(--gold);font-family:'JetBrains Mono',monospace">${pct.toFixed(0)}%</div>
            <div style="width:70px;text-align:right;color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:11px">${fmt(Math.round(f))}€</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">📌 Concentració de clients — Risc</div>
      <div class="info-box" style="margin-bottom:10px">
        ⚠️ <strong>Regla del 80/20:</strong> Si un client representa més del 30% de la facturació, tens un risc de concentració.
        Diversifica la cartera de clients per reduir vulnerabilitat.
      </div>
      ${clients.sort((a,b)=>b.monthly_value-a.monthly_value).map(cl => {
        const pct = monthly > 0 ? (cl.monthly_value/monthly*100) : 0;
        const isRisky = pct > 30;
        return `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:12px">
          <div style="flex:1;color:var(--text)">${cl.name}</div>
          <div style="width:120px;height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden">
            <div style="height:100%;background:${isRisky?'var(--red)':'var(--green)'};width:${pct}%;border-radius:4px"></div>
          </div>
          <div style="width:40px;text-align:right;color:${isRisky?'var(--red)':'var(--text2)'};font-weight:${isRisky?700:400}">${pct.toFixed(0)}%</div>
          ${isRisky ? '<span style="color:var(--red);font-size:10px">⚠️ RISC</span>' : ''}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ---- Operacions ----
window.updateServei = async function(idx, field, value) {
  const gd = G.gameData;
  if (!gd.serveis?.[idx]) return;
  gd.serveis[idx][field] = value;
  // Recalcular ingressos mensuals
  gd.finances.monthly_revenue = gd.serveis.reduce((s, sv) => s + sv.preu * sv.unitats_mes, 0);
  await saveGameData();
};

window.deleteServei = async function(idx) {
  const gd = G.gameData;
  if (!confirm('Eliminar aquest producte/servei del catàleg?')) return;
  gd.serveis.splice(idx, 1);
  gd.finances.monthly_revenue = (gd.serveis||[]).reduce((s, sv) => s + sv.preu * sv.unitats_mes, 0);
  await saveGameData();
  renderSales();
};

window.openAddServei = function() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'add-servei-modal';
  modal.innerHTML = `
    <div class="modal-card narrow">
      <div class="modal-header">
        <span style="font-size:32px">🛍️</span>
        <div><div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text)">Nou producte / servei</div></div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="form-group2"><label>Nom</label>
        <input class="form-input" id="new-servei-name" placeholder="Ex: Consulta bàsica, Producte A..."></div>
      <div class="form-row">
        <div class="form-group2"><label>Preu unitari (€)</label>
          <input class="form-input" id="new-servei-preu" type="number" min="0.01" placeholder="25.00"></div>
        <div class="form-group2"><label>Unitats/mes estimades</label>
          <input class="form-input" id="new-servei-unitats" type="number" min="1" placeholder="100"></div>
      </div>
      <button class="btn-primary" style="width:100%" onclick="confirmAddServei()">Afegir al catàleg</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.confirmAddServei = async function() {
  const name    = document.getElementById('new-servei-name')?.value.trim();
  const preu    = parseFloat(document.getElementById('new-servei-preu')?.value);
  const unitats = parseInt(document.getElementById('new-servei-unitats')?.value);
  if (!name || isNaN(preu) || isNaN(unitats)) { showToast('⚠️ Omple tots els camps'); return; }
  const gd = G.gameData;
  if (!gd.serveis) gd.serveis = [];
  gd.serveis.push({ id: 'sv_'+Date.now(), name, preu, unitats_mes: unitats });
  gd.finances.monthly_revenue = gd.serveis.reduce((s, sv) => s + sv.preu * sv.unitats_mes, 0);
  await saveGameData();
  document.getElementById('add-servei-modal')?.remove();
  showToast(`✅ "${name}" afegit al catàleg`);
  renderSales();
};

window.acceptClaim = async function(idx) {
  const gd = G.gameData;
  const cl = gd.claims[idx];
  if (!cl) return;
  if ((gd.finances?.cash||0) < cl.compensation) { showToast('❌ No tens prou tresoreria'); return; }
  gd.finances.cash -= cl.compensation;
  cl.resolved = true;
  cl.accepted = true;
  // Millora satisfacció del client
  const client = (gd.clients||[]).find(c => c.name === cl.client);
  if (client) client.satisfaction = Math.min(100, (client.satisfaction||70) + 15);
  await saveGameData();
  showToast(`✅ Reclamació acceptada. -${fmt(cl.compensation)}€ | Client satisfet`);
  showEventToast('✅','Reclamació resolta',`${cl.client}: compensació pagada de ${fmt(cl.compensation)}€`, true);
  renderSales();
};

window.counterOfferClaim = function(idx) {
  const gd = G.gameData;
  const cl = gd.claims[idx];
  if (!cl) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'counter-modal';
  const suggested = Math.round(cl.compensation * 0.5);
  modal.innerHTML = `
    <div class="modal-card narrow">
      <div class="modal-header">
        <span style="font-size:32px">🤝</span>
        <div><div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:var(--text)">Contraoferta</div>
        <div style="font-size:11px;color:var(--text2)">El client demana: ${fmt(cl.compensation)}€</div></div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="info-box">Pots oferir un import menor. Si el client no accepta pot mantenir la reclamació o marxar.</div>
      <div class="form-group2"><label>La teva oferta (€)</label>
        <input class="form-input" id="counter-amount" type="number" value="${suggested}" min="0" max="${cl.compensation}"></div>
      <button class="btn-primary" style="width:100%" onclick="sendCounterOffer(${idx})">Enviar contraoferta</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.sendCounterOffer = async function(idx) {
  const gd = G.gameData;
  const cl = gd.claims[idx];
  const offer = parseInt(document.getElementById('counter-amount')?.value || 0);
  document.getElementById('counter-modal')?.remove();
  const ratio = offer / cl.compensation;
  const client = (gd.clients||[]).find(c => c.name === cl.client);
  const sat = client?.satisfaction || 65;
  // Probabilitat acceptació: depèn de la satisfacció i quant oferim
  const acceptProb = ratio * (sat / 100) + 0.2;
  if (Math.random() < acceptProb) {
    // Accepta
    gd.finances.cash -= offer;
    cl.resolved = true; cl.accepted = true; cl.compensation = offer;
    if (client) client.satisfaction = Math.min(100, sat + 8);
    showToast(`✅ El client ha acceptat la contraoferta: ${fmt(offer)}€`);
    showEventToast('🤝','Contraoferta acceptada!',`${cl.client} accepta ${fmt(offer)}€`, true);
  } else {
    // Rebutja la contraoferta
    if (client) client.satisfaction = Math.max(0, sat - 10);
    showToast(`❌ El client ha rebutjat la contraoferta. Manté la reclamació.`);
    showEventToast('😡','Contraoferta rebutjada',`${cl.client} no accepta ${fmt(offer)}€`, false);
  }
  await saveGameData();
  renderSales();
};

window.rejectClaim = async function(idx) {
  const gd = G.gameData;
  const cl = gd.claims[idx];
  if (!cl) return;
  cl.resolved = true; cl.accepted = false;
  const client = (gd.clients||[]).find(c => c.name === cl.client);
  const sat = client?.satisfaction || 65;
  // Risc que el client marxi
  const leaveProb = sat < 50 ? 0.70 : sat < 70 ? 0.40 : 0.15;
  if (Math.random() < leaveProb && client) {
    cl.clientLeft = true;
    const idx2 = gd.clients.findIndex(c => c.name === cl.client);
    if (idx2 >= 0) gd.clients.splice(idx2, 1);
    showToast(`💔 Client perdut: ${cl.client} ha cancel·lat el contracte`);
    showEventToast('💔','Client perdut!',`${cl.client} ha marxat per la reclamació no atesa.`, false);
  } else {
    if (client) client.satisfaction = Math.max(0, sat - 20);
    showToast(`⚠️ Reclamació rebutjada. ${cl.client} molt molest.`);
  }
  await saveGameData();
  renderSales();
};

window.negotiateClient = function(idx) {
  showToast('🤝 Funcionalitat negociació directa — proper sprint');
};

window.loseClient = async function(idx) {
  const gd = G.gameData;
  if (!confirm('Eliminar aquest client?')) return;
  gd.clients.splice(idx, 1);
  await saveGameData();
  renderSales();
};

window.openNewClientModal = function() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-card narrow">
      <div class="modal-header">
        <span style="font-size:32px">🤝</span>
        <div><div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:var(--text)">Prospecte nou client</div></div>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="form-group2"><label>Nom empresa / client</label>
        <input class="form-input" id="nc-name" placeholder="Empresa XYZ SL"></div>
      <div class="form-row">
        <div class="form-group2"><label>Tipus</label>
          <select class="form-select" id="nc-type"><option>B2B</option><option>B2C</option><option>B2G</option></select></div>
        <div class="form-group2"><label>Valor mensual (€)</label>
          <input class="form-input" id="nc-value" type="number" placeholder="5000"></div>
      </div>
      <button class="btn-primary" style="width:100%" onclick="addNewClient()">Afegir client</button>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.addNewClient = async function() {
  const name  = document.getElementById('nc-name')?.value.trim();
  const type  = document.getElementById('nc-type')?.value;
  const value = parseInt(document.getElementById('nc-value')?.value);
  if (!name || isNaN(value)) { showToast('⚠️ Omple tots els camps'); return; }
  const gd = G.gameData;
  if (!gd.clients) gd.clients = [];
  gd.clients.push({ id:'cl_'+Date.now(), icon:'🤝', name, type, monthly_value:value, satisfaction:70 });
  await saveGameData();
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
  showToast(`✅ ${name} afegit com a client`);
  renderSales();
};
