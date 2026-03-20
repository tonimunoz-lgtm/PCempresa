"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { LEVELS } from '@/lib/gameData';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export default function PizzaClicker() {
  const { pizzas, totalPizzas, pizzasPerClick, pizzasPerSecond, level, xp, clickCombo, comboMultiplier, clickPizza, addPassiveIncome } = useGameStore();
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [ovenGlow, setOvenGlow] = useState(0);
  const floaterIdRef = useRef(0);
  const ovenRef = useRef<HTMLDivElement>(null);

  // Passive income
  useEffect(() => {
    if (pizzasPerSecond <= 0) return;
    const interval = setInterval(() => {
      addPassiveIncome(pizzasPerSecond / 20);
    }, 50);
    return () => clearInterval(interval);
  }, [pizzasPerSecond, addPassiveIncome]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    clickPizza();
    setIsPressed(true);
    setOvenGlow(prev => Math.min(prev + 10, 100));
    setTimeout(() => setIsPressed(false), 100);
    setTimeout(() => setOvenGlow(prev => Math.max(prev - 5, 0)), 200);

    const rect = ovenRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = ++floaterIdRef.current;
      const gained = Math.floor(pizzasPerClick * comboMultiplier);
      
      let text = `+${gained} 🍕`;
      let color = '#ffcc00';
      
      if (comboMultiplier >= 2) { text = `🔥 COMBO x${Math.floor(comboMultiplier)}! +${gained} 🍕`; color = '#ff6b00'; }
      else if (comboMultiplier >= 1.5) { color = '#ff9500'; }
      
      setFloaters(prev => [...prev, { id, x, y, text, color }]);
      setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 1200);
    }
  }, [clickPizza, pizzasPerClick, comboMultiplier]);

  const currentLevel = LEVELS.find(l => l.level === level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === level + 1);
  const xpProgress = nextLevel ? ((xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100 : 100;

  const formatNum = (n: number) => {
    if (n >= 1e12) return `${(n/1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n/1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n/1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return Math.floor(n).toString();
  };

  return (
    <div className="clicker-area">
      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-icon">🍕</span>
          <div>
            <div className="stat-value">{formatNum(pizzas)}</div>
            <div className="stat-label">Pizzas</div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⚡</span>
          <div>
            <div className="stat-value">{formatNum(pizzasPerClick)}</div>
            <div className="stat-label">Por click</div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏱️</span>
          <div>
            <div className="stat-value">{formatNum(pizzasPerSecond)}/s</div>
            <div className="stat-label">Pasivo</div>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div>
            <div className="stat-value">{formatNum(totalPizzas)}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      {/* Level bar */}
      <div className="level-section">
        <div className="level-info">
          <span className="level-badge">Nv.{level}</span>
          <span className="level-title">{currentLevel.title}</span>
          {clickCombo > 5 && (
            <span className="combo-badge">🔥 COMBO x{clickCombo}</span>
          )}
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar" style={{ width: `${Math.min(xpProgress, 100)}%` }} />
          <span className="xp-text">{Math.floor(xp)} XP {nextLevel ? `/ ${nextLevel.xpRequired}` : '(MAX)'}</span>
        </div>
      </div>

      {/* OVEN */}
      <div className="oven-container" ref={ovenRef}>
        <div className="oven-glow" style={{ opacity: ovenGlow / 100, transform: `scale(${1 + ovenGlow/400})` }} />
        
        <div className={`oven-wrapper ${isPressed ? 'pressed' : ''}`} onClick={handleClick}>
          {/* Italian wood-fired oven illustration */}
          <div className="oven-body">
            <div className="oven-arch" />
            <div className="oven-mouth">
              <div className="oven-fire">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="fire-tongue" style={{
                    height: `${30 + Math.random() * 40}px`,
                    left: `${i * 12.5}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${0.3 + Math.random() * 0.4}s`,
                  }} />
                ))}
              </div>
              <div className="oven-interior" />
            </div>
            <div className="oven-base" />
            <div className="oven-chimney">
              <div className="smoke" />
              <div className="smoke smoke-2" />
            </div>
            <div className="oven-stones">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="stone" />
              ))}
            </div>
            <div className="oven-label">FORNO NAPOLETANO</div>
          </div>
          
          {/* Pizza on paddle */}
          <div className={`pizza-paddle ${isPressed ? 'going-in' : ''}`}>
            <div className="paddle-handle" />
            <div className="pizza-on-paddle">
              🍕
            </div>
          </div>
        </div>

        {/* Floating texts */}
        {floaters.map(f => (
          <div 
            key={f.id} 
            className="floater"
            style={{ left: f.x, top: f.y, color: f.color }}
          >
            {f.text}
          </div>
        ))}

        <div className="click-hint">
          {clickCombo > 5 
            ? `🔥 ¡COMBO! x${comboMultiplier.toFixed(1)} multiplicador` 
            : '¡Haz click para hacer pizzas!'}
        </div>
      </div>

      <style jsx>{`
        .clicker-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px 16px;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
        }
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          width: 100%;
        }
        .stat-item {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,150,0,0.2);
          border-radius: 12px;
          padding: 10px 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stat-icon { font-size: 20px; }
        .stat-value { font-size: 14px; font-weight: 800; color: #ffcc00; line-height: 1; }
        .stat-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .level-section { width: 100%; }
        .level-info { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
        .level-badge {
          background: linear-gradient(135deg, #ff6b00, #cc2200);
          color: white; font-weight: 900; font-size: 12px;
          padding: 4px 10px; border-radius: 20px;
          box-shadow: 0 2px 8px rgba(255,80,0,0.4);
        }
        .level-title { color: rgba(255,200,100,0.9); font-size: 13px; font-weight: 600; }
        .combo-badge {
          background: linear-gradient(135deg, #ff9500, #ff3300);
          color: white; font-weight: 900; font-size: 11px;
          padding: 3px 10px; border-radius: 20px;
          animation: pulse 0.5s ease-in-out infinite alternate;
          box-shadow: 0 0 15px rgba(255,100,0,0.5);
        }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
        .xp-bar-container {
          background: rgba(255,255,255,0.08);
          border-radius: 8px;
          height: 18px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,150,0,0.15);
        }
        .xp-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff6b00, #ffcc00);
          border-radius: 8px;
          transition: width 0.3s ease;
        }
        .xp-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }
        .oven-container {
          position: relative;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .oven-glow {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,120,0,0.6) 0%, transparent 70%);
          pointer-events: none;
          transition: all 0.1s;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
        }
        .oven-wrapper {
          position: relative;
          cursor: pointer;
          transition: transform 0.1s;
          z-index: 1;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .oven-wrapper:hover { transform: scale(1.02); }
        .oven-wrapper.pressed { transform: scale(0.96); }
        .oven-body {
          position: relative;
          width: 300px;
          height: 260px;
        }
        .oven-arch {
          position: absolute;
          width: 300px;
          height: 200px;
          top: 0;
          background: linear-gradient(180deg, #8B4513 0%, #6B3410 30%, #5C2A0E 60%, #7a3a1a 100%);
          border-radius: 150px 150px 0 0;
          box-shadow: 
            inset 0 -20px 40px rgba(0,0,0,0.4),
            inset 0 10px 30px rgba(255,150,50,0.15),
            0 4px 20px rgba(0,0,0,0.5);
        }
        .oven-mouth {
          position: absolute;
          width: 160px;
          height: 100px;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          background: #1a0500;
          border-radius: 80px 80px 0 0;
          overflow: hidden;
          box-shadow: inset 0 0 30px rgba(255,80,0,0.3), 0 0 20px rgba(255,80,0,0.2);
        }
        .oven-interior {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 80%, rgba(255,100,0,0.4) 0%, transparent 70%);
        }
        .oven-fire {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50px;
          display: flex;
          align-items: flex-end;
        }
        .fire-tongue {
          position: absolute;
          width: 12%;
          bottom: 0;
          background: linear-gradient(to top, #ff6b00, #ffcc00, transparent);
          border-radius: 50% 50% 30% 30%;
          animation: flameWave ease-in-out infinite alternate;
          transform-origin: bottom center;
        }
        @keyframes flameWave {
          from { transform: scaleX(0.8) scaleY(0.9); }
          to { transform: scaleX(1.2) scaleY(1.1); }
        }
        .oven-base {
          position: absolute;
          bottom: 20px;
          width: 100%;
          height: 80px;
          background: linear-gradient(180deg, #6B3410 0%, #4a2008 100%);
          border-radius: 0 0 20px 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.5);
        }
        .oven-chimney {
          position: absolute;
          top: -30px;
          right: 40px;
          width: 30px;
          height: 60px;
          background: linear-gradient(180deg, #6B3410, #8B4513);
          border-radius: 4px 4px 0 0;
          overflow: visible;
        }
        .smoke {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          background: rgba(200,200,200,0.3);
          border-radius: 50%;
          animation: smokeRise 2s ease-in-out infinite;
        }
        .smoke-2 { animation-delay: 1s; opacity: 0.5; }
        @keyframes smokeRise {
          0% { transform: translateX(-50%) translateY(0) scale(1); opacity: 0.4; }
          100% { transform: translateX(-30px) translateY(-60px) scale(3); opacity: 0; }
        }
        .oven-stones {
          position: absolute;
          bottom: 80px;
          left: 20px;
          right: 20px;
          display: flex;
          gap: 4px;
          justify-content: center;
        }
        .stone {
          width: 35px;
          height: 18px;
          background: linear-gradient(180deg, #888 0%, #555 100%);
          border-radius: 8px;
          box-shadow: inset 0 -2px 4px rgba(0,0,0,0.3);
        }
        .oven-label {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,220,150,0.7);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .pizza-paddle {
          position: absolute;
          bottom: 40px;
          left: -40px;
          display: flex;
          align-items: center;
          gap: 0;
          transform-origin: right center;
          transition: transform 0.15s ease;
          pointer-events: none;
        }
        .pizza-paddle.going-in {
          transform: translateX(60px) scaleX(0.7);
        }
        .paddle-handle {
          width: 80px;
          height: 8px;
          background: linear-gradient(90deg, #8B4513, #6B3410);
          border-radius: 4px;
        }
        .pizza-on-paddle {
          font-size: 36px;
          animation: pizzaSpin 8s linear infinite;
          filter: drop-shadow(0 0 10px rgba(255,150,0,0.5));
        }
        @keyframes pizzaSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .floater {
          position: absolute;
          font-weight: 900;
          font-size: 16px;
          pointer-events: none;
          animation: floatUp 1.2s ease-out forwards;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          z-index: 20;
          white-space: nowrap;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
        }
        .click-hint {
          margin-top: 12px;
          color: rgba(255,200,100,0.5);
          font-size: 12px;
          text-align: center;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}
