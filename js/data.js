// ============================================================
// GAME DATA — upgrades, levels, city layout
// ============================================================

const UPGRADES = [
  // HORNOS
  {id:"oven_1",name:"Horno de Leña Básico",desc:"Un horno artesanal que mejora el sabor",emoji:"🪵",cost:50,maxLv:10,effect:"+1 pizza/click",ppc:1,pps:0,rep:0,cat:"oven"},
  {id:"oven_2",name:"Horno Napolitano",desc:"Importado directamente de Nápoles",emoji:"🔥",cost:500,maxLv:10,effect:"+5 pizzas/click",ppc:5,pps:0,rep:0,cat:"oven"},
  {id:"oven_3",name:"Horno Doble Cámara",desc:"Dos pizzas al mismo tiempo",emoji:"⚡",cost:5000,maxLv:10,effect:"+20 pizzas/click",ppc:20,pps:0,rep:0,cat:"oven"},
  {id:"oven_4",name:"Horno Volcánico",desc:"Calor del mismísimo Vesubio",emoji:"🌋",cost:50000,maxLv:8,effect:"+100 pizzas/click",ppc:100,pps:0,rep:0,cat:"oven"},
  {id:"oven_5",name:"Horno Cuántico",desc:"Cocina en múltiples dimensiones",emoji:"⚛️",cost:1000000,maxLv:5,effect:"+1000 pizzas/click",ppc:1000,pps:0,rep:0,cat:"oven"},
  // PERSONAL
  {id:"staff_1",name:"Pizzero Aprendiz",desc:"El primer empleado del negocio",emoji:"👨‍🍳",cost:100,maxLv:15,effect:"+0.5 pizza/seg",ppc:0,pps:0.5,rep:0,cat:"staff"},
  {id:"staff_2",name:"Chef Italiano",desc:"Formado en Florencia",emoji:"⭐",cost:1000,maxLv:15,effect:"+3 pizzas/seg",ppc:0,pps:3,rep:0,cat:"staff"},
  {id:"staff_3",name:"Maestro Pizzaiolo",desc:"Certificado por la Asociación Verace",emoji:"👑",cost:10000,maxLv:10,effect:"+15 pizzas/seg",ppc:0,pps:15,rep:0,cat:"staff"},
  {id:"staff_4",name:"Equipo de Camareros",desc:"Servicio impecable en sala",emoji:"🤵",cost:8000,maxLv:10,effect:"+10 pizzas/seg +rep",ppc:0,pps:10,rep:5,cat:"staff"},
  {id:"staff_5",name:"Robot Pizzero",desc:"Nunca duerme, nunca descansa",emoji:"🤖",cost:500000,maxLv:8,effect:"+200 pizzas/seg",ppc:0,pps:200,rep:0,cat:"staff"},
  {id:"staff_6",name:"Ejército de Clones",desc:"Clonados del mejor chef",emoji:"🧬",cost:10000000,maxLv:5,effect:"+5000 pizzas/seg",ppc:0,pps:5000,rep:0,cat:"staff"},
  // REPARTO
  {id:"delivery_1",name:"Bicicleta de Reparto",desc:"El clásico repartidor en bici",emoji:"🚲",cost:300,maxLv:10,effect:"+1 pizza/seg",ppc:0,pps:1,rep:0,cat:"delivery"},
  {id:"delivery_2",name:"Flota de Motos",desc:"Reparto express en 30 min",emoji:"🛵",cost:8000,maxLv:10,effect:"+8 pizzas/seg",ppc:0,pps:8,rep:0,cat:"delivery"},
  {id:"delivery_3",name:"Drones de Reparto",desc:"Entrega aérea ultrarápida",emoji:"🚁",cost:250000,maxLv:8,effect:"+80 pizzas/seg",ppc:0,pps:80,rep:0,cat:"delivery"},
  {id:"delivery_4",name:"Teletransportación",desc:"Física cuántica al servicio del sabor",emoji:"✨",cost:5000000,maxLv:5,effect:"+1000 pizzas/seg",ppc:0,pps:1000,rep:0,cat:"delivery"},
  // DECORACIÓN
  {id:"decor_1",name:"Decoración Rústica",desc:"Madera y ladrillo artesanal",emoji:"🏺",cost:200,maxLv:5,effect:"+reputación",ppc:0,pps:0,rep:10,cat:"decor"},
  {id:"decor_2",name:"Terraza Exterior",desc:"Con vistas al centro",emoji:"🌿",cost:3000,maxLv:5,effect:"+reputación +clientes",ppc:0,pps:5,rep:25,cat:"decor"},
  {id:"decor_3",name:"Iluminación Italiana",desc:"Guirnaldas y velas artesanales",emoji:"🕯️",cost:15000,maxLv:5,effect:"+reputación alta",ppc:0,pps:0,rep:50,cat:"decor"},
  {id:"decor_4",name:"Fuente de Mármol",desc:"Enviada desde Carrara",emoji:"⛲",cost:100000,maxLv:3,effect:"+reputación máxima",ppc:0,pps:0,rep:200,cat:"decor"},
  // TECNOLOGÍA
  {id:"tech_1",name:"Página Web",desc:"Pedidos online básicos",emoji:"💻",cost:500,maxLv:1,effect:"+2 pizzas/seg",ppc:0,pps:2,rep:0,cat:"tech"},
  {id:"tech_2",name:"App Móvil",desc:"Diseñada en Silicon Valley",emoji:"📱",cost:5000,maxLv:1,effect:"+20 pizzas/seg",ppc:0,pps:20,rep:0,cat:"tech"},
  {id:"tech_3",name:"IA de Sabores",desc:"Recetas generadas por IA",emoji:"🧠",cost:200000,maxLv:3,effect:"+100 pizzas/seg",ppc:0,pps:100,rep:0,cat:"tech"},
  {id:"tech_4",name:"Publicidad Holográfica",desc:"Reclamos 3D en la ciudad",emoji:"🌐",cost:1000000,maxLv:3,effect:"+reputación +ventas",ppc:0,pps:100,rep:300,cat:"tech"},
  // ESPACIO
  {id:"space_1",name:"Cohete de Reparto",desc:"Lleva pizzas a la Luna",emoji:"🚀",cost:2000000,maxLv:5,effect:"+500 pizzas/seg",ppc:0,pps:500,rep:0,cat:"space"},
  {id:"space_2",name:"Pizzería en Marte",desc:"Primera sucursal interplanetaria",emoji:"🔴",cost:10000000,maxLv:3,effect:"+2000 pizzas/seg",ppc:0,pps:2000,rep:0,cat:"space"},
  {id:"space_3",name:"Cadena Galáctica",desc:"Franquicias en la Vía Láctea",emoji:"🌌",cost:100000000,maxLv:3,effect:"+20000 pizzas/seg",ppc:0,pps:20000,rep:0,cat:"space"},
  {id:"space_4",name:"Imperio del Multiverso",desc:"Pizzerías en cada dimensión",emoji:"🌀",cost:999999999,maxLv:1,effect:"🏆 VICTORIA TOTAL",ppc:0,pps:999999,rep:0,cat:"space"},
  // EXPANSIONES
  {id:"decor_garden",name:"Jardin Privado",desc:"Fuente, arboles y flores. Ocupa 1 casilla extra en PizzaCity",emoji:"\uD83C\uDF33",cost:500000,maxLv:1,effect:"+reputacion masiva +expansion",ppc:0,pps:0,rep:500,cat:"decor"},
  {id:"decor_recreation",name:"Zona de Recreo",desc:"Columpios, tobogan y mesa de pizza. Ocupa 1 casilla extra",emoji:"\uD83C\uDFA1",cost:1000000,maxLv:1,effect:"+reputacion +clientes +expansion",ppc:0,pps:50,rep:300,cat:"decor"},
  // SEGURIDAD
  {id:"sec_1",name:"Cámara de Seguridad",desc:"Vigila el local 24/7",emoji:"📷",cost:2000,maxLv:5,effect:"-daño por robos",ppc:0,pps:0,rep:0,cat:"security"},
  {id:"sec_2",name:"Guardia de Seguridad",desc:"Ex-marine con buen sueldo",emoji:"💂",cost:20000,maxLv:5,effect:"-daño ataques",ppc:0,pps:0,rep:0,cat:"security"},
  {id:"sec_3",name:"Soborno Policía",desc:"La policía mira para otro lado",emoji:"👮",cost:50000,maxLv:10,effect:"+corrupción policial",ppc:0,pps:0,rep:0,cat:"security"},
  {id:"sec_4",name:"Detective Privado",desc:"Para descubrir saboteadores",emoji:"🔍",cost:100000,maxLv:5,effect:"+probabilidad pillar rivales",ppc:0,pps:0,rep:0,cat:"security"},
];

const LEVELS = [
  {lv:1, xp:0,      title:"Aprendiz de Pizzero",      unlock:"Acceso básico al juego"},
  {lv:2, xp:100,    title:"Pizzero Novato",            unlock:"Tienda básica desbloqueada"},
  {lv:3, xp:300,    title:"Chef en Prácticas",         unlock:"Mejoras de personal"},
  {lv:4, xp:700,    title:"Cocinero Local",            unlock:"Decoración del local"},
  {lv:5, xp:1500,   title:"Maestro de la Masa",        unlock:"Tecnología básica"},
  {lv:6, xp:3000,   title:"Empresario Pizzero",        unlock:"Flota de reparto"},
  {lv:7, xp:6000,   title:"Magnate del Queso",         unlock:"App móvil"},
  {lv:8, xp:12000,  title:"Barón de la Pizza",         unlock:"Drones + Cohetes espaciales"},
  {lv:9, xp:25000,  title:"Rey de PizzaCity",          unlock:"Publicidad holográfica"},
  {lv:10,xp:50000,  title:"Señor de las Pizzas",       unlock:"🚨 INTERACCIONES PVP DESBLOQUEADAS"},
  {lv:11,xp:100000, title:"Conde de Mozzarella",       unlock:"Pizzería en Marte"},
  {lv:12,xp:200000, title:"Duque del Horno",           unlock:"IA de sabores avanzada"},
  {lv:13,xp:400000, title:"Príncipe del Multiverso",   unlock:"Cadena Galáctica"},
  {lv:14,xp:800000, title:"Rey del Universo Pizza",    unlock:"Imperio Multiverso"},
  {lv:15,xp:2000000,title:"🍕 DIOS DE LA PIZZA 🍕",   unlock:"¡Has conquistado el multiverso!"},
];

const CITY_LAYOUT = [
  [1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1],
  [1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,0,1,1,0,2,2,0,1,1,0,1,1,1,1],
  [1,1,0,1,1,0,2,2,0,1,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,0,1,1,0,3,3,0,1,1,0,2,2,0,1],
  [1,1,0,1,1,0,3,3,0,1,1,0,2,2,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
];

const CATS = [
  {id:'all',label:'⭐ Todo'},
  {id:'oven',label:'🔥 Hornos'},
  {id:'staff',label:'👨‍🍳 Personal'},
  {id:'delivery',label:'🚲 Reparto'},
  {id:'decor',label:'✨ Decor'},
  {id:'tech',label:'💻 Tech'},
  {id:'space',label:'🚀 Espacio'},
  {id:'security',label:'🔒 Seguridad'},
];

const RANDOM_EVENTS = {
  bad: [
    {type:'earthquake',emoji:'🌋',title:'¡Terremoto!',desc:'El Vesubio ha despertado. Daños en el horno.',loss:.08},
    {type:'robbery',emoji:'🦹',title:'¡Robo en el local!',desc:'Alguien vació la caja registradora.',loss:.10},
    {type:'fire',emoji:'🔥',title:'¡Incendio!',desc:'El horno se sobrecalentó. Pizzas perdidas.',loss:.07},
    {type:'strike',emoji:'✊',title:'¡Huelga del personal!',desc:'Los empleados piden mejores condiciones.',loss:.05},
    {type:'flood',emoji:'🌊',title:'¡Inundación!',desc:'Las cañerías han fallado. Sótano bajo el agua.',loss:.06},
    {type:'inspection',emoji:'🏥',title:'¡Inspección sanitaria!',desc:'El inspector encontró irregularidades. Multa.',loss:.09},
  ],
  good: [
    {type:'viral',emoji:'📱',title:'¡Viral en TikTok!',desc:'Tu pizza es trending. ¡Pedidos disparados!',gain:.18},
    {type:'alien',emoji:'👽',title:'¡Pedido alienígena!',desc:'Una nave espacial ha pedido 500 margheritas.',gain:.22},
    {type:'celebrity',emoji:'⭐',title:'¡Famoso te menciona!',desc:'Un influencer ha visitado tu local.',gain:.15},
  ]
};

// ============================================================
// PIZZERIA SVG TILES — 10 evolution stages
// ============================================================

const PIZZERIA_TIERS = [
  { minLv:1,  id:'t1',  name:'Barraca' },
  { minLv:3,  id:'t2',  name:'Local' },
  { minLv:5,  id:'t3',  name:'Pizzería' },
  { minLv:7,  id:'t4',  name:'Ristorante' },
  { minLv:9,  id:'t5',  name:'Gran Palazzo' },
  { minLv:11, id:'t6',  name:'Torre' },
  { minLv:13, id:'t7',  name:'Fortaleza' },
  { minLv:15, id:'t8',  name:'Estación Espacial' },
  { minLv:17, id:'t9',  name:'Ciudad Planetaria' },
  { minLv:19, id:'t10', name:'DIOS DEL MULTIVERSO' },
];

function getPizzeriaTier(level) {
  return [...PIZZERIA_TIERS].reverse().find(t => level >= t.minLv) || PIZZERIA_TIERS[0];
}

// Returns SVG inner content (no <svg> wrapper) for a given tier id
// cellSize is the px size of the cell
function getPizzeriaSVG(tierId, cellSize, isMe) {
  const s = cellSize;
  const c = s / 2; // center
  const scale = s / 60; // normalized to 60px base

  const svgs = {
    t1: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#1e1208"/>
      <polygon points="${s*.13},${s*.57} ${s*.87},${s*.57} ${c},${s*.27}" fill="#4a2206"/>
      <rect x="${s*.2}" y="${s*.57}" width="${s*.6}" height="${s*.27}" fill="#6b3410"/>
      <line x1="${s*.2}" y1="${s*.64}" x2="${s*.8}" y2="${s*.64}" stroke="#4a2206" stroke-width="${scale*.7}"/>
      <line x1="${s*.2}" y1="${s*.72}" x2="${s*.8}" y2="${s*.72}" stroke="#4a2206" stroke-width="${scale*.7}"/>
      <rect x="${s*.36}" y="${s*.67}" width="${s*.17}" height="${s*.17}" rx="${s*.05}" fill="#2a1004"/>
      <rect x="${s*.23}" y="${s*.6}" width="${s*.12}" height="${s*.1}" rx="${s*.02}" fill="#ffcc44" style="animation:wl 1.5s ease-in-out infinite alternate"/>
      <rect x="${s*.65}" y="${s*.6}" width="${s*.12}" height="${s*.1}" rx="${s*.02}" fill="#ffcc44" style="animation:wl 1.5s ease-in-out infinite alternate .5s"/>
      <rect x="${s*.57}" y="${s*.2}" width="${s*.08}" height="${s*.23}" fill="#4a2206"/>
      <circle cx="${c}" cy="${s*.53}" r="${s*.05}" fill="#cc4400"/>
      <circle cx="${c}" cy="${s*.53}" r="${s*.03}" fill="#ffcc00"/>
      <circle cx="${s*.6}" cy="${s*.15}" r="${s*.05}" fill="rgba(200,170,150,.35)" style="animation:su 2s ease-in infinite"/>`,

    t2: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#1e1208"/>
      <rect x="${s*.13}" y="${s*.37}" width="${s*.73}" height="${s*.47}" fill="#c8845a"/>
      <line x1="${s*.13}" y1="${s*.47}" x2="${s*.87}" y2="${s*.47}" stroke="rgba(0,0,0,.12)" stroke-width="${scale*.7}"/>
      <line x1="${s*.13}" y1="${s*.57}" x2="${s*.87}" y2="${s*.57}" stroke="rgba(0,0,0,.12)" stroke-width="${scale*.7}"/>
      <line x1="${s*.13}" y1="${s*.67}" x2="${s*.87}" y2="${s*.67}" stroke="rgba(0,0,0,.12)" stroke-width="${scale*.7}"/>
      <rect x="${s*.1}" y="${s*.32}" width="${s*.8}" height="${s*.07}" fill="#a06040"/>
      <rect x="${s*.1}" y="${s*.28}" width="${s*.8}" height="${s*.05}" fill="#804820"/>
      <rect x="${s*.13}" y="${s*.47}" width="${s*.73}" height="${s*.1}" fill="#cc2200"/>
      <line x1="${s*.3}" y1="${s*.47}" x2="${s*.3}" y2="${s*.57}" stroke="#aa1800" stroke-width="${scale*.5}"/>
      <line x1="${s*.5}" y1="${s*.47}" x2="${s*.5}" y2="${s*.57}" stroke="#aa1800" stroke-width="${scale*.5}"/>
      <line x1="${s*.7}" y1="${s*.47}" x2="${s*.7}" y2="${s*.57}" stroke="#aa1800" stroke-width="${scale*.5}"/>
      <rect x="${s*.17}" y="${s*.37}" width="${s*.2}" height="${s*.17}" rx="${s*.02}" fill="#ffeeaa"/>
      <rect x="${s*.63}" y="${s*.37}" width="${s*.2}" height="${s*.17}" rx="${s*.02}" fill="#ffeeaa"/>
      <rect x="${s*.4}" y="${s*.6}" width="${s*.2}" height="${s*.23}" rx="${s*.03}" fill="#5a2a10"/>
      <rect x="${s*.17}" y="${s*.23}" width="${s*.67}" height="${s*.12}" rx="${s*.03}" fill="#8b4513"/>`,

    t3: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#1c1206"/>
      <rect x="${s*.1}" y="${s*.3}" width="${s*.8}" height="${s*.53}" fill="#d4a060"/>
      <line x1="${s*.1}" y1="${s*.4}" x2="${s*.9}" y2="${s*.4}" stroke="rgba(0,0,0,.1)" stroke-width="${scale*.6}"/>
      <line x1="${s*.1}" y1="${s*.5}" x2="${s*.9}" y2="${s*.5}" stroke="rgba(0,0,0,.1)" stroke-width="${scale*.6}"/>
      <line x1="${s*.1}" y1="${s*.6}" x2="${s*.9}" y2="${s*.6}" stroke="rgba(0,0,0,.1)" stroke-width="${scale*.6}"/>
      <rect x="${s*.07}" y="${s*.23}" width="${s*.87}" height="${s*.08}" fill="#b07830"/>
      <rect x="${s*.17}" y="${s*.33}" width="${s*.2}" height="${s*.23}" rx="${s*.1}" fill="#88aacc"/>
      <rect x="${s*.63}" y="${s*.33}" width="${s*.2}" height="${s*.23}" rx="${s*.1}" fill="#88aacc"/>
      <rect x="${s*.17}" y="${s*.58}" width="${s*.67}" height="${s*.12}" rx="${s*.02}" fill="#7a5010"/>
      <rect x="${s*.38}" y="${s*.62}" width="${s*.23}" height="${s*.22}" rx="${s*.05}" fill="#5a3010"/>
      <circle cx="${s*.33}" cy="${s*.65}" r="${s*.025}" fill="#d4a830" style="animation:st 1s ease-in-out infinite alternate"/>
      <circle cx="${s*.5}" cy="${s*.65}" r="${s*.025}" fill="#d4a830" style="animation:st 1s ease-in-out infinite alternate .3s"/>
      <circle cx="${s*.67}" cy="${s*.65}" r="${s*.025}" fill="#d4a830" style="animation:st 1s ease-in-out infinite alternate .6s"/>
      <rect x="${s*.07}" y="${s*.07}" width="${s*.07}" height="${s*.15}" fill="#009246"/>
      <rect x="${s*.14}" y="${s*.07}" width="${s*.07}" height="${s*.15}" fill="#fff"/>
      <rect x="${s*.21}" y="${s*.07}" width="${s*.07}" height="${s*.15}" fill="#ce2b37"/>`,

    t4: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#181008"/>
      <rect x="${s*.1}" y="${s*.27}" width="${s*.8}" height="${s*.57}" fill="#e8d5a0"/>
      <line x1="${s*.1}" y1="${s*.37}" x2="${s*.9}" y2="${s*.37}" stroke="rgba(0,0,0,.09)" stroke-width="${scale*.6}"/>
      <line x1="${s*.1}" y1="${s*.47}" x2="${s*.9}" y2="${s*.47}" stroke="rgba(0,0,0,.09)" stroke-width="${scale*.6}"/>
      <line x1="${s*.1}" y1="${s*.57}" x2="${s*.9}" y2="${s*.57}" stroke="rgba(0,0,0,.09)" stroke-width="${scale*.6}"/>
      <line x1="${s*.1}" y1="${s*.67}" x2="${s*.9}" y2="${s*.67}" stroke="rgba(0,0,0,.09)" stroke-width="${scale*.6}"/>
      <rect x="${s*.07}" y="${s*.17}" width="${s*.87}" height="${s*.12}" fill="#d4a830"/>
      <rect x="${s*.07}" y="${s*.13}" width="${s*.87}" height="${s*.05}" fill="#b8901c"/>
      <rect x="${s*.15}" y="${s*.27}" width="${s*.08}" height="${s*.57}" fill="#d4c090"/>
      <rect x="${s*.77}" y="${s*.27}" width="${s*.08}" height="${s*.57}" fill="#d4c090"/>
      <rect x="${s*.25}" y="${s*.3}" width="${s*.2}" height="${s*.25}" rx="${s*.1}" fill="#88aacc"/>
      <rect x="${s*.55}" y="${s*.3}" width="${s*.2}" height="${s*.25}" rx="${s*.1}" fill="#88aacc"/>
      <rect x="${s*.2}" y="${s*.57}" width="${s*.6}" height="${s*.12}" rx="${s*.02}" fill="#8b4513"/>
      <rect x="${s*.37}" y="${s*.62}" width="${s*.27}" height="${s*.22}" rx="${s*.05}" fill="#5a3010"/>
      <rect x="${s*.38}" y="${s*.63}" width="${s*.1}" height="${s*.2}" rx="${s*.02}" fill="#7a4820"/>
      <rect x="${s*.52}" y="${s*.63}" width="${s*.1}" height="${s*.2}" rx="${s*.02}" fill="#7a4820"/>
      <text x="${c}" y="${s*.15}" text-anchor="middle" font-size="${s*.14}" style="animation:st 1.5s ease-in-out infinite alternate">🏆</text>`,

    t5: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#120828"/>
      <rect x="${s*.23}" y="${s*.13}" width="${s*.53}" height="${s*.7}" fill="#2a1040"/>
      <rect x="${s*.1}" y="${s*.3}" width="${s*.23}" height="${s*.53}" fill="#200c34"/>
      <rect x="${s*.67}" y="${s*.3}" width="${s*.23}" height="${s*.53}" fill="#200c34"/>
      <rect x="${s*.23}" y="${s*.13}" width="${s*.53}" height="${s*.03}" fill="#cc44ff" opacity=".9" style="animation:np 1.5s ease-in-out infinite alternate"/>
      <rect x="${s*.27}" y="${s*.17}" width="${s*.47}" height="${s*.17}" rx="${s*.03}" fill="none" stroke="#cc44ff" stroke-width="${scale*1.5}" style="animation:np 1.8s ease-in-out infinite alternate"/>
      <rect x="${s*.28}" y="${s*.35}" width="${s*.13}" height="${s*.13}" rx="${s*.02}" fill="#cc44ff" opacity=".7" style="animation:np 1.2s ease-in-out infinite alternate"/>
      <rect x="${s*.58}" y="${s*.35}" width="${s*.13}" height="${s*.13}" rx="${s*.02}" fill="#cc44ff" opacity=".7" style="animation:np 1.2s ease-in-out infinite alternate .4s"/>
      <rect x="${s*.43}" y="${s*.35}" width="${s*.13}" height="${s*.13}" rx="${s*.02}" fill="#ff6600" opacity=".8" style="animation:np 1.4s ease-in-out infinite alternate .2s"/>
      <rect x="${s*.38}" y="${s*.63}" width="${s*.23}" height="${s*.2}" rx="${s*.12}" fill="#150628"/>
      <polygon points="${c},${s*.03} ${s*.43},${s*.12} ${c},${s*.09} ${s*.57},${s*.12} ${s*.63},${s*.03} ${s*.6},${s*.08} ${c},${s*.06} ${s*.4},${s*.08}" fill="#ffaa00"/>`,

    t6: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#0e0620"/>
      <rect x="${s*.33}" y="${s*.07}" width="${s*.33}" height="${s*.77}" fill="#1e0832"/>
      <rect x="${s*.1}" y="${s*.23}" width="${s*.27}" height="${s*.6}" fill="#180628"/>
      <rect x="${s*.63}" y="${s*.23}" width="${s*.27}" height="${s*.6}" fill="#180628"/>
      <rect x="${s*.3}" y="${s*.03}" width="${s*.07}" height="${s*.07}" fill="#2a0e48"/>
      <rect x="${s*.4}" y="${s*.03}" width="${s*.07}" height="${s*.07}" fill="#2a0e48"/>
      <rect x="${s*.5}" y="${s*.03}" width="${s*.07}" height="${s*.07}" fill="#2a0e48"/>
      <rect x="${s*.6}" y="${s*.03}" width="${s*.07}" height="${s*.07}" fill="#2a0e48"/>
      <rect x="${s*.33}" y="${s*.07}" width="${s*.33}" height="${s*.03}" fill="#dd00ff" opacity=".9" style="animation:np 1s ease-in-out infinite alternate"/>
      <rect x="${s*.38}" y="${s*.13}" width="${s*.1}" height="${s*.17}" rx="${s*.05}" fill="#ee44ff" opacity=".8" style="animation:np 1s ease-in-out infinite alternate"/>
      <rect x="${s*.52}" y="${s*.13}" width="${s*.1}" height="${s*.17}" rx="${s*.05}" fill="#cc00ff" opacity=".8" style="animation:np 1.3s ease-in-out infinite alternate .3s"/>
      <rect x="${s*.38}" y="${s*.37}" width="${s*.1}" height="${s*.15}" rx="${s*.05}" fill="#aa00ee" opacity=".7"/>
      <rect x="${s*.52}" y="${s*.37}" width="${s*.1}" height="${s*.15}" rx="${s*.05}" fill="#aa00ee" opacity=".7"/>
      <rect x="${s*.38}" y="${s*.57}" width="${s*.23}" height="${s*.13}" rx="${s*.02}" fill="#8800cc" opacity=".6"/>
      <rect x="${s*.13}" y="${s*.3}" width="${s*.13}" height="${s*.1}" rx="${s*.02}" fill="#7700bb" opacity=".6"/>
      <rect x="${s*.73}" y="${s*.3}" width="${s*.13}" height="${s*.1}" rx="${s*.02}" fill="#7700bb" opacity=".6"/>
      <rect x="${s*.4}" y="${s*.67}" width="${s*.2}" height="${s*.17}" rx="${s*.1}" fill="#0e0420"/>
      <line x1="${c}" y1="0" x2="${c}" y2="${s*.07}" stroke="#dd00ff" stroke-width="${scale*2}"/>
      <circle cx="${c}" cy="0" r="${s*.03}" fill="#ff00ff" style="animation:np .7s ease-in-out infinite alternate"/>`,

    t7: `
      <rect x="0" y="${s*.83}" width="${s}" height="${s*.17}" fill="#08061a"/>
      <rect x="${s*.03}" y="${s*.17}" width="${s*.93}" height="${s*.67}" fill="#0c0828"/>
      <rect x="${s*.03}" y="${s*.13}" width="${s*.12}" height="${s*.07}" fill="#100a30"/>
      <rect x="${s*.18}" y="${s*.13}" width="${s*.12}" height="${s*.07}" fill="#100a30"/>
      <rect x="${s*.33}" y="${s*.13}" width="${s*.12}" height="${s*.07}" fill="#100a30"/>
      <rect x="${s*.48}" y="${s*.13}" width="${s*.12}" height="${s*.07}" fill="#100a30"/>
      <rect x="${s*.63}" y="${s*.13}" width="${s*.12}" height="${s*.07}" fill="#100a30"/>
      <rect x="${s*.78}" y="${s*.13}" width="${s*.12}" height="${s*.07}" fill="#100a30"/>
      <rect x="${s*.03}" y="${s*.17}" width="${s*.93}" height="${s*.025}" fill="#4444ff" opacity=".8" style="animation:np 1.2s ease-in-out infinite alternate"/>
      <rect x="${s*.37}" y="${s*.03}" width="${s*.27}" height="${s*.2}" fill="#100828"/>
      <rect x="${s*.33}" y="0" width="${s*.05}" height="${s*.07}" fill="#140a30"/>
      <rect x="${s*.42}" y="0" width="${s*.05}" height="${s*.07}" fill="#140a30"/>
      <rect x="${s*.5}" y="0" width="${s*.05}" height="${s*.07}" fill="#140a30"/>
      <rect x="${s*.58}" y="0" width="${s*.05}" height="${s*.07}" fill="#140a30"/>
      <rect x="${s*.42}" y="${s*.07}" width="${s*.08}" height="${s*.13}" rx="${s*.04}" fill="#6666ff" opacity=".8" style="animation:np .9s ease-in-out infinite alternate"/>
      <rect x="${s*.53}" y="${s*.07}" width="${s*.08}" height="${s*.13}" rx="${s*.04}" fill="#4444ee" opacity=".8" style="animation:np 1.1s ease-in-out infinite alternate .3s"/>
      <rect x="${s*.1}" y="${s*.23}" width="${s*.13}" height="${s*.17}" rx="${s*.07}" fill="#3333cc" opacity=".7"/>
      <rect x="${s*.28}" y="${s*.23}" width="${s*.13}" height="${s*.17}" rx="${s*.07}" fill="#4444dd" opacity=".7"/>
      <rect x="${s*.58}" y="${s*.23}" width="${s*.13}" height="${s*.17}" rx="${s*.07}" fill="#4444dd" opacity=".7"/>
      <rect x="${s*.77}" y="${s*.23}" width="${s*.13}" height="${s*.17}" rx="${s*.07}" fill="#3333cc" opacity=".7"/>
      <rect x="${s*.1}" y="${s*.47}" width="${s*.13}" height="${s*.13}" rx="${s*.07}" fill="#2222bb" opacity=".6"/>
      <rect x="${s*.77}" y="${s*.47}" width="${s*.13}" height="${s*.13}" rx="${s*.07}" fill="#2222bb" opacity=".6"/>
      <rect x="${s*.37}" y="${s*.6}" width="${s*.27}" height="${s*.23}" rx="${s*.13}" fill="#060420"/>
      <rect x="${s*.03}" y="${s*.17}" width="${s*.1}" height="${s*.67}" fill="#0e0830"/>
      <rect x="${s*.87}" y="${s*.17}" width="${s*.1}" height="${s*.67}" fill="#0e0830"/>`,

    t8: `
      <rect x="0" y="${s*.87}" width="${s}" height="${s*.13}" fill="#010a18"/>
      <circle cx="${s*.08}" cy="${s*.1}" r="${s*.013}" fill="rgba(0,200,255,.7)" style="animation:st .9s infinite alternate"/>
      <circle cx="${s*.92}" cy="${s*.17}" r="${s*.015}" fill="rgba(0,200,255,.6)" style="animation:st 1.3s infinite alternate .4s"/>
      <circle cx="${s*.13}" cy="${s*.58}" r="${s*.012}" fill="rgba(100,200,255,.6)" style="animation:st .7s infinite alternate .2s"/>
      <circle cx="${s*.87}" cy="${s*.67}" r="${s*.013}" fill="rgba(0,200,255,.5)" style="animation:st 1.5s infinite alternate .7s"/>
      <g style="transform-origin:${c}px ${s*.47}px;animation:cs 8s linear infinite">
      <ellipse cx="${c}" cy="${s*.47}" rx="${s*.47}" ry="${s*.13}" fill="none" stroke="rgba(0,200,255,.18)" stroke-width="${scale}" stroke-dasharray="${scale*3} ${scale*3}"/>
      </g>
      <rect x="${s*.33}" y="${s*.13}" width="${s*.33}" height="${s*.73}" fill="#001540"/>
      <rect x="${s*.13}" y="${s*.33}" width="${s*.23}" height="${s*.53}" fill="#001030"/>
      <rect x="${s*.63}" y="${s*.33}" width="${s*.23}" height="${s*.53}" fill="#001030"/>
      <rect x="${s*.33}" y="${s*.13}" width="${s*.33}" height="${s*.025}" fill="#00ddff" opacity=".9" style="animation:np 1s ease-in-out infinite alternate"/>
      <rect x="${s*.37}" y="${s*.23}" width="${s*.12}" height="${s*.12}" rx="${s*.02}" fill="#00eeff" opacity=".8" style="animation:np .8s ease-in-out infinite alternate"/>
      <rect x="${s*.52}" y="${s*.23}" width="${s*.12}" height="${s*.12}" rx="${s*.02}" fill="#00aaff" opacity=".8" style="animation:np 1.1s ease-in-out infinite alternate .3s"/>
      <rect x="${s*.37}" y="${s*.38}" width="${s*.12}" height="${s*.12}" rx="${s*.02}" fill="#0088ff" opacity=".7"/>
      <rect x="${s*.52}" y="${s*.38}" width="${s*.12}" height="${s*.12}" rx="${s*.02}" fill="#00ccff" opacity=".7"/>
      <rect x="${s*.37}" y="${s*.53}" width="${s*.12}" height="${s*.12}" rx="${s*.02}" fill="#0066ff" opacity=".6"/>
      <rect x="${s*.52}" y="${s*.53}" width="${s*.12}" height="${s*.12}" rx="${s*.02}" fill="#0066ff" opacity=".6"/>
      <rect x="${s*.17}" y="${s*.4}" width="${s*.13}" height="${s*.1}" rx="${s*.02}" fill="#0044cc" opacity=".65}"/>
      <rect x="${s*.7}" y="${s*.4}" width="${s*.13}" height="${s*.1}" rx="${s*.02}" fill="#0044cc" opacity=".65"/>
      <rect x="${s*.42}" y="${s*.63}" width="${s*.17}" height="${s*.23}" rx="${s*.08}" fill="#000820"/>
      <polygon points="${c},${s*.03} ${s*.47},${s*.1} ${c},${s*.1} ${s*.53},${s*.1} ${s*.57},${s*.03} ${s*.53},${s*.08} ${c},${s*.06} ${s*.47},${s*.08}" fill="#00ccff"/>
      <circle cx="${c}" cy="${s*.05}" r="${s*.03}" fill="#00ffff" style="animation:np .5s ease-in-out infinite alternate"/>`,

    t9: `
      <rect x="0" y="${s*.87}" width="${s}" height="${s*.13}" fill="#010810"/>
      <circle cx="${s*.07}" cy="${s*.07}" r="${s*.013}" fill="rgba(100,255,200,.7)" style="animation:st .8s infinite alternate"/>
      <circle cx="${s*.93}" cy="${s*.13}" r="${s*.015}" fill="rgba(0,255,150,.6)" style="animation:st 1.2s infinite alternate .3s"/>
      <g style="transform-origin:${c}px ${s*.43}px;animation:cs 10s linear infinite">
      <ellipse cx="${c}" cy="${s*.43}" rx="${s*.48}" ry="${s*.12}" fill="none" stroke="rgba(0,255,150,.15)" stroke-width="${scale*1.2}" stroke-dasharray="${scale*4} ${scale*3}"/>
      </g>
      <g style="transform-origin:${c}px ${s*.43}px;animation:cs 6s linear infinite reverse">
      <ellipse cx="${c}" cy="${s*.43}" rx="${s*.37}" ry="${s*.08}" fill="none" stroke="rgba(100,255,200,.12)" stroke-width="${scale*.8}" stroke-dasharray="${scale*3} ${scale*4}"/>
      </g>
      <rect x="${s*.27}" y="${s*.1}" width="${s*.47}" height="${s*.77}" fill="#001a10"/>
      <rect x="${s*.07}" y="${s*.3}" width="${s*.23}" height="${s*.57}" fill="#00140c"/>
      <rect x="${s*.7}" y="${s*.3}" width="${s*.23}" height="${s*.57}" fill="#00140c"/>
      <rect x="${s*.27}" y="${s*.1}" width="${s*.47}" height="${s*.033}" fill="#00ff88" opacity=".8" style="animation:np .9s ease-in-out infinite alternate"/>
      <rect x="${s*.3}" y="${s*.13}" width="${s*.15}" height="${s*.13}" rx="${s*.02}" fill="#00ff88" opacity=".75" style="animation:np .8s ease-in-out infinite alternate"/>
      <rect x="${s*.55}" y="${s*.13}" width="${s*.15}" height="${s*.13}" rx="${s*.02}" fill="#00ddff" opacity=".75" style="animation:np 1.1s ease-in-out infinite alternate .3s"/>
      <rect x="${s*.3}" y="${s*.32}" width="${s*.15}" height="${s*.13}" rx="${s*.02}" fill="#00cc66" opacity=".65"/>
      <rect x="${s*.55}" y="${s*.32}" width="${s*.15}" height="${s*.13}" rx="${s*.02}" fill="#00cc66" opacity=".65"/>
      <rect x="${s*.3}" y="${s*.5}" width="${s*.15}" height="${s*.13}" rx="${s*.02}" fill="#00aa55" opacity=".6"/>
      <rect x="${s*.55}" y="${s*.5}" width="${s*.15}" height="${s*.13}" rx="${s*.02}" fill="#00aa55" opacity=".6"/>
      <rect x="${s*.1}" y="${s*.37}" width="${s*.15}" height="${s*.12}" rx="${s*.02}" fill="#008844" opacity=".6"/>
      <rect x="${s*.75}" y="${s*.37}" width="${s*.15}" height="${s*.12}" rx="${s*.02}" fill="#008844" opacity=".6"/>
      <rect x="${s*.37}" y="${s*.63}" width="${s*.27}" height="${s*.23}" rx="${s*.13}" fill="#000e08"/>
      <polygon points="${c},${s*.02} ${s*.45},${s*.1} ${c},${s*.075} ${s*.55},${s*.1} ${s*.6},${s*.02} ${s*.57},${s*.07} ${c},${s*.04} ${s*.43},${s*.07}" fill="#00ff88"/>
      <circle cx="${c}" cy="${s*.03}" r="${s*.04}" fill="#00ffaa" style="animation:np .5s ease-in-out infinite alternate"/>`,

    t10: `
      <rect x="0" y="${s*.87}" width="${s}" height="${s*.13}" fill="#080406"/>
      <circle cx="${s*.05}" cy="${s*.05}" r="${s*.017}" fill="rgba(255,220,100,.9)" style="animation:st .6s infinite alternate"/>
      <circle cx="${s*.95}" cy="${s*.08}" r="${s*.015}" fill="rgba(255,200,50,.8)" style="animation:st 1s infinite alternate .2s"/>
      <circle cx="${s*.08}" cy="${s*.53}" r="${s*.013}" fill="rgba(255,220,100,.7)" style="animation:st .8s infinite alternate .4s"/>
      <circle cx="${s*.92}" cy="${s*.63}" r="${s*.017}" fill="rgba(255,200,50,.6)" style="animation:st 1.2s infinite alternate .6s"/>
      <g style="transform-origin:${c}px ${s*.43}px;animation:cs 5s linear infinite">
      <ellipse cx="${c}" cy="${s*.43}" rx="${s*.47}" ry="${s*.12}" fill="none" stroke="rgba(255,200,0,.2)" stroke-width="${scale*1.2}" stroke-dasharray="${scale*4} ${scale*3}"/>
      </g>
      <g style="transform-origin:${c}px ${s*.43}px;animation:cs 8s linear infinite reverse">
      <ellipse cx="${c}" cy="${s*.43}" rx="${s*.33}" ry="${s*.08}" fill="none" stroke="rgba(255,150,0,.15)" stroke-width="${scale*.8}" stroke-dasharray="${scale*3} ${scale*4}"/>
      </g>
      <polygon points="${c},${s*.03} ${s*.27},${s*.33} ${s*.73},${s*.33}" fill="#1a0a00"/>
      <rect x="${s*.23}" y="${s*.33}" width="${s*.53}" height="${s*.53}" fill="#1a0a00"/>
      <rect x="${s*.1}" y="${s*.43}" width="${s*.17}" height="${s*.43}" fill="#140800"/>
      <rect x="${s*.73}" y="${s*.43}" width="${s*.17}" height="${s*.43}" fill="#140800"/>
      <line x1="${s*.27}" y1="${s*.33}" x2="${s*.73}" y2="${s*.33}" stroke="#ffaa00" stroke-width="${scale*1.5}" opacity=".9" style="animation:np .8s ease-in-out infinite alternate"/>
      <rect x="${s*.27}" y="${s*.47}" width="${s*.47}" height="${s*.02}" fill="#ff8800" opacity=".7"/>
      <rect x="${s*.27}" y="${s*.6}" width="${s*.47}" height="${s*.02}" fill="#ff6600" opacity=".6"/>
      <rect x="${s*.27}" y="${s*.73}" width="${s*.47}" height="${s*.02}" fill="#ff4400" opacity=".5"/>
      <rect x="${s*.38}" y="${s*.18}" width="${s*.08}" height="${s*.08}" rx="${s*.02}" fill="#ffcc00" opacity=".9" style="animation:np .6s ease-in-out infinite alternate"/>
      <rect x="${s*.53}" y="${s*.18}" width="${s*.08}" height="${s*.08}" rx="${s*.02}" fill="#ffaa00" opacity=".9" style="animation:np .8s ease-in-out infinite alternate .2s"/>
      <rect x="${s*.3}" y="${s*.28}" width="${s*.08}" height="${s*.07}" rx="${s*.02}" fill="#ff8800" opacity=".7" style="animation:np 1s ease-in-out infinite alternate .4s"/>
      <rect x="${s*.62}" y="${s*.28}" width="${s*.08}" height="${s*.07}" rx="${s*.02}" fill="#ff8800" opacity=".7" style="animation:np 1.2s ease-in-out infinite alternate .6s"/>
      <rect x="${s*.28}" y="${s*.37}" width="${s*.13}" height="${s*.13}" rx="${s*.02}" fill="#ffcc00" opacity=".75" style="animation:np .7s ease-in-out infinite alternate"/>
      <rect x="${s*.58}" y="${s*.37}" width="${s*.13}" height="${s*.13}" rx="${s*.02}" fill="#ff8800" opacity=".75" style="animation:np .9s ease-in-out infinite alternate .2s"/>
      <rect x="${s*.43}" y="${s*.37}" width="${s*.13}" height="${s*.13}" rx="${s*.02}" fill="#ff6600" opacity=".85" style="animation:np 1.1s ease-in-out infinite alternate .4s"/>
      <rect x="${s*.28}" y="${s*.55}" width="${s*.13}" height="${s*.12}" rx="${s*.02}" fill="#ff8800" opacity=".65"/>
      <rect x="${s*.58}" y="${s*.55}" width="${s*.13}" height="${s*.12}" rx="${s*.02}" fill="#ff8800" opacity=".65"/>
      <rect x="${s*.43}" y="${s*.55}" width="${s*.13}" height="${s*.12}" rx="${s*.02}" fill="#ffaa00" opacity=".7"/>
      <rect x="${s*.13}" y="${s*.5}" width="${s*.12}" height="${s*.1}" rx="${s*.02}" fill="#ff6600" opacity=".6"/>
      <rect x="${s*.75}" y="${s*.5}" width="${s*.12}" height="${s*.1}" rx="${s*.02}" fill="#ff6600" opacity=".6"/>
      <rect x="${s*.38}" y="${s*.63}" width="${s*.23}" height="${s*.23}" rx="${s*.12}" fill="#0a0400"/>
      <polygon points="${c},0 ${s*.43},${s*.07} ${s*.47},${s*.05} ${c},${s*.08} ${s*.53},${s*.05} ${s*.57},${s*.07}" fill="#ffcc00"/>
      <circle cx="${c}" cy="${s*.02}" r="${s*.05}" fill="#ffff00" style="animation:np .4s ease-in-out infinite alternate"/>
      <circle cx="${c}" cy="${s*.02}" r="${s*.025}" fill="#fff" style="animation:np .3s ease-in-out infinite alternate"/>`,
  };

  return svgs[tierId] || svgs['t1'];
}
