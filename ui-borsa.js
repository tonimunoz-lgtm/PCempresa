// Accés a l'estat global i funcions via window (exposats per index.html)
const getG = () => window.G;
const saveGameData  = (...a) => window.saveGameData(...a);
const showToast     = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt  = (...a) => window.fmt(...a);
const fmtPct = (...a) => window.fmtPct(...a);
const getSTOCKS  = () => window.STOCKS_DATA  || [];
const getCRYPTOS = () => window.CRYPTOS_DATA || [];

// ============================================================
//  ui-borsa.js  —  Borsa simulada + Criptoactius educatius
// ============================================================

let borsaPrices = {}; // preus live de la sessió
let initialized = false;

window.renderBorsa = function renderBorsa() {
  const gd = getG()?.gameData;
  if (!gd) { document.getElementById('tab-borsa').innerHTML = '<div style="padding:40px;text-align:center;color:var(--text2)">Carregant dades...</div>'; return; }
  if (!initialized) initBorsaPrices();
  const cash = gd.finances?.cash || 0;
  const port = gd.portfolio || { stocks:{}, crypto:{} };

  document.getElementById('tab-borsa').innerHTML = `
  <div class="borsa-wrap">
    <div class="borsa-disclaimer">
      📚 <strong>Nota educativa:</strong> Aquesta borsa és una simulació fictícia amb finalitat pedagògica.
      Els preus <em>no</em> reflecteixen mercats reals. L'objectiu és entendre el risc, la volatilitat
      i per què invertir sense coneixement pot arruïnar una empresa. <strong>La borsa no és un joc!</strong>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">📈 Borsa Simulada</h2>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">Setmana ${gd.week} · Any ${gd.year}</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="tstat">💰 Efectiu disponible: <span class="tstat-v">${fmt(cash)}€</span></div>
        <div class="tstat">📊 Cartera: <span class="tstat-v" id="portfolio-total">—</span></div>
      </div>
    </div>

    <!-- Tabs interns -->
    <div style="display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:16px;width:fit-content">
      <button class="auth-tab active" id="btab-stocks"  onclick="switchBorsaTab('stocks')">📈 Accions</button>
      <button class="auth-tab"        id="btab-crypto"  onclick="switchBorsaTab('crypto')">₿ Criptoactius</button>
      <button class="auth-tab"        id="btab-port"    onclick="switchBorsaTab('portfolio')">💼 La meva cartera</button>
      <button class="auth-tab"        id="btab-edu"     onclick="switchBorsaTab('edu')">📚 Aprèn</button>
    </div>

    <div id="borsa-stocks-panel">${renderStocksPanel(port, cash)}</div>
    <div id="borsa-crypto-panel" style="display:none">${renderCryptoPanel(port, cash)}</div>
    <div id="borsa-port-panel"   style="display:none">${renderPortfolioPanel(port, cash)}</div>
    <div id="borsa-edu-panel"    style="display:none">${renderEduPanel()}</div>
  </div>`;

  updatePortfolioTotal(port);

  window.switchBorsaTab = (tab) => {
    ['stocks','crypto','portfolio','edu'].forEach(t => {
      document.getElementById(`borsa-${t}-panel`).style.display = t===tab ? '' : 'none';
      document.getElementById(`btab-${t==='portfolio'?'port':t}`).classList.toggle('active', t===tab);
    });
    if (tab==='portfolio') {
      document.getElementById('borsa-port-panel').innerHTML = renderPortfolioPanel(getG().gameData.portfolio||{stocks:{},crypto:{}}, getG().gameData.finances?.cash||0);
    }
  };
}

function initBorsaPrices() {
  getSTOCKS().forEach(s  => { borsaPrices['s_'+s.ticker] = s.basePrice * (0.9 + Math.random()*0.2); });
  getCRYPTOS().forEach(c => { borsaPrices['c_'+c.symbol] = c.basePrice * (0.7 + Math.random()*0.6); });
  initialized = true;
}

function fluctuate(key, volatility) {
  const shock = (Math.random()-0.48) * volatility;
  borsaPrices[key] = Math.max(0.001, borsaPrices[key] * (1+shock));
  return borsaPrices[key];
}

function renderStocksPanel(port, cash) {
  return `
  <div class="stocks-grid">
    ${getSTOCKS().map(s => {
      const key     = 's_'+s.ticker;
      const price   = fluctuate(key, s.volatility);
      const prev    = price * (1 + (Math.random()-0.5)*s.volatility);
      const chg     = ((price-prev)/prev*100).toFixed(2);
      const isPos   = price >= prev;
      const owned   = port.stocks?.[s.ticker];
      const histSvg = miniChart(Array.from({length:20},(_,i)=>s.basePrice*(0.85+Math.random()*0.3)));
      return `
      <div class="stock-card ${owned?'owned':''}">
        <div class="stock-header">
          <div>
            <div class="stock-ticker">${s.icon} ${s.ticker}</div>
            <div class="stock-name">${s.name}</div>
            ${owned ? `<div style="font-size:10px;color:var(--accent);margin-top:2px">✅ Tens ${owned.shares} accions</div>` : ''}
          </div>
          <div style="text-align:right">
            <div class="stock-price">${price.toFixed(2)}€</div>
            <div class="stock-change ${isPos?'up':'down'}">${isPos?'▲':'▼'} ${Math.abs(chg)}%</div>
          </div>
        </div>
        <div class="stock-chart">${histSvg}</div>
        <div style="font-size:10px;color:var(--text2);margin-bottom:10px">${s.desc}</div>
        <div style="display:flex;gap:3px;align-items:center">
          <input type="number" min="1" value="10" style="width:64px;background:rgba(255,255,255,.06);border:1px solid var(--border2);border-radius:6px;padding:6px 8px;color:var(--text);font-size:12px;font-family:var(--font);outline:none" id="qty-s-${s.ticker}">
          <button class="btn-primary" style="flex:1;padding:7px;font-size:11px" onclick="buyStock('${s.ticker}',${price.toFixed(4)},${s.volatility})">Comprar</button>
          ${owned ? `<button class="btn-danger" style="flex:1;padding:7px;font-size:11px" onclick="sellStock('${s.ticker}',${price.toFixed(4)})">Vendre</button>` : ''}
        </div>
        <div style="font-size:10px;color:var(--text2);margin-top:4px">
          Cost: <span style="color:var(--gold)" id="cost-s-${s.ticker}">—</span>
          · Risc: <span style="color:${s.volatility>0.06?'var(--red)':s.volatility>0.04?'var(--gold)':'var(--green)'}">${s.volatility>0.06?'ALT':s.volatility>0.04?'MIG':'BAIX'}</span>
        </div>
      </div>`;
    }).join('')}
  </div>
  <script>
    document.querySelectorAll('[id^="qty-s-"]').forEach(inp => {
      inp.addEventListener('input', () => {
        const t = inp.id.replace('qty-s-','');
        const el = document.getElementById('cost-s-'+t);
        if (el) el.textContent = (parseInt(inp.value||0)*parseFloat(inp.closest('.stock-card').querySelector('.stock-price').textContent)).toLocaleString('ca')+'€';
      });
    });
  <\/script>`;
}

function renderCryptoPanel(port, cash) {
  const RISK_COLORS = {low:'var(--green)', mid:'var(--gold)', high:'var(--red)', extreme:'#ff00ff'};
  return `
  <div class="danger-box">
    🚨 <strong>AVÍS IMPORTANT:</strong> Les criptomonedes són actius especulatius d'alt risc.
    Pots perdre el 80% del capital invertit en qüestió de dies.
    Mai inverteixis diners que no et puguis permetre perdre. Aquestes criptos són <strong>fictícies</strong>.
  </div>
  <div class="crypto-grid">
    ${getCRYPTOS().map(c => {
      const key   = 'c_'+c.symbol;
      const price = fluctuate(key, c.volatility);
      const prev  = price * (1+(Math.random()-0.5)*c.volatility*2);
      const chg   = ((price-prev)/prev*100).toFixed(1);
      const isPos = price >= prev;
      const owned = port.crypto?.[c.symbol];
      const risk  = c.volatility>=0.35?'EXTREM':c.volatility>=0.2?'ALT':c.volatility>=0.12?'MIG':'BAIX';
      const rColor= c.volatility>=0.35?RISK_COLORS.extreme:c.volatility>=0.2?RISK_COLORS.high:c.volatility>=0.12?RISK_COLORS.mid:RISK_COLORS.low;
      return `
      <div class="crypto-card" style="${owned?'border-color:rgba(79,127,255,.4);background:rgba(79,127,255,.06)':''}">
        <div class="crypto-icon">${c.icon}</div>
        <div class="crypto-name">${c.symbol}</div>
        <div style="font-size:10px;color:var(--text2)">${c.name}</div>
        <div class="crypto-price">${price < 1 ? price.toFixed(4) : price.toFixed(2)}€</div>
        <div class="stock-change ${isPos?'up':'down'}" style="margin:4px auto;width:fit-content">${isPos?'▲':'▼'}${Math.abs(chg)}%</div>
        <div style="font-size:9px;font-weight:800;color:${rColor};margin:6px 0">RISC: ${risk}</div>
        <div class="risk-meter"><div class="risk-fill" style="width:${c.volatility*250}%"></div></div>
        <div style="font-size:9px;color:var(--text3);margin:4px 0 8px">${c.desc}</div>
        ${owned ? `<div style="font-size:10px;color:var(--accent);margin-bottom:6px">✅ ${owned.amount.toFixed(4)} ${c.symbol}</div>` : ''}
        <div style="display:flex;gap:4px">
          <input type="number" min="10" value="100" step="10" style="width:60px;background:rgba(255,255,255,.06);border:1px solid var(--border2);border-radius:6px;padding:5px 7px;color:var(--text);font-size:11px;font-family:var(--font);outline:none" id="qty-c-${c.symbol}">
          <span style="font-size:10px;color:var(--text2);align-self:center">€</span>
          <button class="btn-primary" style="flex:1;padding:6px;font-size:10px" onclick="buyCrypto('${c.symbol}',${price.toFixed(6)},${c.volatility})">Comprar</button>
          ${owned?`<button class="btn-danger" style="flex:1;padding:6px;font-size:10px" onclick="sellCrypto('${c.symbol}',${price.toFixed(6)})">Vendre</button>`:''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderPortfolioPanel(port, cash) {
  const stocks = Object.entries(port.stocks || {});
  const cryptos = Object.entries(port.crypto || {});
  if (stocks.length === 0 && cryptos.length === 0) {
    return `<div class="section-card"><div style="text-align:center;padding:40px;color:var(--text2)">
      <div style="font-size:48px;margin-bottom:12px">📊</div>
      <div style="font-size:14px;font-weight:700">Cartera buida</div>
      <div style="font-size:12px;margin-top:6px">Compra accions o criptoactius per construir la teva cartera.</div>
    </div></div>`;
  }

  let totalInvested = 0, totalCurrent = 0;
  const rows = [
    ...stocks.map(([ticker, h]) => {
      const cur = (borsaPrices['s_'+ticker] || h.avgPrice) * h.shares;
      const inv = h.avgPrice * h.shares;
      totalInvested += inv; totalCurrent += cur;
      const pnl = cur - inv; const pnlPct = ((pnl/inv)*100).toFixed(1);
      return `<tr><td><strong style="color:var(--text)">${ticker}</strong></td><td style="color:var(--text2)">${h.shares} acc.</td>
        <td style="color:var(--gold)">${h.avgPrice.toFixed(2)}€</td>
        <td style="color:var(--text)">${(borsaPrices['s_'+ticker]||h.avgPrice).toFixed(2)}€</td>
        <td style="color:${pnl>=0?'var(--green)':'var(--red)'}">${pnl>=0?'+':''}${pnl.toFixed(0)}€ (${pnlPct}%)</td>
        <td><button class="emp-btn fire" onclick="sellStock('${ticker}',${borsaPrices['s_'+ticker]||h.avgPrice})">Vendre tot</button></td></tr>`;
    }),
    ...cryptos.map(([symbol, h]) => {
      const cur = (borsaPrices['c_'+symbol] || h.avgPrice) * h.amount;
      const inv = h.avgPrice * h.amount;
      totalInvested += inv; totalCurrent += cur;
      const pnl = cur - inv; const pnlPct = ((pnl/inv)*100).toFixed(1);
      return `<tr><td><strong style="color:var(--text)">${symbol}</strong></td><td style="color:var(--text2)">${h.amount.toFixed(4)}</td>
        <td style="color:var(--gold)">${h.avgPrice.toFixed(4)}€</td>
        <td style="color:var(--text)">${(borsaPrices['c_'+symbol]||h.avgPrice).toFixed(4)}€</td>
        <td style="color:${pnl>=0?'var(--green)':'var(--red)'}">${pnl>=0?'+':''}${pnl.toFixed(0)}€ (${pnlPct}%)</td>
        <td><button class="emp-btn fire" onclick="sellCrypto('${symbol}',${borsaPrices['c_'+symbol]||h.avgPrice})">Vendre tot</button></td></tr>`;
    }),
  ];

  const totalPnl = totalCurrent - totalInvested;
  return `
  <div class="section-card" style="margin-bottom:14px">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      <div class="ratio-box"><div class="ratio-val" style="color:var(--gold)">${fmt(Math.round(totalInvested))}€</div><div class="ratio-label">Invertit</div></div>
      <div class="ratio-box"><div class="ratio-val" style="color:var(--text)">${fmt(Math.round(totalCurrent))}€</div><div class="ratio-label">Valor actual</div></div>
      <div class="ratio-box"><div class="ratio-val" style="color:${totalPnl>=0?'var(--green)':'var(--red)'}">${totalPnl>=0?'+':''}${fmt(Math.round(totalPnl))}€</div><div class="ratio-label">Guany/Pèrdua</div></div>
    </div>
  </div>
  <div class="section-card">
    <table class="portfolio-table" style="width:100%">
      <thead><tr><th>Actiu</th><th>Quantitat</th><th>Preu mitjà</th><th>Preu actual</th><th>G/P</th><th></th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  </div>`;
}

function renderEduPanel() {
  return `
  <div style="display:grid;gap:12px">
    <div class="section-card">
      <div class="section-title">📚 Conceptes bàsics de borsa</div>
      <div style="display:grid;gap:8px;font-size:12px;color:var(--text2);line-height:1.7">
        <div class="info-box"><strong>Acció:</strong> Part proporcional del capital d'una empresa. Si compres una acció de Inditex, ets propietari/ària d'una petita part d'Inditex.</div>
        <div class="info-box"><strong>Dividends:</strong> Part del benefici que l'empresa distribueix als accionistes. No totes les empreses en paguen.</div>
        <div class="info-box"><strong>Volatilitat:</strong> Mesura de com fluctua el preu. Alta volatilitat = més risc però també més oportunitat de guany.</div>
        <div class="warn-box"><strong>PER (Price Earnings Ratio):</strong> Relació entre el preu de l'acció i el benefici per acció. Un PER de 20 vol dir que pagues 20€ per cada €1 de benefici anual.</div>
        <div class="danger-box"><strong>⚠️ Risc de mercat:</strong> Els preus poden caure per sota del preu de compra. Pots perdre tot el capital invertit. Mai inverteixis diners que necessitis a curt termini.</div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-title">₿ Criptoactius: per entendre el risc</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.7">
        <div class="danger-box">
          <strong>Les criptomonedes NO són diners:</strong> No estan regulades pel Banc Central Europeu. El seu valor depèn exclusivament de la confiança i l'especulació.<br><br>
          <strong>Casos reals:</strong> El Bitcoin va perdre el 80% del seu valor en 2022. Terra/Luna va arribar a 0 en 48 hores. FTX, un dels majors exchanges, va fer fallida amb milers de milions de clients sense cobrar.<br><br>
          <strong>Per a empreses:</strong> Invertir els fons d'una empresa en criptos pot ser causa de fallida. Un CFO que ho faci pot ser demanat judicialment pels accionistes.
        </div>
        <div class="warn-box">
          <strong>Blockchain SÍ, però amb criteri:</strong> La tecnologia blockchain té aplicacions legítimes: contractes intel·ligents, traçabilitat de cadena de subministrament, NFTs corporatius. Però especular amb criptos és una altra cosa.
        </div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-title">📐 Indicadors borsaris</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;color:var(--text2)">
        ${[['PER','Preu / Benefici per acció'],['EV/EBITDA','Valor empresa / EBITDA'],['ROE','Return on Equity'],['Beta','Volatilitat vs mercat'],['BPA','Benefici per Acció'],['Dividend Yield','Dividends / Preu acció']].map(([n,d])=>`
        <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:10px">
          <div style="font-weight:700;color:var(--accent);font-size:13px;margin-bottom:4px">${n}</div>
          <div>${d}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function miniChart(data) {
  const min = Math.min(...data), max = Math.max(...data), range = max-min||1;
  const W=100,H=35, pts = data.map((v,i)=>`${(i/(data.length-1))*W},${H-((v-min)/range)*H}`).join(' ');
  const lastIsUp = data[data.length-1] >= data[0];
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <polyline points="${pts}" fill="none" stroke="${lastIsUp?'#10b981':'#ef4444'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function updatePortfolioTotal(port) {
  let total = 0;
  Object.entries(port.stocks||{}).forEach(([t,h])=>{ total += (borsaPrices['s_'+t]||h.avgPrice)*h.shares; });
  Object.entries(port.crypto||{}).forEach(([s,h])=>{ total += (borsaPrices['c_'+s]||h.avgPrice)*h.amount; });
  const el = document.getElementById('portfolio-total');
  if (el) el.textContent = fmt(Math.round(total))+'€';
}

// ---- Operacions ----
window.buyStock = async function(ticker, price, vol) {
  const qty = parseInt(document.getElementById('qty-s-'+ticker)?.value||10);
  const cost = qty * price;
  const gd = getG().gameData;
  if ((gd.finances?.cash||0) < cost) { showToast('❌ No tens prou tresoreria'); return; }
  if (!gd.portfolio) gd.portfolio = {stocks:{},crypto:{}};
  if (!gd.portfolio.stocks) gd.portfolio.stocks = {};
  const existing = gd.portfolio.stocks[ticker];
  if (existing) {
    const totalShares = existing.shares + qty;
    existing.avgPrice = (existing.avgPrice*existing.shares + price*qty) / totalShares;
    existing.shares = totalShares;
  } else {
    gd.portfolio.stocks[ticker] = { shares:qty, avgPrice:price, volatility:vol, history:[price], currentPrice:price };
  }
  gd.finances.cash -= cost;
  showToast(`📈 ${qty} accions de ${ticker} comprades per ${fmt(Math.round(cost))}€`);
  await saveGameData();
  renderBorsa();
};

window.sellStock = async function(ticker, price) {
  const gd = getG().gameData;
  const holding = gd.portfolio?.stocks?.[ticker];
  if (!holding) return;
  const revenue = holding.shares * price;
  const profit = revenue - holding.shares * holding.avgPrice;
  gd.finances.cash += revenue;
  delete gd.portfolio.stocks[ticker];
  showToast(`📉 ${ticker} venut: ${fmt(Math.round(revenue))}€ (${profit>=0?'+':''}${fmt(Math.round(profit))}€)`);
  await saveGameData();
  renderBorsa();
};

window.buyCrypto = async function(symbol, price, vol) {
  const euros = parseFloat(document.getElementById('qty-c-'+symbol)?.value||100);
  const gd = getG().gameData;
  if ((gd.finances?.cash||0) < euros) { showToast('❌ No tens prou tresoreria'); return; }
  const amount = euros / price;
  if (!gd.portfolio) gd.portfolio = {stocks:{},crypto:{}};
  if (!gd.portfolio.crypto) gd.portfolio.crypto = {};
  const existing = gd.portfolio.crypto[symbol];
  if (existing) {
    const totalAmt = existing.amount + amount;
    existing.avgPrice = (existing.avgPrice*existing.amount + price*amount) / totalAmt;
    existing.amount = totalAmt;
  } else {
    gd.portfolio.crypto[symbol] = { amount, avgPrice:price, volatility:vol, history:[price], currentPrice:price };
  }
  gd.finances.cash -= euros;
  showToast(`₿ ${amount.toFixed(4)} ${symbol} comprats per ${fmt(Math.round(euros))}€`);
  await saveGameData();
  renderBorsa();
};

window.sellCrypto = async function(symbol, price) {
  const gd = getG().gameData;
  const holding = gd.portfolio?.crypto?.[symbol];
  if (!holding) return;
  const revenue = holding.amount * price;
  const profit = revenue - holding.amount * holding.avgPrice;
  gd.finances.cash += revenue;
  delete gd.portfolio.crypto[symbol];
  showToast(`₿ ${symbol} venut: ${fmt(Math.round(revenue))}€ (${profit>=0?'+':''}${fmt(Math.round(profit))}€)`);
  await saveGameData();
  renderBorsa();
};
