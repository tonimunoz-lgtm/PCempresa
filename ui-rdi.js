(function() {
const getG = () => window.G;
const saveGameData  = (...a) => window.saveGameData(...a);
const showToast     = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt = (...a) => window.fmt(...a);

// ============================================================
//  ui-rdi.js — Departament I+D+i complet
// ============================================================

const RDI_PROJECTS = [
  // Producte/Servei
  {id:'prod_basic',cat:'producte',name:'Millora de producte existent',desc:'Optimitza un producte actual per augmentar qualitat i marge.',cost:8000,weeks:4,successRate:0.85,effect:{revenue_mult:1.08,prestigi:2},icon:'🔧',level:1},
  {id:'prod_new',cat:'producte',name:'Desenvolupament de nou producte',desc:'Crea un producte completament nou per a un nou segment.',cost:25000,weeks:10,successRate:0.60,effect:{revenue_mult:1.15,prestigi:5,newService:true},icon:'💡',level:2},
  {id:'prod_patent',cat:'producte',name:'Patentar innovació',desc:'Registra una patent que protegeix la teva innovació. +prestigi, -competència.',cost:15000,weeks:6,successRate:0.70,effect:{prestigi:8,competitorShield:12},icon:'📜',level:3},

  // Procés
  {id:'proc_lean',cat:'proces',name:'Implementar Lean Manufacturing',desc:'Redueix malbaratament i millora eficiència productiva.',cost:12000,weeks:6,successRate:0.75,effect:{cost_reduction:0.05,capacity_mult:1.10},icon:'🏭',level:1},
  {id:'proc_auto',cat:'proces',name:'Automatització parcial',desc:'Automatitza processos repetitius amb software i sensors.',cost:35000,weeks:12,successRate:0.65,effect:{cost_reduction:0.10,capacity_mult:1.25},icon:'🤖',level:2},
  {id:'proc_ia',cat:'proces',name:'Intel·ligència Artificial aplicada',desc:'Implementa IA per optimitzar producció, logística o vendes.',cost:60000,weeks:16,successRate:0.50,effect:{cost_reduction:0.12,revenue_mult:1.10,prestigi:6},icon:'🧠',level:3},

  // Sostenibilitat
  {id:'sost_energia',cat:'sostenibilitat',name:'Eficiència energètica',desc:'Redueix el consum energètic amb renovables i aïllament.',cost:20000,weeks:8,successRate:0.80,effect:{cost_reduction:0.04,prestigi:3,esg:10},icon:'⚡',level:1},
  {id:'sost_residus',cat:'sostenibilitat',name:'Economia circular',desc:'Redueix residus i crea valor dels subproductes.',cost:18000,weeks:6,successRate:0.75,effect:{cost_reduction:0.03,prestigi:4,esg:15},icon:'♻️',level:2},
  {id:'sost_carboni',cat:'sostenibilitat',name:'Certificació zero emissions',desc:'Aconsegueix la certificació de neutralitat en carboni.',cost:40000,weeks:14,successRate:0.55,effect:{prestigi:10,esg:25,revenue_mult:1.05},icon:'🌱',level:3},

  // Digital
  {id:'dig_web',cat:'digital',name:'Transformació digital bàsica',desc:'Web, CRM, i presència digital professionalitzada.',cost:10000,weeks:4,successRate:0.90,effect:{revenue_mult:1.06,prestigi:2},icon:'🌐',level:1},
  {id:'dig_ecomm',cat:'digital',name:'E-commerce i venda online',desc:'Crea una botiga online amb pagaments i logística.',cost:22000,weeks:8,successRate:0.70,effect:{revenue_mult:1.12,newChannel:true},icon:'🛒',level:2},
  {id:'dig_bigdata',cat:'digital',name:'Big Data i analítica avançada',desc:'Analitza dades de clients i mercat per predir tendències.',cost:45000,weeks:12,successRate:0.55,effect:{revenue_mult:1.08,cost_reduction:0.06,prestigi:5},icon:'📊',level:3},
];

window.renderRDI = function() {
  const gd = getG()?.gameData;
  if (!gd?.company) {
    document.getElementById('tab-rdi').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">🔬</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Sense empresa activa</div>
      </div>`;
    return;
  }

  if (!gd.rdi) gd.rdi = { projects: [], completed: [], budget: 0, totalInvested: 0, innovations: 0, esg: 0 };
  const rdi = gd.rdi;
  const activeProjects = rdi.projects || [];
  const completed = rdi.completed || [];
  const budget = gd.finances?.cash || 0;

  // Categories
  const cats = [
    {id:'producte', name:'Producte i Servei', icon:'💡', desc:'Millora o crea nous productes'},
    {id:'proces', name:'Processos', icon:'⚙️', desc:'Optimitza la producció'},
    {id:'sostenibilitat', name:'Sostenibilitat (ESG)', icon:'🌱', desc:'Economia verda i circular'},
    {id:'digital', name:'Transformació Digital', icon:'🌐', desc:'Digitalitza el negoci'},
  ];

  document.getElementById('tab-rdi').innerHTML = `
  <div style="padding:16px;max-width:1100px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div>
        <h2 style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">🔬 I+D+i — Investigació, Desenvolupament i Innovació</h2>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">Inverteix en innovació per guanyar avantatge competitiu</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="tstat">💶 Disponible: <span class="tstat-v">${fmt(Math.round(budget))}€</span></div>
        <div class="tstat">🔬 Projectes actius: <span class="tstat-v">${activeProjects.length}</span></div>
        <div class="tstat">✅ Completats: <span class="tstat-v">${completed.length}</span></div>
        <div class="tstat">🌱 ESG: <span class="tstat-v">${rdi.esg||0}</span></div>
      </div>
    </div>

    <!-- KPI I+D+i -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      <div class="kpi-card">
        <div class="kpi-icon">📊</div>
        <div class="kpi-label">Inversió total I+D</div>
        <div class="kpi-val" style="font-size:18px">${fmt(rdi.totalInvested||0)}€</div>
        <div style="font-size:10px;color:var(--text2)">${budget>0?((rdi.totalInvested/(gd.finances?.monthly_revenue||1)*100/12).toFixed(1)):0}% dels ingressos</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">💡</div>
        <div class="kpi-label">Innovacions</div>
        <div class="kpi-val" style="font-size:18px">${rdi.innovations||0}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🌱</div>
        <div class="kpi-label">Puntuació ESG</div>
        <div class="kpi-val" style="font-size:18px;color:var(--green)">${rdi.esg||0}/100</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🏆</div>
        <div class="kpi-label">Nivell I+D</div>
        <div class="kpi-val" style="font-size:18px">${getRDILevel(completed.length)}</div>
      </div>
    </div>

    <!-- Projectes actius -->
    ${activeProjects.length > 0 ? `
    <div class="section-card" style="margin-bottom:16px;border-color:rgba(79,127,255,.3)">
      <div class="section-title">🔧 Projectes en curs</div>
      <div style="display:grid;gap:10px">
        ${activeProjects.map((p, i) => {
          const totalWeeks = p.totalWeeks || p.weeks || 8;
          const progress = Math.round(((totalWeeks - (p.weeksLeft||0)) / totalWeeks) * 100);
          return `
          <div style="background:rgba(79,127,255,.06);border:1px solid rgba(79,127,255,.2);border-radius:12px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:24px">${p.icon}</span>
                <div>
                  <div style="font-weight:700;font-size:14px;color:var(--text)">${p.name}</div>
                  <div style="font-size:11px;color:var(--text2)">${p.desc}</div>
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:12px;color:var(--accent);font-weight:700">${p.weeksLeft||0} setmanes restants</div>
                <div style="font-size:10px;color:var(--text2)">Probabilitat èxit: ${Math.round((p.successRate||0.5)*100)}%</div>
              </div>
            </div>
            <div style="background:rgba(255,255,255,.08);border-radius:4px;height:8px;overflow:hidden">
              <div style="height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px;width:${progress}%;transition:width .3s"></div>
            </div>
            <div style="font-size:10px;color:var(--text2);text-align:right;margin-top:3px">${progress}% completat</div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- Catàleg de projectes -->
    <div class="section-card">
      <div class="section-title">📋 Catàleg de projectes I+D+i</div>
      <div style="display:flex;gap:4px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:16px;flex-wrap:wrap">
        ${cats.map((c,i) => `<button class="auth-tab${i===0?' active':''}" id="rdi-cat-${c.id}" onclick="switchRDICat('${c.id}')">${c.icon} ${c.name}</button>`).join('')}
      </div>
      ${cats.map((cat,ci) => `
      <div id="rdi-panel-${cat.id}" style="${ci>0?'display:none':''}">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          ${RDI_PROJECTS.filter(p => p.cat === cat.id).map(p => {
            const alreadyActive = activeProjects.find(a => a.id === p.id);
            const alreadyDone = completed.includes(p.id);
            const canAfford = budget >= p.cost;
            const levelOk = (completed.length + 1) >= p.level;
            return `
            <div class="section-card" style="padding:14px;${alreadyDone?'opacity:.5;':''}${alreadyActive?'border-color:var(--accent);':''}">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <span style="font-size:28px">${p.icon}</span>
                <div style="flex:1">
                  <div style="font-weight:700;font-size:13px;color:var(--text)">${p.name}</div>
                  <div style="font-size:11px;color:var(--text2);margin-top:2px">${p.desc}</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:10px 0;font-size:11px">
                <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center">
                  <div style="color:var(--text2)">Cost</div>
                  <div style="color:var(--gold);font-weight:700;font-family:'JetBrains Mono',monospace">${fmt(p.cost)}€</div>
                </div>
                <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center">
                  <div style="color:var(--text2)">Durada</div>
                  <div style="color:var(--accent);font-weight:700">${p.weeks} setm.</div>
                </div>
                <div style="background:rgba(255,255,255,.04);border-radius:6px;padding:6px;text-align:center">
                  <div style="color:var(--text2)">Èxit</div>
                  <div style="color:${p.successRate>=0.7?'var(--green)':p.successRate>=0.5?'var(--gold)':'var(--red)'};font-weight:700">${Math.round(p.successRate*100)}%</div>
                </div>
              </div>
              <div style="font-size:10px;color:var(--text2);margin-bottom:8px">
                Efectes: ${Object.entries(p.effect).map(([k,v]) => {
                  if (k==='revenue_mult') return `📈 Ingressos +${Math.round((v-1)*100)}%`;
                  if (k==='cost_reduction') return `📉 Costos -${Math.round(v*100)}%`;
                  if (k==='prestigi') return `⭐ Prestigi +${v}`;
                  if (k==='capacity_mult') return `⚙️ Capacitat +${Math.round((v-1)*100)}%`;
                  if (k==='esg') return `🌱 ESG +${v}`;
                  if (k==='newService') return '💡 Nou producte';
                  if (k==='newChannel') return '🛒 Nou canal';
                  return '';
                }).filter(Boolean).join(' · ')}
              </div>
              ${alreadyDone ? '<div style="text-align:center;color:var(--green);font-weight:700;font-size:12px">✅ Completat</div>' :
                alreadyActive ? '<div style="text-align:center;color:var(--accent);font-weight:700;font-size:12px">🔧 En curs...</div>' :
                !levelOk ? `<div style="text-align:center;color:var(--text3);font-size:11px">🔒 Requereix ${p.level} projectes completats</div>` :
                `<button class="emp-btn promote" style="width:100%;font-size:12px" ${!canAfford?'disabled style="width:100%;font-size:12px;opacity:.4;cursor:not-allowed"':''} onclick="startRDIProject('${p.id}')">
                  ${canAfford?'🚀 Iniciar projecte':'❌ Fons insuficients'}
                </button>`}
            </div>`;
          }).join('')}
        </div>
      </div>`).join('')}
    </div>

    <!-- Historial -->
    ${completed.length > 0 ? `
    <div class="section-card" style="margin-top:16px">
      <div class="section-title">🏆 Innovacions completades</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${completed.map(id => {
          const p = RDI_PROJECTS.find(r => r.id === id);
          return p ? `<div style="display:flex;align-items:center;gap:6px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;color:var(--green)">
            ${p.icon} ${p.name}
          </div>` : '';
        }).join('')}
      </div>
    </div>` : ''}
  </div>`;
};

function getRDILevel(completedCount) {
  if (completedCount >= 10) return '🏆 Líder en innovació';
  if (completedCount >= 7) return '🥇 Innovadora';
  if (completedCount >= 4) return '🥈 Avançada';
  if (completedCount >= 2) return '🥉 Emergent';
  return '🌱 Inicial';
}

window.switchRDICat = function(cat) {
  ['producte','proces','sostenibilitat','digital'].forEach(c => {
    const panel = document.getElementById('rdi-panel-' + c);
    const btn = document.getElementById('rdi-cat-' + c);
    if (panel) panel.style.display = c === cat ? '' : 'none';
    if (btn) btn.classList.toggle('active', c === cat);
  });
};

window.startRDIProject = async function(projectId) {
  const gd = getG()?.gameData;
  if (!gd) return;
  const p = RDI_PROJECTS.find(r => r.id === projectId);
  if (!p) return;
  if (!gd.rdi) gd.rdi = { projects:[], completed:[], budget:0, totalInvested:0, innovations:0, esg:0 };
  if (gd.finances.cash < p.cost) { showToast('❌ Fons insuficients'); return; }
  if (gd.rdi.projects.find(a => a.id === p.id)) { showToast('⚠️ Projecte ja en curs'); return; }
  if (gd.rdi.completed.includes(p.id)) { showToast('⚠️ Projecte ja completat'); return; }

  gd.finances.cash -= p.cost;
  gd.rdi.totalInvested = (gd.rdi.totalInvested||0) + p.cost;
  gd.rdi.projects.push({...p, weeksLeft: p.weeks, totalWeeks: p.weeks, startWeek: gd.week});

  gd.notifications.push({id:Date.now(), icon:'🔬', title:'Projecte I+D iniciat', desc:`${p.name} — Durada: ${p.weeks} setmanes`, time:'S'+gd.week, urgent:false});
  await saveGameData();
  window.renderRDI();
  showToast(`🔬 ${p.name} iniciat!`);
  showEventToast('🔬', 'Nou projecte I+D!', p.name + ' — ' + p.weeks + ' setmanes', true);
};

// Hook a advanceWeek per processar projectes I+D
const _origAdvWeek = window.advanceWeek;
if (_origAdvWeek) {
  window.advanceWeek = async function() {
    await _origAdvWeek();
    const gd = getG()?.gameData;
    if (!gd || !gd.rdi) return;
    const projects = gd.rdi.projects || [];
    const toRemove = [];

    projects.forEach((p, i) => {
      if (p.weeksLeft > 0) p.weeksLeft--;
      if (p.weeksLeft <= 0) {
        toRemove.push(i);
        const success = Math.random() < (p.successRate || 0.5);
        if (success) {
          gd.rdi.completed.push(p.id);
          gd.rdi.innovations = (gd.rdi.innovations||0) + 1;
          // Aplicar efectes
          if (p.effect.revenue_mult) gd.finances.monthly_revenue = Math.round((gd.finances.monthly_revenue||0) * p.effect.revenue_mult);
          if (p.effect.cost_reduction) gd.finances.monthly_costs = Math.round((gd.finances.monthly_costs||0) * (1 - p.effect.cost_reduction));
          if (p.effect.prestigi) gd.prestigi = Math.min(100, (gd.prestigi||0) + p.effect.prestigi);
          if (p.effect.esg) gd.rdi.esg = Math.min(100, (gd.rdi.esg||0) + p.effect.esg);
          if (p.effect.capacity_mult) {
            (gd.machines||[]).filter(m=>!m.installing).forEach(m => { m.capacity = Math.round((m.capacity||0) * p.effect.capacity_mult); });
          }
          gd.notifications.push({id:Date.now()+Math.random(), icon:'🎉', title:'I+D completat amb èxit!', desc:`${p.name} — Innovació aplicada`, time:'S'+gd.week, urgent:false});
          showEventToast('🎉', 'Innovació aconseguida!', p.name, true);
        } else {
          gd.notifications.push({id:Date.now()+Math.random(), icon:'❌', title:'Projecte I+D fallit', desc:`${p.name} — No s'han obtingut els resultats esperats. La inversió no es recupera.`, time:'S'+gd.week, urgent:true});
          showEventToast('❌', 'Projecte I+D fallit', p.name + ' — Inversió perduda', false);
        }
      }
    });

    // Eliminar projectes acabats (de darrere a davant)
    toRemove.reverse().forEach(i => projects.splice(i, 1));
    if (toRemove.length > 0) await saveGameData();
  };
}

})();
