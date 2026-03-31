'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUser } from '@/firebase';

/**
 * سياق الهوية السيادية (Sovereign Identity Context).
 * يوفر وصولاً مركزياً لبيانات المواطن الرقمي وحالة اتصاله بالنظام البيئي.
 */
interface AuthContextType {
  user: any;
  profile: any;
  role: string;
  isUserLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, profile, role, isUserLoading } = useUser();

  return (
    <AuthContext.Provider value={{ user, profile, role, isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * خطاف الوصول للهوية السيادية.
 */
export function useSovereignAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSovereignAuth must be used within an AuthProvider');
  }
  return context;
}
