import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UPGRADES, LEVELS } from './gameData';
import { Upgrade, Event } from './types';

interface GameStore {
  // Resources
  pizzas: number;
  totalPizzas: number;
  pizzasPerClick: number;
  pizzasPerSecond: number;
  
  // Progress
  level: number;
  xp: number;
  
  // Upgrades
  upgrades: Upgrade[];
  
  // Events
  events: Event[];
  
  // City
  cityPosition: { x: number; y: number } | null;
  reputation: number;
  
  // Combo
  clickCombo: number;
  lastClickTime: number;
  comboMultiplier: number;
  
  // Crime
  policeCorruption: number;
  detectiveLevel: number;
  securityLevel: number;
  
  // Actions
  clickPizza: () => void;
  buyUpgrade: (upgradeId: string) => void;
  addPassiveIncome: (amount: number) => void;
  addEvent: (event: Event) => void;
  removeEvent: (eventId: string) => void;
  loadFromFirebase: (data: Partial<GameStore>) => void;
  setCityPosition: (pos: { x: number; y: number }) => void;
}

const recalcStats = (upgrades: Upgrade[]) => {
  let ppc = 1;
  let pps = 0;
  let rep = 0;
  
  upgrades.forEach(u => {
    if (u.level > 0) {
      if (u.pizzasPerClick) ppc += u.pizzasPerClick * u.level;
      if (u.pizzasPerSecond) pps += u.pizzasPerSecond * u.level;
      if (u.reputationBonus) rep += u.reputationBonus * u.level;
    }
  });
  
  return { ppc, pps, rep };
};

const getUpgradeCost = (upgrade: Upgrade) => {
  return Math.floor(upgrade.baseCost * Math.pow(1.5, upgrade.level));
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      pizzas: 0,
      totalPizzas: 0,
      pizzasPerClick: 1,
      pizzasPerSecond: 0,
      level: 1,
      xp: 0,
      upgrades: UPGRADES.map(u => ({ ...u })),
      events: [],
      cityPosition: null,
      reputation: 0,
      clickCombo: 0,
      lastClickTime: 0,
      comboMultiplier: 1,
      policeCorruption: 0,
      detectiveLevel: 0,
      securityLevel: 0,

      clickPizza: () => {
        const state = get();
        const now = Date.now();
        const timeDiff = now - state.lastClickTime;
        
        let combo = state.clickCombo;
        let multiplier = state.comboMultiplier;
        
        if (timeDiff < 500) {
          combo = Math.min(combo + 1, 50);
          multiplier = 1 + (combo * 0.05);
        } else {
          combo = 0;
          multiplier = 1;
        }
        
        const gained = Math.floor(state.pizzasPerClick * multiplier);
        const newTotal = state.totalPizzas + gained;
        
        // XP and level
        let xp = state.xp + 1;
        let level = state.level;
        const nextLevel = LEVELS.find(l => l.level === level + 1);
        if (nextLevel && xp >= nextLevel.xpRequired) {
          level = level + 1;
        }
        
        set({
          pizzas: state.pizzas + gained,
          totalPizzas: newTotal,
          xp,
          level,
          clickCombo: combo,
          comboMultiplier: multiplier,
          lastClickTime: now,
        });
      },

      buyUpgrade: (upgradeId: string) => {
        const state = get();
        const upgradeIdx = state.upgrades.findIndex(u => u.id === upgradeId);
        if (upgradeIdx === -1) return;
        
        const upgrade = state.upgrades[upgradeIdx];
        if (upgrade.level >= upgrade.maxLevel) return;
        
        const cost = getUpgradeCost(upgrade);
        if (state.pizzas < cost) return;
        
        const newUpgrades = [...state.upgrades];
        newUpgrades[upgradeIdx] = { ...upgrade, level: upgrade.level + 1 };
        
        // Update security/police stats
        let policeCorruption = state.policeCorruption;
        let detectiveLevel = state.detectiveLevel;
        let securityLevel = state.securityLevel;
        
        if (upgradeId === 'sec_3') policeCorruption += 10;
        if (upgradeId === 'sec_4') detectiveLevel += 1;
        if (upgradeId === 'sec_1' || upgradeId === 'sec_2') securityLevel += 1;
        
        const { ppc, pps, rep } = recalcStats(newUpgrades);
        
        // XP for buying
        let xp = state.xp + Math.floor(cost / 10);
        let level = state.level;
        const nextLevel = LEVELS.find(l => l.level === level + 1);
        if (nextLevel && xp >= nextLevel.xpRequired) {
          level = level + 1;
        }
        
        set({
          upgrades: newUpgrades,
          pizzas: state.pizzas - cost,
          pizzasPerClick: ppc,
          pizzasPerSecond: pps,
          reputation: state.reputation + rep,
          xp,
          level,
          policeCorruption,
          detectiveLevel,
          securityLevel,
        });
      },

      addPassiveIncome: (amount: number) => {
        const state = get();
        const xpGain = Math.max(1, Math.floor(amount / 10));
        let xp = state.xp + xpGain;
        let level = state.level;
        const nextLevel = LEVELS.find(l => l.level === level + 1);
        if (nextLevel && xp >= nextLevel.xpRequired) {
          level = level + 1;
        }
        set({
          pizzas: state.pizzas + amount,
          totalPizzas: state.totalPizzas + amount,
          xp,
          level,
        });
      },

      addEvent: (event: Event) => {
        const state = get();
        let pizzas = state.pizzas;
        if (event.pizzaLoss) pizzas = Math.max(0, pizzas - event.pizzaLoss);
        if (event.pizzaGain) pizzas = pizzas + event.pizzaGain;
        
        set({
          pizzas,
          events: [event, ...state.events.slice(0, 9)],
        });
      },

      removeEvent: (eventId: string) => {
        set(state => ({
          events: state.events.filter(e => e.id !== eventId),
        }));
      },

      loadFromFirebase: (data: Partial<GameStore>) => {
        set(data);
      },

      setCityPosition: (pos: { x: number; y: number }) => {
        set({ cityPosition: pos });
      },
    }),
    {
      name: 'pizzaclicker-game',
      partialize: (state) => ({
        pizzas: state.pizzas,
        totalPizzas: state.totalPizzas,
        pizzasPerClick: state.pizzasPerClick,
        pizzasPerSecond: state.pizzasPerSecond,
        level: state.level,
        xp: state.xp,
        upgrades: state.upgrades,
        reputation: state.reputation,
        policeCorruption: state.policeCorruption,
        detectiveLevel: state.detectiveLevel,
        securityLevel: state.securityLevel,
        cityPosition: state.cityPosition,
      }),
    }
  )
);

export { getUpgradeCost };
