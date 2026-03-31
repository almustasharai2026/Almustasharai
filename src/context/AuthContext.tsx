'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';

/**
 * سياق الهوية السيادية (Sovereign Identity Context).
 */
interface AuthContextType {
  user: any;
  profile: any;
  role: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, role, isUserLoading, signOut } = useUser();

  return (
    <AuthContext.Provider value={{ user, profile, role, loading: isUserLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
