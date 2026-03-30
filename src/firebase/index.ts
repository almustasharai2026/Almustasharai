'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * دالة التهيئة السيادية: تضمن عدم إعادة تهيئة النظام أكثر من مرة
 * وتوفر وصولاً آمناً لكافة الخدمات الأساسية.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      // محاولة التهيئة التلقائية عبر Firebase App Hosting
      firebaseApp = initializeApp();
    } catch (e) {
      // العودة لملف الإعدادات المحلي في حال فشل التهيئة التلقائية
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// تصدير المكونات والخطافات (Hooks) الأساسية
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
