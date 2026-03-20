"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useGameStore } from '@/lib/gameStore';
import PizzaClicker from './PizzaClicker';
import Shop from './Shop';
import PizzaCity from './PizzaCity';
import ProfilePanel from './ProfilePanel';
import EventSystem from './EventSystem';
import LevelUpNotification from './LevelUpNotification';

type Tab = 'clicker' | 'shop' | 'city';

export default function GameLayout() {
  const [tab, setTab] = useState<Tab>('clicker');
  const [showProfile, setShowProfile] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const { username, saveGame } = useAuth();
  const { pizzas, level, pizzasPerSecond } = useGameStore();

  // Auto-save every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await saveGame();
      setSaveIndicator(true);
      setTimeout(() => setSaveIndicator(false), 2000);
    }, 60000);
    return () => clearInterval(interval);
  }, [saveGame]);

  const formatNum = (n: number) => {
    if (n >= 1e9) return `${(n/1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return Math.floor(n).toString();
  };

  return (
    <div className="game-root">
      {/* Background */}
      <div className="game-bg">
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="bg-pattern" />
      </div>

      {/* Top navbar */}
      <nav className="top-nav">
        <div className="nav-brand">
          <span className="brand-emoji">🍕</span>
          <span className="brand-name">PIZZA<b>CLICKER</b></span>
        </div>
        <div className="nav-center">
          <div className="quick-stat">
            <span className="qs-icon">🍕</span>
            <span className="qs-value">{formatNum(pizzas)}</span>
          </div>
          {pizzasPerSecond > 0 && (
            <div className="quick-stat passive">
              <span className="qs-icon">⚡</span>
              <span className="qs-value">+{formatNum(pizzasPerSecond)}/s</span>
            </div>
          )}
          {saveIndicator && <span className="save-flash">☁️ guardado</span>}
        </div>
        <button className="profile-btn" onClick={() => setShowProfile(true)}>
          <span className="profile-avatar-sm">🍕</span>
          <span className="profile-name-sm">{username}</span>
          <span className="profile-lv">Nv.{level}</span>
        </button>
      </nav>

      {/* Main content */}
      <main className="game-main">
        <div className={`tab-content ${tab === 'clicker' ? 'visible' : 'hidden'}`}>
          <PizzaClicker />
        </div>
        <div className={`tab-content shop-content ${tab === 'shop' ? 'visible' : 'hidden'}`}>
          <Shop />
        </div>
        <div className={`tab-content ${tab === 'city' ? 'visible' : 'hidden'}`}>
          <PizzaCity />
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav className="bottom-nav">
        <button 
          className={`bnav-btn ${tab === 'clicker' ? 'active' : ''}`}
          onClick={() => setTab('clicker')}
        >
          <span className="bnav-icon">🔥</span>
          <span className="bnav-label">Horno</span>
        </button>
        <button 
          className={`bnav-btn ${tab === 'shop' ? 'active' : ''}`}
          onClick={() => setTab('shop')}
        >
          <span className="bnav-icon">🏪</span>
          <span className="bnav-label">Tienda</span>
        </button>
        <button 
          className={`bnav-btn ${tab === 'city' ? 'active' : ''}`}
          onClick={() => setTab('city')}
        >
          <span className="bnav-icon">🌆</span>
          <span className="bnav-label">PizzaCity</span>
        </button>
      </nav>

      {/* Overlays */}
      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
      <EventSystem />
      <LevelUpNotification />

      <style jsx>{`
        .game-root {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background: #070408;
          color: white;
          font-family: 'Segoe UI', system-ui, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .game-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
        }
        .bg-glow-1 {
          width: 600px; height: 600px;
          background: #ff4400;
          top: -200px; left: -200px;
          animation: drift1 8s ease-in-out infinite alternate;
        }
        .bg-glow-2 {
          width: 500px; height: 500px;
          background: #ff0080;
          bottom: -100px; right: -100px;
          animation: drift2 10s ease-in-out infinite alternate;
        }
        @keyframes drift1 { to { transform: translate(80px, 60px); } }
        @keyframes drift2 { to { transform: translate(-60px, -80px); } }
        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(rgba(255,100,0,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .top-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(0,0,0,0.5);
          border-bottom: 1px solid rgba(255,150,0,0.15);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
          gap: 8px;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .brand-emoji { font-size: 22px; }
        .brand-name {
          font-size: 15px;
          font-weight: 400;
          color: rgba(255,200,100,0.9);
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .brand-name b { color: #ff6b00; font-weight: 900; }
        .nav-center {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: center;
        }
        .quick-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,150,0,0.2);
          border-radius: 20px;
          padding: 6px 14px;
        }
        .quick-stat.passive { border-color: rgba(0,200,255,0.2); }
        .qs-icon { font-size: 14px; }
        .qs-value { font-size: 14px; font-weight: 800; color: #ffcc00; }
        .quick-stat.passive .qs-value { color: #88ddff; }
        .save-flash {
          font-size: 11px;
          color: rgba(100,255,150,0.7);
          animation: fadeInOut 2s ease;
        }
        @keyframes fadeInOut { 0%,100% { opacity:0; } 30%,70% { opacity:1; } }
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,150,0,0.1);
          border: 1.5px solid rgba(255,150,0,0.3);
          border-radius: 20px;
          padding: 6px 12px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .profile-btn:hover { background: rgba(255,150,0,0.2); }
        .profile-avatar-sm { font-size: 16px; }
        .profile-name-sm {
          font-size: 12px;
          font-weight: 700;
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .profile-lv {
          font-size: 10px;
          color: #ff6b00;
          font-weight: 800;
          background: rgba(255,100,0,0.2);
          padding: 2px 6px;
          border-radius: 10px;
        }
        .game-main {
          position: relative;
          z-index: 1;
          flex: 1;
          overflow: hidden;
        }
        .tab-content {
          position: absolute;
          inset: 0;
          overflow-y: auto;
          transition: opacity 0.2s, transform 0.2s;
        }
        .tab-content.hidden {
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
        }
        .tab-content.visible {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .shop-content {
          display: flex;
          flex-direction: column;
        }
        .bottom-nav {
          position: relative;
          z-index: 10;
          display: flex;
          background: rgba(0,0,0,0.7);
          border-top: 1px solid rgba(255,150,0,0.15);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .bnav-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .bnav-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 25%;
          right: 25%;
          height: 2px;
          background: linear-gradient(90deg, #ff6b00, #ffcc00);
          border-radius: 0 0 4px 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .bnav-btn.active { color: white; }
        .bnav-btn.active::after { opacity: 1; }
        .bnav-icon { font-size: 24px; }
        .bnav-label { font-size: 10px; font-weight: 700; letter-spacing: 0.5px; }
        @media (min-width: 768px) {
          .game-root { max-width: 1200px; margin: 0 auto; }
          .top-nav { padding: 14px 24px; }
          .bottom-nav { display: none; }
          .game-main {
            display: grid;
            grid-template-columns: 480px 1fr;
            grid-template-rows: 1fr;
          }
          .tab-content { position: relative !important; opacity: 1 !important; pointer-events: all !important; transform: none !important; overflow-y: auto; }
          .tab-content:nth-child(1) { border-right: 1px solid rgba(255,150,0,0.1); }
          .tab-content:nth-child(2) { display: none; }
          .tab-content:nth-child(3) { display: none; }
        }
      `}</style>
    </div>
  );
}
