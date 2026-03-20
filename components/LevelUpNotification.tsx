"use client";
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { LEVELS } from '@/lib/gameData';

export default function LevelUpNotification() {
  const { level } = useGameStore();
  const prevLevel = useRef(level);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);

  useEffect(() => {
    if (level > prevLevel.current) {
      setShowLevelUp(level);
      prevLevel.current = level;
      setTimeout(() => setShowLevelUp(null), 5000);
    }
  }, [level]);

  if (!showLevelUp) return null;

  const lvlData = LEVELS.find(l => l.level === showLevelUp);
  if (!lvlData) return null;

  return (
    <div className="levelup-overlay">
      <div className="levelup-card">
        <div className="levelup-stars">✨✨✨</div>
        <div className="levelup-badge">NIVEL {showLevelUp}</div>
        <div className="levelup-title">{lvlData.title}</div>
        <div className="levelup-unlock">
          <span className="unlock-label">🔓 Desbloqueado:</span>
          <span className="unlock-value">{lvlData.unlock}</span>
        </div>
        <button className="levelup-close" onClick={() => setShowLevelUp(null)}>¡Genial! 🍕</button>
      </div>

      <style jsx>{`
        .levelup-overlay {
          position: fixed;
          inset: 0;
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(6px);
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .levelup-card {
          background: linear-gradient(135deg, #1a0808, #0d0515);
          border: 3px solid #ff6b00;
          border-radius: 28px;
          padding: 40px 36px;
          text-align: center;
          max-width: 340px;
          width: 90%;
          box-shadow: 0 0 80px rgba(255,100,0,0.5), inset 0 0 40px rgba(255,50,0,0.1);
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popIn {
          from { transform: scale(0.5) rotate(-5deg); opacity: 0; }
          to { transform: scale(1) rotate(0); opacity: 1; }
        }
        .levelup-stars {
          font-size: 32px;
          animation: starSpin 1s ease-in-out infinite alternate;
          margin-bottom: 12px;
        }
        @keyframes starSpin { from { transform: rotate(-10deg) scale(0.9); } to { transform: rotate(10deg) scale(1.1); } }
        .levelup-badge {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b00, #ffcc00);
          color: #000;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 3px;
          padding: 6px 20px;
          border-radius: 20px;
          margin-bottom: 14px;
        }
        .levelup-title {
          font-size: 28px;
          font-weight: 900;
          color: white;
          margin-bottom: 20px;
          text-shadow: 0 0 20px rgba(255,150,50,0.5);
        }
        .levelup-unlock {
          background: rgba(255,150,0,0.1);
          border: 1px solid rgba(255,150,0,0.3);
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 24px;
        }
        .unlock-label { display: block; color: rgba(255,200,100,0.6); font-size: 12px; margin-bottom: 6px; }
        .unlock-value { color: #ffcc00; font-weight: 700; font-size: 15px; }
        .levelup-close {
          background: linear-gradient(135deg, #ff6b00, #cc2200);
          border: none;
          border-radius: 14px;
          padding: 14px 32px;
          color: white;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(255,80,0,0.4);
          transition: all 0.2s;
        }
        .levelup-close:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,80,0,0.5); }
      `}</style>
    </div>
  );
}
