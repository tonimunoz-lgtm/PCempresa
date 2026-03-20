"use client";
import { useAuth, AuthProvider } from "@/lib/authContext";
import AuthScreen from "@/components/AuthScreen";
import GameLayout from "@/components/GameLayout";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070408',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ fontSize: '64px', animation: 'spin 2s linear infinite' }}>🍕</div>
        <div style={{ color: 'rgba(255,150,50,0.7)', fontSize: '16px', letterSpacing: '3px' }}>
          CARGANDO...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <AuthScreen />;
  return <GameLayout />;
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
