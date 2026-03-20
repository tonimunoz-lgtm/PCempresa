import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkhLFKvgo-iPlHmHau-nxIysdnqp5ZdmI",
  authDomain: "clicker-ea94f.firebaseapp.com",
  projectId: "clicker-ea94f",
  storageBucket: "clicker-ea94f.firebasestorage.app",
  messagingSenderId: "873459350629",
  appId: "1:873459350629:web:813bb901d6e928c8e8da8c"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
