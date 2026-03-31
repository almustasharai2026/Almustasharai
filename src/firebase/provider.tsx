'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { roles, type UserRole } from '@/lib/roles';

export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  role: UserRole;
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
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(roles.USER);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // 🔥 Sovereign Safety Valve
    const safetyTimer = setTimeout(() => {
      setIsUserLoading(false);
    }, 3000);

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // 🔥 Sovereign Role Detection Protocol
        if (firebaseUser.email === 'bishoysamy390@gmail.com') {
          setRole(roles.ADMIN);
        } else if (firebaseUser.email?.includes("moderator")) {
          setRole(roles.MODERATOR);
        } else if (firebaseUser.email?.includes("consultant")) {
          setRole(roles.CONSULTANT);
        } else {
          setRole(roles.USER);
        }
      } else {
        setRole(roles.USER);
      }

      setIsUserLoading(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      unsubscribeAuth();
      clearTimeout(safetyTimer);
    };
  }, [auth]);

  // Real-time profile sync with Sovereign Shield
  useEffect(() => {
    if (!firestore || !user) {
      setProfile(null);
      return;
    }
    
    try {
      const unsub = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
        if (doc.exists()) setProfile(doc.data());
      }, (err) => {
        console.warn("Sovereign Profile sync paused:", err.message);
      });
      return () => unsub();
    } catch (e) {
      console.error("Firestore sync error:", e);
    }
  }, [firestore, user]);

  const contextValue = useMemo(() => ({
    firebaseApp,
    firestore,
    auth,
    user,
    role,
    isUserLoading,
    profile
  }), [firebaseApp, firestore, auth, user, role, isUserLoading, profile]);

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
    role: context?.role || roles.USER,
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
