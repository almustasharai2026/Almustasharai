'use client';

import { initializeFirebase } from '@/firebase';

/**
 * ملف الوصول السيادي لخدمات Firebase.
 * يقوم بتوفير النسخ الوحيدة (Singletons) من خدمات النظام لضمان الاستقرار.
 */
const services = initializeFirebase();

export const app = services.firebaseApp;
export const auth = services.auth;
export const db = services.firestore;
