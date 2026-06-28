import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    return cred;
  };
  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    setUser(cred.user);
    return cred;
  };
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    setUser(cred.user);
    return cred;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
