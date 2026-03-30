'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
}

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  profile: any | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode; firebaseApp: FirebaseApp; firestore: Firestore; auth: Auth }> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
  });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // 🔥 صمام أمان لكسر حلقة التحميل (2 ثانية)
    const safetyTimer = setTimeout(() => {
      setUserAuthState(prev => ({ ...prev, isUserLoading: false }));
    }, 2500);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUserAuthState({ user: firebaseUser, isUserLoading: false });
      clearTimeout(safetyTimer);
    });

    return () => {
      unsubscribeAuth();
      clearTimeout(safetyTimer);
    };
  }, [auth]);

  // مزامنة الملف الشخصي اللحظية
  useEffect(() => {
    if (!firestore || !userAuthState.user) {
      setProfile(null);
      return;
    }
    const unsub = onSnapshot(doc(firestore, "users", userAuthState.user.uid), (doc) => {
      if (doc.exists()) setProfile(doc.data());
    });
    return () => unsub();
  }, [firestore, userAuthState.user]);

  const contextValue = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    user: userAuthState.user,
    isUserLoading: userAuthState.isUserLoading,
    profile
  }), [firebaseApp, firestore, auth, userAuthState, profile]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(FirebaseContext);
  return { 
    user: context?.user || null, 
    isUserLoading: context?.isUserLoading ?? true,
    profile: context?.profile || null
  };
};

export const useFirestore = () => useContext(FirebaseContext)?.firestore || null;
export const useAuth = () => useContext(FirebaseContext)?.auth || null;

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null) {
    (memoized as any).__memo = true;
  }
  return memoized;
}