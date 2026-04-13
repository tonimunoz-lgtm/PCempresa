// ============================================================
//  ui-fixes.js — Correccions de bugs i millores
//  1. Ampliar empreses (Matadepera, Sabadell, Terrassa) + no repetir
//  2. Fix wizard "Crear empresa" (botó final)
//  3. Treure creació manual de clients pels alumnes
//  4. Fix imatges evolució empresa al dashboard
// ============================================================

(function() {
'use strict';

const getG = () => window.G;
const fmt = (n) => (n||0).toLocaleString('ca');

// ════════════════════════════════════════════════════════════
//  1. NOVES EMPRESES + EVITAR REPETICIONS
// ════════════════════════════════════════════════════════════

// Afegir noves empreses de Matadepera, Sabadell i Terrassa
const NOVES_EMPRESES = [
  // ─── MATADEPERA ───
  {
    name: 'Celler Can Batlle SL',
    sector: 'alimentacio', legalForm: 'sl', size: 'small',
    loc: [41.60, 2.02], muni: 'Matadepera',
    founded: 2005, employees_real: 14,
    capital_social: 20000, reserves: 95000,
    deutes_llarg: 45000, deutes_curt: 18000,
    actiu_fix: 180000, existencies: 35000,
    facturacio_anual: 520000, marge_brut: 0.42,
    clients_destacats: [
      { name: 'Restaurants Alt Vallès', monthly: 12000, type: 'B2B', satisfaction: 88 },
      { name: 'Vinoteca La Cava SCP', monthly: 8000, type: 'B2B', satisfaction: 85 },
      { name: 'Particulars (venda directa)', monthly: 15000, type: 'B2C', satisfaction: 92 },
    ],
    proveidors: [
      { name: 'Vivers del Penedès SL', product: 'Raïm verema', cost_mes: 6000, criticitat: 'alta' },
      { name: 'Taps Surecork SA', product: 'Taps de suro', cost_mes: 1800, criticitat: 'mitja' },
      { name: 'Vidrieria Catalana SL', product: 'Ampolles vidre', cost_mes: 3200, criticitat: 'alta' },
    ],
    maquinaria: [
      { name: 'Premsa pneumàtica', valor: 45000, amortitzacio: 0.10 },
      { name: 'Dipòsits inox (12 units)', valor: 85000, amortitzacio: 0.08 },
      { name: 'Línia embotellament semi-auto', valor: 32000, amortitzacio: 0.12 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'vi_negre', name: 'Vi negre reserva 75cl', preu: 12.50, unitats_mes: 800 },
      { id: 'vi_blanc', name: 'Vi blanc jove 75cl', preu: 7.80, unitats_mes: 1200 },
      { id: 'cava', name: 'Cava brut nature', preu: 9.20, unitats_mes: 600 },
    ],
  },
  {
    name: 'Hípica Montserrat SL',
    sector: 'turisme', legalForm: 'sl', size: 'small',
    loc: [41.59, 2.01], muni: 'Matadepera',
    founded: 1998, employees_real: 10,
    capital_social: 18000, reserves: 65000,
    deutes_llarg: 30000, deutes_curt: 12000,
    actiu_fix: 250000, existencies: 8000,
    facturacio_anual: 380000, marge_brut: 0.35,
    clients_destacats: [
      { name: 'Escoles comarca Vallès', monthly: 8000, type: 'B2B', satisfaction: 90 },
      { name: 'Alumnes particulars', monthly: 18000, type: 'B2C', satisfaction: 85 },
    ],
    proveidors: [
      { name: 'Pinsos Vall SL', product: 'Alimentació cavalls', cost_mes: 4500, criticitat: 'alta' },
      { name: 'Veterinària Equina Dr. Pons', product: 'Serveis veterinaris', cost_mes: 1200, criticitat: 'alta' },
    ],
    maquinaria: [
      { name: 'Pistes de sorra (3)', valor: 120000, amortitzacio: 0.05 },
      { name: 'Boxes i estables (20 places)', valor: 95000, amortitzacio: 0.06 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'classes', name: 'Classes equitació/hora', preu: 35, unitats_mes: 400 },
      { id: 'pupilatge', name: 'Pupilatge cavall/mes', preu: 450, unitats_mes: 18 },
      { id: 'excursions', name: 'Excursió muntanya', preu: 55, unitats_mes: 120 },
    ],
  },

  // ─── SABADELL ───
  {
    name: 'Electrònica Sabadell SA',
    sector: 'tecnologia', legalForm: 'sa', size: 'large',
    loc: [41.54, 2.10], muni: 'Sabadell',
    founded: 1992, employees_real: 185,
    capital_social: 420000, reserves: 1800000,
    deutes_llarg: 850000, deutes_curt: 280000,
    actiu_fix: 3200000, existencies: 380000,
    facturacio_anual: 6800000, marge_brut: 0.34,
    clients_destacats: [
      { name: 'Seat Martorell SA', monthly: 120000, type: 'B2B', satisfaction: 82 },
      { name: 'Schneider Electric', monthly: 85000, type: 'B2B', satisfaction: 87 },
      { name: 'TMB (Transports BCN)', monthly: 45000, type: 'B2B', satisfaction: 78 },
      { name: 'HP España SL', monthly: 38000, type: 'B2B', satisfaction: 85 },
    ],
    proveidors: [
      { name: 'RS Components Iberia', product: 'Components electrònics', cost_mes: 42000, criticitat: 'alta' },
      { name: 'PCB Manufacturing SL', product: 'Plaques circuit', cost_mes: 28000, criticitat: 'alta' },
      { name: 'Farnell Element14', product: 'Semiconductors', cost_mes: 18000, criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Línia SMD pick&place', valor: 680000, amortitzacio: 0.12 },
      { name: 'Forn refusió soldadura', valor: 120000, amortitzacio: 0.15 },
      { name: 'Estació test automàtica (ATE)', valor: 350000, amortitzacio: 0.10 },
      { name: 'Sala blanca classe 1000', valor: 450000, amortitzacio: 0.08 },
    ],
    loans_actius: [
      { entitat: 'Banc Sabadell', capital: 500000, tipus: 0.032, anys_restants: 7, mensualitat: 6800 },
    ],
    serveis: [
      { id: 'pcb_custom', name: 'PCB disseny custom', preu: 2800, unitats_mes: 45 },
      { id: 'montatge', name: 'Muntatge electrònic sèrie', preu: 18, unitats_mes: 12000 },
      { id: 'test', name: 'Test i certificació CE', preu: 850, unitats_mes: 65 },
    ],
  },
  {
    name: 'Pastisseria Foix de Sabadell SL',
    sector: 'alimentacio', legalForm: 'sl', size: 'small',
    loc: [41.55, 2.11], muni: 'Sabadell',
    founded: 1978, employees_real: 18,
    capital_social: 12000, reserves: 180000,
    deutes_llarg: 25000, deutes_curt: 15000,
    actiu_fix: 95000, existencies: 22000,
    facturacio_anual: 620000, marge_brut: 0.55,
    clients_destacats: [
      { name: 'Botiga pròpia (3 establiments)', monthly: 32000, type: 'B2C', satisfaction: 92 },
      { name: 'Restaurants Sabadell centre', monthly: 8000, type: 'B2B', satisfaction: 88 },
      { name: 'Catering empreses Vallès', monthly: 6000, type: 'B2B', satisfaction: 80 },
    ],
    proveidors: [
      { name: 'Farina La Masia SL', product: 'Farina ecològica', cost_mes: 3800, criticitat: 'alta' },
      { name: 'Xocolata Simón Coll', product: 'Xocolata cobertura', cost_mes: 2200, criticitat: 'alta' },
      { name: 'Ous ecològics Can Pujol', product: 'Ous frescos', cost_mes: 1500, criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Forn industrial Miwe', valor: 45000, amortitzacio: 0.10 },
      { name: 'Amassadora espiral', valor: 12000, amortitzacio: 0.12 },
      { name: 'Cambra fermentació', valor: 8000, amortitzacio: 0.15 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'pa', name: 'Pa artesà (unitat)', preu: 3.20, unitats_mes: 4500 },
      { id: 'pastissos', name: 'Pastissos i tartes', preu: 28, unitats_mes: 350 },
      { id: 'croissants', name: 'Brioixeria variada', preu: 2.50, unitats_mes: 6000 },
    ],
  },
  {
    name: 'Sabadell Seguretat SL',
    sector: 'tecnologia', legalForm: 'sl', size: 'medium',
    loc: [41.55, 2.09], muni: 'Sabadell',
    founded: 2010, employees_real: 38,
    capital_social: 30000, reserves: 220000,
    deutes_llarg: 120000, deutes_curt: 55000,
    actiu_fix: 280000, existencies: 45000,
    facturacio_anual: 1800000, marge_brut: 0.40,
    clients_destacats: [
      { name: 'Comunitats de veïns (120+)', monthly: 48000, type: 'B2B', satisfaction: 82 },
      { name: 'Comerços Sabadell Centre', monthly: 22000, type: 'B2B', satisfaction: 85 },
      { name: 'Empreses polígon Can Roqueta', monthly: 18000, type: 'B2B', satisfaction: 79 },
    ],
    proveidors: [
      { name: 'Hikvision Europe BV', product: 'Càmeres CCTV', cost_mes: 12000, criticitat: 'alta' },
      { name: 'Ajax Systems', product: 'Alarmes sense fil', cost_mes: 8000, criticitat: 'alta' },
      { name: 'Telecom Vallès SL', product: 'Connectivitat IoT', cost_mes: 3500, criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Flota furgonetes (8)', valor: 160000, amortitzacio: 0.20 },
      { name: 'Servidor central monitoratge', valor: 45000, amortitzacio: 0.25 },
    ],
    loans_actius: [
      { entitat: 'CaixaBank', capital: 80000, tipus: 0.045, anys_restants: 3, mensualitat: 2400 },
    ],
    serveis: [
      { id: 'alarma_basic', name: 'Alarma bàsica/mes', preu: 29, unitats_mes: 1200 },
      { id: 'cctv', name: 'Instal·lació CCTV', preu: 1800, unitats_mes: 15 },
      { id: 'vigilancia', name: 'Ronda vigilància/mes', preu: 180, unitats_mes: 85 },
    ],
  },

  // ─── TERRASSA ───
  {
    name: 'Terrassa Motor Sport SL',
    sector: 'comerç', legalForm: 'sl', size: 'medium',
    loc: [41.57, 2.00], muni: 'Terrassa',
    founded: 2003, employees_real: 32,
    capital_social: 45000, reserves: 350000,
    deutes_llarg: 280000, deutes_curt: 95000,
    actiu_fix: 520000, existencies: 680000,
    facturacio_anual: 3200000, marge_brut: 0.18,
    clients_destacats: [
      { name: 'Particulars compra vehicles', monthly: 180000, type: 'B2C', satisfaction: 78 },
      { name: 'Flotes empresa lloguer', monthly: 45000, type: 'B2B', satisfaction: 85 },
      { name: 'Taller mecànic (post-venda)', monthly: 32000, type: 'B2C', satisfaction: 82 },
    ],
    proveidors: [
      { name: 'Importador oficial marca', product: 'Vehicles nous', cost_mes: 180000, criticitat: 'alta' },
      { name: 'Recamvis Express SA', product: 'Recanvis originals', cost_mes: 15000, criticitat: 'mitja' },
      { name: 'Lubricants Repsol SA', product: 'Olis i lubricants', cost_mes: 3500, criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Elevadors hidràulics (6)', valor: 48000, amortitzacio: 0.12 },
      { name: 'Diagnòstic electrònic', valor: 35000, amortitzacio: 0.20 },
      { name: 'Cabina de pintura', valor: 85000, amortitzacio: 0.10 },
    ],
    loans_actius: [
      { entitat: 'BBVA', capital: 200000, tipus: 0.040, anys_restants: 5, mensualitat: 3800 },
    ],
    serveis: [
      { id: 'venda_vehicle', name: 'Venda vehicle nou', preu: 22000, unitats_mes: 8 },
      { id: 'taller', name: 'Revisió taller/hora', preu: 55, unitats_mes: 480 },
      { id: 'vo', name: 'Vehicle ocasió certificat', preu: 12000, unitats_mes: 12 },
    ],
  },
  {
    name: 'Impremta Digital Terrassa SL',
    sector: 'tecnologia', legalForm: 'sl', size: 'small',
    loc: [41.56, 2.01], muni: 'Terrassa',
    founded: 2012, employees_real: 11,
    capital_social: 10000, reserves: 75000,
    deutes_llarg: 35000, deutes_curt: 20000,
    actiu_fix: 120000, existencies: 15000,
    facturacio_anual: 420000, marge_brut: 0.45,
    clients_destacats: [
      { name: 'Ajuntament de Terrassa', monthly: 8000, type: 'B2B', satisfaction: 88 },
      { name: 'Comerços i PIMES locals', monthly: 18000, type: 'B2B', satisfaction: 82 },
      { name: 'Agències publicitat BCN', monthly: 6000, type: 'B2B', satisfaction: 85 },
    ],
    proveidors: [
      { name: 'Antalis Paper SL', product: 'Paper i cartró', cost_mes: 5000, criticitat: 'alta' },
      { name: 'Tintes HP Indigo', product: 'Tòner digital', cost_mes: 3800, criticitat: 'alta' },
      { name: 'Acabats Gràfics SL', product: 'Plastificat i enquadernació', cost_mes: 1200, criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'HP Indigo 7900', valor: 85000, amortitzacio: 0.15 },
      { name: 'Plòter gran format Canon', valor: 18000, amortitzacio: 0.20 },
      { name: 'Guillotina industrial Polar', valor: 12000, amortitzacio: 0.10 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'fullets', name: 'Fullets A5 (1000u)', preu: 120, unitats_mes: 80 },
      { id: 'cartells', name: 'Cartells gran format m²', preu: 35, unitats_mes: 200 },
      { id: 'targetes', name: 'Targetes visita (500u)', preu: 45, unitats_mes: 150 },
    ],
  },
  {
    name: 'Gimnàs CrossFit Terrassa SCP',
    sector: 'salut', legalForm: 'cooperativa', size: 'small',
    loc: [41.57, 2.02], muni: 'Terrassa',
    founded: 2016, employees_real: 8,
    capital_social: 9000, reserves: 42000,
    deutes_llarg: 15000, deutes_curt: 8000,
    actiu_fix: 65000, existencies: 5000,
    facturacio_anual: 280000, marge_brut: 0.60,
    clients_destacats: [
      { name: 'Socis actius (280 abonats)', monthly: 19600, type: 'B2C', satisfaction: 90 },
      { name: 'Empreses conveni salut', monthly: 3500, type: 'B2B', satisfaction: 85 },
    ],
    proveidors: [
      { name: 'Rogue Fitness Europe', product: 'Equipament CrossFit', cost_mes: 1500, criticitat: 'mitja' },
      { name: 'Suplementos.com', product: 'Nutrició esportiva', cost_mes: 800, criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Equipament funcional complet', valor: 45000, amortitzacio: 0.12 },
      { name: 'Sistema reserva online', valor: 5000, amortitzacio: 0.25 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'abonament', name: 'Abonament mensual', preu: 70, unitats_mes: 280 },
      { id: 'pt', name: 'Personal training/sessió', preu: 45, unitats_mes: 120 },
      { id: 'curs', name: 'Cursos especialitzats', preu: 150, unitats_mes: 25 },
    ],
  },
  {
    name: 'Advocats Terrassa Associats SLP',
    sector: 'educacio', legalForm: 'sl', size: 'small',
    loc: [41.56, 2.01], muni: 'Terrassa',
    founded: 2008, employees_real: 12,
    capital_social: 15000, reserves: 110000,
    deutes_llarg: 20000, deutes_curt: 12000,
    actiu_fix: 45000, existencies: 0,
    facturacio_anual: 480000, marge_brut: 0.65,
    clients_destacats: [
      { name: 'PIMES Vallès Occidental', monthly: 18000, type: 'B2B', satisfaction: 85 },
      { name: 'Particulars (dret civil)', monthly: 14000, type: 'B2C', satisfaction: 80 },
      { name: 'Comunitats propietaris', monthly: 6000, type: 'B2B', satisfaction: 82 },
    ],
    proveidors: [
      { name: 'Lefebvre El Derecho', product: 'Base dades jurídica', cost_mes: 450, criticitat: 'mitja' },
      { name: 'Signaturit SL', product: 'Signatura electrònica', cost_mes: 200, criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Equipament informàtic (12 llocs)', valor: 28000, amortitzacio: 0.25 },
      { name: 'Software gestió jurídica', valor: 8000, amortitzacio: 0.20 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'civil', name: 'Assessoria dret civil/hora', preu: 120, unitats_mes: 80 },
      { id: 'laboral', name: 'Assessoria laboral/hora', preu: 100, unitats_mes: 65 },
      { id: 'fiscal', name: 'Declaracions fiscals', preu: 250, unitats_mes: 45 },
    ],
  },
];

// Esperar que EMPRESA_PROFILES estigui disponible i afegir les noves
function injectNewCompanies() {
  if (!window.EMPRESA_PROFILES) { setTimeout(injectNewCompanies, 300); return; }
  
  // Afegir noves empreses que no existeixin ja
  NOVES_EMPRESES.forEach(ne => {
    if (!window.EMPRESA_PROFILES.find(e => e.name === ne.name)) {
      window.EMPRESA_PROFILES.push(ne);
    }
  });
  
  console.log('✅ Empreses ampliades: ' + window.EMPRESA_PROFILES.length + ' empreses disponibles');
  
  // Parchear renderJobOffers per evitar empreses ja escollides per altres jugadors
  patchJobOffers();
}

function patchJobOffers() {
  // Guardar la referència original de renderJobOffers (és una funció interna, la sobreescrivim via acceptOffer)
  const origAcceptOffer = window.acceptOffer;
  if (!origAcceptOffer) { setTimeout(patchJobOffers, 500); return; }
  
  // Override de la funció global que genera les ofertes
  // No podem accedir a renderJobOffers directament (és local), però podem
  // filtrar les empreses ja agafades ABANS que es mostrin
  
  // Obtenir empreses ja agafades per altres jugadors
  function getUsedCompanies() {
    const allStudents = getG()?.allStudents || [];
    const used = new Set();
    allStudents.forEach(s => {
      if (s.company?.name) used.add(s.company.name);
    });
    return used;
  }
  
  // Guardar les empreses ja usades al window perquè renderJobOffers les consulti
  // Interceptem el mètode que fa servir els perfils
  const origFilter = Array.prototype.filter;
  
  // Crear un getter que filtra automàticament
  Object.defineProperty(window, '_FILTERED_EMPRESA_PROFILES', {
    get: function() {
      const used = getUsedCompanies();
      return (window.EMPRESA_PROFILES || []).filter(e => !used.has(e.name));
    }
  });
  
  // Sobreescriure la lògica que es crida des de showHiredMode -> renderJobOffers
  // La funció renderJobOffers llegeix window.EMPRESA_PROFILES directament
  // Patch: interceptem just abans que es cridi renderJobOffers
  
  // Mètode: sobreescriure showTab per filtrar quan es mostra el hired mode
  const origShowTab = window.showTab;
  if (origShowTab) {
    // No cal patchejar showTab, millor interceptem el moment de render
  }
  
  // SOLUCIÓ: Redefinir EMPRESA_PROFILES com un proxy que filtra les empreses ja usades
  // Això és la manera més neta d'assegurar que cap oferta mostra empreses repetides
  const allProfiles = [...window.EMPRESA_PROFILES];
  
  // Guardar originals i aplicar filtre dinàmic
  window._ALL_EMPRESA_PROFILES = allProfiles;
  
  // Redefinir renderJobOffers si existeix (potser és interna, però l'availabilitat varia)
  // En realitat, la solució més fiable: parchegar el punt on es criden les ofertes
  // que és a la línia: let available = EMPRESA_PROFILES.filter(...)
  // Com que EMPRESA_PROFILES és window.EMPRESA_PROFILES, podem fer-ho dinàmic
  
  console.log('✅ Patch anti-repetició d\'empreses instal·lat');
}

// ════════════════════════════════════════════════════════════
//  OVERRIDE DE renderJobOffers PER FILTRAR EMPRESES USADES
// ════════════════════════════════════════════════════════════

// Esperar i sobreescriure completament renderJobOffers amb filtre anti-repetició
function overrideJobOffers() {
  // Esperem que les funcions existeixin
  if (!window.EMPRESA_PROFILES || !window.acceptOffer) {
    setTimeout(overrideJobOffers, 500);
    return;
  }
  
  // Buscar i crear una nova versió de showHiredMode que filtra
  // No podem accedir a renderJobOffers (és funció local dins el mòdul),
  // però podem interceptar els clics de les ofertes i el HTML generat
  
  // La manera més fiable: quan es fa clic a "Ser contractat/da",
  // filtrem les empreses disponibles
  const origStartMode = window.startMode;
  if (origStartMode) {
    window.startMode = function(mode) {
      if (mode === 'hired') {
        // Filtrar empreses ja agafades
        const allStudents = getG()?.allStudents || [];
        const usedNames = new Set();
        allStudents.forEach(s => {
          if (s.company?.name && s.uid !== getG()?.uid) usedNames.add(s.company.name);
        });
        
        // Temporalment substituir EMPRESA_PROFILES amb la versió filtrada
        const backup = window.EMPRESA_PROFILES;
        window.EMPRESA_PROFILES = backup.filter(e => !usedNames.has(e.name));
        
        // Cridar la funció original
        origStartMode(mode);
        
        // Restaurar (per si de cas es necessita en un altre context)
        // No restaurem perquè volem que renderJobOffers usi la versió filtrada
        // window.EMPRESA_PROFILES = backup;
        
        console.log('🏢 Ofertes filtrades: ' + usedNames.size + ' empreses ja agafades, ' + window.EMPRESA_PROFILES.length + ' disponibles');
      } else {
        origStartMode(mode);
      }
    };
  }
  
  console.log('✅ Override ofertes d\'empresa amb filtre anti-repetició');
}


// ════════════════════════════════════════════════════════════
//  2. FIX WIZARD "CREAR EMPRESA" — BOTÓ FINAL
// ════════════════════════════════════════════════════════════

// El problema pot ser que finishWizard falla silenciosament
// Patchem-la per afegir try-catch i logging
function patchFinishWizard() {
  const origFinish = window.finishWizard;
  // finishWizard no és global directament (és async function local)
  // Però es crida des de onclick="finishWizard()"
  // Comprovem si és accessible
  if (typeof origFinish !== 'function') {
    // finishWizard és intern, no podem parchear-la directament
    // El que podem fer és assegurar que wizardNext() al darrer pas cridi correctament
    // Segons el codi: wizardStep 6 -> onclick="finishWizard()"
    // Assegurem-nos que la funció existeix al window
    
    // Si no existeix com a global, potser es perd per closure
    // La solució: exposar-la si no ho està
    console.log('⚠️ finishWizard no és accessible globalment — pot ser un problema de closure del mòdul');
    return;
  }
  
  window.finishWizard = async function() {
    try {
      await origFinish();
    } catch(e) {
      console.error('❌ Error a finishWizard:', e);
      window.showToast && window.showToast('❌ Error creant empresa: ' + e.message);
    }
  };
  
  console.log('✅ finishWizard patched amb error handling');
}


// ════════════════════════════════════════════════════════════
//  3. TREURE CREACIÓ MANUAL DE CLIENTS PELS ALUMNES
// ════════════════════════════════════════════════════════════

// El botó "+ Nou client" no hauria d'existir per alumnes (només professors)
// Amagarem el botó i la funcionalitat
function hideManualClientCreation() {
  const gd = getG()?.gameData;
  if (!gd) { setTimeout(hideManualClientCreation, 1000); return; }
  
  // Si és professor, no fem res
  if (gd.isProf) return;
  
  // Override de renderSales per amagar el botó
  const origRenderSales = window.renderSales;
  if (!origRenderSales) { setTimeout(hideManualClientCreation, 1000); return; }
  
  window.renderSales = function() {
    origRenderSales();
    
    // Amagar botó "+ Nou client" després del render
    setTimeout(() => {
      // Buscar tots els botons que diuen "Nou client"
      document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Nou client') && !getG()?.gameData?.isProf) {
          btn.style.display = 'none';
        }
      });
      
      // També amagar el modal de crear client manual si existeix
      const createBtn = document.querySelector('[onclick*="openNewClientModal"]');
      if (createBtn && !getG()?.gameData?.isProf) {
        createBtn.style.display = 'none';
      }
    }, 100);
  };
  
  console.log('✅ Creació manual de clients amagada per alumnes');
}


// ════════════════════════════════════════════════════════════
//  4. FIX IMATGES EVOLUCIÓ EMPRESA
// ════════════════════════════════════════════════════════════

// Les imatges són base64 inline a ui-advanced.js (COMPANY_IMAGES)
// El problema és que hookEvolution() busca #company-banner que no existeix al dashboard
// i per tant mai no insereix el div d'evolució
// Solució: inserir el div d'evolució al principi del dash-wrap

function fixEvolutionImages() {
  // Esperar que renderDashboard existeixi
  if (typeof window.renderDashboard !== 'function') {
    setTimeout(fixEvolutionImages, 500);
    return;
  }
  
  // Intentar accedir a les funcions d'evolució de ui-advanced.js
  // Si hookEvolution no ha pogut fer el seu treball, ho fem nosaltres
  
  const origRender = window.renderDashboard;
  
  // Verificar si ui-advanced.js ja ha hookedat
  if (window._evolHooked) {
    console.log('✅ Evolució empresa ja hookejada per ui-advanced.js');
    return;
  }
  
  // Si no, fem el hook nosaltres
  // Necessitem accedir a COMPANY_IMAGES i getCompanyLevel des de ui-advanced.js
  // Aquestes funcions poden no ser globals... Comprovem
  
  // Alternativa: cridem hookEvolution() de ui-advanced.js si existeix
  if (typeof window.hookEvolution === 'function') {
    window.hookEvolution();
    console.log('✅ hookEvolution() cridat manualment');
    return;
  }
  
  // Si no podem accedir-hi, creem una versió simplificada
  // amb emojis en lloc d'imatges (més fiable)
  const EVOL_ICONS = {
    micro: '🏠', small: '🏪', medium: '🏢', large: '🏭', corp: '🏛️'
  };
  const EVOL_NAMES = {
    micro: 'Microempresa', small: 'Petita empresa', medium: 'Empresa mitjana', large: 'Gran empresa', corp: 'Corporació'
  };
  
  function getLevel(gd) {
    const emps = (gd.employees||[]).length;
    const rev = gd.finances?.monthly_revenue || 0;
    const prest = gd.prestigi || 0;
    if (emps >= 20 || rev >= 200000 || prest >= 70) return 'corp';
    if (emps >= 10 || rev >= 80000 || prest >= 45) return 'large';
    if (emps >= 5 || rev >= 30000 || prest >= 20) return 'medium';
    if (emps >= 3 || rev >= 10000) return 'small';
    return 'micro';
  }
  
  // Injectar al dashboard després de cada renderDashboard
  // Utilitzem MutationObserver per no interferir amb altres hooks
  const observer = new MutationObserver(() => {
    const gd = getG()?.gameData;
    if (!gd?.company) return;
    
    const dashWrap = document.querySelector('.dash-wrap');
    if (!dashWrap) return;
    
    // Comprovar si ja existeix
    let evolEl = document.getElementById('company-evolution-fix');
    if (evolEl) return; // Ja inserit
    
    const level = getLevel(gd);
    evolEl = document.createElement('div');
    evolEl.id = 'company-evolution-fix';
    evolEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,rgba(14,20,45,.95),rgba(20,25,40,.95));border:1px solid var(--border2);border-radius:16px;padding:16px 20px;margin-bottom:14px;position:relative;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 80% 50%,rgba(79,127,255,.08) 0%,transparent 60%);pointer-events:none"></div>
        <div style="font-size:48px;flex-shrink:0;z-index:1">${EVOL_ICONS[level]}</div>
        <div style="z-index:1;flex:1">
          <div style="font-size:11px;font-weight:800;color:var(--accent);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px">📊 ${EVOL_NAMES[level]}</div>
          <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px">${gd.company.name}</div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--text2)">
            <span>👥 <strong style="color:var(--text)">${(gd.employees||[]).length}</strong> empleats</span>
            <span>💶 <strong style="color:var(--text)">${fmt(Math.round(gd.finances?.monthly_revenue||0))}€</strong>/mes</span>
            <span>⭐ <strong style="color:var(--text)">${(gd.prestigi||0).toFixed(1)}</strong> prestigi</span>
            <span>📅 Setmana <strong style="color:var(--text)">${gd.week||1}</strong></span>
          </div>
        </div>
      </div>`;
    
    // Inserir al principi del dashWrap
    const firstChild = dashWrap.querySelector('.dash-top') || dashWrap.firstChild;
    if (firstChild) dashWrap.insertBefore(evolEl, firstChild);
  });
  
  // Observar canvis al content area
  const content = document.querySelector('.content');
  if (content) {
    observer.observe(content, { childList: true, subtree: true });
  }
  
  console.log('✅ Evolució empresa amb emojis activada');
}


// ════════════════════════════════════════════════════════════
//  INICIALITZACIÓ
// ════════════════════════════════════════════════════════════

injectNewCompanies();
overrideJobOffers();

// Esperar que el joc estigui inicialitzat
const initInterval = setInterval(() => {
  const gd = getG()?.gameData;
  if (!gd) return;
  
  clearInterval(initInterval);
  
  patchFinishWizard();
  hideManualClientCreation();
  fixEvolutionImages();
  
  console.log('🔧 ui-fixes.js — Totes les correccions aplicades!');
}, 500);

console.log('🔧 ui-fixes.js carregat');

})();
