
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { roles as ROLES_LIST, isOwner } from '@/lib/roles';

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
        // حماية سيادية فورية: التعرف على المالك قبل حتى جلب البيانات من الداتا بيز
        const initialRole = isOwner(firebaseUser.email) ? ROLES_LIST.ADMIN : ROLES_LIST.USER;
        
        setAuthState(prev => ({
          ...prev,
          user: firebaseUser,
          role: initialRole,
          isUserLoading: true // نبقى في حالة تحميل حتى نتأكد من البروفايل
        }));

        // مراقبة ملف المستخدم السيادي لحظياً
        const unsubscribeProfile = onSnapshot(doc(firestore, "users", firebaseUser.uid), (snap) => {
          const data = snap.data();
          let detectedRole = data?.role || initialRole;
          
          // تأكيد السلطة المطلقة للمالك
          if (isOwner(firebaseUser.email)) {
            detectedRole = ROLES_LIST.ADMIN;
          }

          setAuthState({
            user: firebaseUser,
            profile: data || null,
            role: detectedRole,
            isUserLoading: false,
            userError: null
          });
        }, (err) => {
          console.error("Sovereign Profile Sync Error:", err);
          setAuthState(prev => ({ 
            ...prev, 
            user: firebaseUser, 
            role: isOwner(firebaseUser.email) ? ROLES_LIST.ADMIN : (prev.role || ROLES_LIST.USER),
            isUserLoading: false, 
            userError: err 
          }));
        });

        return () => unsubscribeProfile();
      } else {
        setAuthState({ user: null, profile: null, role: ROLES_LIST.USER, isUserLoading: false, userError: null });
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
