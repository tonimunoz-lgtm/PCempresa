// ============================================================
//  data-empreses.js  —  Dades financeres creïbles per empresa
// ============================================================
// Cada empresa té un perfil complet: actiu/passiu, empleats,
// clients reals, proveïdors, deutes, etc. en funció de la mida.

export const EMPRESA_PROFILES = [
  {
    name: 'Aigüa Mineral Montseny SAU',
    sector: 'alimentacio', legalForm: 'sa', size: 'large',
    loc: [41.74, 2.38], muni: 'Granollers',
    founded: 1987, employees_real: 280,
    capital_social: 600000, reserves: 2800000,
    deutes_llarg: 1200000, deutes_curt: 380000,
    actiu_fix: 4500000, existencies: 420000,
    facturacio_anual: 8200000, marge_brut: 0.38,
    clients_destacats: [
      { name: 'Mercadona SA',         monthly: 180000, type: 'B2B', satisfaction: 88 },
      { name: 'Bon Preu SAU',         monthly: 95000,  type: 'B2B', satisfaction: 82 },
      { name: 'Caprabo SL',           monthly: 62000,  type: 'B2B', satisfaction: 79 },
      { name: 'Hotels NH Vallès',     monthly: 28000,  type: 'B2B', satisfaction: 91 },
    ],
    proveidors: [
      { name: 'Manantials del Montseny SL', product: 'Extracció aigua', cost_mes: 18000, criticitat: 'alta' },
      { name: 'Plastipac Embalum SL',       product: 'Ampolles PET',   cost_mes: 32000, criticitat: 'alta' },
      { name: 'Etiquetes Vallès SL',        product: 'Etiquetes',      cost_mes: 8000,  criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Línia embotellament automàtica', valor: 850000, amortitzacio: 0.10 },
      { name: 'Sistema purificació osmosi',     valor: 220000, amortitzacio: 0.12 },
      { name: 'Flota camions (8 units)',         valor: 480000, amortitzacio: 0.20 },
    ],
    loans_actius: [
      { entitat: 'Banc Sabadell', capital: 800000, tipus: 0.035, anys_restants: 6, mensualitat: 12200 },
    ],
    serveis: [
      { id: 'agua_05', name: 'Aigua mineral 0,5L', preu: 0.28, unitats_mes: 180000 },
      { id: 'agua_15', name: 'Aigua mineral 1,5L', preu: 0.42, unitats_mes: 95000 },
      { id: 'agua_5l', name: 'Garrafa 5L',         preu: 1.20, unitats_mes: 22000 },
    ],
  },

  {
    name: 'Metal·listeria Gallifa SL',
    sector: 'construccio', legalForm: 'sl', size: 'medium',
    loc: [41.62, 2.15], muni: 'Rubí',
    founded: 2001, employees_real: 45,
    capital_social: 60000, reserves: 280000,
    deutes_llarg: 320000, deutes_curt: 95000,
    actiu_fix: 680000, existencies: 85000,
    facturacio_anual: 1800000, marge_brut: 0.32,
    clients_destacats: [
      { name: 'Constructora Llobregat SL', monthly: 45000, type: 'B2B', satisfaction: 85 },
      { name: 'Gremi Constructors Vallès', monthly: 32000, type: 'B2B', satisfaction: 78 },
      { name: 'Habitatges Municipals SA',  monthly: 18000, type: 'B2B', satisfaction: 82 },
    ],
    proveidors: [
      { name: 'Arcelor Mittal Iberia',  product: 'Acer en rotlles', cost_mes: 28000, criticitat: 'alta' },
      { name: 'Gases Industrials SA',    product: 'Gas soldadura',   cost_mes: 3200,  criticitat: 'mitja' },
      { name: 'Ferreteria Major SL',     product: 'Consumibles',     cost_mes: 1800,  criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Taller CNC Mazak',         valor: 185000, amortitzacio: 0.12 },
      { name: 'Pont grua 5T',             valor: 45000,  amortitzacio: 0.08 },
      { name: 'Soldadora robotitzada',    valor: 68000,  amortitzacio: 0.15 },
    ],
    loans_actius: [
      { entitat: 'CaixaBank', capital: 200000, tipus: 0.042, anys_restants: 4, mensualitat: 4500 },
    ],
    serveis: [
      { id: 'struct',   name: 'Estructura metàl·lica m²', preu: 85,   unitats_mes: 420 },
      { id: 'escales',  name: 'Escales industrials',      preu: 2800, unitats_mes: 12 },
      { id: 'reixes',   name: 'Reixes i tancaments',      preu: 320,  unitats_mes: 85 },
    ],
  },

  {
    name: 'Logística Rapid SL',
    sector: 'logistica', legalForm: 'sl', size: 'medium',
    loc: [41.70, 2.01], muni: 'Terrassa',
    founded: 2008, employees_real: 120,
    capital_social: 80000, reserves: 520000,
    deutes_llarg: 680000, deutes_curt: 210000,
    actiu_fix: 1850000, existencies: 45000,
    facturacio_anual: 4500000, marge_brut: 0.22,
    clients_destacats: [
      { name: 'Amazon Spain SLU',         monthly: 85000, type: 'B2B', satisfaction: 72 },
      { name: 'Inditex Logística SA',      monthly: 65000, type: 'B2B', satisfaction: 88 },
      { name: 'Carrefour España SA',       monthly: 42000, type: 'B2B', satisfaction: 79 },
      { name: 'Diverses PIMES Vallès',     monthly: 28000, type: 'B2B', satisfaction: 85 },
    ],
    proveidors: [
      { name: 'Repsol Combustibles SA',    product: 'Gasoil camions',    cost_mes: 38000, criticitat: 'alta' },
      { name: 'Bridgestone Hispanica SA',  product: 'Pneumàtics',        cost_mes: 8500,  criticitat: 'mitja' },
      { name: 'Telemàtica Flota SL',       product: 'GPS i telemetria',  cost_mes: 2200,  criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Flota camions (18 units)', valor: 1200000, amortitzacio: 0.20 },
      { name: 'Carretons elevadors (6)',  valor: 85000,   amortitzacio: 0.15 },
      { name: 'Sistema gestió magatzem',  valor: 45000,   amortitzacio: 0.25 },
    ],
    loans_actius: [
      { entitat: 'BBVA Leasing',    capital: 380000, tipus: 0.038, anys_restants: 5, mensualitat: 7200 },
      { entitat: 'ICO Inversió',    capital: 280000, tipus: 0.025, anys_restants: 8, mensualitat: 3500 },
    ],
    serveis: [
      { id: 'transp_nac', name: 'Transport nacional palets', preu: 45,    unitats_mes: 2800 },
      { id: 'transp_int', name: 'Transport internacional',   preu: 280,   unitats_mes: 320 },
      { id: 'magatzem',   name: 'Magatzem logístic m²/mes',  preu: 8.50,  unitats_mes: 4200 },
    ],
  },

  {
    name: 'TecnoSoft Vallès SL',
    sector: 'tecnologia', legalForm: 'sl', size: 'small',
    loc: [41.73, 2.22], muni: 'Granollers',
    founded: 2015, employees_real: 22,
    capital_social: 15000, reserves: 125000,
    deutes_llarg: 80000, deutes_curt: 42000,
    actiu_fix: 95000, existencies: 12000,
    facturacio_anual: 890000, marge_brut: 0.62,
    clients_destacats: [
      { name: 'Ajuntament Granollers',  monthly: 12000, type: 'B2G', satisfaction: 88 },
      { name: 'Clínica Dental Ponent',  monthly: 8500,  type: 'B2B', satisfaction: 92 },
      { name: 'Formatgeria Cal Pep',    monthly: 6200,  type: 'B2B', satisfaction: 85 },
      { name: 'Particulars (SaaS)',     monthly: 18000, type: 'B2C', satisfaction: 78 },
    ],
    proveidors: [
      { name: 'AWS EMEA SARL',         product: 'Cloud computing',   cost_mes: 4200,  criticitat: 'alta' },
      { name: 'GitHub Enterprise',      product: 'Repositoris codi', cost_mes: 850,   criticitat: 'mitja' },
      { name: 'Atlassian Pty Ltd',      product: 'Jira / Confluence', cost_mes: 620,   criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Servidors Dell PowerEdge (4)', valor: 32000, amortitzacio: 0.33 },
      { name: 'Workstations disseny (10)',    valor: 28000, amortitzacio: 0.25 },
    ],
    loans_actius: [],
    serveis: [
      { id: 'saas_basic',  name: 'SaaS Basic (mes)',      preu: 89,   unitats_mes: 145 },
      { id: 'saas_pro',    name: 'SaaS Professional',     preu: 249,  unitats_mes: 38 },
      { id: 'dev_hora',    name: 'Consultoria/hora',      preu: 95,   unitats_mes: 420 },
      { id: 'web',         name: 'Projecte web a mida',   preu: 4500, unitats_mes: 4 },
    ],
  },

  {
    name: 'Farmàcia Vallès SA',
    sector: 'salut', legalForm: 'sa', size: 'medium',
    loc: [41.70, 2.09], muni: 'Sabadell',
    founded: 1978, employees_real: 65,
    capital_social: 120000, reserves: 680000,
    deutes_llarg: 280000, deutes_curt: 125000,
    actiu_fix: 950000, existencies: 380000,
    facturacio_anual: 3200000, marge_brut: 0.28,
    clients_destacats: [
      { name: 'Mutua Mèdica de Catalunya', monthly: 48000, type: 'B2B', satisfaction: 86 },
      { name: 'Residències Gent Gran SL',  monthly: 32000, type: 'B2B', satisfaction: 91 },
      { name: 'Pacients particulars',       monthly: 68000, type: 'B2C', satisfaction: 82 },
      { name: 'Centres mèdics Sabadell',   monthly: 25000, type: 'B2B', satisfaction: 88 },
    ],
    proveidors: [
      { name: 'Alliance Healthcare España', product: 'Medicaments OTC',  cost_mes: 95000, criticitat: 'alta' },
      { name: 'Kern Pharma SL',             product: 'Genèrics',         cost_mes: 42000, criticitat: 'alta' },
      { name: 'Laboratoris Almirall SA',    product: 'Dermocosm.',       cost_mes: 18000, criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Robot dispensació Rowa',   valor: 85000, amortitzacio: 0.10 },
      { name: 'Sistema gestió estocs',    valor: 18000, amortitzacio: 0.33 },
      { name: 'Camb. frigorífica vac.',   valor: 12000, amortitzacio: 0.15 },
    ],
    loans_actius: [
      { entitat: 'Banc Sabadell',  capital: 180000, tipus: 0.032, anys_restants: 5, mensualitat: 3300 },
    ],
    serveis: [
      { id: 'medicaments',  name: 'Medicaments recepta',    preu: 12.50, unitats_mes: 8200 },
      { id: 'otc',          name: 'Productes OTC',          preu: 8.20,  unitats_mes: 6800 },
      { id: 'dermocosm',    name: 'Dermocosm. i parafarm.', preu: 22.00, unitats_mes: 1800 },
      { id: 'vaccines',     name: 'Vacunes grip/covid',     preu: 18.00, unitats_mes: 420 },
    ],
  },

  {
    name: 'Hotel Spa Can Santoi SL',
    sector: 'turisme', legalForm: 'sl', size: 'medium',
    loc: [41.78, 2.35], muni: 'La Garriga',
    founded: 1995, employees_real: 55,
    capital_social: 180000, reserves: 420000,
    deutes_llarg: 580000, deutes_curt: 145000,
    actiu_fix: 2800000, existencies: 28000,
    facturacio_anual: 2100000, marge_brut: 0.55,
    clients_destacats: [
      { name: 'Booking Holdings Inc.',    monthly: 38000, type: 'B2B', satisfaction: 75 },
      { name: 'Agències viatge BCN',       monthly: 22000, type: 'B2B', satisfaction: 82 },
      { name: 'Empreses (teambuilding)',   monthly: 18000, type: 'B2B', satisfaction: 88 },
      { name: 'Particulars (direct)',      monthly: 36000, type: 'B2C', satisfaction: 91 },
    ],
    proveidors: [
      { name: 'Makro Cash & Carry SA',     product: 'Alimentació i begudes', cost_mes: 18000, criticitat: 'alta' },
      { name: 'Ecolab Europe GmbH',        product: 'Productes neteja hotel', cost_mes: 3800,  criticitat: 'mitja' },
      { name: 'Laundry Services Vallès',   product: 'Bugaderia industrial',   cost_mes: 4200,  criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Piscina coberta spa',        valor: 380000, amortitzacio: 0.04 },
      { name: 'Cuina industrial',           valor: 95000,  amortitzacio: 0.10 },
      { name: 'Sistema climatització',      valor: 120000, amortitzacio: 0.08 },
    ],
    loans_actius: [
      { entitat: 'ICO Turisme',     capital: 350000, tipus: 0.028, anys_restants: 10, mensualitat: 3200 },
      { entitat: 'CaixaBank',       capital: 220000, tipus: 0.040, anys_restants: 7,  mensualitat: 3000 },
    ],
    serveis: [
      { id: 'hab_simple',  name: 'Habitació individual/nit', preu: 95,   unitats_mes: 280 },
      { id: 'hab_doble',   name: 'Habitació doble/nit',      preu: 145,  unitats_mes: 420 },
      { id: 'spa_dia',     name: 'Accés spa (dia)',           preu: 38,   unitats_mes: 320 },
      { id: 'menu',        name: 'Menú restaurant',          preu: 28,   unitats_mes: 1850 },
      { id: 'team',        name: 'Pack teambuilding empresa', preu: 1800, unitats_mes: 12 },
    ],
  },

  {
    name: 'Tèxtils Roca SL',
    sector: 'moda', legalForm: 'sl', size: 'medium',
    loc: [41.63, 2.11], muni: 'Sabadell',
    founded: 1968, employees_real: 80,
    capital_social: 90000, reserves: 380000,
    deutes_llarg: 420000, deutes_curt: 180000,
    actiu_fix: 1200000, existencies: 280000,
    facturacio_anual: 2800000, marge_brut: 0.42,
    clients_destacats: [
      { name: 'El Corte Inglés SA',        monthly: 62000, type: 'B2B', satisfaction: 82 },
      { name: 'Boutiques moda BCN (12)',    monthly: 35000, type: 'B2B', satisfaction: 88 },
      { name: 'Exportació mercats UE',      monthly: 42000, type: 'Export', satisfaction: 75 },
    ],
    proveidors: [
      { name: 'Cotonifici Bustese SpA',    product: 'Cotó premium Itàlia',  cost_mes: 48000, criticitat: 'alta' },
      { name: 'Tintoreria Vallès SL',      product: 'Tenyit i acabats',     cost_mes: 22000, criticitat: 'alta' },
      { name: 'Botons i Complements SL',   product: 'Complements costura',  cost_mes: 8500,  criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Telers Jacquard (12 units)',  valor: 420000, amortitzacio: 0.08 },
      { name: 'Màquines de cosir ind. (20)', valor: 95000,  amortitzacio: 0.12 },
      { name: 'Sistema CAD disseny tèxtil', valor: 28000,  amortitzacio: 0.25 },
    ],
    loans_actius: [
      { entitat: 'Banc Sabadell',  capital: 280000, tipus: 0.038, anys_restants: 6, mensualitat: 4800 },
    ],
    serveis: [
      { id: 'camisa_h',   name: 'Camisa home (col·lecció)',   preu: 28.50, unitats_mes: 2800 },
      { id: 'camisa_d',   name: 'Camisa dona (col·lecció)',   preu: 32.00, unitats_mes: 2200 },
      { id: 'jaqueta',    name: 'Jaqueta llana',              preu: 85.00, unitats_mes: 680 },
      { id: 'teixit_m',   name: 'Teixit a mida (metre)',      preu: 18.50, unitats_mes: 1200 },
    ],
  },

  {
    name: 'Clínica Dental Ponent SL',
    sector: 'salut', legalForm: 'sl', size: 'small',
    loc: [41.56, 2.10], muni: 'Sant Cugat del Vallès',
    founded: 2009, employees_real: 10,
    capital_social: 18000, reserves: 95000,
    deutes_llarg: 65000, deutes_curt: 28000,
    actiu_fix: 220000, existencies: 18000,
    facturacio_anual: 360000, marge_brut: 0.68,
    clients_destacats: [
      { name: 'Mutua Dental Colectivo', monthly: 8500,  type: 'B2B', satisfaction: 85 },
      { name: 'Pacients particulars',    monthly: 16000, type: 'B2C', satisfaction: 92 },
    ],
    proveidors: [
      { name: 'Henry Schein España SA',  product: 'Material odontològic', cost_mes: 4800, criticitat: 'alta' },
      { name: 'Dentsply Sirona SA',      product: 'Implants i pròtesis',  cost_mes: 6200, criticitat: 'alta' },
      { name: 'Sterilization Systems',  product: 'Productes esteril.',   cost_mes: 850,  criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Cadira dental Sirona (3)',     valor: 48000, amortitzacio: 0.10 },
      { name: 'Ortopantomògraf digital',      valor: 32000, amortitzacio: 0.12 },
      { name: 'Autoclau esterilització',      valor: 8500,  amortitzacio: 0.10 },
    ],
    loans_actius: [
      { entitat: 'CaixaBank',  capital: 45000, tipus: 0.035, anys_restants: 3, mensualitat: 1350 },
    ],
    serveis: [
      { id: 'revisio',     name: 'Revisió i neteja bucal',     preu: 65,   unitats_mes: 85 },
      { id: 'empast',      name: 'Empastament/obturació',      preu: 120,  unitats_mes: 42 },
      { id: 'extrac',      name: 'Extracció simple',           preu: 95,   unitats_mes: 18 },
      { id: 'implant',     name: 'Implant dental complet',     preu: 1450, unitats_mes: 8 },
      { id: 'ortodon',     name: 'Ortodoncia (tractament)',    preu: 2800, unitats_mes: 5 },
      { id: 'blanq',       name: 'Blanquiment dental',         preu: 380,  unitats_mes: 12 },
    ],
  },

  {
    name: 'Constructora Llobregat SL',
    sector: 'construccio', legalForm: 'sl', size: 'large',
    loc: [41.63, 2.04], muni: 'Terrassa',
    founded: 1982, employees_real: 180,
    capital_social: 300000, reserves: 1850000,
    deutes_llarg: 2200000, deutes_curt: 680000,
    actiu_fix: 6800000, existencies: 920000,
    facturacio_anual: 9500000, marge_brut: 0.18,
    clients_destacats: [
      { name: 'Habitatge Jove Catalunya',  monthly: 185000, type: 'B2G', satisfaction: 78 },
      { name: 'Immobiliària Terrassa SA',  monthly: 128000, type: 'B2B', satisfaction: 82 },
      { name: 'Ajuntament de Terrassa',   monthly: 95000,  type: 'B2G', satisfaction: 86 },
    ],
    proveidors: [
      { name: 'LafargeHolcim Spain SA',   product: 'Ciment i formigó',   cost_mes: 145000, criticitat: 'alta' },
      { name: 'Arcelor Mittal Iberia',    product: 'Acer corrugat',      cost_mes: 82000,  criticitat: 'alta' },
      { name: 'Isover Saint-Gobain SA',   product: 'Aïllament tèrmic',   cost_mes: 28000,  criticitat: 'mitja' },
      { name: 'Roca Sanitario SA',        product: 'Sanitaris i grifo',   cost_mes: 18000,  criticitat: 'baixa' },
    ],
    maquinaria: [
      { name: 'Grues torre (3 units)',   valor: 580000, amortitzacio: 0.12 },
      { name: 'Excavadores i pales',    valor: 420000, amortitzacio: 0.15 },
      { name: 'Parc maquinaria lleug.', valor: 280000, amortitzacio: 0.20 },
    ],
    loans_actius: [
      { entitat: 'BBVA',        capital: 1200000, tipus: 0.036, anys_restants: 8, mensualitat: 14500 },
      { entitat: 'ICO Empresa', capital: 800000,  tipus: 0.024, anys_restants: 10, mensualitat: 8000 },
    ],
    serveis: [
      { id: 'edif_hab', name: 'Edifici residencial (m²)',  preu: 1850, unitats_mes: 280 },
      { id: 'obra_pub', name: 'Obra pública/infraest.',    preu: 1200, unitats_mes: 320 },
      { id: 'rehab',    name: 'Rehabilitació edificis',   preu: 680,  unitats_mes: 185 },
    ],
  },

  {
    name: 'Bodega Alella DO SL',
    sector: 'alimentacio', legalForm: 'sl', size: 'medium',
    loc: [41.49, 2.30], muni: 'Alella',
    founded: 1906, employees_real: 28,
    capital_social: 45000, reserves: 580000,
    deutes_llarg: 185000, deutes_curt: 62000,
    actiu_fix: 1850000, existencies: 320000,
    facturacio_anual: 1500000, marge_brut: 0.58,
    clients_destacats: [
      { name: 'El Corte Inglés (vi)',      monthly: 28000, type: 'B2B', satisfaction: 88 },
      { name: 'Restaurants Michelin BCN',  monthly: 22000, type: 'B2B', satisfaction: 95 },
      { name: 'Exportació Alemanya/UK',    monthly: 18000, type: 'Export', satisfaction: 82 },
      { name: 'Enoturisme i celler',       monthly: 12000, type: 'B2C', satisfaction: 92 },
    ],
    proveidors: [
      { name: 'Viveros Provedo SA',         product: 'Plantes i injerts',    cost_mes: 2800,  criticitat: 'mitja' },
      { name: 'Tonnellerie François Frères',product: 'Bótes de roure franc.', cost_mes: 8500,  criticitat: 'alta' },
      { name: 'Guala Closures España',      product: 'Taps i corchos',       cost_mes: 3200,  criticitat: 'mitja' },
    ],
    maquinaria: [
      { name: 'Premsa pneumàtica Bucher', valor: 85000, amortitzacio: 0.08 },
      { name: 'Dipòsits inox (18 units)', valor: 120000, amortitzacio: 0.06 },
      { name: 'Línia embotellament',      valor: 95000, amortitzacio: 0.10 },
    ],
    loans_actius: [
      { entitat: 'Banc Sabadell',  capital: 120000, tipus: 0.030, anys_restants: 7, mensualitat: 1680 },
    ],
    serveis: [
      { id: 'blanc_jove', name: 'Vi blanc DO Alella jove',   preu: 6.80,  unitats_mes: 4800 },
      { id: 'blanc_res',  name: 'Vi blanc reserva',          preu: 14.50, unitats_mes: 1800 },
      { id: 'cava_brut',  name: 'Cava brut nature',          preu: 11.20, unitats_mes: 2200 },
      { id: 'enoturis',   name: 'Visita celler + tast',      preu: 22.00, unitats_mes: 380 },
    ],
  },
];

// Genera un perfil complet de gameData per a una empresa existent
export function generateHiredCompanyData(empresaProfile, uid, displayName) {
  const p = empresaProfile;
  const now = new Date();

  // Calcular ingressos mensuals reals a partir dels serveis
  const monthly_revenue = p.serveis.reduce((s, sv) => s + sv.preu * sv.unitats_mes, 0);
  const monthly_costs_base = monthly_revenue * (1 - p.marge_brut);

  // Empleats per jerarquia basats en la mida
  const employees = generateEmployees(p);

  // Préstecs actius
  const loans = p.loans_actius.map((l, i) => ({
    id: 'loan_' + i,
    entitat: l.entitat,
    capital_original: l.capital,
    capital_pendent: Math.round(l.capital * (l.anys_restants / (l.anys_restants + 3))),
    tipus: l.tipus,
    anys_restants: l.anys_restants,
    monthlyPayment: l.mensualitat,
  }));

  // Calcular actiu/passiu coherent
  const totalLoans = loans.reduce((s, l) => s + l.capital_pendent, 0);
  const tresoreria = Math.round(monthly_revenue * 0.15 + Math.random() * monthly_revenue * 0.1);

  return {
    uid, displayName, isProf: false,
    mode: 'hired',
    week: 1, year: now.getFullYear(), month: now.getMonth() + 1,
    startDate: now.toISOString(),
    prestigi: Math.round(20 + Math.random() * 40),
    company: {
      name: p.name,
      sector: p.sector,
      sectorData: getSectorData(p.sector),
      legalForm: p.legalForm,
      legalFormName: getLegalFormName(p.legalForm),
      founded: p.founded,
      employees_real: p.employees_real,
      muni: p.muni,
      monthlyRent: Math.round(monthly_revenue * 0.04),
      size: p.size,
    },
    finances: {
      cash: tresoreria,
      monthly_revenue,
      monthly_costs: monthly_costs_base,
      annual_revenue: 0,
      annual_costs: 0,
      loans,
      revenue_history: generateHistorial(monthly_revenue, 12),
      actiu: {
        immobilitzat: p.actiu_fix,
        existencies: p.existencies,
        tresoreria,
        clients: Math.round(monthly_revenue * 0.45), // deute clients (45 dies cobrament)
      },
      passiu: {
        capital: p.capital_social,
        reserves: p.reserves,
        deutes_llarg: p.deutes_llarg,
        deutes_curt: p.deutes_curt,
        proveidors: Math.round(monthly_costs_base * 0.30), // deute proveïdors (30 dies pagament)
      },
    },
    employees,
    machines: p.maquinaria.map((m, i) => ({
      id: 'mach_' + i, name: m.name,
      valor: m.valor, amortitzacio: m.amortitzacio,
      capacity: Math.round(m.valor / 500),
      maintenance: Math.round(m.valor * m.amortitzacio / 12),
    })),
    clients: p.clients_destacats.map((c, i) => ({
      id: 'cl_' + i,
      icon: '🤝',
      name: c.name,
      type: c.type,
      monthly_value: c.monthly,
      satisfaction: c.satisfaction,
    })),
    claims: [],
    notifications: [
      { id: 1, icon: '👋', title: 'Benvingut/da a ' + p.name,
        desc: 'Ets el nou/a director/a general. L\'empresa porta funcionant des de ' + p.founded + '. Revisa l\'estat financer i els departaments.',
        time: 'Dia 1', urgent: false, read: false },
      { id: 2, icon: '📋', title: 'Primera junta de l\'any',
        desc: 'Els accionistes esperen un pla estratègic per al proper exercici. Revisa els objectius al panell de Junta.',
        time: 'Dia 1', urgent: false, read: false },
    ],
    events: [],
    mktBudget: Math.round(monthly_revenue * 0.05),
    marketing: {
      channels: { rrss: Math.round(monthly_revenue * 0.01), google: Math.round(monthly_revenue * 0.015) },
      sponsors: [],
    },
    proveidors: p.proveidors.map((pv, i) => ({
      id: 'prov_' + i,
      name: pv.name,
      product: pv.product,
      cost_mes: pv.cost_mes,
      criticitat: pv.criticitat,
      qualitat: Math.round(70 + Math.random() * 25),
      termini_pagament: 30,
      negociant: false,
      descompte_actual: 0,
    })),
    serveis: p.serveis.map(sv => ({ ...sv })),
    portfolio: { stocks: {}, crypto: {} },
    trade: { imports: [], exports: [], incoterms: {} },
    franchise: null,
    shareholders: generateShareholders(p.legalForm, p.capital_social),
    boardDecisions: [],
    laborRelations: { satisfaccio: 72, ultimaConvocatoria: null, convenis: [], negociacio: null },
    rd: { projectes: [], pressupost: Math.round(monthly_revenue * 0.02), inversio_total: 0 },
    lastSaved: Date.now(),
  };
}

function generateEmployees(p) {
  const emps = [];
  const sectorIcon = getSectorData(p.sector)?.icon || '🏢';

  const ROLES = {
    large: [
      { dept:'direccio',  rol:'Director General',          sou:6800, emoji:'👔', nivel:'directiu' },
      { dept:'finances',  rol:'Director Financer (CFO)',   sou:5200, emoji:'💰', nivel:'directiu' },
      { dept:'rrhh',      rol:'Director RRHH',             sou:4800, emoji:'👥', nivel:'directiu' },
      { dept:'vendes',    rol:'Director Comercial',        sou:5500, emoji:'📊', nivel:'directiu' },
      { dept:'produccio', rol:'Director Operacions',       sou:5100, emoji:'🏭', nivel:'directiu' },
      { dept:'vendes',    rol:'Cap de vendes zona Nord',   sou:3200, emoji:'🗺️', nivel:'intermedi' },
      { dept:'vendes',    rol:'Cap de vendes zona Sud',    sou:3100, emoji:'🗺️', nivel:'intermedi' },
      { dept:'rrhh',      rol:'Responsable Selecció',      sou:2800, emoji:'🔍', nivel:'intermedi' },
      { dept:'produccio', rol:'Cap de torn',               sou:2900, emoji:'⚙️', nivel:'intermedi' },
      { dept:'vendes',    rol:'Comercial senior',          sou:2400, emoji:'🤝', nivel:'base' },
      { dept:'vendes',    rol:'Comercial junior',          sou:1950, emoji:'🤝', nivel:'base' },
      { dept:'produccio', rol:'Operari qualificat',        sou:2100, emoji:'🔧', nivel:'base' },
      { dept:'admin',     rol:'Administrativa',            sou:1980, emoji:'📝', nivel:'base' },
    ],
    medium: [
      { dept:'direccio',  rol:'Gerent',                   sou:4200, emoji:'👔', nivel:'directiu' },
      { dept:'finances',  rol:'Responsable Finances',     sou:3100, emoji:'💰', nivel:'intermedi' },
      { dept:'vendes',    rol:'Cap de vendes',            sou:3200, emoji:'📊', nivel:'intermedi' },
      { dept:'rrhh',      rol:'Responsable RRHH',         sou:2900, emoji:'👥', nivel:'intermedi' },
      { dept:'vendes',    rol:'Comercial',                sou:2200, emoji:'🤝', nivel:'base' },
      { dept:'produccio', rol:'Oficial 1a',               sou:2050, emoji:'🔧', nivel:'base' },
      { dept:'admin',     rol:'Administrativa',           sou:1950, emoji:'📝', nivel:'base' },
    ],
    small: [
      { dept:'direccio',  rol:'Gerent / Propietari',      sou:3500, emoji:'👔', nivel:'directiu' },
      { dept:'vendes',    rol:'Comercial',                sou:2000, emoji:'🤝', nivel:'base' },
      { dept:'produccio', rol:'Oficial',                  sou:1950, emoji:'🔧', nivel:'base' },
    ],
  };

  const roles = ROLES[p.size] || ROLES.small;
  return roles.map((r, i) => ({
    id: 'emp_' + i,
    name: generateName(),
    dept: r.dept,
    role: r.rol,
    nivel: r.nivel,
    salary: r.sou,
    emoji: r.emoji,
    morale: 65 + Math.floor(Math.random() * 30),
    seniority: Math.round(1 + Math.random() * 10),
    avatar: r.emoji,
  }));
}

function generateHistorial(baseRev, months) {
  return Array.from({ length: months }, (_, i) => {
    const variation = 0.85 + Math.random() * 0.30;
    const rev = Math.round(baseRev * variation);
    const costs = Math.round(rev * (0.55 + Math.random() * 0.20));
    return { week: i * 4 + 1, rev, costs, result: rev - costs };
  });
}

function generateShareholders(legalForm, capital) {
  if (legalForm === 'autonomia') return [];
  const profiles = [
    { name: 'Familia fundadora',    icon: '👨‍👩‍👧', type: 'familiar',   patience: 9, risk: 'baix',  style: 'conservador', pct: 0.40, satisfaction: 75 },
    { name: 'Fons Capital Vallès',  icon: '🏦',     type: 'inversor',   patience: 5, risk: 'mig',   style: 'equilibrat',  pct: 0.25, satisfaction: 68 },
    { name: 'Business Angel Puig',  icon: '👔',     type: 'angel',      patience: 6, risk: 'mig',   style: 'estratègic',  pct: 0.15, satisfaction: 71 },
  ];
  const count = legalForm === 'sa' ? 3 : 2;
  return profiles.slice(0, count).map(p => ({
    ...p, shares: Math.round(capital * p.pct / 10),
  }));
}

function getSectorData(sector) {
  const map = {
    alimentacio: { icon: '🍎', name: 'Alimentació' },
    tecnologia:  { icon: '💻', name: 'Tecnologia' },
    construccio: { icon: '🏗️', name: 'Construcció' },
    comerc:      { icon: '🛍️', name: 'Comerç' },
    logistica:   { icon: '🚛', name: 'Logística' },
    turisme:     { icon: '🏨', name: 'Turisme' },
    salut:       { icon: '💊', name: 'Salut' },
    educacio:    { icon: '📚', name: 'Educació' },
    moda:        { icon: '👔', name: 'Moda i Tèxtil' },
    quimica:     { icon: '⚗️', name: 'Química' },
  };
  return map[sector] || { icon: '🏢', name: sector };
}

function getLegalFormName(lf) {
  const m = { sl: 'Societat Limitada', sa: 'Societat Anònima', autonomia: 'Autònom/a', slne: 'SL Nova Empresa', cooperativa: 'Cooperativa' };
  return m[lf] || lf;
}

const NOMS = ['Marc','Laia','Jordi','Marta','Pere','Anna','Joan','Núria','Pau','Carla','Miquel','Montserrat','David','Silvia','Àlex'];
const COGNOMS = ['Garcia','Martí','López','Puig','Roca','Serra','Costa','Vila','Mas','Ferrer','Soler','Domènech','Pujol','Bosch','Vidal'];
function generateName() {
  return NOMS[Math.floor(Math.random() * NOMS.length)] + ' ' + COGNOMS[Math.floor(Math.random() * COGNOMS.length)];
}
