(function() {
// Accés a l estat global i funcions via window (exposats per index.html)
const getG = () => window.G;
const saveGameData   = (...a) => window.saveGameData(...a);
const showToast      = (...a) => window.showToast(...a);
const showEventToast = (...a) => window.showEventToast(...a);
const fmt  = (...a) => window.fmt(...a);
const EVENT_POOL = window.EVENT_POOL_DATA || [];

// Usar Firebase ja inicialitzat per index.html
const _getDb = () => window._db;
const _setDoc = (...a) => window._firestore_setDoc(...a);
const _doc    = (...a) => window._firestore_doc(...a);

// ============================================================
//  ui-professor.js  —  Mode Professor
// ============================================================

window.renderProfessor = function renderProfessor() {
  if (!getG()?.isProf) { document.getElementById('tab-professor').innerHTML = '<div style="padding:40px;text-align:center;color:var(--text2)">Accés restringit</div>'; return; }
  if (!getG().isProf) {
    document.getElementById('tab-professor').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2)">
        <div style="font-size:48px;margin-bottom:12px">🔒</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">Accés restringit</div>
        <div style="font-size:12px;margin-top:6px">Aquesta secció és exclusiva per a professors.</div>
      </div>`;
    return;
  }

  // ★★★ FIX: Filtrar només alumnes de la classe del professor ★★★
  // El professor només veu alumnes que tinguin el SEU mateix classCode.
  // Si el professor no té classCode definit, mostrar avís.
  const profGd = getG().gameData;
  const profClassCode = (profGd?.classCode || '').toUpperCase().trim();
  
  if (!profClassCode) {
    document.getElementById('tab-professor').innerHTML = `
      <div style="padding:40px;text-align:center;color:var(--text2);max-width:500px;margin:0 auto">
        <div style="font-size:48px;margin-bottom:12px">🏫</div>
        <div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px">Sense classe activa</div>
        <div style="font-size:13px;line-height:1.6;margin-bottom:20px">Has de crear o seleccionar una classe per veure els alumnes. Cada professor/a té el seu propi codi de classe i només pot veure els seus alumnes.</div>
        <button onclick="openProfile()" class="btn-primary" style="padding:12px 24px;background:var(--accent);border:none;border-radius:10px;color:#fff;font-weight:700;cursor:pointer">🏫 Gestionar classes</button>
      </div>`;
    return;
  }

  const allStudents = getG().allStudents || [];
  const students = allStudents.filter(s => 
    !s.isProf && 
    (s.classCode||'').toUpperCase().trim() === profClassCode
  );
  const active   = students.filter(s => !!s.company);
  const inactive = students.filter(s => !s.company);

  // Calcular mètriques de classe
  const avgCash    = active.length > 0 ? Math.round(active.reduce((s,st)=>s+(st.finances?.cash||0),0)/active.length) : 0;
  const avgPrest   = active.length > 0 ? (active.reduce((s,st)=>s+(st.prestigi||0),0)/active.length).toFixed(1) : '0';
  const inCrisis   = active.filter(s=>(s.finances?.cash||0)<0).length;
  const bestProfit = active.reduce((best,s)=>{
    const res=(s.finances?.monthly_revenue||0)-(s.finances?.monthly_costs||0);
    return res>best.res?{name:s.displayName,company:s.company?.name,res}:best;
  },{res:-Infinity,name:'—',company:'—'});

  document.getElementById('tab-professor').innerHTML = `
  <div class="prof-wrap">

    <!-- Header professor -->
    <div class="prof-header">
      <div style="font-size:48px">👩‍🏫</div>
      <div style="flex:1">
        <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--text)">Panell del Professor/a</div>
        <div style="font-size:13px;color:var(--text2);margin-top:4px">
          ${students.length} alumnes registrats · ${active.length} empreses actives · ${inactive.length} sense empresa
        </div>
      </div>
      <div class="tstat" style="border-color:rgba(245,158,11,.3)">🟡 Mode professor actiu</div>
    </div>

    <!-- KPIs classe -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">
      <div class="kpi-card">
        <div class="kpi-icon">👥</div>
        <div class="kpi-label">Alumnes actius</div>
        <div class="kpi-val">${active.length}</div>
        <div class="kpi-change">${inactive.length} sense empresa</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">💰</div>
        <div class="kpi-label">Tresoreria mitjana</div>
        <div class="kpi-val ${avgCash>=0?'positive':'negative'}">${fmt(avgCash)}€</div>
        <div class="kpi-change">a la classe</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🚨</div>
        <div class="kpi-label">En crisi</div>
        <div class="kpi-val ${inCrisis>0?'negative':''}">${inCrisis}</div>
        <div class="kpi-change ${inCrisis>0?'down':'up'}">${inCrisis>0?'⚠️ Cal intervenció':'✅ Tothom estable'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">🏆</div>
        <div class="kpi-label">Millor resultat</div>
        <div class="kpi-val positive" style="font-size:16px">${bestProfit.name}</div>
        <div class="kpi-change">${bestProfit.company||'—'}</div>
      </div>
    </div>

    <!-- Eines del professor -->
    <div class="section-card" style="margin-bottom:14px">
      <div class="section-title">🛠️ Eines del professor — Gestió de la classe</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">

        <!-- Llançar esdeveniment global -->
        <div style="background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px">🌍 Llançar esdeveniment global</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Afecta totes les empreses dels alumnes simultàniament. Ideal per a exercicis de crisi.</div>
          <select class="form-select" id="prof-event-select" style="margin-bottom:10px;font-size:12px">
            ${EVENT_POOL.map(ev=>`<option value="${ev.type}_${ev.title}">${ev.icon} ${ev.title} (${ev.impact>=0?'+':''}${(ev.impact*100).toFixed(0)}%)</option>`).join('')}
          </select>
          <button class="btn-danger" style="width:100%;font-size:12px" onclick="broadcastEvent()">📢 Llançar a tota la classe</button>
        </div>

        <!-- Avançar setmana global -->
        <div style="background:rgba(79,127,255,.06);border:1px solid rgba(79,127,255,.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px">⏩ Control de temps</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Avança totes les empreses de la classe a la mateixa setmana. Útil per sincronitzar exercicis.</div>
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <select class="form-select" id="prof-weeks" style="flex:1;font-size:12px">
              <option>1</option><option>4</option><option>13</option><option>26</option><option>52</option>
            </select>
            <span style="align-self:center;font-size:12px;color:var(--text2)">setmanes</span>
          </div>
          <button class="btn-primary" style="width:100%;font-size:12px" onclick="advanceClassWeeks()">⏩ Avançar tota la classe</button>
        </div>

        <!-- Reset empresa alumne -->
        <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px">🔄 Reset / Ajuda alumne</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Restableix l'estat d'un alumne o injecta liquiditat de rescat per evitar fallida pedagògica.</div>
          <select class="form-select" id="prof-student-select" style="margin-bottom:8px;font-size:12px">
            ${active.map(s=>`<option value="${s.uid}">${s.displayName} — ${s.company?.name||'—'}</option>`).join('')}
          </select>
          <div style="display:flex;gap:6px">
            <button class="btn-secondary" style="flex:1;font-size:11px" onclick="injectCash()">💉 Injectar 50k€</button>
            <button class="btn-danger" style="flex:1;font-size:11px" onclick="triggerCrisis()">💥 Crisi empresa</button>
          </div>
        </div>

        <!-- Estadística global -->
        <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:16px">
          <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px">📊 Exportar resultats</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Genera un resum de tots els alumnes per avaluació i entrega de notes.</div>
          <button class="btn-primary" style="width:100%;font-size:12px;margin-bottom:6px;background:var(--green)" onclick="exportResults()">📄 Descarregar CSV resultats</button>
          <button class="btn-secondary" style="width:100%;font-size:12px" onclick="printLeaderboard()">🖨️ Imprimir rànquing</button>
        </div>
      </div>
    </div>

    <!-- Rànquing -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

      <div class="section-card">
        <div class="section-title">🏆 Rànquing per benefici mensual</div>
        <div class="prof-leaderboard">
          ${active.sort((a,b)=>{
            const ra=(a.finances?.monthly_revenue||0)-(a.finances?.monthly_costs||0);
            const rb=(b.finances?.monthly_revenue||0)-(b.finances?.monthly_costs||0);
            return rb-ra;
          }).map((s,i)=>{
            const res=(s.finances?.monthly_revenue||0)-(s.finances?.monthly_costs||0);
            const posClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
            const medalIcon = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
            return `
            <div class="prof-lb-row">
              <div class="prof-lb-pos ${posClass}">${medalIcon}</div>
              <div style="flex:1">
                <div style="font-size:12px;font-weight:700;color:var(--text)">${s.displayName}</div>
                <div style="font-size:10px;color:var(--text2)">${s.company?.sectorData?.icon||'🏢'} ${s.company?.name||'—'}</div>
              </div>
              <div style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:${res>=0?'var(--green)':'var(--red)'}">
                ${res>=0?'+':''}${fmt(Math.round(res))}€/mes
              </div>
            </div>`;
          }).join('') || '<div style="padding:20px;text-align:center;color:var(--text2);font-size:12px">Sense alumnes actius</div>'}
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">🔴 Alumnes en crisi — Prioritat d'atenció</div>
        ${active.filter(s=>(s.finances?.cash||0)<5000).length === 0
          ? `<div style="color:var(--green);font-size:12px;text-align:center;padding:20px">✅ Cap alumne en situació crítica</div>`
          : active.filter(s=>(s.finances?.cash||0)<5000).sort((a,b)=>(a.finances?.cash||0)-(b.finances?.cash||0)).map(s=>`
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.2);border-radius:8px;margin-bottom:6px">
            <div style="font-size:20px">${(s.finances?.cash||0)<0?'🚨':'⚠️'}</div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:700;color:var(--text)">${s.displayName}</div>
              <div style="font-size:10px;color:var(--text2)">${s.company?.name}</div>
            </div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--red);font-weight:700">${fmt(Math.round(s.finances?.cash||0))}€</div>
          </div>`).join('')}

        <div style="margin-top:14px">
          <div class="section-title" style="margin-bottom:10px">🏭 Distribució per sectors</div>
          ${Object.entries(active.reduce((acc,s)=>{
            const sec=s.company?.sector||'altres';
            acc[sec]=(acc[sec]||0)+1; return acc;
          },{})).map(([sec,count])=>{
            const SECTORS = [{id:'alimentacio',icon:'🍎'},{id:'tecnologia',icon:'💻'},{id:'construccio',icon:'🏗️'},{id:'comerc',icon:'🛍️'},{id:'logistica',icon:'🚛'},{id:'turisme',icon:'🏨'},{id:'salut',icon:'💊'},{id:'educacio',icon:'📚'},{id:'moda',icon:'👔'},{id:'quimica',icon:'⚗️'}];
            const s=SECTORS.find(s=>s.id===sec)||{icon:'🏢'};
            const pct=Math.round(count/active.length*100);
            return `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:11px">
              <span style="width:18px">${s.icon}</span>
              <span style="flex:1;color:var(--text2)">${sec}</span>
              <div style="width:80px;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden">
                <div style="height:100%;background:var(--accent);width:${pct}%;border-radius:3px"></div>
              </div>
              <span style="color:var(--text);min-width:24px;text-align:right">${count}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- AVALUACIÓ COMPETENCIAL -->
    <div class="section-card" style="margin-top:14px;border-color:rgba(124,58,237,.3)">
      <div class="section-title">🎓 Avaluació per competències</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Avaluació automàtica basada en les accions i decisions de cada alumne dins el simulador.</div>
      <div id="eval-table-container"></div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-primary" style="font-size:12px;background:var(--accent2)" onclick="exportEvaluation()">📄 Exportar avaluació CSV</button>
        <div style="font-size:10px;color:var(--text3);align-self:center">Nota: L'avaluació es calcula automàticament basant-se en les decisions i accions de l'alumne.</div>
      </div>
    </div>

    <!-- Taula detallada alumnes -->
    <div class="section-card" style="margin-top:14px;overflow-x:auto">
      <div class="section-title">📋 Tots els alumnes — Vista detallada</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="border-bottom:1px solid var(--border)">
            <th style="text-align:left;padding:8px 10px;color:var(--text2);font-weight:600">Alumne</th>
            <th style="text-align:left;padding:8px 10px;color:var(--text2);font-weight:600">Empresa</th>
            <th style="text-align:left;padding:8px 10px;color:var(--text2);font-weight:600">Sector</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Tresoreria</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Resultat/mes</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Prestigi</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Empleats</th>
            <th style="text-align:right;padding:8px 10px;color:var(--text2);font-weight:600">Setmana</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s=>{
            const res=(s.finances?.monthly_revenue||0)-(s.finances?.monthly_costs||0);
            const isCrisis=(s.finances?.cash||0)<0;
            return `
            <tr style="border-bottom:1px solid rgba(255,255,255,.04);${isCrisis?'background:rgba(239,68,68,.05)':''}">
              <td style="padding:8px 10px;font-weight:600;color:var(--text)">${s.displayName}${isCrisis?'  🚨':''}</td>
              <td style="padding:8px 10px;color:var(--text2)">${s.company?.name||'Sense empresa'}</td>
              <td style="padding:8px 10px">${s.company?.sectorData?.icon||'—'} ${s.company?.sector||'—'}</td>
              <td style="padding:8px 10px;text-align:right;font-family:'JetBrains Mono',monospace;color:${(s.finances?.cash||0)>=0?'var(--gold)':'var(--red)'}">${fmt(Math.round(s.finances?.cash||0))}€</td>
              <td style="padding:8px 10px;text-align:right;font-family:'JetBrains Mono',monospace;color:${res>=0?'var(--green)':'var(--red)'}">${res>=0?'+':''}${fmt(Math.round(res))}€</td>
              <td style="padding:8px 10px;text-align:right;color:var(--gold)">${(s.prestigi||0).toFixed(1)}</td>
              <td style="padding:8px 10px;text-align:right;color:var(--text)">${s.employees?.length||0}</td>
              <td style="padding:8px 10px;text-align:right;color:var(--text2)">S${s.week||1}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;

  // Renderitzar taula d'avaluació (fora del template literal per evitar nesting)
  setTimeout(function() {
    var container = document.getElementById('eval-table-container');
    if (!container) return;
    var activeStudents = getG().allStudents.filter(function(s) { return !s.isProf && s.company; });
    var html = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px;min-width:900px"><thead><tr style="border-bottom:2px solid var(--border2)">';
    html += '<th style="text-align:left;padding:8px 6px;color:var(--text2);font-weight:600">Alumne</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">📈 Risc inv.</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">🤝 Negoc.</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">⚖️ Drets lab.</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">📊 Comptab.</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">💶 Gestió fin.</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">🔬 Innovació</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--text2);font-weight:600;font-size:9px">🌐 Comerç</th>';
    html += '<th style="text-align:center;padding:8px 4px;color:var(--accent);font-weight:700;font-size:10px">NOTA</th>';
    html += '</tr></thead><tbody>';
    activeStudents.forEach(function(s) {
      var ev = evaluateStudent(s);
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,.04)">';
      html += '<td style="padding:8px 6px"><div style="font-weight:700;color:var(--text)">' + s.displayName + '</div><div style="font-size:9px;color:var(--text3)">' + (s.company?.name||'—') + '</div></td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.riskMgmt) + '</td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.negotiation) + '</td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.laborRights) + '</td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.accounting) + '</td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.financeMgmt) + '</td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.innovation) + '</td>';
      html += '<td style="text-align:center;padding:8px 4px">' + renderGrade(ev.intlTrade) + '</td>';
      var gradeColor = ev.finalGrade >= 7 ? 'var(--green)' : ev.finalGrade >= 5 ? 'var(--gold)' : 'var(--red)';
      html += '<td style="text-align:center;padding:8px 4px"><div style="font-family:\'JetBrains Mono\',monospace;font-size:14px;font-weight:800;color:' + gradeColor + '">' + ev.finalGrade.toFixed(1) + '</div></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
  }, 50);
}

window.broadcastEvent = async function() {
  const sel = document.getElementById('prof-event-select');
  if (!sel) return;
  const [type, ...titleParts] = sel.value.split('_');
  const ev = EVENT_POOL.find(e=>e.type===type && e.title===titleParts.join('_'));
  if (!ev) return;

  // Afectar tots els estudiants via Firestore
  const students = getG().allStudents.filter(s=>!s.isProf && s.company);
  let count = 0;
  for (const s of students) {
    if (!s.uid) continue;
    try {
      const events = [...(s.events||[]), {...ev, id:'prof_ev_'+Date.now(), weeksLeft:Math.max(1,ev.duration||1)}];
      const notifications = [...(s.notifications||[]), {id:Date.now(), icon:ev.icon, title:'[PROFESSOR] '+ev.title, desc:ev.desc, time:`S${s.week}`, urgent:ev.impact<0}];
      await window._firestore_setDoc(window._firestore_doc(window._db,'games',s.uid), {...s, events, notifications}, {merge:true});
      count++;
    } catch(e) { console.warn(e); }
  }
  showToast(`📢 Esdeveniment llançat a ${count} empreses!`);
  showEventToast(ev.icon,'[PROFESSOR] '+ev.title,ev.desc,ev.impact>=0);
};

window.injectCash = async function() {
  const sel = document.getElementById('prof-student-select');
  if (!sel?.value) return;
  const uid = sel.value;
  const student = getG().allStudents.find(s=>s.uid===uid);
  if (!student) return;
  const updated = {
    ...student,
    finances: {...student.finances, cash:(student.finances?.cash||0)+50000, actiu:{...(student.finances?.actiu||{}), tresoreria:(student.finances?.cash||0)+50000}},
    notifications:[...(student.notifications||[]),{id:Date.now(),icon:'💉',title:'Ajuda del professor/a',desc:'El/la professor/a ha injectat 50.000€ de capital de rescat educatiu.',time:`S${student.week}`,urgent:false}]
  };
  await window._firestore_setDoc(window._firestore_doc(window._db,'games',uid), updated, {merge:true});
  showToast(`💉 50.000€ injectats a ${student.displayName}`);
};

window.triggerCrisis = async function() {
  const sel = document.getElementById('prof-student-select');
  if (!sel?.value) return;
  const uid = sel.value;
  const student = getG().allStudents.find(s=>s.uid===uid);
  if (!student) return;
  const crisisEv = EVENT_POOL.find(e=>e.impact<=-0.12);
  const updated = {
    ...student,
    events:[...(student.events||[]),{...crisisEv, id:'prof_crisis_'+Date.now(), weeksLeft:4}],
    notifications:[...(student.notifications||[]),{id:Date.now(),icon:'💥',title:'[PROFESSOR] Crisi simulada',desc:'El professor/a ha activat una crisi econòmica per a la teva empresa.',time:`S${student.week}`,urgent:true}]
  };
  await window._firestore_setDoc(window._firestore_doc(window._db,'games',uid), updated, {merge:true});
  showToast(`💥 Crisi activada per a ${student.displayName}`);
};

window.exportResults = function() {
  const students = getG().allStudents.filter(s=>!s.isProf);
  const rows = [
    ['Nom','Email','Empresa','Sector','Tresoreria','Resultat/mes','Prestigi','Empleats','Setmana','Estat'].join(','),
    ...students.map(s=>{
      const res=(s.finances?.monthly_revenue||0)-(s.finances?.monthly_costs||0);
      return [
        s.displayName||'',s.uid?.replace('@','[at]')||'',
        s.company?.name||'sense empresa',s.company?.sector||'—',
        Math.round(s.finances?.cash||0),Math.round(res),
        (s.prestigi||0).toFixed(1),s.employees?.length||0,s.week||1,
        (s.finances?.cash||0)<0?'CRISI':'activa'
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob(['\uFEFF'+rows], {type:'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `empresabat_resultats_s${getG().allStudents[0]?.week||1}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('📄 CSV descarregat!');
};

window.printLeaderboard = function() { window.print(); };

window.advanceClassWeeks = function() {
  showToast('⏩ Funció avançada: requereix Cloud Functions. Properament disponible.');
};

// ============================================================
//  SISTEMA D'AVALUACIÓ PER COMPETÈNCIES
// ============================================================

function evaluateStudent(s) {
  const f = s.finances || {};
  const cash = f.cash || 0;
  const rev = f.monthly_revenue || 0;
  const costs = f.monthly_costs || 0;
  const result = rev - costs;
  const emps = s.employees || [];
  const loans = f.loans || [];
  const port = s.portfolio || {stocks:{},crypto:{}};
  const trade = s.trade || {imports:[],exports:[]};
  const rdi = s.rdi || {projects:[],completed:[],esg:0};
  const labor = s.laborRelations || {};
  const prest = s.prestigi || 0;
  const week = s.week || 1;
  const provs = s.proveidors || [];

  // 1. RISC D'INVERSIÓ (0-10)
  // Mesura: ha invertit a la borsa? Ha diversificat? Ha perdut tot?
  let riskMgmt = 5;
  const stockEntries = Object.keys(port.stocks || {}).length;
  const cryptoEntries = Object.keys(port.crypto || {}).length;
  if (stockEntries + cryptoEntries > 0) riskMgmt += 1; // Ha invertit
  if (stockEntries >= 2) riskMgmt += 1; // Diversifica accions
  if (cryptoEntries > 0 && stockEntries > cryptoEntries) riskMgmt += 1; // Més accions que cripto (prudent)
  if (cryptoEntries > stockEntries + 2) riskMgmt -= 2; // Massa cripto = especulació
  const totalInvested = Object.values(port.stocks||{}).reduce((s,v) => s + (v.invested||0), 0) + Object.values(port.crypto||{}).reduce((s,v) => s + (v.invested||0), 0);
  if (totalInvested > cash * 0.5) riskMgmt -= 1; // Massa exposició
  if (totalInvested > 0 && totalInvested < rev * 0.2) riskMgmt += 1; // Inversió raonable
  riskMgmt = Math.max(0, Math.min(10, riskMgmt));

  // 2. NEGOCIACIÓ (0-10)
  let negotiation = 5;
  if (provs.length >= 1) negotiation += 1;
  if (provs.length >= 3) negotiation += 1;
  if (s.clients?.length >= 3) negotiation += 1;
  if (s.franchise) negotiation += 1;
  if (trade.exports?.length >= 1) negotiation += 1;
  if (prest >= 30) negotiation += 1;
  negotiation = Math.max(0, Math.min(10, negotiation));

  // 3. DRETS LABORALS (0-10)
  let laborRights = 6;
  const avgSalary = emps.length > 0 ? emps.reduce((s,e) => s + (e.salary||0), 0) / emps.length : 0;
  if (avgSalary >= 1500) laborRights += 1; // Salari digne
  if (avgSalary >= 2000) laborRights += 1;
  if (avgSalary < 1000 && emps.length > 0) laborRights -= 2; // Salaris baixos
  const avgMorale = emps.length > 0 ? emps.reduce((s,e) => s + (e.morale||60), 0) / emps.length : 70;
  if (avgMorale >= 70) laborRights += 1;
  if (avgMorale < 40) laborRights -= 2;
  if (labor.convenis?.length > 0) laborRights += 1; // Té convenis
  if (labor.vaga) laborRights -= 1; // Hi ha vaga activa
  laborRights = Math.max(0, Math.min(10, laborRights));

  // 4. COMPTABILITAT (0-10)
  let accounting = 5;
  if (f.actiu && f.passiu) accounting += 1; // Té balanç
  if (loans.length > 0) accounting += 1; // Ha gestionat préstecs
  if (f.revenue_history?.length >= 8) accounting += 1; // Historial
  if (week >= 26) accounting += 1; // Experiència temporal
  if (week >= 52) accounting += 1; // Any complet
  const totalActiu = (f.actiu?.immobilitzat||0) + (f.actiu?.existencies||0) + cash + (f.actiu?.clients||0);
  const totalPassiu = (f.passiu?.capital||0) + (f.passiu?.reserves||0) + (f.passiu?.deutes_llarg||0) + (f.passiu?.deutes_curt||0) + (f.passiu?.proveidors||0);
  if (totalActiu > 0 && totalPassiu > 0) accounting += 1;
  accounting = Math.max(0, Math.min(10, accounting));

  // 5. GESTIÓ FINANCERA (0-10)
  let financeMgmt = 5;
  if (cash >= 0) financeMgmt += 1;
  if (cash >= 10000) financeMgmt += 1;
  if (result >= 0) financeMgmt += 1; // Beneficis
  if (result > rev * 0.1) financeMgmt += 1; // Bon marge
  const totalDeute = (f.passiu?.deutes_llarg||0) + (f.passiu?.deutes_curt||0);
  const capital = (f.passiu?.capital||0) + (f.passiu?.reserves||0);
  if (capital > 0 && totalDeute / capital < 2) financeMgmt += 1; // Endeutament sa
  if (cash < -50000) financeMgmt -= 3; // Greu problema
  financeMgmt = Math.max(0, Math.min(10, financeMgmt));

  // 6. INNOVACIÓ / ESG (0-10)
  let innovation = 3;
  if (rdi.completed?.length >= 1) innovation += 2;
  if (rdi.completed?.length >= 3) innovation += 2;
  if (rdi.completed?.length >= 5) innovation += 1;
  if ((rdi.esg||0) >= 15) innovation += 1;
  if ((rdi.esg||0) >= 40) innovation += 1;
  if ((rdi.totalInvested||0) > 0) innovation += 1;
  innovation = Math.max(0, Math.min(10, innovation));

  // 7. COMERÇ INTERNACIONAL (0-10)
  let intlTrade = 4;
  if (trade.exports?.length >= 1) intlTrade += 2;
  if (trade.exports?.length >= 3) intlTrade += 1;
  if (trade.imports?.length >= 1) intlTrade += 1;
  if (trade.imports?.length + trade.exports?.length >= 5) intlTrade += 1;
  if (Object.keys(trade.incoterms||{}).length > 0) intlTrade += 1;
  intlTrade = Math.max(0, Math.min(10, intlTrade));

  // NOTA FINAL (ponderada)
  const weights = { riskMgmt: 0.12, negotiation: 0.12, laborRights: 0.15, accounting: 0.18, financeMgmt: 0.20, innovation: 0.13, intlTrade: 0.10 };
  const finalGrade = riskMgmt * weights.riskMgmt + negotiation * weights.negotiation + laborRights * weights.laborRights + accounting * weights.accounting + financeMgmt * weights.financeMgmt + innovation * weights.innovation + intlTrade * weights.intlTrade;

  return { riskMgmt, negotiation, laborRights, accounting, financeMgmt, innovation, intlTrade, finalGrade };
}

function renderGrade(val) {
  const v = Math.round(val * 10) / 10;
  const color = v >= 7 ? 'var(--green)' : v >= 5 ? 'var(--gold)' : 'var(--red)';
  const bg = v >= 7 ? 'rgba(16,185,129,.12)' : v >= 5 ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.12)';
  return `<div style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:24px;background:${bg};border-radius:6px;font-size:11px;font-weight:700;color:${color};font-family:'JetBrains Mono',monospace">${v.toFixed(1)}</div>`;
}

window.exportEvaluation = function() {
  const students = getG().allStudents.filter(s => !s.isProf && s.company);
  const header = ['Alumne','Empresa','Risc inversió','Negociació','Drets laborals','Comptabilitat','Gestió financera','Innovació/ESG','Comerç int.','NOTA FINAL'];
  const rows = students.map(s => {
    const ev = evaluateStudent(s);
    return [
      s.displayName, s.company?.name||'—',
      ev.riskMgmt.toFixed(1), ev.negotiation.toFixed(1), ev.laborRights.toFixed(1),
      ev.accounting.toFixed(1), ev.financeMgmt.toFixed(1), ev.innovation.toFixed(1),
      ev.intlTrade.toFixed(1), ev.finalGrade.toFixed(1)
    ].join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], {type:'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'empresabat_avaluacio.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast('📄 Avaluació exportada!');
};

})();
