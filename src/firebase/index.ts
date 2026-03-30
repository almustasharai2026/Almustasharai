'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 🔥 Sovereign Singleton Cache
// Preventing "Internal Assertion Failed" by caching instances at module level
let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedDb: Firestore | undefined;

/**
 * دالة التهيئة السيادية: تضمن عدم تكرار النداءات لخدمات Firebase
 * وتوفر وصولاً آمناً ومستقراً لكافة مكونات النظام البيئي.
 */
export function initializeFirebase() {
  if (!cachedApp) {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  if (!cachedAuth) {
    cachedAuth = getAuth(cachedApp);
  }

  if (!cachedDb) {
    cachedDb = getFirestore(cachedApp);
  }

  return {
    firebaseApp: cachedApp,
    auth: cachedAuth,
    firestore: cachedDb
  };
}

// تصدير الخدمات والخطافات السيادية
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './error-emitter';
export * from './errors';
