"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useGameStore } from '@/lib/gameStore';
import { LEVELS } from '@/lib/gameData';

export default function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { user, username, logout, changePassword, saveGame } = useAuth();
  const { level, xp, totalPizzas, reputation, pizzasPerClick, pizzasPerSecond, upgrades } = useGameStore();
  const [tab, setTab] = useState<'stats' | 'security'>('stats');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const currentLevel = LEVELS.find(l => l.level === level) || LEVELS[0];
  const unlockedUpgrades = upgrades.filter(u => u.level > 0).length;

  const formatNum = (n: number) => {
    if (n >= 1e9) return `${(n/1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n/1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return Math.floor(n).toString();
  };

  const handleSave = async () => {
    setSaving(true);
    await saveGame();
    setSaving(false);
    setMsg('✅ Partida guardada en la nube');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleChangePass = async () => {
    if (newPass.length < 6) { setMsg('⚠️ Mínimo 6 caracteres'); return; }
    if (newPass !== confirmPass) { setMsg('⚠️ Las contraseñas no coinciden'); return; }
    try {
      await changePassword(newPass);
      setMsg('✅ Contraseña actualizada');
      setNewPass(''); setConfirmPass('');
    } catch {
      setMsg('⚠️ Error. Puede que necesites re-iniciar sesión.');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div className="profile-header">
          <div className="profile-avatar">🍕</div>
          <div className="profile-info">
            <div className="profile-username">{username}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-title">{currentLevel.title}</div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="profile-tabs">
          <button className={`ptab ${tab === 'stats' ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 Stats</button>
          <button className={`ptab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>🔒 Seguridad</button>
        </div>

        {tab === 'stats' && (
          <div className="stats-content">
            <div className="stat-grid">
              <div className="stat-box">
                <div className="sb-value">{level}</div>
                <div className="sb-label">Nivel</div>
              </div>
              <div className="stat-box">
                <div className="sb-value">{formatNum(xp)}</div>
                <div className="sb-label">XP Total</div>
              </div>
              <div className="stat-box">
                <div className="sb-value">{formatNum(totalPizzas)}</div>
                <div className="sb-label">Pizzas hechas</div>
              </div>
              <div className="stat-box">
                <div className="sb-value">{reputation}</div>
                <div className="sb-label">Reputación</div>
              </div>
              <div className="stat-box">
                <div className="sb-value">{pizzasPerClick}</div>
                <div className="sb-label">🍕/click</div>
              </div>
              <div className="stat-box">
                <div className="sb-value">{formatNum(pizzasPerSecond)}</div>
                <div className="sb-label">🍕/segundo</div>
              </div>
              <div className="stat-box">
                <div className="sb-value">{unlockedUpgrades}</div>
                <div className="sb-label">Mejoras</div>
              </div>
            </div>

            <div className="next-unlock">
              {LEVELS.find(l => l.level === level + 1) && (
                <>
                  <div className="nu-label">Próximo desbloqueo (Nv.{level + 1}):</div>
                  <div className="nu-value">{LEVELS.find(l => l.level === level + 1)?.unlock}</div>
                </>
              )}
            </div>

            {msg && <div className="profile-msg">{msg}</div>}

            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? '⏳ Guardando...' : '☁️ Guardar partida en la nube'}
            </button>
          </div>
        )}

        {tab === 'security' && (
          <div className="security-content">
            <h3 className="sec-title">Cambiar contraseña</h3>
            <div className="sec-form">
              <input
                type="password"
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="sec-input"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className="sec-input"
              />
              {msg && <div className="profile-msg">{msg}</div>}
              <button className="save-btn" onClick={handleChangePass}>🔑 Cambiar contraseña</button>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={logout}>
          🚪 Cerrar sesión
        </button>
      </div>

      <style jsx>{`
        .profile-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(0,0,0,0.8);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .profile-panel {
          background: #0d0810;
          border: 2px solid rgba(255,150,0,0.35);
          border-radius: 24px;
          padding: 28px;
          width: 340px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 0 80px rgba(255,80,0,0.25);
        }
        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          position: relative;
        }
        .profile-avatar { font-size: 48px; }
        .profile-info { flex: 1; }
        .profile-username { font-size: 20px; font-weight: 900; color: white; }
        .profile-email { font-size: 12px; color: rgba(255,255,255,0.4); margin: 2px 0; }
        .profile-title { font-size: 12px; color: #ff6b00; font-weight: 700; }
        .close-btn { position: absolute; top: 0; right: 0; background: rgba(255,255,255,0.1); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; }
        .profile-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px; }
        .ptab { flex: 1; padding: 8px; border: none; border-radius: 7px; background: transparent; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 13px; font-weight: 600; }
        .ptab.active { background: linear-gradient(135deg, #ff6b00, #cc2200); color: white; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .stat-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,150,0,0.15); border-radius: 12px; padding: 12px 8px; text-align: center; }
        .sb-value { font-size: 18px; font-weight: 900; color: #ffcc00; }
        .sb-label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .next-unlock { background: rgba(255,150,0,0.08); border: 1px solid rgba(255,150,0,0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px; }
        .nu-label { font-size: 11px; color: rgba(255,200,100,0.6); margin-bottom: 4px; }
        .nu-value { font-size: 13px; color: rgba(255,200,100,0.9); font-weight: 700; }
        .profile-msg { background: rgba(255,200,100,0.1); border: 1px solid rgba(255,200,100,0.3); border-radius: 10px; padding: 10px 14px; color: rgba(255,200,100,0.9); font-size: 13px; margin-bottom: 12px; text-align: center; }
        .save-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #ff6b00, #cc2200); border: none; border-radius: 12px; color: white; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,80,0,0.4); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .sec-title { font-size: 16px; font-weight: 700; color: rgba(255,200,100,0.8); margin: 0 0 16px; }
        .sec-form { display: flex; flex-direction: column; gap: 12px; }
        .sec-input { background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,100,0,0.3); border-radius: 10px; padding: 12px 16px; color: white; font-size: 14px; outline: none; }
        .sec-input:focus { border-color: rgba(255,150,0,0.8); }
        .logout-btn { width: 100%; padding: 12px; background: rgba(255,50,50,0.15); border: 1.5px solid rgba(255,50,50,0.3); border-radius: 12px; color: #ff8080; font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 16px; transition: all 0.2s; }
        .logout-btn:hover { background: rgba(255,50,50,0.25); }
      `}</style>
    </div>
  );
}
