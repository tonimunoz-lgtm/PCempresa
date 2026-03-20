"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useGameStore } from '@/lib/gameStore';
import { useAuth } from '@/lib/authContext';

interface CityPlayer {
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

const GRID_W = 16;
const GRID_H = 12;

// City layout: 0=road, 1=block, 2=park, 3=plaza
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
  [1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
];

const getTileColor = (type: number) => {
  switch(type) {
    case 0: return '#3a3520'; // road
    case 1: return '#1a2a1a'; // building block  
    case 2: return '#1a3520'; // park
    case 3: return '#2a2515'; // plaza
    default: return '#1a2a1a';
  }
};

export default function PizzaCity() {
  const [players, setPlayers] = useState<CityPlayer[]>([]);
  const [selected, setSelected] = useState<CityPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{x:number,y:number}|null>(null);
  const { level, cityPosition } = useGameStore();
  const { user, username } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'city'));
        const data: CityPlayer[] = [];
        snap.forEach(doc => data.push(doc.data() as CityPlayer));
        setPlayers(data);
      } catch {
        // Offline fallback with mock data
        setPlayers([
          { userId: 'demo1', username: 'PizzaKing', x: 3, y: 1, level: 8, reputation: 500, pizzasSold: 50000, upgrades: ['oven_2','staff_2'], lastActive: Date.now() },
          { userId: 'demo2', username: 'ItalyBoss', x: 9, y: 4, level: 5, reputation: 200, pizzasSold: 20000, upgrades: ['oven_1'], lastActive: Date.now() - 3600000 },
          { userId: 'demo3', username: 'MozzaMaster', x: 13, y: 7, level: 3, reputation: 80, pizzasSold: 5000, upgrades: [], lastActive: Date.now() - 86400000 },
        ]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getPlayerAtCell = (x: number, y: number) => players.find(p => p.x === x && p.y === y);
  const getMyPlayer = () => players.find(p => p.userId === user?.uid);

  const getLevelColor = (lvl: number) => {
    if (lvl >= 12) return '#ff00ff';
    if (lvl >= 10) return '#ff6b00';
    if (lvl >= 7) return '#ffcc00';
    if (lvl >= 4) return '#00ff88';
    return '#aaaaaa';
  };

  const getCellSize = () => {
    if (typeof window !== 'undefined') {
      return Math.min(Math.floor((window.innerWidth - 64) / GRID_W), 52);
    }
    return 44;
  };

  const cellSize = getCellSize();

  const formatNum = (n: number) => {
    if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="city-view">
      <div className="city-header">
        <h2 className="city-title">🌆 PizzaCity</h2>
        <p className="city-sub">El corazón del imperio pizzero mundial</p>
      </div>

      {loading ? (
        <div className="city-loading">
          <div className="loading-pizza">🍕</div>
          <p>Construyendo la ciudad...</p>
        </div>
      ) : (
        <>
          <div className="city-map-container">
            <div 
              className="city-grid"
              style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_W}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${GRID_H}, ${cellSize}px)`,
                gap: '2px',
              }}
            >
              {CITY_LAYOUT.map((row, y) => 
                row.map((tile, x) => {
                  const player = getPlayerAtCell(x, y);
                  const isMe = player?.userId === user?.uid;
                  const isMyPos = cityPosition?.x === x && cityPosition?.y === y && !player;
                  const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
                  const isSelected = selected?.x === x && selected?.y === y;

                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`city-cell ${tile === 0 ? 'road' : ''} ${player ? 'has-player' : ''} ${isMe ? 'is-me' : ''} ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        background: player 
                          ? `radial-gradient(circle, ${getLevelColor(player.level)}22, ${getTileColor(tile)})` 
                          : getTileColor(tile),
                        border: isMe ? `2px solid ${getLevelColor(player!.level)}` : 
                                isSelected ? '2px solid white' :
                                tile === 0 ? '1px solid #4a4530' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: tile !== 0 ? '4px' : '2px',
                        position: 'relative',
                        cursor: player ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={() => setHoveredCell({x, y})}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={() => player && setSelected(player)}
                    >
                      {tile === 2 && !player && (
                        <span style={{ fontSize: cellSize * 0.4, lineHeight: `${cellSize}px`, display: 'block', textAlign: 'center' }}>🌳</span>
                      )}
                      {tile === 3 && !player && (
                        <span style={{ fontSize: cellSize * 0.4, lineHeight: `${cellSize}px`, display: 'block', textAlign: 'center' }}>⛲</span>
                      )}
                      {tile === 1 && !player && !isMyPos && (
                        <div style={{
                          position: 'absolute', inset: '3px',
                          background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`,
                          borderRadius: '3px',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }} />
                      )}
                      {player && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                        }}>
                          <span style={{ fontSize: Math.max(cellSize * 0.35, 14), lineHeight: 1 }}>🍕</span>
                          <span style={{ 
                            fontSize: Math.max(cellSize * 0.18, 8),
                            color: getLevelColor(player.level),
                            fontWeight: 900,
                            lineHeight: 1,
                            textShadow: '0 1px 3px black',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                          }}>
                            {player.username.substring(0,6)}
                          </span>
                          {isMe && (
                            <span style={{ fontSize: 8, color: '#ffcc00', lineHeight: 1 }}>YO</span>
                          )}
                        </div>
                      )}
                      {isMyPos && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(255,200,0,0.05)',
                          border: '2px dashed rgba(255,200,0,0.4)',
                          borderRadius: '4px',
                        }}>
                          <span style={{ fontSize: cellSize * 0.3 }}>📍</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="city-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#aaaaaa' }} />
                <span>Principiante</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#00ff88' }} />
                <span>Nv. 4+</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#ffcc00' }} />
                <span>Nv. 7+</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#ff6b00' }} />
                <span>Nv. 10+</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#ff00ff' }} />
                <span>Élite</span>
              </div>
            </div>
          </div>

          {/* Player details panel */}
          {selected && (
            <div className="player-panel" onClick={() => setSelected(null)}>
              <div className="panel-card" onClick={e => e.stopPropagation()}>
                <button className="panel-close" onClick={() => setSelected(null)}>✕</button>
                <div className="panel-header">
                  <span className="panel-pizza">🍕</span>
                  <div>
                    <div className="panel-name">{selected.username}</div>
                    <div className="panel-level" style={{ color: getLevelColor(selected.level) }}>
                      Nivel {selected.level}
                    </div>
                  </div>
                </div>
                <div className="panel-stats">
                  <div className="panel-stat">
                    <span>⭐ Reputación</span>
                    <strong>{selected.reputation}</strong>
                  </div>
                  <div className="panel-stat">
                    <span>🍕 Pizzas vendidas</span>
                    <strong>{formatNum(selected.pizzasSold)}</strong>
                  </div>
                  <div className="panel-stat">
                    <span>🏪 Mejoras activas</span>
                    <strong>{selected.upgrades.length}</strong>
                  </div>
                  <div className="panel-stat">
                    <span>📅 Última conexión</span>
                    <strong>{Date.now() - selected.lastActive < 3600000 ? '< 1h' : 
                             Date.now() - selected.lastActive < 86400000 ? '< 24h' : 'Hace días'}</strong>
                  </div>
                </div>
                {level >= 10 && selected.userId !== user?.uid && (
                  <div className="panel-pvp">
                    <div className="pvp-title">⚔️ Acciones PvP (Nv.10+)</div>
                    <div className="pvp-buttons">
                      <button className="pvp-btn sabotage">🔥 Contratar pirómano</button>
                      <button className="pvp-btn steal">💧 Sabotear cañerías</button>
                      <button className="pvp-btn spy">🕵️ Espiar negocio</button>
                    </div>
                    <p className="pvp-note">⚠️ PvP completo en próxima actualización</p>
                  </div>
                )}
                {selected.userId === user?.uid && (
                  <div className="panel-me-note">👑 ¡Esta es tu pizzería!</div>
                )}
              </div>
            </div>
          )}

          {/* Players list */}
          <div className="players-list">
            <h3 className="players-title">🏆 Ranking de PizzaCity</h3>
            <div className="players-scroll">
              {[...players].sort((a,b) => b.pizzasSold - a.pizzasSold).map((p, i) => (
                <div 
                  key={p.userId} 
                  className={`player-row ${p.userId === user?.uid ? 'is-me' : ''}`}
                  onClick={() => setSelected(p)}
                >
                  <span className="rank-num">#{i+1}</span>
                  <span className="rank-emoji">🍕</span>
                  <span className="rank-name">{p.username}</span>
                  <span className="rank-level" style={{ color: getLevelColor(p.level) }}>Nv.{p.level}</span>
                  <span className="rank-pizzas">{formatNum(p.pizzasSold)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .city-view { display: flex; flex-direction: column; height: 100%; overflow-y: auto; padding: 0 0 20px; }
        .city-header { padding: 16px 20px 8px; border-bottom: 1px solid rgba(255,150,0,0.15); }
        .city-title { margin: 0; font-size: 20px; font-weight: 900; color: #ffcc00; }
        .city-sub { margin: 4px 0 0; color: rgba(255,255,255,0.4); font-size: 12px; }
        .city-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 12px; padding: 60px; color: rgba(255,255,255,0.5); }
        .loading-pizza { font-size: 48px; animation: spin 2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .city-map-container { padding: 16px; overflow-x: auto; }
        .city-grid { margin: 0 auto; }
        .city-legend { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; padding: 0 4px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.5); }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .player-panel {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        }
        .panel-card {
          background: #110810;
          border: 2px solid rgba(255,150,0,0.4);
          border-radius: 20px;
          padding: 24px;
          width: 300px;
          max-width: 90vw;
          position: relative;
          box-shadow: 0 0 60px rgba(255,80,0,0.3);
        }
        .panel-close { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.1); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px; }
        .panel-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .panel-pizza { font-size: 48px; }
        .panel-name { font-size: 22px; font-weight: 900; color: white; }
        .panel-level { font-size: 14px; font-weight: 700; }
        .panel-stats { display: flex; flex-direction: column; gap: 10px; }
        .panel-stat { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: rgba(255,255,255,0.6); }
        .panel-stat strong { color: white; }
        .panel-pvp { margin-top: 20px; }
        .pvp-title { font-size: 14px; font-weight: 700; color: #ff6b00; margin-bottom: 10px; }
        .pvp-buttons { display: flex; flex-direction: column; gap: 8px; }
        .pvp-btn { padding: 10px; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .pvp-btn.sabotage { background: rgba(255,50,50,0.2); color: #ff8080; border: 1px solid rgba(255,50,50,0.3); }
        .pvp-btn.steal { background: rgba(50,150,255,0.2); color: #80c0ff; border: 1px solid rgba(50,150,255,0.3); }
        .pvp-btn.spy { background: rgba(150,50,255,0.2); color: #c080ff; border: 1px solid rgba(150,50,255,0.3); }
        .pvp-note { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 8px; text-align: center; }
        .panel-me-note { text-align: center; margin-top: 16px; color: #ffcc00; font-weight: 700; font-size: 14px; }
        .players-list { padding: 0 16px; margin-top: 16px; }
        .players-title { font-size: 16px; font-weight: 900; color: #ffcc00; margin: 0 0 10px; }
        .players-scroll { display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto; }
        .player-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,150,0,0.1);
          cursor: pointer; transition: all 0.2s;
          font-size: 13px;
        }
        .player-row:hover { background: rgba(255,150,0,0.08); }
        .player-row.is-me { border-color: rgba(255,200,0,0.3); background: rgba(255,200,0,0.05); }
        .rank-num { color: rgba(255,255,255,0.3); font-size: 11px; width: 24px; }
        .rank-emoji { font-size: 16px; }
        .rank-name { flex: 1; font-weight: 600; color: white; }
        .rank-level { font-size: 11px; font-weight: 700; }
        .rank-pizzas { color: rgba(255,200,100,0.8); font-weight: 700; font-size: 12px; }
      `}</style>
    </div>
  );
}
