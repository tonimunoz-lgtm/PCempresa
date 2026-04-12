(function() {
var getG = function(){ return window.G; };
var saveGameData = function(){ return window.saveGameData.apply(null, arguments); };
var showToast = function(){ return window.showToast.apply(null, arguments); };
var showEventToast = function(){ return window.showEventToast.apply(null, arguments); };
var fmt = function(){ return window.fmt.apply(null, arguments); };
var getSTOCKS = function(){ return window.STOCKS_DATA || []; };
var getCRYPTOS = function(){ return window.CRYPTOS_DATA || []; };

var borsaPrices = {};
var priceHistory = {};
var initialized = false;
var lastFetchTime = 0;
var realCryptoPrices = null;

var COINGECKO_MAP = {
  BTC:'bitcoin', ETH:'ethereum', BNB:'binancecoin', SOL:'solana',
  XRP:'ripple', ADA:'cardano', DOGE:'dogecoin', DOT:'polkadot',
  AVAX:'avalanche-2', MATIC:'matic-network', LINK:'chainlink'
};

async function fetchRealCryptoPrices() {
  var ids = Object.values(COINGECKO_MAP).join(',');
  try {
    var resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids='+ids+'&vs_currencies=eur&include_24hr_change=true');
    if (!resp.ok) throw new Error('API error '+resp.status);
    var data = await resp.json();
    realCryptoPrices = {};
    Object.entries(COINGECKO_MAP).forEach(function(e){
      var symbol=e[0], geckoId=e[1];
      if (data[geckoId]) realCryptoPrices[symbol] = { price: data[geckoId].eur, change24h: data[geckoId].eur_24h_change||0 };
    });
    lastFetchTime = Date.now();
    console.log('📈 Preus cripto reals actualitzats');
    return true;
  } catch(e) { console.warn('CoinGecko no disponible:', e.message); return false; }
}

function genHistory(base, vol, n) {
  base = parseFloat(base) || 1; vol = parseFloat(vol) || 0.03;
  var h=[base]; for(var i=1;i<n;i++) h.push(Math.max(0.001, h[i-1]*(1+(Math.random()-0.48)*vol))); return h;
}

async function initBorsaPrices() {
  await fetchRealCryptoPrices();
  getSTOCKS().forEach(function(s){
    var k='s_'+s.ticker; borsaPrices[k]=s.basePrice*(1+(Math.random()-0.48)*s.volatility*0.5);
    priceHistory[k]=genHistory(s.basePrice, s.volatility, 30);
  });
  getCRYPTOS().forEach(function(c){
    var k='c_'+c.symbol;
    var realP = (realCryptoPrices && realCryptoPrices[c.symbol]) ? realCryptoPrices[c.symbol].price : null;
    var baseP = parseFloat(realP) || parseFloat(c.basePrice) || 1;
    borsaPrices[k] = realP ? baseP : baseP*(0.8+Math.random()*0.4);
    priceHistory[k]=genHistory(borsaPrices[k], c.volatility, 30);
  });
  initialized=true;
  setInterval(async function(){
    var got=await fetchRealCryptoPrices();
    if(got) getCRYPTOS().forEach(function(c){ if(realCryptoPrices[c.symbol]){ var k='c_'+c.symbol; borsaPrices[k]=realCryptoPrices[c.symbol].price; priceHistory[k].push(borsaPrices[k]); if(priceHistory[k].length>60) priceHistory[k].shift(); }});
    getSTOCKS().forEach(function(s){ var k='s_'+s.ticker; borsaPrices[k]*=(1+(Math.random()-0.48)*s.volatility*0.3); priceHistory[k].push(borsaPrices[k]); if(priceHistory[k].length>60) priceHistory[k].shift(); });
    if(getG()?.currentTab==='borsa') window.renderBorsa();
  }, 15*60*1000);
}

function fluctuate(k,v){ var p=borsaPrices[k]; if(!p||!isFinite(p))p=1; borsaPrices[k]=Math.max(0.001,p*(1+(Math.random()-0.48)*v)); return borsaPrices[k]; }
function miniChart(d){ if(!d||d.length<2)return''; d=d.filter(function(v){return typeof v==='number'&&isFinite(v);}); if(d.length<2)return''; var mn=Math.min.apply(null,d),mx=Math.max.apply(null,d),r=mx-mn||1,W=100,H=35; var pts=d.map(function(v,i){return(i/(d.length-1))*W+','+(H-((v-mn)/r)*H);}).join(' '); var up=d[d.length-1]>=d[0]; return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><polyline points="'+pts+'" fill="none" stroke="'+(up?'#10b981':'#ef4444')+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

window.renderBorsa = async function() {
  var gd=getG()?.gameData; if(!gd){document.getElementById('tab-borsa').innerHTML='<div style="padding:40px;text-align:center;color:var(--text2)">Carregant...</div>';return;}
  if(!initialized) await initBorsaPrices();
  var cash=gd.finances?.cash||0, port=gd.portfolio||{stocks:{},crypto:{}};
  var isReal=!!realCryptoPrices, lastUp=lastFetchTime>0?new Date(lastFetchTime).toLocaleTimeString('ca'):'—';

  document.getElementById('tab-borsa').innerHTML =
  '<div class="borsa-wrap">' +
    '<div class="borsa-disclaimer" style="'+(isReal?'border-color:rgba(16,185,129,.3);background:rgba(16,185,129,.06)':'')+'">' +
      (isReal ? '🟢 <strong>Preus cripto en temps real</strong> via CoinGecko. Accions IBEX35 amb fluctuació simulada. Última act.: '+lastUp+' (cada 15 min)' : '📚 <strong>Mode simulació.</strong> Tots els preus simulats amb volatilitat realista.') +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">' +
      '<div><h2 style="font-family:\'Syne\',sans-serif;font-size:20px;font-weight:800;color:var(--text)">📈 Borsa '+(isReal?'— Dades reals':'— Simulada')+'</h2><div style="font-size:12px;color:var(--text2);margin-top:2px">Setmana '+gd.week+' · Any '+gd.year+'</div></div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><div class="tstat">💶 Efectiu: <span class="tstat-v">'+fmt(Math.round(cash))+'€</span></div><div class="tstat">📊 Cartera: <span class="tstat-v" id="portfolio-total">—</span></div>'+(isReal?'<button class="emp-btn promote" style="padding:5px 12px;font-size:10px" onclick="refreshBorsaPrices()">🔄 Actualitzar</button>':'')+'</div>' +
    '</div>' +
    '<div style="display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:16px;width:fit-content">' +
      '<button class="auth-tab active" id="btab-stocks" onclick="switchBorsaTab(\'stocks\')">📈 IBEX35 ('+getSTOCKS().length+')</button>' +
      '<button class="auth-tab" id="btab-crypto" onclick="switchBorsaTab(\'crypto\')">₿ Cripto '+(isReal?'(REAL)':'(SIM)')+'</button>' +
      '<button class="auth-tab" id="btab-port" onclick="switchBorsaTab(\'portfolio\')">💼 Cartera</button>' +
      '<button class="auth-tab" id="btab-edu" onclick="switchBorsaTab(\'edu\')">📚 Aprèn</button>' +
    '</div>' +
    '<div id="borsa-stocks-panel">'+renderStocksPanel(port,cash)+'</div>' +
    '<div id="borsa-crypto-panel" style="display:none">'+renderCryptoPanel(port,cash)+'</div>' +
    '<div id="borsa-port-panel" style="display:none">'+renderPortfolioPanel(port,cash)+'</div>' +
    '<div id="borsa-edu-panel" style="display:none">'+renderEduPanel()+'</div>' +
  '</div>';

  updatePortfolioTotal(port);
  window.switchBorsaTab=function(tab){
    var pm={stocks:'stocks',crypto:'crypto',portfolio:'port',edu:'edu'};
    ['stocks','crypto','portfolio','edu'].forEach(function(t){ var p=document.getElementById('borsa-'+pm[t]+'-panel'),b=document.getElementById('btab-'+pm[t]); if(p)p.style.display=t===tab?'':'none'; if(b)b.classList.toggle('active',t===tab); });
    if(tab==='portfolio'){var pp=document.getElementById('borsa-port-panel');if(pp)pp.innerHTML=renderPortfolioPanel(getG().gameData.portfolio||{stocks:{},crypto:{}},getG().gameData.finances?.cash||0);}
  };
};
window.refreshBorsaPrices=async function(){showToast('🔄 Actualitzant...');await fetchRealCryptoPrices();if(realCryptoPrices)getCRYPTOS().forEach(function(c){if(realCryptoPrices[c.symbol])borsaPrices['c_'+c.symbol]=realCryptoPrices[c.symbol].price;});getSTOCKS().forEach(function(s){fluctuate('s_'+s.ticker,s.volatility*0.2);});window.renderBorsa();showToast('✅ Preus actualitzats');};

function renderStocksPanel(port,cash){
  var html='<div style="margin-bottom:10px;padding:10px 14px;background:rgba(79,127,255,.06);border:1px solid rgba(79,127,255,.15);border-radius:10px;font-size:11px;color:var(--text2)">📊 <strong>IBEX35</strong> — Preus de referència reals (abril 2025) amb fluctuació simulada.</div><div class="stocks-grid">';
  getSTOCKS().forEach(function(s){
    var k='s_'+s.ticker,price=borsaPrices[k]||s.basePrice,h=priceHistory[k]||[price],prev=h.length>1?h[h.length-2]:price,chg=prev>0?((price-prev)/prev*100):0,isPos=chg>=0,owned=port.stocks?.[s.ticker];
    var rl=s.volatility>0.06?'ALT':s.volatility>0.03?'MIG':'BAIX', rc=s.volatility>0.06?'var(--red)':s.volatility>0.03?'var(--gold)':'var(--green)';
    html+='<div class="stock-card '+(owned?'owned':'')+'"><div class="stock-header"><div><div class="stock-ticker">'+s.icon+' '+s.ticker+'</div><div class="stock-name">'+s.name+'</div><div style="font-size:9px;color:var(--text3)">'+s.sector+'</div>'+(owned?'<div style="font-size:10px;color:var(--accent);margin-top:2px">✅ '+owned.shares+' acc.</div>':'')+'</div><div style="text-align:right"><div class="stock-price">'+price.toFixed(2)+'€</div><div class="stock-change '+(isPos?'up':'down')+'">'+(isPos?'▲':'▼')+' '+Math.abs(chg).toFixed(2)+'%</div></div></div><div class="stock-chart">'+miniChart(h)+'</div><div style="font-size:10px;color:var(--text2);margin-bottom:8px">'+s.desc+'</div><div style="display:flex;gap:3px;align-items:center"><input type="number" min="1" value="10" style="width:60px;background:rgba(255,255,255,.06);border:1px solid var(--border2);border-radius:6px;padding:6px 8px;color:var(--text);font-size:12px;font-family:var(--font);outline:none" id="qty-s-'+s.ticker+'"><button class="btn-primary" style="flex:1;padding:7px;font-size:11px" onclick="buyStock(\''+s.ticker+'\','+price.toFixed(4)+','+s.volatility+')">Comprar</button>'+(owned?'<button class="btn-danger" style="flex:1;padding:7px;font-size:11px" onclick="sellStock(\''+s.ticker+'\','+price.toFixed(4)+')">Vendre</button>':'')+'</div><div style="font-size:10px;color:var(--text2);margin-top:4px">Risc: <span style="color:'+rc+';font-weight:700">'+rl+'</span></div></div>';
  });
  return html+'</div>';
}

function renderCryptoPanel(port,cash){
  var isReal=!!realCryptoPrices;
  var html='<div class="danger-box">🚨 <strong>AVÍS:</strong> Les criptomonedes són actius d\'alt risc.'+(isReal?' 🟢 <strong>Preus reals</strong> via CoinGecko.':' ⚪ Preus simulats.')+'</div><div class="crypto-grid">';
  getCRYPTOS().forEach(function(c){
    var k='c_'+c.symbol,price=borsaPrices[k]||c.basePrice,rd=realCryptoPrices?.[c.symbol],ch24=rd?rd.change24h:(Math.random()-0.5)*c.volatility*200,isPos=ch24>=0,owned=port.crypto?.[c.symbol];
    var risk=c.volatility>=0.35?'EXTREM':c.volatility>=0.2?'ALT':c.volatility>=0.12?'MIG':'BAIX', rc=c.volatility>=0.35?'#ff00ff':c.volatility>=0.2?'var(--red)':c.volatility>=0.12?'var(--gold)':'var(--green)';
    var h=priceHistory[k]||[price], prFmt=price<1?price.toFixed(4):price<100?price.toFixed(2):Math.round(price).toLocaleString('ca'), isRealP=!!rd;
    html+='<div class="crypto-card" style="'+(owned?'border-color:rgba(79,127,255,.4);background:rgba(79,127,255,.06)':'')+'"><div style="display:flex;justify-content:space-between;align-items:center"><div class="crypto-icon">'+c.icon+'</div>'+(isRealP?'<span style="font-size:8px;background:rgba(16,185,129,.15);color:var(--green);padding:1px 5px;border-radius:8px;font-weight:700">REAL</span>':'<span style="font-size:8px;background:rgba(255,255,255,.08);color:var(--text3);padding:1px 5px;border-radius:8px">SIM</span>')+'</div><div class="crypto-name">'+c.symbol+'</div><div style="font-size:10px;color:var(--text2)">'+c.name+'</div><div class="crypto-price">'+prFmt+'€</div><div class="stock-change '+(isPos?'up':'down')+'" style="margin:4px auto;width:fit-content">'+(isPos?'▲':'▼')+Math.abs(ch24).toFixed(1)+'% 24h</div><div class="stock-chart" style="height:30px;margin:4px 0">'+miniChart(h)+'</div><div style="font-size:9px;font-weight:800;color:'+rc+';margin:4px 0">RISC: '+risk+'</div><div class="risk-meter"><div class="risk-fill" style="width:'+Math.min(100,c.volatility*250)+'%"></div></div><div style="font-size:9px;color:var(--text3);margin:4px 0 8px">'+c.desc+'</div>'+(owned?'<div style="font-size:10px;color:var(--accent);margin-bottom:6px">✅ '+owned.amount.toFixed(4)+' '+c.symbol+'</div>':'')+'<div style="display:flex;gap:4px"><input type="number" min="10" value="100" step="10" style="width:60px;background:rgba(255,255,255,.06);border:1px solid var(--border2);border-radius:6px;padding:5px 7px;color:var(--text);font-size:11px;font-family:var(--font);outline:none" id="qty-c-'+c.symbol+'"><span style="font-size:10px;color:var(--text2);align-self:center">€</span><button class="btn-primary" style="flex:1;padding:6px;font-size:10px" onclick="buyCrypto(\''+c.symbol+'\','+price.toFixed(6)+','+c.volatility+')">Comprar</button>'+(owned?'<button class="btn-danger" style="flex:1;padding:6px;font-size:10px" onclick="sellCrypto(\''+c.symbol+'\','+price.toFixed(6)+')">Vendre</button>':'')+'</div></div>';
  });
  return html+'</div>';
}

function renderPortfolioPanel(port,cash){
  var stocks=Object.entries(port.stocks||{}),cryptos=Object.entries(port.crypto||{});
  if(!stocks.length&&!cryptos.length) return '<div class="section-card"><div style="text-align:center;padding:40px;color:var(--text2)"><div style="font-size:48px;margin-bottom:12px">📊</div><div style="font-size:14px;font-weight:700">Cartera buida</div></div></div>';
  var ti=0,tc=0,rows='';
  stocks.forEach(function(e){var t=e[0],h=e[1],cp=borsaPrices['s_'+t]||h.avgPrice,c=cp*h.shares,inv=h.avgPrice*h.shares;ti+=inv;tc+=c;var pnl=c-inv,pp=inv>0?((pnl/inv)*100).toFixed(1):'0';rows+='<tr><td><strong style="color:var(--text)">'+t+'</strong></td><td>'+h.shares+'</td><td style="color:var(--gold)">'+h.avgPrice.toFixed(2)+'€</td><td>'+cp.toFixed(2)+'€</td><td style="color:'+(pnl>=0?'var(--green)':'var(--red)')+'">'+(pnl>=0?'+':'')+Math.round(pnl)+'€ ('+pp+'%)</td><td><button class="emp-btn fire" onclick="sellStock(\''+t+'\','+cp.toFixed(4)+')">Vendre</button></td></tr>';});
  cryptos.forEach(function(e){var s=e[0],h=e[1],cp=borsaPrices['c_'+s]||h.avgPrice,c=cp*h.amount,inv=h.avgPrice*h.amount;ti+=inv;tc+=c;var pnl=c-inv,pp=inv>0?((pnl/inv)*100).toFixed(1):'0',isR=!!realCryptoPrices?.[s];rows+='<tr><td><strong style="color:var(--text)">'+s+'</strong> <span style="font-size:9px;color:'+(isR?'var(--green)':'var(--text3)')+'">'+(isR?'REAL':'SIM')+'</span></td><td>'+h.amount.toFixed(4)+'</td><td style="color:var(--gold)">'+(h.avgPrice<1?h.avgPrice.toFixed(4):h.avgPrice.toFixed(2))+'€</td><td>'+(cp<1?cp.toFixed(4):cp.toFixed(2))+'€</td><td style="color:'+(pnl>=0?'var(--green)':'var(--red)')+'">'+(pnl>=0?'+':'')+Math.round(pnl)+'€ ('+pp+'%)</td><td><button class="emp-btn fire" onclick="sellCrypto(\''+s+'\','+cp.toFixed(6)+')">Vendre</button></td></tr>';});
  var tp=tc-ti;
  return '<div class="section-card" style="margin-bottom:14px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px"><div class="ratio-box"><div class="ratio-val" style="color:var(--gold)">'+fmt(Math.round(ti))+'€</div><div class="ratio-label">Invertit</div></div><div class="ratio-box"><div class="ratio-val">'+fmt(Math.round(tc))+'€</div><div class="ratio-label">Valor actual</div></div><div class="ratio-box"><div class="ratio-val" style="color:'+(tp>=0?'var(--green)':'var(--red)')+'">'+(tp>=0?'+':'')+fmt(Math.round(tp))+'€</div><div class="ratio-label">G/P</div></div></div></div><div class="section-card"><table class="portfolio-table" style="width:100%"><thead><tr><th>Actiu</th><th>Qttat</th><th>Preu mitjà</th><th>Preu actual</th><th>G/P</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function renderEduPanel(){return '<div style="display:grid;gap:12px"><div class="section-card"><div class="section-title">📚 Conceptes bàsics de borsa</div><div style="display:grid;gap:8px;font-size:12px;color:var(--text2);line-height:1.7"><div class="info-box"><strong>Acció:</strong> Part proporcional del capital d\'una empresa.</div><div class="info-box"><strong>Dividends:</strong> Part del benefici distribuïda als accionistes.</div><div class="info-box"><strong>Volatilitat:</strong> Mesura de fluctuació del preu. Alta = més risc i oportunitat.</div><div class="warn-box"><strong>PER:</strong> Preu / Benefici per acció. PER 20 = pagues 20€ per 1€ de benefici anual.</div><div class="danger-box"><strong>⚠️ Risc:</strong> Pots perdre tot el capital. Mai inverteixis diners que necessitis.</div></div></div><div class="section-card"><div class="section-title">₿ Criptoactius: riscos reals</div><div class="danger-box" style="font-size:12px;line-height:1.7"><strong>NO són diners regulats.</strong> Bitcoin va perdre 80% en 2022. Terra/Luna va arribar a 0 en 48h. FTX va fer fallida.<br><strong>MiCA:</strong> La UE regula criptoactius des de 2024, però el risc segueix sent extrem.</div></div></div>';}

function updatePortfolioTotal(port){var t=0;Object.entries(port.stocks||{}).forEach(function(e){t+=(borsaPrices['s_'+e[0]]||e[1].avgPrice)*e[1].shares;});Object.entries(port.crypto||{}).forEach(function(e){t+=(borsaPrices['c_'+e[0]]||e[1].avgPrice)*e[1].amount;});var el=document.getElementById('portfolio-total');if(el)el.textContent=fmt(Math.round(t))+'€';}

window.buyStock=async function(ticker,price,vol){var qty=parseInt(document.getElementById('qty-s-'+ticker)?.value||10),cost=qty*price,gd=getG().gameData;if((gd.finances?.cash||0)<cost){showToast('❌ Fons insuficients');return;}if(!gd.portfolio)gd.portfolio={stocks:{},crypto:{}};if(!gd.portfolio.stocks)gd.portfolio.stocks={};var ex=gd.portfolio.stocks[ticker];if(ex){var ts=ex.shares+qty;ex.avgPrice=(ex.avgPrice*ex.shares+price*qty)/ts;ex.shares=ts;ex.currentPrice=price;}else{gd.portfolio.stocks[ticker]={shares:qty,avgPrice:price,volatility:vol,currentPrice:price};}gd.finances.cash-=cost;showToast('📈 '+qty+' '+ticker+' comprades: '+fmt(Math.round(cost))+'€');await saveGameData();window.renderBorsa();};
window.sellStock=async function(ticker,price){var gd=getG().gameData,h=gd.portfolio?.stocks?.[ticker];if(!h)return;var rev=h.shares*price,prof=rev-h.shares*h.avgPrice;gd.finances.cash+=rev;delete gd.portfolio.stocks[ticker];showToast('📉 '+ticker+' venut: '+fmt(Math.round(rev))+'€ ('+(prof>=0?'+':'')+fmt(Math.round(prof))+'€)');if(Math.abs(prof)>=500)showEventToast(prof>=0?'💰':'📉',prof>=0?'Guany':'Pèrdua',ticker+': '+(prof>=0?'+':'')+fmt(Math.round(prof))+'€',prof>=0);await saveGameData();window.renderBorsa();};
window.buyCrypto=async function(symbol,price,vol){var euros=parseFloat(document.getElementById('qty-c-'+symbol)?.value||100),gd=getG().gameData;if((gd.finances?.cash||0)<euros){showToast('❌ Fons insuficients');return;}var amount=euros/price;if(!gd.portfolio)gd.portfolio={stocks:{},crypto:{}};if(!gd.portfolio.crypto)gd.portfolio.crypto={};var ex=gd.portfolio.crypto[symbol];if(ex){var ta=ex.amount+amount;ex.avgPrice=(ex.avgPrice*ex.amount+price*amount)/ta;ex.amount=ta;ex.currentPrice=price;}else{gd.portfolio.crypto[symbol]={amount:amount,avgPrice:price,volatility:vol,currentPrice:price};}gd.finances.cash-=euros;showToast('₿ '+amount.toFixed(4)+' '+symbol+': '+fmt(Math.round(euros))+'€');await saveGameData();window.renderBorsa();};
window.sellCrypto=async function(symbol,price){var gd=getG().gameData,h=gd.portfolio?.crypto?.[symbol];if(!h)return;var rev=h.amount*price,prof=rev-h.amount*h.avgPrice;gd.finances.cash+=rev;delete gd.portfolio.crypto[symbol];showToast('₿ '+symbol+' venut: '+fmt(Math.round(rev))+'€ ('+(prof>=0?'+':'')+fmt(Math.round(prof))+'€)');if(Math.abs(prof)>=500)showEventToast(prof>=0?'💰':'📉',prof>=0?'Guany':'Pèrdua',symbol+': '+(prof>=0?'+':'')+fmt(Math.round(prof))+'€',prof>=0);await saveGameData();window.renderBorsa();};
})();
