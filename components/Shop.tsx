"use client";
import { useState } from 'react';
import { useGameStore, getUpgradeCost } from '@/lib/gameStore';
import { UPGRADES } from '@/lib/gameData';
import { Upgrade } from '@/lib/types';

const CATEGORIES = [
  { id: 'all', label: '⭐ Todo', },
  { id: 'oven', label: '🔥 Hornos' },
  { id: 'staff', label: '👨‍🍳 Personal' },
  { id: 'delivery', label: '🚲 Reparto' },
  { id: 'decor', label: '✨ Decor' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'space', label: '🚀 Espacio' },
  { id: 'security', label: '🔒 Seguridad' },
];

export default function Shop() {
  const { pizzas, upgrades, buyUpgrade, level } = useGameStore();
  const [filter, setFilter] = useState('all');

  const formatNum = (n: number) => {
    if (n >= 1e9) return `${(n/1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return Math.floor(n).toString();
  };

  const filtered = upgrades.filter(u => filter === 'all' || u.category === filter);

  const getUpgradeById = (id: string) => upgrades.find(u => u.id === id) || UPGRADES.find(u => u.id === id)!;

  return (
    <div className="shop">
      <div className="shop-header">
        <h2 className="shop-title">🏪 Tienda de Mejoras</h2>
        <div className="shop-budget">
          <span className="budget-label">Tienes:</span>
          <span className="budget-value">{formatNum(pizzas)} 🍕</span>
        </div>
      </div>

      <div className="cat-scroll">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            className={`cat-btn ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="upgrades-grid">
        {filtered.map(upgrade => {
          const u = getUpgradeById(upgrade.id);
          const cost = getUpgradeCost(u);
          const canAfford = pizzas >= cost;
          const maxed = u.level >= u.maxLevel;
          const requiresLv10 = u.category === 'security' && (u.id === 'sec_3' || u.id === 'sec_4') && level < 10;
          const spaceRequired = u.category === 'space' && level < 8;
          const locked = requiresLv10 || spaceRequired;

          return (
            <div 
              key={upgrade.id}
              className={`upgrade-card ${canAfford && !maxed && !locked ? 'affordable' : ''} ${maxed ? 'maxed' : ''} ${locked ? 'locked' : ''}`}
              onClick={() => !maxed && !locked && buyUpgrade(upgrade.id)}
            >
              <div className="upgrade-emoji">{upgrade.emoji}</div>
              <div className="upgrade-info">
                <div className="upgrade-name">{upgrade.name}</div>
                <div className="upgrade-desc">{upgrade.description}</div>
                <div className="upgrade-effect">{upgrade.effect}</div>
              </div>
              <div className="upgrade-right">
                <div className="upgrade-level">
                  {[...Array(Math.min(u.maxLevel, 10))].map((_, i) => (
                    <div key={i} className={`level-dot ${i < u.level ? 'filled' : ''}`} />
                  ))}
                </div>
                <div className="upgrade-cost">
                  {maxed ? (
                    <span className="maxed-label">✅ MAX</span>
                  ) : locked ? (
                    <span className="locked-label">🔒 Nv.{requiresLv10 ? 10 : 8}</span>
                  ) : (
                    <span className={canAfford ? 'cost-ok' : 'cost-no'}>
                      {formatNum(cost)} 🍕
                    </span>
                  )}
                </div>
                {u.level > 0 && <div className="current-level">Nv.{u.level}/{u.maxLevel}</div>}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .shop {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,150,0,0.15);
        }
        .shop-title { margin: 0; font-size: 18px; font-weight: 900; color: #ffcc00; }
        .shop-budget { display: flex; align-items: center; gap: 6px; }
        .budget-label { color: rgba(255,255,255,0.5); font-size: 12px; }
        .budget-value { color: #ffcc00; font-weight: 800; font-size: 16px; }
        .cat-scroll {
          display: flex;
          gap: 6px;
          padding: 10px 16px;
          overflow-x: auto;
          scrollbar-width: none;
          border-bottom: 1px solid rgba(255,150,0,0.1);
          flex-shrink: 0;
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-btn {
          white-space: nowrap;
          padding: 6px 14px;
          border: 1.5px solid rgba(255,150,0,0.3);
          border-radius: 20px;
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .cat-btn.active, .cat-btn:hover {
          background: linear-gradient(135deg, #ff6b00, #cc2200);
          border-color: transparent;
          color: white;
          box-shadow: 0 3px 10px rgba(255,80,0,0.3);
        }
        .upgrades-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 16px;
          overflow-y: auto;
          flex: 1;
        }
        .upgrade-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,150,0,0.1);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .upgrade-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,150,0,0.03), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .upgrade-card:hover::before { opacity: 1; }
        .upgrade-card.affordable {
          border-color: rgba(255,200,0,0.3);
          box-shadow: 0 0 15px rgba(255,150,0,0.1);
        }
        .upgrade-card.affordable:hover {
          border-color: rgba(255,200,0,0.6);
          transform: translateX(4px);
          box-shadow: 0 0 25px rgba(255,150,0,0.2);
        }
        .upgrade-card.maxed {
          opacity: 0.6;
          border-color: rgba(100,255,100,0.2);
          cursor: default;
        }
        .upgrade-card.locked {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .upgrade-emoji { font-size: 32px; flex-shrink: 0; }
        .upgrade-info { flex: 1; min-width: 0; }
        .upgrade-name { font-weight: 700; color: white; font-size: 14px; margin-bottom: 2px; }
        .upgrade-desc { color: rgba(255,255,255,0.4); font-size: 11px; margin-bottom: 3px; }
        .upgrade-effect { color: rgba(255,200,100,0.8); font-size: 11px; font-weight: 600; }
        .upgrade-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .upgrade-level { display: flex; gap: 2px; flex-wrap: wrap; max-width: 60px; justify-content: flex-end; }
        .level-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.2); transition: background 0.2s; }
        .level-dot.filled { background: linear-gradient(135deg, #ff6b00, #ffcc00); }
        .upgrade-cost { font-size: 13px; font-weight: 800; }
        .cost-ok { color: #ffcc00; }
        .cost-no { color: rgba(255,255,255,0.3); }
        .maxed-label { color: #80ff90; font-size: 11px; }
        .locked-label { color: rgba(255,255,255,0.3); font-size: 11px; }
        .current-level { color: rgba(255,150,0,0.6); font-size: 10px; }
      `}</style>
    </div>
  );
}
