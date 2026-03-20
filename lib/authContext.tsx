"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail, updatePassword, onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useGameStore } from './gameStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  saveGame: () => Promise<void>;
  username: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const gameStore = useGameStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUsername(data.username || '');
          // Load game state
          if (data.gameState) {
            gameStore.loadFromFirebase(data.gameState);
          }
        }
      }
      setLoading(false);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, uname: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const cityX = Math.floor(Math.random() * 14) + 1;
    const cityY = Math.floor(Math.random() * 10) + 1;
    
    await setDoc(doc(db, 'users', cred.user.uid), {
      username: uname,
      email,
      createdAt: Date.now(),
      gameState: null,
      cityPosition: { x: cityX, y: cityY },
    });
    
    await setDoc(doc(db, 'city', cred.user.uid), {
      userId: cred.user.uid,
      username: uname,
      x: cityX,
      y: cityY,
      level: 1,
      reputation: 0,
      pizzasSold: 0,
      upgrades: [],
      lastActive: Date.now(),
    });
    
    setUsername(uname);
  };

  const logout = async () => {
    await saveGame();
    await signOut(auth);
    setUsername('');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (newPassword: string) => {
    if (user) await updatePassword(user, newPassword);
  };

  const saveGame = async () => {
    if (!user) return;
    const state = useGameStore.getState();
    const saveData = {
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
    };
    
    await updateDoc(doc(db, 'users', user.uid), { gameState: saveData });
    await updateDoc(doc(db, 'city', user.uid), {
      level: state.level,
      reputation: state.reputation,
      pizzasSold: state.totalPizzas,
      upgrades: state.upgrades.filter(u => u.level > 0).map(u => u.id),
      lastActive: Date.now(),
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, changePassword, saveGame, username }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
