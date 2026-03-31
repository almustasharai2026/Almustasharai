
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { roles as ROLES_LIST, checkSovereignStatus, SOVEREIGN_ADMIN_EMAIL } from '@/lib/roles';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  profile: any | null;
  role: string;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  signOut: () => Promise<void>;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  // بروتوكول التأسيس الفوري للمالك king2026 لتجنب تعليق التحميل
  const [authState, setAuthState] = useState<UserAuthState>({
    user: null,
    profile: null,
    role: ROLES_LIST.USER,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const sovereign = checkSovereignStatus(firebaseUser.email);
        const initialRole = sovereign.isOwner ? ROLES_LIST.ADMIN : ROLES_LIST.USER;
        
        setAuthState(prev => ({
          ...prev,
          user: firebaseUser,
          role: initialRole,
          isUserLoading: true 
        }));

        const unsubscribeProfile = onSnapshot(doc(firestore, "users", firebaseUser.uid), (snap) => {
          const data = snap.data();
          let detectedRole = data?.role || initialRole;
          
          if (sovereign.isOwner) {
            detectedRole = ROLES_LIST.ADMIN;
          }

          setAuthState({
            user: firebaseUser,
            profile: data || (sovereign.isOwner ? { fullName: 'king2026', email: SOVEREIGN_ADMIN_EMAIL, balance: 999999 } : null),
            role: detectedRole,
            isUserLoading: false,
            userError: null
          });
        }, (err) => {
          setAuthState(prev => ({ 
            ...prev, 
            user: firebaseUser, 
            role: sovereign.isOwner ? ROLES_LIST.ADMIN : (prev.role || ROLES_LIST.USER),
            isUserLoading: false, 
            userError: err 
          }));
        });

        return () => unsubscribeProfile();
      } else {
        // في بيئة التطوير، إذا لم يكن هناك مستخدم، نقوم ببدء الهوية السيادية للمالك افتراضياً لتجنب الـ Access Denied
        setAuthState({ 
          user: null, 
          profile: null, 
          role: ROLES_LIST.USER, 
          isUserLoading: false, 
          userError: null 
        });
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  const contextValue = useMemo(() => ({
    ...authState,
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp,
    firestore,
    auth,
    signOut: () => firebaseSignOut(auth)
  }), [firebaseApp, firestore, auth, authState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return context;
};

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useUser = () => {
  const { user, profile, role, isUserLoading, userError, signOut } = useFirebase();
  return { user, profile, role, isUserLoading, userError, signOut };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  const memoized = useMemo(factory, deps);
  if (typeof memoized === 'object' && memoized !== null) {
    (memoized as any).__memo = true;
  }
  return memoized;
}
