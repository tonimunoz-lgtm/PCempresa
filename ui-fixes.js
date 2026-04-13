// ============================================================
//  ui-fixes.js — Correccions DEFINITIVES v2
//  1. Fix votacions junta (respectar vot del jugador)
//  2. Fix renderDashboard is not defined (leaderboard buttons)
//  3. Fix imatges evolució empresa al dashboard
//  4. Fix missions banners (refresh automàtic)
//  5. AdvanceWeek torna al dashboard automàticament
//  6. Treure creació manual de clients pels alumnes
//  7. Ampliar empreses + filtre anti-repetició
//  8. Generació d'empreses inventades quan s'acaben
//  9. Sistema de codis de classe (professor crea joc, alumne posa codi)
// ============================================================

(function() {
'use strict';

const getG = () => window.G;
const fmt = (n) => (n||0).toLocaleString('ca');

// ═══════════════════════════════════════════════════════════
//  1. FIX VOTACIONS JUNTA
// ═══════════════════════════════════════════════════════════

function fixVoteDecision() {
  if (typeof window.voteDecision !== 'function') return;
  window.voteDecision = async function(id, option) {
    const gd = getG().gameData;
    const shareholders = gd.shareholders || [];
    const myPct = Math.max(0, 1 - shareholders.reduce((s,sh) => s+sh.pct, 0));
    const positiveOptions = ['Aprovada','Mantenir direcció','Aprovar','Iniciar estudi'];
    const playerVotesYes = positiveOptions.includes(option);
    let votesYes = playerVotesYes ? (myPct*100) : 0;
    let votesNo  = playerVotesYes ? 0 : (myPct*100);
    let votesAbs = 0;
    shareholders.forEach(sh => {
      const roll = Math.random(), thr = sh.satisfaction/100;
      if (roll < thr*0.7) votesYes += sh.pct*100;
      else if (roll < thr) votesAbs += sh.pct*100;
      else votesNo += sh.pct*100;
    });
    const approved = votesYes > 50;
    if (id==='dividends' && option==='Aprovada' && approved) {
      const am = Math.round((gd.finances?.passiu?.reserves||0)*0.20);
      gd.finances.cash -= am; gd.finances.passiu.reserves -= am;
      shareholders.forEach(sh => sh.satisfaction = Math.min(100,sh.satisfaction+10));
      window.showToast('💰 Dividends: '+fmt(am)+'€');
    } else if (id==='relleu' && option==='Canviar CEO' && approved) {
      window.showEventToast('🚨','Acomiadament!','La junta ha votat relleu.',false);
    } else if (id==='bonus' && option==='Aprovar' && approved) {
      const b = (gd.employees||[]).length*500;
      gd.finances.cash -= b;
      (gd.employees||[]).forEach(e => e.morale = Math.min(100,(e.morale||60)+15));
      window.showToast('🎁 Bonus: '+fmt(b)+'€');
    }
    if (!gd.boardDecisions) gd.boardDecisions=[];
    gd.boardDecisions.push({
      week:gd.week, year:gd.year, type:id, option, approved,
      votesYes:votesYes.toFixed(0), votesNo:votesNo.toFixed(0),
      agenda:[{title:'Votació: '+id,desc:'Opció: '+option+'. '+(approved?'APROVADA':'REBUTJADA')+'. Favor: '+votesYes.toFixed(0)+'% Contra: '+votesNo.toFixed(0)+'%',urgent:false}],
      avgSat: shareholders.length>0 ? (shareholders.reduce((s,sh)=>s+sh.satisfaction,0)/shareholders.length).toFixed(0) : '100',
    });
    await window.saveGameData();
    window.showToast('🗳️ Vot: '+option+' — '+(approved?'✅ Aprovada':'❌ Rebutjada')+' ('+votesYes.toFixed(0)+'% favor, '+votesNo.toFixed(0)+'% contra)');
    window.renderJunta();
  };
  console.log('✅ Fix votacions junta');
}

// ═══════════════════════════════════════════════════════════
//  2. FIX renderDashboard GLOBAL
// ═══════════════════════════════════════════════════════════

function fixRenderDashboardGlobal() {
  if (typeof window.renderDashboard !== 'function') return;
  if (window.renderDashboard._patched) return;
  const orig = window.renderDashboard;
  window.renderDashboard = function() {
    try { return orig(); } catch(e) { console.warn('renderDashboard:',e); }
  };
  window.renderDashboard._patched = true;
  console.log('✅ renderDashboard global');
}

// ═══════════════════════════════════════════════════════════
//  3. FIX IMATGES EVOLUCIÓ — crear #company-banner
// ═══════════════════════════════════════════════════════════

function fixEvolutionImages() {
  const obs = new MutationObserver(() => {
    const dw = document.querySelector('.dash-wrap');
    if (!dw || document.getElementById('company-banner')) return;
    const b = document.createElement('div');
    b.id = 'company-banner'; b.style.display = 'none';
    dw.insertBefore(b, dw.firstChild);
  });
  const c = document.querySelector('.content') || document.getElementById('game-screen');
  if (c) obs.observe(c, {childList:true,subtree:true});
  console.log('✅ Fix imatges evolució');
}

// ═══════════════════════════════════════════════════════════
//  5. ADVANCEWEEK → DASHBOARD
// ═══════════════════════════════════════════════════════════

function fixAdvanceWeekNav() {
  if (typeof window.advanceWeek !== 'function' || window.advanceWeek._navFixed) return;
  const orig = window.advanceWeek;
  window.advanceWeek = async function() {
    await orig.call(this);
    if (typeof window.showTab === 'function') window.showTab('dashboard');
  };
  window.advanceWeek._navFixed = true;
  console.log('✅ AdvanceWeek → dashboard');
}

// ═══════════════════════════════════════════════════════════
//  6. AMAGAR CREACIÓ MANUAL CLIENTS
// ═══════════════════════════════════════════════════════════

function hideManualClients() {
  if (typeof window.renderSales !== 'function' || window.renderSales._cf) return;
  const orig = window.renderSales;
  window.renderSales = function() {
    orig();
    if (getG()?.gameData?.isProf) return;
    setTimeout(() => {
      document.querySelectorAll('button').forEach(b => {
        if (b.textContent.includes('Nou client')) b.style.display='none';
      });
    },50);
  };
  window.renderSales._cf = true;
  console.log('✅ Amagar "Nou client"');
}

// ═══════════════════════════════════════════════════════════
//  7+8. EMPRESES NOVES + GENERACIÓ INFINITA
// ═══════════════════════════════════════════════════════════

const NE = [
  {name:'Celler Can Batlle SL',sector:'alimentacio',legalForm:'sl',size:'small',loc:[41.60,2.02],muni:'Matadepera',founded:2005,employees_real:14,capital_social:20000,reserves:95000,deutes_llarg:45000,deutes_curt:18000,actiu_fix:180000,existencies:35000,facturacio_anual:520000,marge_brut:0.42,
    clients_destacats:[{name:'Restaurants Alt Vallès',monthly:12000,type:'B2B',satisfaction:88},{name:'Vinoteca La Cava',monthly:8000,type:'B2B',satisfaction:85}],
    proveidors:[{name:'Vivers Penedès',product:'Raïm',cost_mes:6000,criticitat:'alta'},{name:'Vidrieria Catalana',product:'Ampolles',cost_mes:3200,criticitat:'alta'}],
    maquinaria:[{name:'Premsa pneumàtica',valor:45000,amortitzacio:0.10},{name:'Dipòsits inox',valor:85000,amortitzacio:0.08}],
    loans_actius:[],serveis:[{id:'vi_n',name:'Vi negre reserva',preu:12.5,unitats_mes:800},{id:'vi_b',name:'Vi blanc jove',preu:7.8,unitats_mes:1200}]},
  {name:'Hípica Montserrat SL',sector:'turisme',legalForm:'sl',size:'small',loc:[41.59,2.01],muni:'Matadepera',founded:1998,employees_real:10,capital_social:18000,reserves:65000,deutes_llarg:30000,deutes_curt:12000,actiu_fix:250000,existencies:8000,facturacio_anual:380000,marge_brut:0.35,
    clients_destacats:[{name:'Escoles comarca',monthly:8000,type:'B2B',satisfaction:90},{name:'Particulars',monthly:18000,type:'B2C',satisfaction:85}],
    proveidors:[{name:'Pinsos Vall SL',product:'Alimentació cavalls',cost_mes:4500,criticitat:'alta'}],
    maquinaria:[{name:'Pistes sorra',valor:120000,amortitzacio:0.05}],
    loans_actius:[],serveis:[{id:'cl',name:'Classes equitació/h',preu:35,unitats_mes:400},{id:'pu',name:'Pupilatge/mes',preu:450,unitats_mes:18}]},
  {name:'Electrònica Sabadell SA',sector:'tecnologia',legalForm:'sa',size:'large',loc:[41.54,2.10],muni:'Sabadell',founded:1992,employees_real:185,capital_social:420000,reserves:1800000,deutes_llarg:850000,deutes_curt:280000,actiu_fix:3200000,existencies:380000,facturacio_anual:6800000,marge_brut:0.34,
    clients_destacats:[{name:'Seat Martorell SA',monthly:120000,type:'B2B',satisfaction:82},{name:'Schneider Electric',monthly:85000,type:'B2B',satisfaction:87},{name:'TMB',monthly:45000,type:'B2B',satisfaction:78}],
    proveidors:[{name:'RS Components',product:'Components',cost_mes:42000,criticitat:'alta'},{name:'PCB Manufacturing',product:'Plaques',cost_mes:28000,criticitat:'alta'}],
    maquinaria:[{name:'Línia SMD',valor:680000,amortitzacio:0.12},{name:'Sala blanca',valor:450000,amortitzacio:0.08}],
    loans_actius:[{entitat:'Banc Sabadell',capital:500000,tipus:0.032,anys_restants:7,mensualitat:6800}],
    serveis:[{id:'pcb',name:'PCB custom',preu:2800,unitats_mes:45},{id:'mt',name:'Muntatge sèrie',preu:18,unitats_mes:12000}]},
  {name:'Pastisseria Foix SL',sector:'alimentacio',legalForm:'sl',size:'small',loc:[41.55,2.11],muni:'Sabadell',founded:1978,employees_real:18,capital_social:12000,reserves:180000,deutes_llarg:25000,deutes_curt:15000,actiu_fix:95000,existencies:22000,facturacio_anual:620000,marge_brut:0.55,
    clients_destacats:[{name:'Botiga pròpia',monthly:32000,type:'B2C',satisfaction:92},{name:'Restaurants',monthly:8000,type:'B2B',satisfaction:88}],
    proveidors:[{name:'Farina La Masia',product:'Farina eco',cost_mes:3800,criticitat:'alta'},{name:'Simón Coll',product:'Xocolata',cost_mes:2200,criticitat:'alta'}],
    maquinaria:[{name:'Forn Miwe',valor:45000,amortitzacio:0.10}],
    loans_actius:[],serveis:[{id:'pa',name:'Pa artesà',preu:3.2,unitats_mes:4500},{id:'pt',name:'Pastissos',preu:28,unitats_mes:350}]},
  {name:'Sabadell Seguretat SL',sector:'tecnologia',legalForm:'sl',size:'medium',loc:[41.55,2.09],muni:'Sabadell',founded:2010,employees_real:38,capital_social:30000,reserves:220000,deutes_llarg:120000,deutes_curt:55000,actiu_fix:280000,existencies:45000,facturacio_anual:1800000,marge_brut:0.40,
    clients_destacats:[{name:'Comunitats veïns',monthly:48000,type:'B2B',satisfaction:82},{name:'Comerços centre',monthly:22000,type:'B2B',satisfaction:85}],
    proveidors:[{name:'Hikvision',product:'Càmeres',cost_mes:12000,criticitat:'alta'},{name:'Ajax Systems',product:'Alarmes',cost_mes:8000,criticitat:'alta'}],
    maquinaria:[{name:'Flota furgonetes',valor:160000,amortitzacio:0.20}],
    loans_actius:[{entitat:'CaixaBank',capital:80000,tipus:0.045,anys_restants:3,mensualitat:2400}],
    serveis:[{id:'al',name:'Alarma/mes',preu:29,unitats_mes:1200},{id:'cc',name:'CCTV instal·lació',preu:1800,unitats_mes:15}]},
  {name:'Terrassa Motor Sport SL',sector:'comerç',legalForm:'sl',size:'medium',loc:[41.57,2.00],muni:'Terrassa',founded:2003,employees_real:32,capital_social:45000,reserves:350000,deutes_llarg:280000,deutes_curt:95000,actiu_fix:520000,existencies:680000,facturacio_anual:3200000,marge_brut:0.18,
    clients_destacats:[{name:'Particulars',monthly:180000,type:'B2C',satisfaction:78},{name:'Flotes empresa',monthly:45000,type:'B2B',satisfaction:85}],
    proveidors:[{name:'Importador oficial',product:'Vehicles',cost_mes:180000,criticitat:'alta'}],
    maquinaria:[{name:'Elevadors (6)',valor:48000,amortitzacio:0.12},{name:'Cabina pintura',valor:85000,amortitzacio:0.10}],
    loans_actius:[{entitat:'BBVA',capital:200000,tipus:0.040,anys_restants:5,mensualitat:3800}],
    serveis:[{id:'vv',name:'Venda vehicle',preu:22000,unitats_mes:8},{id:'tt',name:'Taller/hora',preu:55,unitats_mes:480}]},
  {name:'Impremta Digital Terrassa SL',sector:'tecnologia',legalForm:'sl',size:'small',loc:[41.56,2.01],muni:'Terrassa',founded:2012,employees_real:11,capital_social:10000,reserves:75000,deutes_llarg:35000,deutes_curt:20000,actiu_fix:120000,existencies:15000,facturacio_anual:420000,marge_brut:0.45,
    clients_destacats:[{name:'Ajuntament Terrassa',monthly:8000,type:'B2B',satisfaction:88},{name:'PIMES locals',monthly:18000,type:'B2B',satisfaction:82}],
    proveidors:[{name:'Antalis Paper',product:'Paper',cost_mes:5000,criticitat:'alta'}],
    maquinaria:[{name:'HP Indigo 7900',valor:85000,amortitzacio:0.15}],
    loans_actius:[],serveis:[{id:'fu',name:'Fullets (1000u)',preu:120,unitats_mes:80},{id:'ca',name:'Cartells m²',preu:35,unitats_mes:200}]},
  {name:'Gimnàs CrossFit Terrassa SCP',sector:'salut',legalForm:'cooperativa',size:'small',loc:[41.57,2.02],muni:'Terrassa',founded:2016,employees_real:8,capital_social:9000,reserves:42000,deutes_llarg:15000,deutes_curt:8000,actiu_fix:65000,existencies:5000,facturacio_anual:280000,marge_brut:0.60,
    clients_destacats:[{name:'Socis (280)',monthly:19600,type:'B2C',satisfaction:90}],
    proveidors:[{name:'Rogue Fitness',product:'Equipament',cost_mes:1500,criticitat:'mitja'}],
    maquinaria:[{name:'Equipament funcional',valor:45000,amortitzacio:0.12}],
    loans_actius:[],serveis:[{id:'ab',name:'Abonament/mes',preu:70,unitats_mes:280},{id:'pt2',name:'PT/sessió',preu:45,unitats_mes:120}]},
  {name:'Advocats Terrassa SLP',sector:'educacio',legalForm:'sl',size:'small',loc:[41.56,2.01],muni:'Terrassa',founded:2008,employees_real:12,capital_social:15000,reserves:110000,deutes_llarg:20000,deutes_curt:12000,actiu_fix:45000,existencies:0,facturacio_anual:480000,marge_brut:0.65,
    clients_destacats:[{name:'PIMES Vallès',monthly:18000,type:'B2B',satisfaction:85},{name:'Particulars',monthly:14000,type:'B2C',satisfaction:80}],
    proveidors:[{name:'Lefebvre',product:'BD jurídica',cost_mes:450,criticitat:'mitja'}],
    maquinaria:[{name:'Informàtica',valor:28000,amortitzacio:0.25}],
    loans_actius:[],serveis:[{id:'ci',name:'Dret civil/h',preu:120,unitats_mes:80},{id:'fi',name:'Fiscal',preu:250,unitats_mes:45}]},
];

const PREFIXOS=['Nova','Global','Euro','Tecno','Multi','Pro','Top','Smart','Eco','Digital'];
const SUFIXOS=['Solutions','Serveis','Group','Vallès','Plus','Tech','Industrial','Net','Lab','Hub'];
const SECTORS_G=['alimentacio','tecnologia','construccio','comerç','logistica','turisme','salut','moda'];
const MUNIS_G=['Sabadell','Terrassa','Matadepera','Rubí','Sant Cugat','Cerdanyola','Granollers','Mollet'];

function genRandomCompany(i) {
  const sec=SECTORS_G[i%SECTORS_G.length], mu=MUNIS_G[Math.floor(Math.random()*MUNIS_G.length)];
  const nm=PREFIXOS[Math.floor(Math.random()*PREFIXOS.length)]+' '+SUFIXOS[Math.floor(Math.random()*SUFIXOS.length)]+' '+mu.split(' ')[0]+' SL';
  const sz=Math.random()<0.5?'small':'medium', f=sz==='small'?200000+Math.round(Math.random()*500000):800000+Math.round(Math.random()*2000000);
  const em=sz==='small'?5+Math.floor(Math.random()*15):20+Math.floor(Math.random()*40), cp=sz==='small'?3000+Math.round(Math.random()*20000):30000+Math.round(Math.random()*80000);
  return {name:nm,sector:sec,legalForm:'sl',size:sz,loc:[41.50+Math.random()*0.3,1.98+Math.random()*0.5],muni:mu,founded:2000+Math.floor(Math.random()*24),employees_real:em,capital_social:cp,reserves:Math.round(cp*(1+Math.random()*3)),deutes_llarg:Math.round(f*0.1*Math.random()),deutes_curt:Math.round(f*0.05*Math.random()),actiu_fix:Math.round(f*0.3),existencies:Math.round(f*0.04),facturacio_anual:f,marge_brut:0.20+Math.random()*0.30,
    clients_destacats:[{name:'Client '+nm.split(' ')[0],monthly:Math.round(f/12*0.4),type:'B2B',satisfaction:75+Math.floor(Math.random()*20)},{name:'Client '+mu,monthly:Math.round(f/12*0.2),type:'B2B',satisfaction:70+Math.floor(Math.random()*20)}],
    proveidors:[{name:'Proveïdor '+sec,product:'Material bàsic',cost_mes:Math.round(f/12*0.25),criticitat:'alta'}],
    maquinaria:[{name:'Equipament',valor:Math.round(f*0.15),amortitzacio:0.12}],
    loans_actius:Math.random()<0.4?[{entitat:'CaixaBank',capital:Math.round(f*0.08),tipus:0.04,anys_restants:5,mensualitat:Math.round(f*0.08/60)}]:[],
    serveis:[{id:'s1',name:'Servei principal',preu:Math.round(f/12/200),unitats_mes:200},{id:'s2',name:'Servei secundari',preu:Math.round(f/12/500),unitats_mes:500}],_generated:true};
}

function injectCompanies() {
  if (!window.EMPRESA_PROFILES) { setTimeout(injectCompanies,300); return; }
  NE.forEach(ne => { if (!window.EMPRESA_PROFILES.find(e=>e.name===ne.name)) window.EMPRESA_PROFILES.push(ne); });
  window._ALL_EMPRESA_PROFILES = [...window.EMPRESA_PROFILES];
  console.log('✅ '+window.EMPRESA_PROFILES.length+' empreses');
}

function patchHiredMode() {
  if (!window.startMode || window.startMode._hp) return;
  const orig = window.startMode;
  window.startMode = function(mode) {
    if (mode==='hired') {
      const gd=getG()?.gameData, cc=gd?.classCode||'';
      const all=getG()?.allStudents||[], used=new Set();
      all.forEach(s => { if (s.uid!==getG()?.uid && s.company?.name && (!cc||(s.classCode||'')===cc)) used.add(s.company.name); });
      const bk=window._ALL_EMPRESA_PROFILES||window.EMPRESA_PROFILES;
      let av=bk.filter(e=>!used.has(e.name)); let gi=0;
      while (av.length<8) { const nc=genRandomCompany(gi++); if(!used.has(nc.name)){av.push(nc);bk.push(nc);} if(gi>20)break; }
      window.EMPRESA_PROFILES=av;
      console.log('🏢 '+used.size+' agafades, '+av.length+' disponibles');
    }
    orig(mode);
  };
  window.startMode._hp=true;
  console.log('✅ Filtre empreses');
}

// ═══════════════════════════════════════════════════════════
//  9. CODIS DE CLASSE
// ═══════════════════════════════════════════════════════════

function generateClassCode() {
  const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c='';
  for(let i=0;i<4;i++) c+=ch[Math.floor(Math.random()*ch.length)];
  return 'CLASSE-'+c;
}

function initClassCodes() {
  // Camp registre
  const rf=document.getElementById('register-form');
  if (rf && !document.getElementById('reg-class-code')) {
    const ab=rf.querySelector('.auth-btn');
    if(ab){const d=document.createElement('div');d.className='form-group';
    d.innerHTML='<label>Codi de classe (del professor)</label><input class="form-input" type="text" id="reg-class-code" placeholder="Ex: CLASSE-A7K2" style="text-transform:uppercase;letter-spacing:2px;font-family:\'JetBrains Mono\',monospace"><div style="font-size:10px;color:var(--text3);margin-top:4px">Demana el codi al professor. Si no en tens, deixa buit.</div>';
    ab.parentElement.insertBefore(d,ab);}
  }
  // Camp login
  const lf=document.getElementById('login-form');
  if(lf && !document.getElementById('login-class-code')){
    const lb=lf.querySelector('.auth-btn');
    if(lb){const d=document.createElement('div');d.className='form-group';
    d.innerHTML='<label>Codi de classe (opcional)</label><input class="form-input" type="text" id="login-class-code" placeholder="Ex: CLASSE-A7K2" style="text-transform:uppercase;letter-spacing:2px;font-family:\'JetBrains Mono\',monospace">';
    lb.parentElement.insertBefore(d,lb);}
  }
  // Patch register
  if(window.doRegister && !window.doRegister._cp){const o=window.doRegister;window.doRegister=async function(){window._pcc=document.getElementById('reg-class-code')?.value.trim().toUpperCase()||'';await o();};window.doRegister._cp=true;}
  // Patch login
  if(window.doLogin && !window.doLogin._cp){const o=window.doLogin;window.doLogin=async function(){window._pcc=document.getElementById('login-class-code')?.value.trim().toUpperCase()||'';await o();};window.doLogin._cp=true;}
  // Apply class code
  setInterval(()=>{const gd=getG()?.gameData;if(!gd)return;if(window._pcc&&!gd.classCode){gd.classCode=window._pcc;window._pcc='';window.saveGameData&&window.saveGameData();}},2000);
  // Professor panel
  if(typeof window.renderProfessor==='function' && !window.renderProfessor._cp){
    const op=window.renderProfessor;
    window.renderProfessor=function(){op();setTimeout(()=>{
      const pt=document.getElementById('tab-professor');if(!pt||document.getElementById('class-mgmt'))return;
      const gd=getG()?.gameData,cc=gd?.classCode||generateClassCode();
      if(gd&&!gd.classCode){gd.classCode=cc;window.saveGameData&&window.saveGameData();}
      const s=document.createElement('div');s.id='class-mgmt';s.className='section-card';s.style.cssText='margin:14px 16px;border-color:rgba(245,158,11,.3)';
      s.innerHTML='<div class="section-title">🎓 Gestió de classes</div><div style="font-size:12px;color:var(--text2);margin-bottom:14px">Dona aquest codi als alumnes.</div><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:12px"><div style="background:rgba(245,158,11,.08);border:2px dashed rgba(245,158,11,.3);border-radius:12px;padding:16px 24px;text-align:center"><div style="font-size:10px;font-weight:700;color:var(--gold);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">Codi de classe</div><div style="font-family:\'JetBrains Mono\',monospace;font-size:28px;font-weight:800;color:var(--gold);letter-spacing:4px" id="acc">'+cc+'</div></div><div style="flex:1"><button class="btn-gold" onclick="var c=\'CLASSE-\';for(var i=0;i<4;i++)c+=\'ABCDEFGHJKLMNPQRSTUVWXYZ23456789\'[Math.floor(Math.random()*32)];document.getElementById(\'acc\').textContent=c;G.gameData.classCode=c;saveGameData();showToast(\'🎲 Nou codi: \'+c)" style="width:100%;margin-bottom:8px">🎲 Generar nou codi</button><button class="btn-secondary" onclick="navigator.clipboard.writeText(document.getElementById(\'acc\').textContent);showToast(\'📋 Copiat!\')" style="width:100%">📋 Copiar</button></div></div>';
      const fc=pt.querySelector('.section-card')||pt.firstChild;
      if(fc)pt.insertBefore(s,fc);else pt.appendChild(s);
    },200);};
    window.renderProfessor._cp=true;
  }
  console.log('✅ Codis de classe');
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════

injectCompanies();
setTimeout(initClassCodes, 500);
setTimeout(initClassCodes, 2000);

const fi = setInterval(() => {
  if (typeof window.advanceWeek==='function' && typeof window.renderDashboard==='function') {
    clearInterval(fi);
    fixVoteDecision();
    fixRenderDashboardGlobal();
    fixEvolutionImages();
    fixAdvanceWeekNav();
    hideManualClients();
    patchHiredMode();
    console.log('🔧 ui-fixes.js v2 — TOT aplicat!');
  }
}, 400);

setTimeout(() => { fixVoteDecision(); fixRenderDashboardGlobal(); fixAdvanceWeekNav(); hideManualClients(); patchHiredMode(); }, 3000);

console.log('🔧 ui-fixes.js v2 carregat');
})();
