// Accés a l'estat global i funcions via window (exposats per index.html)
const getG = () => window.G;
const saveGameData  = (...a) => window.saveGameData(...a);
const showToast     = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt  = (...a) => window.fmt(...a);
const fmtPct = (...a) => window.fmtPct(...a);
const getCOUNTRIES = () => window.COUNTRIES_DATA || [];

// ============================================================
//  ui-trade.js  —  Importació/Exportació + Incoterms
// ============================================================

export function renderTrade() {
  const gd = getG()?.gameData;
  if (!gd) return;
  const gd = getG().gameData;
  if (!gd.company) {
    document.getElementById('tab-trade').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">🌍</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Sense empresa activa</div>
      </div>`;
    return;
  }

  const trade = gd.trade || { imports:[], exports:[], incoterms:{} };
  const prest = gd.prestigi || 0;
  const cash  = gd.finances?.cash || 0;

  document.getElementById('tab-trade').innerHTML = `
  <div class="trade-wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">🌍 Comerç Internacional</h2>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">${gd.company.name} — Importació i Exportació</div>
      </div>
      <div style="display:flex;gap:8px">
        <div class="tstat">📦 Exportacions: <span class="tstat-v">${trade.exports?.length||0}</span></div>
        <div class="tstat">📥 Importacions: <span class="tstat-v">${trade.imports?.length||0}</span></div>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:16px;width:fit-content">
      <button class="auth-tab active" id="ttab-exp"  onclick="switchTradeTab('exp')">📤 Exportació</button>
      <button class="auth-tab"        id="ttab-imp"  onclick="switchTradeTab('imp')">📥 Importació</button>
      <button class="auth-tab"        id="ttab-inc"  onclick="switchTradeTab('inc')">📋 Incoterms</button>
      <button class="auth-tab"        id="ttab-act"  onclick="switchTradeTab('act')">✅ Acords actius</button>
    </div>

    <div id="trade-exp-panel">${renderExportPanel(trade, prest, cash, gd)}</div>
    <div id="trade-imp-panel" style="display:none">${renderImportPanel(trade, cash, gd)}</div>
    <div id="trade-inc-panel" style="display:none">${renderIncotermPanel()}</div>
    <div id="trade-act-panel" style="display:none">${renderActiveTradePanel(trade)}</div>
  </div>`;

  window.switchTradeTab = (tab) => {
    ['exp','imp','inc','act'].forEach(t => {
      document.getElementById(`trade-${t}-panel`).style.display = t===tab ? '' : 'none';
      document.getElementById(`ttab-${t}`).classList.toggle('active', t===tab);
    });
  };
}

function renderExportPanel(trade, prest, cash, gd) {
  const sectorIcon = gd.company?.sectorData?.icon || '🏭';
  const product    = gd.company?.sectorData?.name || 'Producte';

  return `
  <div class="section-card" style="margin-bottom:12px">
    <div class="section-title">🌐 Mercats disponibles per exportar</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:14px">
      Producte: <strong style="color:var(--text)">${sectorIcon} ${product}</strong> ·
      Prestigi requerit per mercats llunyans: ≥25
    </div>
    ${getCOUNTRIES().map(c => {
      const canAccess = c.distance !== 'lluny' || prest >= 25;
      const alreadyExp = trade.exports?.some(e => e.country === c.code);
      const weeklyRev  = Math.round(8000 * c.demand * (1-c.tariff) * (prest/30+0.3));
      const setupCost  = c.distance==='proper'?2000:c.distance==='mitja'?5000:12000;
      const tariffPct  = (c.tariff*100).toFixed(0);
      return `
      <div class="country-card ${alreadyExp?'active':''} ${!canAccess?'opacity:.5':''}">
        <div class="country-flag">${c.flag}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:15px;color:var(--text)">${c.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:3px">${c.notes}</div>
          <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;font-size:10px;color:var(--text3)">
            <span>🚢 Distància: ${c.distance}</span>
            <span>📋 Aranzel: ${tariffPct}%</span>
            <span>📈 Demanda: ${(c.demand*100).toFixed(0)}%</span>
            <span>💰 Ingressos estimats: ~${fmt(weeklyRev)}€/setmana</span>
            <span>⚙️ Configuració: ${fmt(setupCost)}€</span>
          </div>
        </div>
        <div>
          ${alreadyExp ? `<span style="color:var(--green);font-weight:700;font-size:13px">✅ Actiu</span>` :
            canAccess ? `<button class="btn-primary" style="font-size:12px;padding:8px 14px" onclick="startExport('${c.code}',${weeklyRev},${setupCost})">Iniciar →</button>` :
            `<span style="color:var(--text3);font-size:11px">⭐${25} prestigi necessari</span>`}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderImportPanel(trade, cash, gd) {
  const suppliers = [
    {id:'imp_ma',  country:'MA', flag:'🇲🇦', name:'Matèries primeres Marroc',    product:'Tèxtils i pell',     cost:1500,  saving:0.25, delivery:7,  risk:'baix'},
    {id:'imp_cn',  country:'CN', flag:'🇨🇳', name:'Components electrònics Xina', product:'Components i PCBs',  cost:3000,  saving:0.45, delivery:21, risk:'mig'},
    {id:'imp_de',  country:'DE', flag:'🇩🇪', name:'Maquinària alemanya',          product:'Peces industrials',  cost:5000,  saving:0.15, delivery:5,  risk:'baix'},
    {id:'imp_fr',  country:'FR', flag:'🇫🇷', name:'Ingredients alimentaris',     product:'Condiments i aromes', cost:800,   saving:0.12, delivery:3,  risk:'baix'},
    {id:'imp_mx',  country:'MX', flag:'🇲🇽', name:'Fruites tropicals Mèxic',    product:'Productes agrícoles', cost:1200,  saving:0.30, delivery:14, risk:'mig'},
    {id:'imp_us',  country:'US', flag:'🇺🇸', name:'Programari EUA (llicències)', product:'Software i SaaS',    cost:2000,  saving:0.20, delivery:1,  risk:'baix'},
  ];

  return `
  <div class="section-card" style="margin-bottom:12px">
    <div class="section-title">📥 Proveïdors internacionals</div>
    <div class="info-box" style="margin-bottom:12px">
      💡 Importar pot reduir costos de producció, però introduces riscos: retards, problemes de qualitat,
      fluctuacions de canvi (si compres en dòlars/yuans) i dependència de proveïdors externs.
    </div>
    ${suppliers.map(s => {
      const alreadyImp = trade.imports?.some(i => i.id === s.id);
      const riskColor  = s.risk==='baix'?'var(--green)':s.risk==='mig'?'var(--gold)':'var(--red)';
      return `
      <div class="country-card ${alreadyImp?'active':''}">
        <div class="country-flag" style="font-size:24px">${s.flag}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:14px;color:var(--text)">${s.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:3px">${s.product}</div>
          <div style="display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;font-size:10px;color:var(--text3)">
            <span>💰 Cost: ${fmt(s.cost)}€/setmana</span>
            <span>📉 Estalvi: -${(s.saving*100).toFixed(0)}% costos producció</span>
            <span>⏱️ Termini: ${s.delivery} dies</span>
            <span style="color:${riskColor}">⚠️ Risc: ${s.risk.toUpperCase()}</span>
          </div>
        </div>
        <div>
          ${alreadyImp ? `<span style="color:var(--green);font-weight:700;font-size:13px">✅ Actiu</span>` :
            `<button class="btn-primary" style="font-size:12px;padding:8px 14px" onclick="startImport('${s.id}','${s.name}',${s.cost},${s.saving})">Contractar →</button>`}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderIncotermPanel() {
  const incoterms = [
    {code:'EXW', name:'Ex Works',           icon:'🏭', risk:'Max comprador', desc:'El venedor posa mercaderia a la seva fàbrica. El comprador assumeix tot el transport i riscos.', seller:'Mínim', buyer:'Màxim'},
    {code:'FOB', name:'Free On Board',      icon:'⚓', risk:'Compartit',     desc:'El venedor entrega quan la mercaderia sobrepassa la borda del vaixell al port d\'origen.', seller:'Fins port origen', buyer:'Flete + assegurança'},
    {code:'CIF', name:'Cost, Insurance, Freight',icon:'🚢', risk:'Baix comprador', desc:'El venedor paga flete i assegurança fins al port de destinació.', seller:'Transport + assegurança', buyer:'Duana destinació'},
    {code:'DDP', name:'Delivered Duty Paid',icon:'🏠', risk:'Max venedor',   desc:'El venedor assumeix tots els costos i riscos fins al punt de destinació, inclosos aranzels.', seller:'Tot', buyer:'Mínim'},
    {code:'DAP', name:'Delivered at Place', icon:'📍', risk:'Mig',           desc:'El venedor entrega al lloc acordat però sense descarregar ni pagar aranzels destinació.', seller:'Transport fins dest.', buyer:'Duana + descàrrega'},
    {code:'FCA', name:'Free Carrier',       icon:'🚛', risk:'Compartit',     desc:'El venedor entrega al transportista designat pel comprador en un lloc acordat.', seller:'Fins primer transportista', buyer:'Transport internacional'},
  ];

  return `
  <div class="section-card">
    <div class="section-title">📋 Incoterms 2020 — Termes de comerç internacional</div>
    <div class="info-box" style="margin-bottom:14px">
      📚 Els <strong>Incoterms</strong> defineixen qui assumeix els costos i riscos del transport en operacions de comerç internacional.
      Publicats per la <strong>Cambra de Comerç Internacional (ICC)</strong>. Versió actual: Incoterms 2020.
    </div>
    <div class="incoterm-grid">
      ${incoterms.map(inc => `
        <div class="incoterm-card" onclick="showIncotermDetail('${inc.code}')">
          <div style="font-size:24px;margin-bottom:8px">${inc.icon}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:800;color:var(--accent)">${inc.code}</div>
          <div style="font-size:11px;font-weight:600;color:var(--text);margin:4px 0">${inc.name}</div>
          <div style="font-size:10px;color:var(--text2);line-height:1.5">${inc.desc}</div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:9px;font-weight:700">
            <span style="color:var(--green)">🟢 Venedor: ${inc.seller}</span>
          </div>
          <div style="font-size:9px;font-weight:700;color:var(--gold);margin-top:2px">🟡 Comprador: ${inc.buyer}</div>
        </div>`).join('')}
    </div>
    <div class="section-card" style="margin-top:14px;background:rgba(79,127,255,.06)">
      <div class="section-title">💡 Quant Incoterm escollir?</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.7">
        <strong style="color:var(--text)">Exportes?</strong> Si ets nou al comerç exterior, comença amb <strong style="color:var(--accent)">FOB o FCA</strong>.
        El comprador gestiona el transport i assumeix el risc un cop surts de l'origen.<br><br>
        <strong style="color:var(--text)">Importes?</strong> Negocia <strong style="color:var(--accent)">DDP</strong> si vols simplicitat: el proveïdor t'entrega tot pagat.
        Si vols controlar el transport, opta per <strong style="color:var(--accent)">EXW</strong>.<br><br>
        <strong style="color:var(--text)">⚠️ Error comú:</strong> Confondre EXW amb DDP. EXW és el mínim per al venedor; DDP el màxim.
      </div>
    </div>
  </div>`;
}

function renderActiveTradePanel(trade) {
  const exports = trade.exports || [];
  const imports = trade.imports || [];

  if (exports.length===0 && imports.length===0) {
    return `<div class="section-card"><div style="text-align:center;padding:30px;color:var(--text2)">
      <div style="font-size:40px;margin-bottom:10px">🌍</div>
      <div style="font-size:14px">Sense acords actius. Inicia exportacions o importacions!</div>
    </div></div>`;
  }

  return `
  <div style="display:grid;gap:12px">
    ${exports.length > 0 ? `
    <div class="section-card">
      <div class="section-title">📤 Exportacions actives</div>
      ${exports.map(e => {
        const c = getCOUNTRIES().find(c=>c.code===e.country)||{};
        return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
          <span style="font-size:28px">${c.flag||'🌍'}</span>
          <div style="flex:1">
            <div style="font-weight:700;font-size:13px;color:var(--text)">${c.name||e.country}</div>
            <div style="font-size:11px;color:var(--text2)">${e.incoterm||'FOB'} · Setup: ${fmt(e.setupCost||0)}€</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--green)">+${fmt(e.weeklyValue||0)}€/s</div>
            <button class="emp-btn fire" style="margin-top:4px;font-size:10px" onclick="cancelTrade('exp','${e.country}')">Cancel·lar</button>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}
    ${imports.length > 0 ? `
    <div class="section-card">
      <div class="section-title">📥 Importacions actives</div>
      ${imports.map(i => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">
          <span style="font-size:24px">📦</span>
          <div style="flex:1">
            <div style="font-weight:700;font-size:13px;color:var(--text)">${i.name}</div>
            <div style="font-size:11px;color:var(--green)">Estalvi: -${((i.saving||0)*100).toFixed(0)}% costos</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--red)">-${fmt(i.weeklyCost||0)}€/s</div>
            <button class="emp-btn fire" style="margin-top:4px;font-size:10px" onclick="cancelTrade('imp','${i.id}')">Cancel·lar</button>
          </div>
        </div>`).join('')}
    </div>` : ''}
  </div>`;
}

// ---- Operacions ----
window.startExport = async function(countryCode, weeklyValue, setupCost) {
  const gd = getG().gameData;
  if ((gd.finances?.cash||0) < setupCost) { showToast(`❌ Necessites ${fmt(setupCost)}€ per establir-te`); return; }
  const c = getCOUNTRIES().find(c=>c.code===countryCode);
  gd.finances.cash -= setupCost;
  if (!gd.trade) gd.trade = {imports:[],exports:[],incoterms:{}};
  gd.trade.exports.push({ country:countryCode, weeklyValue, setupCost, incoterm:'FOB', startWeek:gd.week });
  gd.prestigi = Math.min(100, (gd.prestigi||0) + 3);
  await saveGameData();
  showToast(`🌍 Exportació a ${c?.name} iniciada! +${fmt(weeklyValue)}€/setmana`);
  renderTrade();
};

window.startImport = async function(id, name, weeklyCost, saving) {
  const gd = getG().gameData;
  if (!gd.trade) gd.trade = {imports:[],exports:[],incoterms:{}};
  gd.trade.imports.push({ id, name, weeklyCost, saving, startWeek:gd.week });
  await saveGameData();
  showToast(`📥 Importació de "${name}" activada!`);
  renderTrade();
};

window.cancelTrade = async function(type, id) {
  const gd = getG().gameData;
  if (!gd.trade) return;
  if (type==='exp') gd.trade.exports = gd.trade.exports.filter(e=>e.country!==id);
  else gd.trade.imports = gd.trade.imports.filter(i=>i.id!==id);
  await saveGameData();
  showToast('❌ Acord cancel·lat');
  renderTrade();
};

window.showIncotermDetail = function(code) {
  showToast(`📋 ${code} — Consulta el panell d'Incoterms per a detalls complets`);
};
