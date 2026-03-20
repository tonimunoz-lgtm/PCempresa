import { Upgrade } from "./types";

export const UPGRADES: Upgrade[] = [
  // OVEN
  {
    id: "oven_1", name: "Horno de Leña Básico", description: "Un horno artesanal que mejora el sabor",
    emoji: "🪵", baseCost: 50, level: 0, maxLevel: 10,
    effect: "+1 pizza por click", pizzasPerClick: 1, category: "oven"
  },
  {
    id: "oven_2", name: "Horno Napolitano", description: "Importado directamente de Nápoles",
    emoji: "🔥", baseCost: 500, level: 0, maxLevel: 10,
    effect: "+5 pizzas por click", pizzasPerClick: 5, category: "oven"
  },
  {
    id: "oven_3", name: "Horno Doble Cámara", description: "Dos pizzas al mismo tiempo",
    emoji: "⚡", baseCost: 5000, level: 0, maxLevel: 10,
    effect: "+20 pizzas por click", pizzasPerClick: 20, category: "oven"
  },
  {
    id: "oven_4", name: "Horno Volcánico", description: "Calor del mismísimo Vesubio",
    emoji: "🌋", baseCost: 50000, level: 0, maxLevel: 10,
    effect: "+100 pizzas por click", pizzasPerClick: 100, category: "oven"
  },
  {
    id: "oven_5", name: "Horno Cuántico", description: "Cocina en múltiples dimensiones",
    emoji: "⚛️", baseCost: 1000000, level: 0, maxLevel: 5,
    effect: "+1000 pizzas por click", pizzasPerClick: 1000, category: "oven"
  },

  // STAFF
  {
    id: "staff_1", name: "Pizzero Aprendiz", description: "El primer empleado del negocio",
    emoji: "👨‍🍳", baseCost: 100, level: 0, maxLevel: 15,
    effect: "+0.5 pizza/seg", pizzasPerSecond: 0.5, category: "staff"
  },
  {
    id: "staff_2", name: "Chef Italiano", description: "Formado en Florencia",
    emoji: "👨‍🍳", baseCost: 1000, level: 0, maxLevel: 15,
    effect: "+3 pizzas/seg", pizzasPerSecond: 3, category: "staff"
  },
  {
    id: "staff_3", name: "Maestro Pizzaiolo", description: "Certificado por la Asociación Verace",
    emoji: "⭐", baseCost: 10000, level: 0, maxLevel: 10,
    effect: "+15 pizzas/seg", pizzasPerSecond: 15, category: "staff"
  },
  {
    id: "staff_4", name: "Equipo de Camareros", description: "Servicio impecable",
    emoji: "🤵", baseCost: 8000, level: 0, maxLevel: 10,
    effect: "+10 pizzas/seg + reputación", pizzasPerSecond: 10, reputationBonus: 5, category: "staff"
  },
  {
    id: "staff_5", name: "Robot Pizzero", description: "Nunca duerme, nunca descansa",
    emoji: "🤖", baseCost: 500000, level: 0, maxLevel: 8,
    effect: "+200 pizzas/seg", pizzasPerSecond: 200, category: "staff"
  },
  {
    id: "staff_6", name: "Ejército de Clones", description: "Clonados del mejor chef",
    emoji: "🧬", baseCost: 10000000, level: 0, maxLevel: 5,
    effect: "+5000 pizzas/seg", pizzasPerSecond: 5000, category: "staff"
  },

  // DECOR
  {
    id: "decor_1", name: "Decoración Rústica", description: "Madera y ladrillo artesanal",
    emoji: "🏺", baseCost: 200, level: 0, maxLevel: 5,
    effect: "+reputación", reputationBonus: 10, category: "decor"
  },
  {
    id: "decor_2", name: "Terraza Exterior", description: "Con vistas al centro",
    emoji: "🌿", baseCost: 3000, level: 0, maxLevel: 5,
    effect: "+reputación + clientes", reputationBonus: 25, pizzasPerSecond: 5, category: "decor"
  },
  {
    id: "decor_3", name: "Iluminación Italiana", description: "Guirnaldas y velas",
    emoji: "✨", baseCost: 15000, level: 0, maxLevel: 5,
    effect: "+reputación alta", reputationBonus: 50, category: "decor"
  },
  {
    id: "decor_4", name: "Fuente de Mármol", description: "Enviada desde Carrara",
    emoji: "⛲", baseCost: 100000, level: 0, maxLevel: 3,
    effect: "+reputación máxima", reputationBonus: 200, category: "decor"
  },

  // TECH
  {
    id: "tech_1", name: "Página Web", description: "Pedidos online básicos",
    emoji: "💻", baseCost: 500, level: 0, maxLevel: 1,
    effect: "+2 pizzas/seg", pizzasPerSecond: 2, category: "tech"
  },
  {
    id: "tech_2", name: "App Móvil", description: "Diseñada por Silicon Valley",
    emoji: "📱", baseCost: 5000, level: 0, maxLevel: 1,
    effect: "+20 pizzas/seg", pizzasPerSecond: 20, category: "tech"
  },
  {
    id: "tech_3", name: "IA de Sabores", description: "Recetas generadas por inteligencia artificial",
    emoji: "🧠", baseCost: 200000, level: 0, maxLevel: 3,
    effect: "+x2 pizzas/click", pizzasPerClick: 0, category: "tech"
  },
  {
    id: "tech_4", name: "Publicidad Holográfica", description: "Reclamos en 3D en la ciudad",
    emoji: "🌐", baseCost: 1000000, level: 0, maxLevel: 3,
    effect: "+reputación + ventas", reputationBonus: 300, pizzasPerSecond: 100, category: "tech"
  },

  // DELIVERY
  {
    id: "delivery_1", name: "Bicicleta de Reparto", description: "El clásico repartidor en bici",
    emoji: "🚲", baseCost: 300, level: 0, maxLevel: 10,
    effect: "+1 pizza/seg", pizzasPerSecond: 1, category: "delivery"
  },
  {
    id: "delivery_2", name: "Flota de Motos", description: "Reparto express en 30 min",
    emoji: "🛵", baseCost: 8000, level: 0, maxLevel: 10,
    effect: "+8 pizzas/seg", pizzasPerSecond: 8, category: "delivery"
  },
  {
    id: "delivery_3", name: "Drones de Reparto", description: "Entrega aérea ultrarápida",
    emoji: "🚁", baseCost: 250000, level: 0, maxLevel: 8,
    effect: "+80 pizzas/seg", pizzasPerSecond: 80, category: "delivery"
  },
  {
    id: "delivery_4", name: "Teletransportación", description: "Física cuántica al servicio del sabor",
    emoji: "✨", baseCost: 5000000, level: 0, maxLevel: 5,
    effect: "+1000 pizzas/seg", pizzasPerSecond: 1000, category: "delivery"
  },

  // SPACE
  {
    id: "space_1", name: "Cohete de Reparto", description: "Lleva pizzas a la Luna",
    emoji: "🚀", baseCost: 2000000, level: 0, maxLevel: 5,
    effect: "+500 pizzas/seg", pizzasPerSecond: 500, category: "space"
  },
  {
    id: "space_2", name: "Pizzería en Marte", description: "La primera sucursal interplanetaria",
    emoji: "🔴", baseCost: 10000000, level: 0, maxLevel: 3,
    effect: "+2000 pizzas/seg", pizzasPerSecond: 2000, category: "space"
  },
  {
    id: "space_3", name: "Cadena Galáctica", description: "Franquicias en toda la Vía Láctea",
    emoji: "🌌", baseCost: 100000000, level: 0, maxLevel: 3,
    effect: "+20000 pizzas/seg", pizzasPerSecond: 20000, category: "space"
  },
  {
    id: "space_4", name: "Imperio del Multiverso", description: "Pizzerías en cada dimensión",
    emoji: "🌀", baseCost: 999999999, level: 0, maxLevel: 1,
    effect: "VICTORIA TOTAL", pizzasPerSecond: 999999, category: "space"
  },

  // SECURITY
  {
    id: "sec_1", name: "Cámara de Seguridad", description: "Vigila el local 24/7",
    emoji: "📷", baseCost: 2000, level: 0, maxLevel: 5,
    effect: "-50% daño robos", category: "security"
  },
  {
    id: "sec_2", name: "Guardia de Seguridad", description: "Ex-marine con buen sueldo",
    emoji: "💂", baseCost: 20000, level: 0, maxLevel: 5,
    effect: "-75% daño ataques", category: "security"
  },
  {
    id: "sec_3", name: "Soborno Policía", description: "La policía mira para otro lado",
    emoji: "👮", baseCost: 50000, level: 0, maxLevel: 10,
    effect: "+corrupción policial", category: "security"
  },
  {
    id: "sec_4", name: "Detector Privado", description: "Para descubrir saboteadores",
    emoji: "🔍", baseCost: 100000, level: 0, maxLevel: 5,
    effect: "+probabilidad pillar rivales", category: "security"
  },
];

export const LEVELS = [
  { level: 1, xpRequired: 0, title: "Aprendiz de Pizzero", unlock: "Acceso básico al juego" },
  { level: 2, xpRequired: 100, title: "Pizzero Novato", unlock: "Tienda básica" },
  { level: 3, xpRequired: 300, title: "Chef en Prácticas", unlock: "Mejoras de personal" },
  { level: 4, xpRequired: 700, title: "Cocinero Local", unlock: "Decoración del local" },
  { level: 5, xpRequired: 1500, title: "Maestro de la Masa", unlock: "Tecnología básica" },
  { level: 6, xpRequired: 3000, title: "Empresario Pizzero", unlock: "Flota de reparto" },
  { level: 7, xpRequired: 6000, title: "Magnate del Queso", unlock: "App móvil" },
  { level: 8, xpRequired: 12000, title: "Barón de la Pizza", unlock: "Drones de reparto" },
  { level: 9, xpRequired: 25000, title: "Rey de PizzaCity", unlock: "Publicidad holográfica" },
  { level: 10, xpRequired: 50000, title: "Señor de las Pizzas", unlock: "🚨 INTERACCIONES PVP" },
  { level: 11, xpRequired: 100000, title: "Conde de Mozzarella", unlock: "Cohetes de reparto" },
  { level: 12, xpRequired: 200000, title: "Duque del Horno", unlock: "Pizzería en Marte" },
  { level: 13, xpRequired: 400000, title: "Príncipe del Multiverso", unlock: "IA de sabores avanzada" },
  { level: 14, xpRequired: 800000, title: "Rey del Universo Pizza", unlock: "Cadena Galáctica" },
  { level: 15, xpRequired: 2000000, title: "DIOS DE LA PIZZA 🍕", unlock: "Imperio del Multiverso" },
];
