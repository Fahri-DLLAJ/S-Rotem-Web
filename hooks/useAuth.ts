"use client";
import { useEffect } from "react";
import { signIn, signOut, auth, onAuthStateChanged } from "@/lib/firebase";
import { useAppStore } from "@/store/appStore";

export function useAuth() {
  const { user, authLoading, setUser, setAuthLoading } = useAppStore();

  // Sync Firebase auth state into Zustand on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  async function login(email: string, password: string) {
    setAuthLoading(true);
    try {
      await signIn(email, password);
      // onAuthStateChanged above will update user + authLoading
    } catch (err) {
      setAuthLoading(false);
      throw err; // let the caller handle the error message
    }
  }

  async function logout() {
    await signOut();
    // onAuthStateChanged will set user to null
  }

  return { user, authLoading, login, logout };
}
