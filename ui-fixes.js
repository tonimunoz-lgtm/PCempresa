// ============================================================
//  ui-fixes.js v4 — Correccions definitives
// ============================================================
(function() {
'use strict';
const getG = () => window.G;
const fmt = (n) => (n||0).toLocaleString('ca');

// ═══════════════════════════════════════════════════════════
//  0. EXPOSAR FUNCIONS DEL MODULE
// ═══════════════════════════════════════════════════════════
function exposeModuleFunctions() {
  if (window._fExp) return;
  // renderDashboard wrapper si no és global
  if (typeof window.renderDashboard !== 'function') {
    window.renderDashboard = function() { window.showTab && window.showTab('dashboard'); };
  }
  // wizardData wrapper
  if (typeof window.wizardData === 'undefined') window.wizardData = {};
  // finishWizard wrapper
  if (typeof window.finishWizard === 'undefined') {
    window.finishWizard = function() {
      if (window.wizardNext) window.wizardNext();
      else window.showToast && window.showToast('❌ Error. Recarrega la pàgina i afegeix les línies a index.html.');
    };
  }
  window._fExp = true;
}

// ═══════════════════════════════════════════════════════════
//  1. FIX VOTACIONS JUNTA
// ═══════════════════════════════════════════════════════════
function fixVotes() {
  if (typeof window.voteDecision !== 'function' || window.voteDecision._f) return;
  window.voteDecision = async function(id, option) {
    const gd = getG().gameData, sh = gd.shareholders || [];
    const myPct = Math.max(0, 1 - sh.reduce((s,x) => s+x.pct, 0));
    const yes = ['Aprovada','Mantenir direcció','Aprovar','Iniciar estudi'].includes(option);
    let vY = yes ? myPct*100 : 0, vN = yes ? 0 : myPct*100, vA = 0;
    sh.forEach(x => { const r=Math.random(),t=x.satisfaction/100; if(r<t*0.65)vY+=x.pct*100; else if(r<t*0.85)vA+=x.pct*100; else vN+=x.pct*100; });
    const ok = vY > 50;
    if (id==='dividends'&&option==='Aprovada'&&ok){const a=Math.round((gd.finances?.passiu?.reserves||0)*0.2);gd.finances.cash-=a;gd.finances.passiu.reserves-=a;sh.forEach(x=>x.satisfaction=Math.min(100,x.satisfaction+10));}
    else if(id==='bonus'&&option==='Aprovar'&&ok){const b=(gd.employees||[]).length*500;gd.finances.cash-=b;(gd.employees||[]).forEach(e=>e.morale=Math.min(100,(e.morale||60)+15));}
    if(!gd.boardDecisions)gd.boardDecisions=[];
    gd.boardDecisions.push({week:gd.week,year:gd.year,type:id,option,approved:ok,votesYes:vY.toFixed(0),votesNo:vN.toFixed(0),agenda:[{title:'Votació: '+id,desc:'Vot: '+option+'. '+(ok?'APROVADA':'REBUTJADA')+'. Favor:'+vY.toFixed(0)+'% Contra:'+vN.toFixed(0)+'%',urgent:false}]});
    await window.saveGameData();
    window.showToast('🗳️ '+option+' — '+(ok?'✅ Aprovada':'❌ Rebutjada')+' ('+vY.toFixed(0)+'%/'+vN.toFixed(0)+'%)');
    window.renderJunta&&window.renderJunta();
  };
  window.voteDecision._f=true;
}

// ═══════════════════════════════════════════════════════════
//  2. SECTORS NOUS
// ═══════════════════════════════════════════════════════════
function addSectors() {
  const arr = window.SECTORS_DATA || window.SECTORS;
  if (!arr) return;
  [{id:'entreteniment',name:'Entreteniment i Oci',icon:'🎮',sector:'Serveis'},
   {id:'energia',name:'Energia i Medi Ambient',icon:'⚡',sector:'Producció'},
   {id:'immobiliari',name:'Sector Immobiliari',icon:'🏠',sector:'Serveis'}
  ].forEach(ns => { if(!arr.find(s=>s.id===ns.id)) arr.push(ns); });
  if(window.SECTORS && window.SECTORS!==arr) {
    [{id:'entreteniment',name:'Entreteniment i Oci',icon:'🎮',sector:'Serveis'},
     {id:'energia',name:'Energia i Medi Ambient',icon:'⚡',sector:'Producció'},
     {id:'immobiliari',name:'Sector Immobiliari',icon:'🏠',sector:'Serveis'}
    ].forEach(ns => { if(!window.SECTORS.find(s=>s.id===ns.id)) window.SECTORS.push(ns); });
  }
}

// ═══════════════════════════════════════════════════════════
//  3. ADVANCEWEEK → DASHBOARD
// ═══════════════════════════════════════════════════════════
function fixAdvance() {
  if (typeof window.advanceWeek!=='function'||window.advanceWeek._nf) return;
  const o=window.advanceWeek;
  window.advanceWeek=async function(){await o.call(this);window.showTab&&window.showTab('dashboard');};
  window.advanceWeek._nf=true;
}

// ═══════════════════════════════════════════════════════════
//  4. AMAGAR CLIENT MANUAL
// ═══════════════════════════════════════════════════════════
function hideClients() {
  if(typeof window.renderSales!=='function'||window.renderSales._hc) return;
  const o=window.renderSales;
  window.renderSales=function(){o();if(getG()?.gameData?.isProf)return;setTimeout(()=>{document.querySelectorAll('button').forEach(b=>{if(b.textContent.includes('Nou client'))b.style.display='none';});},80);};
  window.renderSales._hc=true;
}

// ═══════════════════════════════════════════════════════════
//  5. EMPRESES NOVES + INFINITES
// ═══════════════════════════════════════════════════════════
const NE=[
  {name:'Celler Can Batlle SL',sector:'alimentacio',legalForm:'sl',size:'small',muni:'Matadepera',founded:2005,employees_real:14,capital_social:20000,reserves:95000,deutes_llarg:45000,deutes_curt:18000,actiu_fix:180000,existencies:35000,facturacio_anual:520000,marge_brut:0.42,loc:[41.60,2.02],clients_destacats:[{name:'Restaurants Vallès',monthly:12000,type:'B2B',satisfaction:88}],proveidors:[{name:'Vivers Penedès',product:'Raïm',cost_mes:6000,criticitat:'alta'}],maquinaria:[{name:'Premsa',valor:45000,amortitzacio:0.10}],loans_actius:[],serveis:[{id:'v1',name:'Vi negre',preu:12.5,unitats_mes:800}]},
  {name:'Hípica Montserrat SL',sector:'turisme',legalForm:'sl',size:'small',muni:'Matadepera',founded:1998,employees_real:10,capital_social:18000,reserves:65000,deutes_llarg:30000,deutes_curt:12000,actiu_fix:250000,existencies:8000,facturacio_anual:380000,marge_brut:0.35,loc:[41.59,2.01],clients_destacats:[{name:'Escoles',monthly:8000,type:'B2B',satisfaction:90}],proveidors:[{name:'Pinsos Vall',product:'Alimentació',cost_mes:4500,criticitat:'alta'}],maquinaria:[{name:'Pistes',valor:120000,amortitzacio:0.05}],loans_actius:[],serveis:[{id:'c1',name:'Classes/h',preu:35,unitats_mes:400}]},
  {name:'Electrònica Sabadell SA',sector:'tecnologia',legalForm:'sa',size:'large',muni:'Sabadell',founded:1992,employees_real:185,capital_social:420000,reserves:1800000,deutes_llarg:850000,deutes_curt:280000,actiu_fix:3200000,existencies:380000,facturacio_anual:6800000,marge_brut:0.34,loc:[41.54,2.10],clients_destacats:[{name:'Seat',monthly:120000,type:'B2B',satisfaction:82}],proveidors:[{name:'RS Components',product:'Components',cost_mes:42000,criticitat:'alta'}],maquinaria:[{name:'Línia SMD',valor:680000,amortitzacio:0.12}],loans_actius:[{entitat:'Banc Sabadell',capital:500000,tipus:0.032,anys_restants:7,mensualitat:6800}],serveis:[{id:'p1',name:'PCB custom',preu:2800,unitats_mes:45}]},
  {name:'Pastisseria Foix SL',sector:'alimentacio',legalForm:'sl',size:'small',muni:'Sabadell',founded:1978,employees_real:18,capital_social:12000,reserves:180000,deutes_llarg:25000,deutes_curt:15000,actiu_fix:95000,existencies:22000,facturacio_anual:620000,marge_brut:0.55,loc:[41.55,2.11],clients_destacats:[{name:'Botiga pròpia',monthly:32000,type:'B2C',satisfaction:92}],proveidors:[{name:'Farina La Masia',product:'Farina',cost_mes:3800,criticitat:'alta'}],maquinaria:[{name:'Forn',valor:45000,amortitzacio:0.10}],loans_actius:[],serveis:[{id:'pa',name:'Pa artesà',preu:3.2,unitats_mes:4500}]},
  {name:'Sabadell Seguretat SL',sector:'tecnologia',legalForm:'sl',size:'medium',muni:'Sabadell',founded:2010,employees_real:38,capital_social:30000,reserves:220000,deutes_llarg:120000,deutes_curt:55000,actiu_fix:280000,existencies:45000,facturacio_anual:1800000,marge_brut:0.40,loc:[41.55,2.09],clients_destacats:[{name:'Comunitats',monthly:48000,type:'B2B',satisfaction:82}],proveidors:[{name:'Hikvision',product:'Càmeres',cost_mes:12000,criticitat:'alta'}],maquinaria:[{name:'Furgonetes',valor:160000,amortitzacio:0.20}],loans_actius:[],serveis:[{id:'a1',name:'Alarma/mes',preu:29,unitats_mes:1200}]},
  {name:'Terrassa Motor Sport SL',sector:'comerç',legalForm:'sl',size:'medium',muni:'Terrassa',founded:2003,employees_real:32,capital_social:45000,reserves:350000,deutes_llarg:280000,deutes_curt:95000,actiu_fix:520000,existencies:680000,facturacio_anual:3200000,marge_brut:0.18,loc:[41.57,2.00],clients_destacats:[{name:'Particulars',monthly:180000,type:'B2C',satisfaction:78}],proveidors:[{name:'Importador',product:'Vehicles',cost_mes:180000,criticitat:'alta'}],maquinaria:[{name:'Elevadors',valor:48000,amortitzacio:0.12}],loans_actius:[],serveis:[{id:'vv',name:'Venda vehicle',preu:22000,unitats_mes:8}]},
  {name:'Impremta Terrassa SL',sector:'tecnologia',legalForm:'sl',size:'small',muni:'Terrassa',founded:2012,employees_real:11,capital_social:10000,reserves:75000,deutes_llarg:35000,deutes_curt:20000,actiu_fix:120000,existencies:15000,facturacio_anual:420000,marge_brut:0.45,loc:[41.56,2.01],clients_destacats:[{name:'Ajuntament',monthly:8000,type:'B2B',satisfaction:88}],proveidors:[{name:'Antalis',product:'Paper',cost_mes:5000,criticitat:'alta'}],maquinaria:[{name:'HP Indigo',valor:85000,amortitzacio:0.15}],loans_actius:[],serveis:[{id:'fu',name:'Fullets',preu:120,unitats_mes:80}]},
  {name:'CrossFit Terrassa SCP',sector:'salut',legalForm:'cooperativa',size:'small',muni:'Terrassa',founded:2016,employees_real:8,capital_social:9000,reserves:42000,deutes_llarg:15000,deutes_curt:8000,actiu_fix:65000,existencies:5000,facturacio_anual:280000,marge_brut:0.60,loc:[41.57,2.02],clients_destacats:[{name:'Socis (280)',monthly:19600,type:'B2C',satisfaction:90}],proveidors:[{name:'Rogue Fitness',product:'Equipament',cost_mes:1500,criticitat:'mitja'}],maquinaria:[{name:'Equipament',valor:45000,amortitzacio:0.12}],loans_actius:[],serveis:[{id:'ab',name:'Abonament',preu:70,unitats_mes:280}]},
  {name:'Escape Room Terrassa SL',sector:'entreteniment',legalForm:'sl',size:'small',muni:'Terrassa',founded:2018,employees_real:9,capital_social:12000,reserves:55000,deutes_llarg:20000,deutes_curt:10000,actiu_fix:85000,existencies:5000,facturacio_anual:320000,marge_brut:0.65,loc:[41.56,2.00],clients_destacats:[{name:'Grups',monthly:18000,type:'B2C',satisfaction:92}],proveidors:[{name:'Props SL',product:'Mecanismes',cost_mes:1500,criticitat:'mitja'}],maquinaria:[{name:'Electrònica sales',valor:45000,amortitzacio:0.15}],loans_actius:[],serveis:[{id:'er',name:'Partida grup',preu:75,unitats_mes:350}]},
];
const PFX=['Nova','Global','Euro','Tecno','Multi','Pro','Top','Smart','Eco','Digital','Alt','Rapid'];
const SFX=['Solutions','Serveis','Group','Vallès','Plus','Tech','Net','Lab','Hub','Works','Zone','Point'];
const SEC=['alimentacio','tecnologia','construccio','comerç','logistica','turisme','salut','moda','entreteniment','energia'];
const MUN=['Sabadell','Terrassa','Matadepera','Rubí','Sant Cugat','Cerdanyola','Granollers','Mollet'];
function genCo(i){
  const s=SEC[i%SEC.length],m=MUN[Math.floor(Math.random()*MUN.length)];
  const n=PFX[Math.floor(Math.random()*PFX.length)]+' '+SFX[Math.floor(Math.random()*SFX.length)]+' '+m.split(' ')[0]+' SL';
  const sz=Math.random()<0.5?'small':'medium',f=sz==='small'?200000+Math.round(Math.random()*500000):800000+Math.round(Math.random()*2000000);
  const em=sz==='small'?5+Math.floor(Math.random()*15):20+Math.floor(Math.random()*40),cp=sz==='small'?3000+Math.round(Math.random()*20000):30000+Math.round(Math.random()*80000);
  return{name:n,sector:s,legalForm:'sl',size:sz,loc:[41.50+Math.random()*0.3,1.98+Math.random()*0.5],muni:m,founded:2000+Math.floor(Math.random()*24),employees_real:em,capital_social:cp,reserves:Math.round(cp*(1+Math.random()*3)),deutes_llarg:Math.round(f*0.08*Math.random()),deutes_curt:Math.round(f*0.04*Math.random()),actiu_fix:Math.round(f*0.3),existencies:Math.round(f*0.04),facturacio_anual:f,marge_brut:0.20+Math.random()*0.30,clients_destacats:[{name:'Client '+n.split(' ')[0],monthly:Math.round(f/12*0.35),type:'B2B',satisfaction:75+Math.floor(Math.random()*20)}],proveidors:[{name:'Proveïdor '+s,product:'Material',cost_mes:Math.round(f/12*0.2),criticitat:'alta'}],maquinaria:[{name:'Equipament',valor:Math.round(f*0.12),amortitzacio:0.12}],loans_actius:[],serveis:[{id:'s1',name:'Servei principal',preu:Math.round(f/12/200),unitats_mes:200}]};
}
function injectCo(){
  if(!window.EMPRESA_PROFILES){setTimeout(injectCo,300);return;}
  NE.forEach(e=>{if(!window.EMPRESA_PROFILES.find(x=>x.name===e.name))window.EMPRESA_PROFILES.push(e);});
  window._ALL_EP=[...window.EMPRESA_PROFILES];
}
function patchHired(){
  if(!window.startMode||window.startMode._hp)return;
  const o=window.startMode;
  window.startMode=function(mode){
    if(mode==='hired'){
      const gd=getG()?.gameData,cc=gd?.classCode||'';
      const used=new Set();
      (getG()?.allStudents||[]).forEach(s=>{if(s.uid!==getG()?.uid&&s.company?.name&&(!cc||(s.classCode||'')===cc))used.add(s.company.name);});
      const bk=window._ALL_EP||window.EMPRESA_PROFILES;
      let av=bk.filter(e=>!used.has(e.name));let gi=0;
      while(av.length<6){const nc=genCo(gi++);if(!used.has(nc.name)){av.push(nc);bk.push(nc);}if(gi>30)break;}
      window.EMPRESA_PROFILES=av;
    }
    o(mode);
  };
  window.startMode._hp=true;
}

// ═══════════════════════════════════════════════════════════
//  6. SISTEMA MULTI-CLASSE PROFESSOR
// ═══════════════════════════════════════════════════════════
function genCode(){const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<4;i++)c+=ch[Math.floor(Math.random()*ch.length)];return c;}

function initClassSystem() {
  // Camps login/registre
  ['register-form','login-form'].forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;
    const fieldId = formId === 'register-form' ? 'reg-class-code' : 'login-class-code';
    if (document.getElementById(fieldId)) return;
    const btn = form.querySelector('.auth-btn');
    if (!btn) return;
    const d = document.createElement('div'); d.className = 'form-group';
    d.innerHTML = `<label>Codi de classe (del professor)</label>
      <input class="form-input" type="text" id="${fieldId}" placeholder="Ex: A7K2" maxlength="8" 
        style="text-transform:uppercase;letter-spacing:3px;font-family:'JetBrains Mono',monospace;font-size:20px;text-align:center">
      <div style="font-size:10px;color:var(--text3);margin-top:4px">Demana el codi al professor/a</div>`;
    btn.parentElement.insertBefore(d, btn);
  });
  
  // Patch register/login per guardar codi
  ['doRegister','doLogin'].forEach(fn => {
    if (!window[fn] || window[fn]._cc) return;
    const o = window[fn];
    window[fn] = async function() {
      const el = document.getElementById(fn==='doRegister'?'reg-class-code':'login-class-code');
      window._pendCC = el?.value.trim().toUpperCase() || '';
      await o();
    };
    window[fn]._cc = true;
  });
  
  // Aplicar codi quan gameData estigui llest
  setInterval(() => {
    const gd = getG()?.gameData;
    if (!gd || !window._pendCC) return;
    gd.classCode = window._pendCC;
    window._pendCC = '';
    window.saveGameData && window.saveGameData();
  }, 2000);
  
  // Botó canviar classe al perfil (per alumnes ja registrats)
  if (window.openProfile && !window.openProfile._cc) {
    const op = window.openProfile;
    window.openProfile = function() {
      op();
      setTimeout(() => {
        const stats = document.getElementById('profile-stats');
        if (!stats || document.getElementById('chg-class')) return;
        const gd = getG()?.gameData;
        const div = document.createElement('div'); div.id = 'chg-class';
        div.style.cssText = 'margin-top:14px;text-align:center;padding-top:14px;border-top:1px solid var(--border)';
        div.innerHTML = `
          <div style="font-size:11px;color:var(--text2);margin-bottom:8px">Classe: <strong style="color:var(--gold);font-family:'JetBrains Mono',monospace;letter-spacing:2px">${gd?.classCode||'Cap'}</strong></div>
          <button class="btn-secondary" style="font-size:12px" onclick="var c=prompt('Nou codi de classe:');if(c){G.gameData.classCode=c.trim().toUpperCase();saveGameData();showToast('✅ Classe: '+G.gameData.classCode);closeProfile();}">🔑 Canviar classe</button>`;
        stats.parentElement.appendChild(div);
      }, 100);
    };
    window.openProfile._cc = true;
  }
}

// ═══ PANELL PROFESSOR MULTI-CLASSE ═══
function patchProfessor() {
  if (typeof window.renderProfessor !== 'function' || window.renderProfessor._mc) return;
  const orig = window.renderProfessor;
  
  window.renderProfessor = function() {
    orig(); // Primer renderitza el panell original
    
    // Ara APPEND el panell de classes DINS .prof-wrap (que ja existeix al DOM)
    setTimeout(() => {
      const profWrap = document.querySelector('#tab-professor .prof-wrap');
      if (!profWrap || document.getElementById('class-mgmt-panel')) return;
      
      const gd = getG()?.gameData;
      if (!gd) return;
      
      // Inicialitzar classes del professor si no existeixen
      if (!gd.profClasses) {
        gd.profClasses = [{ code: gd.classCode || genCode(), name: 'Classe 1', created: Date.now() }];
        if (!gd.classCode) gd.classCode = gd.profClasses[0].code;
        window.saveGameData && window.saveGameData();
      }
      
      const classes = gd.profClasses;
      const activeCode = gd.classCode || classes[0]?.code || '';
      const allStudents = getG()?.allStudents || [];
      
      const panel = document.createElement('div');
      panel.id = 'class-mgmt-panel';
      panel.innerHTML = `
        <div class="section-card" style="margin-bottom:16px;border:2px solid rgba(245,158,11,.25);background:linear-gradient(135deg,rgba(245,158,11,.04),transparent)">
          <div class="section-title" style="font-size:16px">🎓 Gestió de Classes</div>
          
          <!-- Selector de classe activa -->
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
            <label style="font-size:12px;font-weight:700;color:var(--text2)">Classe activa:</label>
            <select id="class-selector" class="form-select" style="max-width:250px;font-family:'JetBrains Mono',monospace" onchange="window._switchClass(this.value)">
              ${classes.map(c => `<option value="${c.code}" ${c.code===activeCode?'selected':''}>${c.name} — ${c.code} (${allStudents.filter(s=>!s.isProf&&(s.classCode||'')===c.code).length} alumnes)</option>`).join('')}
            </select>
            <button class="btn-gold" style="font-size:12px;padding:8px 14px" onclick="window._newClass()">+ Nova classe</button>
          </div>
          
          <!-- Codi actiu per compartir -->
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
            <div style="background:rgba(245,158,11,.06);border:2px dashed rgba(245,158,11,.3);border-radius:14px;padding:18px 28px;text-align:center;flex-shrink:0">
              <div style="font-size:9px;font-weight:800;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px">CODI PER ALS ALUMNES</div>
              <div id="active-code-display" style="font-family:'JetBrains Mono',monospace;font-size:40px;font-weight:800;color:var(--gold);letter-spacing:6px">${activeCode}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="btn-secondary" style="font-size:12px" onclick="navigator.clipboard.writeText(document.getElementById('active-code-display').textContent);showToast('📋 Codi copiat al portapapers!')">📋 Copiar codi</button>
              <button class="btn-danger" style="font-size:12px" onclick="window._resetClass()">🗑️ Reiniciar classe</button>
              <button class="btn-secondary" style="font-size:12px" onclick="window._deleteClass()">❌ Eliminar classe</button>
            </div>
          </div>
          
          <!-- Alumnes d'aquesta classe -->
          <div style="font-size:12px;color:var(--text2);margin-bottom:8px">
            <strong>${allStudents.filter(s=>!s.isProf&&(s.classCode||'')===activeCode).length}</strong> alumnes en aquesta classe
          </div>
          <div style="max-height:150px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:6px">
            ${allStudents.filter(s=>!s.isProf&&(s.classCode||'')===activeCode).map(s => `
              <div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px">
                ${s.company?.sectorData?.icon||'👤'} <strong>${s.displayName||'—'}</strong>
                ${s.company ? '· '+s.company.name : '· <span style="color:var(--text3)">sense empresa</span>'}
              </div>`).join('') || '<div style="color:var(--text3);font-size:12px">Cap alumne encara. Comparteix el codi!</div>'}
          </div>
        </div>`;
      
      // Inserir DESPRÉS del prof-header (primer fill de prof-wrap)
      const header = profWrap.querySelector('.prof-header');
      if (header && header.nextSibling) {
        profWrap.insertBefore(panel, header.nextSibling);
      } else {
        profWrap.prepend(panel);
      }
    }, 100);
  };
  window.renderProfessor._mc = true;
}

// Funcions globals de gestió de classes
window._switchClass = function(code) {
  const gd = getG()?.gameData;
  if (!gd) return;
  gd.classCode = code;
  window.saveGameData && window.saveGameData();
  window.showToast('🔄 Classe canviada: ' + code);
  // Re-renderitzar professor amb els alumnes d'aquesta classe
  setTimeout(() => window.renderProfessor && window.renderProfessor(), 300);
};

window._newClass = function() {
  const gd = getG()?.gameData;
  if (!gd) return;
  const name = prompt('Nom de la nova classe (ex: 1r Batxillerat B):');
  if (!name) return;
  if (!gd.profClasses) gd.profClasses = [];
  const code = genCode();
  gd.profClasses.push({ code, name, created: Date.now() });
  gd.classCode = code;
  window.saveGameData && window.saveGameData();
  window.showToast('✅ Nova classe creada: ' + name + ' — Codi: ' + code);
  setTimeout(() => window.renderProfessor && window.renderProfessor(), 300);
};

window._resetClass = function() {
  const gd = getG()?.gameData;
  if (!gd) return;
  const code = gd.classCode;
  if (!confirm('⚠️ ATENCIÓ: Això esborrarà TOTES les dades dels alumnes de la classe ' + code + '. Estàs segur/a?')) return;
  if (!confirm('⚠️ ÚLTIMA CONFIRMACIÓ: Les dades NO es podran recuperar. Continuar?')) return;
  
  // Esborrar dades dels alumnes d'aquesta classe via Firestore
  const allStudents = getG()?.allStudents || [];
  const db = window._db;
  const doc = window._firestore_doc;
  const setDoc = window._firestore_setDoc;
  
  if (db && doc && setDoc) {
    allStudents.filter(s => !s.isProf && (s.classCode||'') === code).forEach(s => {
      if (s.uid) {
        // Reset gameData de l'alumne
        const resetData = {
          uid: s.uid, displayName: s.displayName, isProf: false,
          classCode: code, mode: null, week: 1, year: new Date().getFullYear(),
          month: new Date().getMonth()+1, prestigi: 0, company: null,
          finances: {cash:0,monthly_revenue:0,monthly_costs:0,annual_revenue:0,annual_costs:0,loans:[],revenue_history:[],actiu:{immobilitzat:0,existencies:10000,tresoreria:0,clients:0},passiu:{capital:0,reserves:0,deutes_llarg:0,deutes_curt:0,proveidors:0}},
          employees:[],machines:[],marketing:{channels:{},sponsors:[]},clients:[],claims:[],notifications:[],events:[],
          lastSaved: Date.now(),
        };
        try { setDoc(doc(db,'games',s.uid), resetData); } catch(e) { console.warn('Reset error:',e); }
      }
    });
  }
  
  window.showToast('🗑️ Classe ' + code + ' reiniciada. Els alumnes hauran de tornar a començar.');
  setTimeout(() => window.renderProfessor && window.renderProfessor(), 1000);
};

window._deleteClass = function() {
  const gd = getG()?.gameData;
  if (!gd || !gd.profClasses) return;
  const code = gd.classCode;
  if (gd.profClasses.length <= 1) { window.showToast('⚠️ No pots eliminar l\'única classe'); return; }
  if (!confirm('Eliminar la classe ' + code + '?')) return;
  gd.profClasses = gd.profClasses.filter(c => c.code !== code);
  gd.classCode = gd.profClasses[0]?.code || '';
  window.saveGameData && window.saveGameData();
  window.showToast('❌ Classe eliminada');
  setTimeout(() => window.renderProfessor && window.renderProfessor(), 300);
};

// ═══════════════════════════════════════════════════════════
//  7. FIX IMATGES EVOLUCIÓ
// ═══════════════════════════════════════════════════════════
function fixEvol() {
  const obs = new MutationObserver(() => {
    const dw = document.querySelector('.dash-wrap');
    if (!dw || document.getElementById('company-banner')) return;
    const b = document.createElement('div'); b.id='company-banner'; b.style.display='none';
    dw.insertBefore(b, dw.firstChild);
  });
  const ct = document.querySelector('.content') || document.getElementById('game-screen');
  if (ct) obs.observe(ct, {childList:true,subtree:true});
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
injectCo(); addSectors();
setTimeout(initClassSystem, 300);
setTimeout(initClassSystem, 2000);

const fi=setInterval(()=>{
  if(typeof window.advanceWeek==='function'){
    clearInterval(fi);
    exposeModuleFunctions(); fixVotes(); fixAdvance(); hideClients(); patchHired(); patchProfessor(); fixEvol();
    console.log('🔧 ui-fixes.js v4 — Tot aplicat!');
  }
},400);
setTimeout(()=>{exposeModuleFunctions();fixVotes();fixAdvance();hideClients();patchHired();patchProfessor();},4000);

console.log('🔧 ui-fixes.js v4');
})();
