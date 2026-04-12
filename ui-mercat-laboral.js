(function() {
// ============================================================
//  ui-mercat-laboral.js — Mercat laboral compartit + Negociacions reals
//  · Treballadors compartits entre jugadors
//  · Franquícies amb temps de negociació
//  · Comerç internacional amb empleats i instal·lacions
//  · Integració negociacions amb tots els mòduls
// ============================================================

var getG = function() { return window.G; };
var saveGameData  = function() { return window.saveGameData.apply(null, arguments); };
var showToast     = function() { return window.showToast.apply(null, arguments); };
var showEventToast = function() { return window.showEventToast.apply(null, arguments); };
var fmt = function() { return window.fmt.apply(null, arguments); };

// ════════════════════════════════════════════════════════════
//  1. MERCAT LABORAL COMPARTIT
// ════════════════════════════════════════════════════════════

// Pool de noms catalans realistes
var NOMS = ['Pau','Laia','Marc','Marta','Oriol','Júlia','Arnau','Carla','Jan','Aina','Guillem','Noa','Pol','Berta','Nil','Clàudia','Àlex','Mireia','Gerard','Laura'];
var COGNOMS = ['Ferrer','Costa','Rovira','Duran','Albà','Prat','Roca','Solà','Vidal','Serra','Mas','Font','Bosch','Puig','Torres','Garcia','López','Martí','Sala','Vila'];
var SKILLS_POOL = ['Excel avançat','SAP','Anglès B2','Francès B1','Alemany A2','Xinès bàsic','Comptabilitat','Lean Manufacturing','Marketing digital','SEO/SEM','Programació Python','Disseny gràfic','Gestió de projectes','Atenció al client','Logística internacional','Negociació','Lideratge','Anàlisi de dades','CRM Salesforce','Normativa laboral'];

var DEPTS_EXPANDED = [
  {name:'Comercial',             dept:'vendes',           salaryRange:[1600,2200], icon:'📊'},
  {name:'Comercial sènior',      dept:'vendes',           salaryRange:[2400,3500], icon:'📊'},
  {name:'Operari/a de producció', dept:'produccio',       salaryRange:[1200,1600], icon:'⚙️'},
  {name:'Tècnic/a de producció', dept:'produccio',        salaryRange:[1800,2600], icon:'🔧'},
  {name:'Administratiu/va',      dept:'administracio',    salaryRange:[1400,1800], icon:'📋'},
  {name:'Comptable',             dept:'administracio',    salaryRange:[1800,2400], icon:'📊'},
  {name:'Atenció al client',     dept:'atencio_client',   salaryRange:[1300,1700], icon:'🎧'},
  {name:'Cap atenció client',    dept:'atencio_client',   salaryRange:[2200,3000], icon:'🎧'},
  {name:'Tècnic/a marketing',    dept:'marketing',        salaryRange:[1600,2200], icon:'📢'},
  {name:'Director/a marketing',  dept:'marketing',        salaryRange:[3000,4500], icon:'📢'},
  {name:'Director/a financer/a', dept:'finances',         salaryRange:[3500,5000], icon:'💶'},
  {name:'Director/a RRHH',       dept:'rrhh',             salaryRange:[3000,4200], icon:'🧑‍💼'},
  {name:'Enginyer/a I+D',        dept:'rdi',              salaryRange:[2500,3800], icon:'🔬'},
  {name:'Responsable qualitat',  dept:'produccio',        salaryRange:[2200,3200], icon:'✅'},
  {name:'Logístic/a internacional',dept:'comerc_ext',     salaryRange:[2200,3400], icon:'🌐'},
  {name:'Director/a d\'exportacions',dept:'comerc_ext',   salaryRange:[3500,5500], icon:'🌐'},
];

function generateCandidateName() {
  return NOMS[Math.floor(Math.random()*NOMS.length)] + ' ' + COGNOMS[Math.floor(Math.random()*COGNOMS.length)];
}

function generateSkills(count) {
  var shuffled = SKILLS_POOL.slice().sort(function() { return 0.5 - Math.random(); });
  return shuffled.slice(0, count);
}

function getLanguages() {
  var langs = ['Català (natiu)','Castellà (natiu)'];
  if (Math.random() < 0.6) langs.push('Anglès ' + (Math.random()>0.5?'B2':'C1'));
  if (Math.random() < 0.2) langs.push('Francès ' + (Math.random()>0.5?'B1':'B2'));
  if (Math.random() < 0.08) langs.push('Alemany ' + (Math.random()>0.5?'A2':'B1'));
  if (Math.random() < 0.04) langs.push('Xinès bàsic');
  if (Math.random() < 0.05) langs.push('Àrab bàsic');
  return langs;
}

// Build market from all players + random pool
function buildLaborMarket() {
  var market = [];
  var allStudents = getG().allStudents || [];
  var myUid = getG().uid;
  
  // 1. Treballadors d'ALTRES empreses (es poden reclutar = "caçar")
  allStudents.forEach(function(student) {
    if (student.uid === myUid) return;
    if (!student.company) return;
    var emps = student.employees || [];
    emps.forEach(function(emp) {
      market.push({
        id: emp.id,
        name: emp.name,
        role: emp.role || emp.dept,
        dept: emp.dept,
        salary: emp.salary || 1500,
        morale: emp.morale || 60,
        seniority: emp.seniority || 0,
        skills: emp.skills || generateSkills(2),
        languages: emp.languages || getLanguages(),
        status: 'employed',
        employer: student.company.name,
        employerUid: student.uid,
        icon: emp.avatar || emp.icon || '👤',
        requiresNegotiation: true,
        poachPremium: 1.25, // 25% more salary to poach
      });
    });
  });
  
  // 2. Treballadors a l'atur (pool generat)
  var unemployedCount = Math.max(4, 12 - market.length);
  for (var i = 0; i < unemployedCount; i++) {
    var role = DEPTS_EXPANDED[Math.floor(Math.random() * DEPTS_EXPANDED.length)];
    var salary = role.salaryRange[0] + Math.floor(Math.random() * (role.salaryRange[1] - role.salaryRange[0]));
    market.push({
      id: 'atur_' + Date.now() + '_' + i,
      name: generateCandidateName(),
      role: role.name,
      dept: role.dept,
      salary: salary,
      morale: 65 + Math.floor(Math.random() * 25),
      seniority: Math.round(Math.random() * 5 * 10) / 10,
      skills: generateSkills(2 + Math.floor(Math.random() * 3)),
      languages: getLanguages(),
      status: 'unemployed',
      employer: null,
      employerUid: null,
      icon: role.icon,
      requiresNegotiation: false,
      poachPremium: 1,
    });
  }
  
  return market;
}


// Override openHireModal with shared market
function openHireModalShared() {
  var market = buildLaborMarket();
  window._hireCandidates = market;
  
  // Group by status
  var employed = market.filter(function(c) { return c.status === 'employed'; });
  var unemployed = market.filter(function(c) { return c.status === 'unemployed'; });
  
  var html = '<div style="margin-bottom:12px;padding:12px;background:rgba(79,127,255,.06);border-radius:10px;border:1px solid rgba(79,127,255,.2)">' +
    '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">🏢 Mercat laboral compartit</div>' +
    '<div style="font-size:11px;color:var(--text2)">Contracta persones a l\'atur o negocia per "caçar" empleats d\'altres empreses de la classe.</div>' +
  '</div>';
  
  // Unemployed section
  html += '<div style="font-size:12px;font-weight:700;color:var(--green);margin:12px 0 6px;display:flex;align-items:center;gap:6px">🟢 A l\'atur (' + unemployed.length + ' disponibles)</div>';
  html += unemployed.map(function(c, i) {
    var globalIdx = market.indexOf(c);
    return renderCandidateCard(c, globalIdx, false);
  }).join('');
  
  // Employed section
  if (employed.length > 0) {
    html += '<div style="font-size:12px;font-weight:700;color:var(--gold);margin:16px 0 6px;display:flex;align-items:center;gap:6px">🟡 Treballant en altres empreses (' + employed.length + ')</div>';
    html += '<div style="font-size:10px;color:var(--text3);margin-bottom:8px">⚠️ Caçar un empleat requereix negociació (2-4 setmanes) i oferir +25% de salari mínim</div>';
    html += employed.map(function(c, i) {
      var globalIdx = market.indexOf(c);
      return renderCandidateCard(c, globalIdx, true);
    }).join('');
  }
  
  document.getElementById('hire-candidates').innerHTML = html;
  document.getElementById('hire-modal').style.display = 'flex';
};

function renderCandidateCard(c, idx, isPoach) {
  var salaryDisplay = isPoach ? Math.round(c.salary * c.poachPremium) : c.salary;
  var langBadges = (c.languages || []).map(function(l) {
    return '<span style="display:inline-block;background:rgba(79,127,255,.1);border:1px solid rgba(79,127,255,.2);border-radius:10px;padding:1px 6px;font-size:9px;color:var(--accent);margin:1px">' + l + '</span>';
  }).join('');
  var skillBadges = (c.skills || []).slice(0, 3).map(function(s) {
    return '<span style="display:inline-block;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:10px;padding:1px 6px;font-size:9px;color:var(--text2);margin:1px">' + s + '</span>';
  }).join('');
  
  return '<div class="offer-card" style="padding:12px;margin-bottom:6px;' + (isPoach ? 'border-color:rgba(245,158,11,.25);' : '') + '">' +
    '<div style="display:flex;align-items:flex-start;gap:12px">' +
      '<span style="font-size:28px;margin-top:4px">' + c.icon + '</span>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
          '<span style="font-weight:700;font-size:13px;color:var(--text)">' + c.name + '</span>' +
          '<span style="font-size:10px;color:var(--text2);background:rgba(255,255,255,.05);border-radius:8px;padding:2px 8px">' + c.role + '</span>' +
          (isPoach ? '<span style="font-size:9px;color:var(--gold);background:rgba(245,158,11,.1);border-radius:8px;padding:2px 8px">📍 ' + c.employer + '</span>' : '<span style="font-size:9px;color:var(--green);background:rgba(16,185,129,.1);border-radius:8px;padding:2px 8px">Disponible</span>') +
        '</div>' +
        '<div style="font-size:11px;color:var(--text2);margin-top:4px">Dept: ' + c.dept + ' · Antigüitat: ' + (c.seniority||0).toFixed(1) + ' anys · Moral: ' + Math.round(c.morale||60) + '%</div>' +
        '<div style="margin-top:4px">' + langBadges + '</div>' +
        '<div style="margin-top:3px">' + skillBadges + '</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:13px;color:var(--gold);margin-top:6px">' +
          salaryDisplay.toLocaleString('ca') + '€/mes' +
          (isPoach ? ' <span style="font-size:10px;color:var(--text3)">(actual: ' + c.salary.toLocaleString('ca') + '€)</span>' : '') +
        '</div>' +
      '</div>' +
      '<button class="offer-btn" onclick="hireCandidate(' + idx + ')" style="width:auto;padding:8px 14px;white-space:nowrap;align-self:center">' +
        (isPoach ? '🎯 Reclutar' : '✅ Contractar') +
      '</button>' +
    '</div>' +
  '</div>';
}

// Override hireCandidate with negotiation for poaching
async function hireCandidateShared(idx) {
  var c = window._hireCandidates && window._hireCandidates[idx];
  if (!c) return;
  var gd = getG().gameData;
  
  if (c.status === 'employed') {
    // POACHING: requires negotiation
    var poachSalary = Math.round(c.salary * c.poachPremium);
    if (!confirm('Vols intentar reclutar ' + c.name + ' de ' + c.employer + '?\n\nSalari ofert: ' + poachSalary.toLocaleString('ca') + '€/mes\nTemps de negociació: 2-4 setmanes\nRisc: pot rebutjar l\'oferta\n\nSi accepta, desapareixerà de l\'altra empresa.')) return;
    
    // Create negotiation
    if (window.EBNegotiation && window.EBNegotiation.createNegotiation) {
      window.EBNegotiation.createNegotiation(gd, 'empleat', c.name + ' (' + c.role + ')', {
        negotiationWeeks: 2 + Math.floor(Math.random() * 3),
        successRate: c.morale < 50 ? 0.75 : c.morale < 70 ? 0.50 : 0.30, // Unhappy employees more likely to leave
        candidateData: {
          name: c.name, dept: c.dept, role: c.role,
          salary: poachSalary, morale: 75,
          skills: c.skills, languages: c.languages,
          icon: c.icon, seniority: c.seniority,
          fromEmployer: c.employer, fromEmployerUid: c.employerUid,
          originalEmpId: c.id,
        },
        onSuccess: function(gameData) {
          // Add employee to our team
          var newEmp = {
            id: 'emp_' + Date.now(),
            name: c.name, dept: c.dept, role: c.role,
            salary: poachSalary, morale: 75,
            seniority: c.seniority || 0,
            skills: c.skills, languages: c.languages,
            avatar: c.icon, nivel: 'base',
          };
          gameData.employees.push(newEmp);
          
          // Try to remove from other player via Firestore
          if (c.employerUid && window._db && window._firestore_doc && window._firestore_setDoc) {
            var otherStudent = (getG().allStudents || []).find(function(s) { return s.uid === c.employerUid; });
            if (otherStudent) {
              var updatedEmps = (otherStudent.employees || []).filter(function(e) { return e.id !== c.id; });
              var updatedNotifs = (otherStudent.notifications || []).slice();
              updatedNotifs.push({
                id: Date.now(), icon: '😤',
                title: 'Empleat reclutat per la competència!',
                desc: c.name + ' ha marxat a treballar a ' + (gameData.company?.name || 'una altra empresa') + '.',
                time: 'S' + gameData.week, urgent: true
              });
              try {
                window._firestore_setDoc(
                  window._firestore_doc(window._db, 'games', c.employerUid),
                  { employees: updatedEmps, notifications: updatedNotifs },
                  { merge: true }
                );
              } catch(e) { console.warn('Could not update other player:', e); }
            }
          }
        }
      });
    }
    
    window.closeHireModal();
    showToast('🎯 Negociació de reclutament iniciada amb ' + c.name + '...');
    
  } else {
    // STANDARD HIRE: still takes 1 week (not instant)
    var newEmp = {
      id: 'emp_' + Date.now(), name: c.name,
      dept: c.dept, role: c.role, salary: c.salary,
      morale: c.morale || 75, seniority: c.seniority || 0,
      skills: c.skills, languages: c.languages,
      avatar: c.icon || '👤', nivel: 'base',
      incorporating: true, incorporationWeeks: 1,
    };
    gd.employees.push(newEmp);
    gd.notifications.push({id:Date.now(), icon:'👥', title:'Nou empleat en incorporació', desc:c.name + ' s\'incorporarà la setmana vinent (' + c.role + ')', time:'S'+gd.week, urgent:false});
    await saveGameData();
    window.closeHireModal();
    if (window.renderHR) window.renderHR();
    if (window.renderDashboard) window.renderDashboard();
    showToast('✅ ' + c.name + ' contractat/da! S\'incorporarà en 1 setmana.');
  }
};


// ════════════════════════════════════════════════════════════
//  2. FRANQUÍCIES AMB TEMPS DE NEGOCIACIÓ
// ════════════════════════════════════════════════════════════

// Override joinFranchise
async function joinFranchiseNego(franchiseId) {
  var gd = getG().gameData;
  var FRANCHISES = window.FRANCHISES_DATA || [];
  var fr = FRANCHISES.find(function(f) { return f.id === franchiseId; });
  if (!fr) return;
  if ((gd.finances?.cash||0) < fr.entryFee) { showToast('❌ No tens prou capital'); return; }
  if (!confirm('Iniciar negociació per convertir ' + gd.company.name + ' en franquícia de ' + fr.name + '?\n\nCost entrada: ' + fr.entryFee.toLocaleString('ca') + '€\nRoyalties: ' + (fr.royalty*100) + '%\nTemps negociació: 3-6 setmanes\nTemps obres: 4-8 setmanes')) return;
  
  if (window.EBNegotiation && window.EBNegotiation.createNegotiation) {
    window.EBNegotiation.createNegotiation(gd, 'franquicia', 'Franquícia ' + fr.name, {
      negotiationWeeks: 3 + Math.floor(Math.random() * 4),
      successRate: 0.80,
      onSuccess: function(gameData) {
        gameData.finances.cash -= fr.entryFee;
        gameData.franchise = {
          id: fr.id, mode: 'franquiciat',
          royaltyRate: fr.royalty, adFundRate: fr.adFund,
          contract: fr.contract, startWeek: gameData.week,
          obresWeeksLeft: 4 + Math.floor(Math.random() * 5), // Obres!
          operativa: false,
        };
        gameData.prestigi = Math.min(100, (gameData.prestigi||0) + 5);
        gameData.notifications.push({id:Date.now(), icon:'🏗️', title:'Obres de franquícia en curs!', desc:fr.name + ' — Les obres d\'adequació trigaran unes setmanes.', time:'S'+gameData.week, urgent:false});
      }
    });
  }
  await saveGameData();
  showToast('🤝 Negociació amb ' + fr.name + ' iniciada...');
  if (window.renderFranquicies) window.renderFranquicies();
};

// Override recruitFranchisee
async function recruitFranchiseeNego() {
  var gd = getG().gameData;
  var fr = gd.franchise;
  if (!fr) return;
  var trainingCost = fr.trainingCost || 3000;
  if ((gd.finances?.cash||0) < trainingCost) { showToast('❌ No tens prou per la formació'); return; }
  
  if (window.EBNegotiation && window.EBNegotiation.createNegotiation) {
    window.EBNegotiation.createNegotiation(gd, 'franquicia', 'Nou franquiciat per ' + (fr.name || gd.company?.name), {
      negotiationWeeks: 4 + Math.floor(Math.random() * 4),
      successRate: 0.60,
      onSuccess: function(gameData) {
        gameData.finances.cash -= trainingCost;
        gameData.finances.cash += fr.entryFeeRecurring || 15000;
        gameData.franchise.franchisees = (gameData.franchise.franchisees||0) + 1;
        gameData.franchise.royaltyWeekly = Math.round(gameData.franchise.royaltyWeekly * 1.15);
        gameData.prestigi = Math.min(100, (gameData.prestigi||0) + 2);
      }
    });
  }
  await saveGameData();
  showToast('🤝 Buscant nou franquiciat... (negociació en curs)');
};


// ════════════════════════════════════════════════════════════
//  3. COMERÇ INTERNACIONAL AMB REQUISITS REALS
// ════════════════════════════════════════════════════════════

// Override startExport
async function startExportNego(countryCode, weeklyValue, setupCost) {
  var gd = getG().gameData;
  if ((gd.finances?.cash||0) < setupCost) { showToast('❌ Necessites ' + fmt(setupCost) + '€'); return; }
  
  var COUNTRIES = window.COUNTRIES_DATA || [];
  var country = COUNTRIES.find(function(c) { return c.code === countryCode; });
  var emps = gd.employees || [];
  
  // Check requirements
  var hasComercExt = emps.some(function(e) { return e.dept === 'comerc_ext'; });
  var hasLanguageEmp = emps.some(function(e) {
    var langs = (e.languages || []).join(' ').toLowerCase();
    if (countryCode === 'FR') return langs.indexOf('franc') >= 0;
    if (countryCode === 'DE') return langs.indexOf('alem') >= 0;
    if (countryCode === 'CN') return langs.indexOf('xin') >= 0;
    if (countryCode === 'MA') return langs.indexOf('àrab') >= 0 || langs.indexOf('franc') >= 0;
    return langs.indexOf('angl') >= 0; // English as default
  });
  
  if (!hasComercExt) {
    showToast('❌ Necessites un empleat al departament de Comerç Exterior');
    return;
  }
  
  var negotiationWeeks = 4;
  var successRate = 0.70;
  
  if (!hasLanguageEmp) {
    negotiationWeeks += 3;
    successRate -= 0.20;
    showToast('⚠️ No tens empleats amb l\'idioma necessari. La negociació serà més llarga i difícil.');
  }
  
  if (country && country.distance === 'lluny') {
    negotiationWeeks += 2;
    setupCost = Math.round(setupCost * 1.3); // 30% more for distant countries
  }
  
  if (!confirm('Iniciar negociació d\'exportació a ' + (country?.name||countryCode) + '?\n\n' +
    'Cost establiment: ' + setupCost.toLocaleString('ca') + '€\n' +
    'Valor setmanal estimat: ' + weeklyValue.toLocaleString('ca') + '€\n' +
    'Temps negociació: ~' + negotiationWeeks + ' setmanes\n' +
    'Probabilitat èxit: ' + Math.round(successRate*100) + '%\n' +
    (hasLanguageEmp ? '✅ Tens empleat amb idioma' : '❌ Sense empleat amb idioma (negoció +difícil)') + '\n' +
    '✅ Tens empleat de Comerç Exterior')) return;
  
  if (window.EBNegotiation && window.EBNegotiation.createNegotiation) {
    window.EBNegotiation.createNegotiation(gd, 'export', 'Exportació a ' + (country?.name||countryCode), {
      negotiationWeeks: negotiationWeeks,
      successRate: successRate,
      onSuccess: function(gameData) {
        gameData.finances.cash -= setupCost;
        if (!gameData.trade) gameData.trade = {imports:[],exports:[],incoterms:{}};
        gameData.trade.exports.push({
          country: countryCode,
          weeklyValue: weeklyValue,
          setupCost: setupCost,
          incoterm: 'FOB',
          startWeek: gameData.week,
        });
        gameData.prestigi = Math.min(100, (gameData.prestigi||0) + 3);
      }
    });
  }
  await saveGameData();
  showToast('🌐 Negociació d\'exportació a ' + (country?.name||countryCode) + ' iniciada...');
  if (window.renderTrade) window.renderTrade();
};

// Override startImport
async function startImportNego(id, name, weeklyCost, saving) {
  var gd = getG().gameData;
  var emps = gd.employees || [];
  
  var hasComercExt = emps.some(function(e) { return e.dept === 'comerc_ext'; });
  if (!hasComercExt) {
    showToast('❌ Necessites un empleat al departament de Comerç Exterior');
    return;
  }
  
  if (window.EBNegotiation && window.EBNegotiation.createNegotiation) {
    window.EBNegotiation.createNegotiation(gd, 'import', 'Importació: ' + name, {
      negotiationWeeks: 2 + Math.floor(Math.random() * 3),
      successRate: 0.80,
      onSuccess: function(gameData) {
        if (!gameData.trade) gameData.trade = {imports:[],exports:[],incoterms:{}};
        gameData.trade.imports.push({ id:id, name:name, weeklyCost:weeklyCost, saving:saving, startWeek:gameData.week });
      }
    });
  }
  await saveGameData();
  showToast('📥 Negociació d\'importació iniciada...');
  if (window.renderTrade) window.renderTrade();
};


// ════════════════════════════════════════════════════════════
//  4. HOOK: PROCESS EMPLOYEE INCORPORATION IN ADVANCEWEEK
// ════════════════════════════════════════════════════════════

function hookAdvanceWeekLabor() {
  var orig = window.advanceWeek;
  if (!orig || window._laborHooked) return;
  window._laborHooked = true;
  
  window.advanceWeek = async function() {
    await orig();
    var gd = getG()?.gameData;
    if (!gd) return;
    
    // Process employee incorporations
    (gd.employees || []).forEach(function(e) {
      if (e.incorporating) {
        e.incorporationWeeks = (e.incorporationWeeks || 1) - 1;
        if (e.incorporationWeeks <= 0) {
          e.incorporating = false;
          delete e.incorporationWeeks;
          gd.notifications.push({id:Date.now()+Math.random(), icon:'✅', title:'Empleat incorporat!', desc:e.name + ' ja està operatiu/va (' + e.dept + ')', time:'S'+gd.week, urgent:false});
          showEventToast('✅', 'Nou empleat!', e.name + ' s\'ha incorporat', true);
        }
      }
    });
    
    // Process franchise construction
    if (gd.franchise && gd.franchise.obresWeeksLeft > 0) {
      gd.franchise.obresWeeksLeft--;
      if (gd.franchise.obresWeeksLeft <= 0) {
        gd.franchise.operativa = true;
        gd.prestigi = Math.min(100, (gd.prestigi||0) + 5);
        gd.notifications.push({id:Date.now(), icon:'🏪', title:'Franquícia operativa!', desc:'Les obres han acabat. La franquícia ja està en funcionament!', time:'S'+gd.week, urgent:false});
        showEventToast('🏪', 'Franquícia oberta!', 'Les obres d\'adequació han finalitzat', true);
      }
    }
    
    // Employees in incorporation don't count as active workers
    // (already handled because incorporating employees have their dept but are not fully productive)
  };
}


// ════════════════════════════════════════════════════════════
//  5. INIT
// ════════════════════════════════════════════════════════════

var attempts = 0;
function tryInit() {
  attempts++;
  if (attempts > 60) return;
  if (!window.G || !window.advanceWeek || !window.openHireModal || !document.querySelector('.sidebar')) {
    setTimeout(tryInit, 500);
    return;
  }
  
  // Store originals before overriding
  var _origOpenHire = window.openHireModal;
  var _origJoinFranchise = window.joinFranchise;
  var _origRecruitFranchisee = window.recruitFranchisee;
  var _origStartExport = window.startExport;
  var _origStartImport = window.startImport;
  
  // NOW override (after module has defined them)
  window.openHireModal = openHireModalShared;
  window.hireCandidate = hireCandidateShared;
  window.joinFranchise = joinFranchiseNego;
  window.recruitFranchisee = recruitFranchiseeNego;
  window.startExport = startExportNego;
  window.startImport = startImportNego;
  
  hookAdvanceWeekLabor();
  console.log('👥 EmpresaBat Mercat Laboral + Negociacions carregat');
}

if (document.readyState === 'complete') tryInit();
else window.addEventListener('load', function() { setTimeout(tryInit, 700); });

})();
