"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/authContext';

type Mode = 'login' | 'register' | 'reset';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, resetPassword } = useAuth();

  const handle = async () => {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (!username.trim()) { setError('El nombre de usuario es obligatorio'); setLoading(false); return; }
        await register(email, password, username);
      } else {
        await resetPassword(email);
        setSuccess('¡Email de recuperación enviado! Revisa tu bandeja.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      if (msg.includes('user-not-found')) setError('Usuario no encontrado');
      else if (msg.includes('wrong-password')) setError('Contraseña incorrecta');
      else if (msg.includes('email-already-in-use')) setError('Email ya registrado');
      else if (msg.includes('weak-password')) setError('Contraseña muy débil (mín. 6 caracteres)');
      else setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-bg">
        <div className="flame flame-1" />
        <div className="flame flame-2" />
        <div className="flame flame-3" />
        {[...Array(20)].map((_, i) => (
          <div key={i} className="pizza-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${12 + Math.random() * 20}px`,
          }}>🍕</div>
        ))}
      </div>
      
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-oven">🍕</div>
          <h1 className="logo-title">PIZZA<span>CLICKER</span></h1>
          <p className="logo-sub">El Imperio de la Pizza</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
          >Entrar</button>
          <button 
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
          >Registro</button>
          <button 
            className={`auth-tab ${mode === 'reset' ? 'active' : ''}`}
            onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
          >Recuperar</button>
        </div>

        <div className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Nombre de Pizzero</label>
              <input 
                type="text" 
                placeholder="Tu apodo legendario..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="tu@pizzeria.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="form-input"
              onKeyDown={e => e.key === 'Enter' && handle()}
            />
          </div>
          
          {mode !== 'reset' && (
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                onKeyDown={e => e.key === 'Enter' && handle()}
              />
            </div>
          )}

          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}

          <button className="auth-btn" onClick={handle} disabled={loading}>
            {loading ? '⏳ Cargando...' : 
             mode === 'login' ? '🔥 ¡Entrar al Horno!' : 
             mode === 'register' ? '🍕 ¡Crear mi Pizzería!' : 
             '📧 Enviar Email'}
          </button>
        </div>

        <p className="auth-footer">
          Inicia sesión para guardar tu progreso en PizzaCity 🌍
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0005;
          font-family: 'Segoe UI', sans-serif;
        }
        .auth-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 100%, #3d0000 0%, #1a0010 40%, #0a0005 100%);
        }
        .pizza-particle {
          position: absolute;
          top: -30px;
          animation: fall linear infinite;
          opacity: 0.3;
        }
        @keyframes fall {
          to { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .flame {
          position: absolute;
          bottom: 0;
          width: 200px;
          height: 300px;
          border-radius: 50% 50% 30% 30%;
          filter: blur(40px);
          opacity: 0.4;
          animation: flicker 2s ease-in-out infinite alternate;
        }
        .flame-1 { left: 10%; background: #ff6b00; animation-delay: 0s; }
        .flame-2 { left: 50%; transform: translateX(-50%); background: #ff3300; animation-delay: 0.5s; height: 400px; }
        .flame-3 { right: 10%; background: #ff9500; animation-delay: 1s; }
        @keyframes flicker {
          from { transform: scaleX(1) scaleY(1); opacity: 0.3; }
          to { transform: scaleX(1.1) scaleY(1.1); opacity: 0.5; }
        }
        .auth-card {
          position: relative;
          z-index: 10;
          background: rgba(20, 5, 10, 0.92);
          border: 2px solid rgba(255, 100, 0, 0.4);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          margin: 20px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(255,80,0,0.2), inset 0 0 40px rgba(255,50,0,0.05);
        }
        .auth-logo { text-align: center; margin-bottom: 32px; }
        .logo-oven {
          font-size: 64px;
          animation: bounce 2s ease-in-out infinite;
          display: block;
          margin-bottom: 8px;
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .logo-title {
          font-size: 36px;
          font-weight: 900;
          color: #fff;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin: 0;
        }
        .logo-title span { color: #ff6b00; }
        .logo-sub {
          color: rgba(255,150,50,0.7);
          font-size: 13px;
          letter-spacing: 2px;
          margin: 4px 0 0;
        }
        .auth-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 4px;
        }
        .auth-tab {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .auth-tab.active {
          background: linear-gradient(135deg, #ff6b00, #ff3300);
          color: white;
          box-shadow: 0 4px 12px rgba(255,80,0,0.4);
        }
        .auth-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { color: rgba(255,200,100,0.8); font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .form-input {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,100,0,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          color: white;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(255,150,0,0.8); box-shadow: 0 0 20px rgba(255,100,0,0.15); }
        .form-input::placeholder { color: rgba(255,255,255,0.3); }
        .auth-error { background: rgba(255,50,50,0.15); border: 1px solid rgba(255,50,50,0.4); border-radius: 8px; padding: 10px 14px; color: #ff8080; font-size: 13px; }
        .auth-success { background: rgba(50,255,100,0.1); border: 1px solid rgba(50,255,100,0.3); border-radius: 8px; padding: 10px 14px; color: #80ff90; font-size: 13px; }
        .auth-btn {
          background: linear-gradient(135deg, #ff6b00 0%, #cc2200 100%);
          border: none;
          border-radius: 12px;
          padding: 14px;
          color: white;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 1px;
          transition: all 0.2s;
          margin-top: 8px;
          box-shadow: 0 6px 20px rgba(255,80,0,0.4);
        }
        .auth-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(255,80,0,0.5); }
        .auth-btn:active { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-footer { text-align: center; color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 20px; }
      `}</style>
    </div>
  );
}
