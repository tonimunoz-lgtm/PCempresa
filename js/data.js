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
