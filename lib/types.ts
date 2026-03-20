export interface Upgrade {
  id: string;
  name: string;
  description: string;
  emoji: string;
  baseCost: number;
  level: number;
  maxLevel: number;
  effect: string;
  pizzasPerClick?: number;
  pizzasPerSecond?: number;
  reputationBonus?: number;
  category: 'oven' | 'staff' | 'decor' | 'tech' | 'delivery' | 'space' | 'security';
}

export interface Event {
  id: string;
  type: 'earthquake' | 'robbery' | 'fire' | 'strike' | 'flood' | 'health_inspection' | 'viral' | 'alien_order';
  title: string;
  description: string;
  pizzaLoss?: number;
  pizzaGain?: number;
  duration?: number;
  timestamp: number;
}

export interface PlayerCity {
  userId: string;
  username: string;
  x: number;
  y: number;
  level: number;
  reputation: number;
  pizzasSold: number;
  upgrades: string[];
  lastActive: number;
}

export interface GameState {
  pizzas: number;
  totalPizzas: number;
  pizzasPerClick: number;
  pizzasPerSecond: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  reputation: number;
  upgrades: Upgrade[];
  events: Event[];
  multiplier: number;
  clickCombo: number;
  lastClickTime: number;
  policeCorruption: number;
  detectives: number;
  citySlot: { x: number; y: number } | null;
}
