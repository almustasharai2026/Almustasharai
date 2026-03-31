'use client';

import { initializeFirebase } from '@/firebase';

/**
 * موديول الوصول السيادي لخدمات Firebase.
 */
const services = initializeFirebase();

export const app = services.firebaseApp;
export const auth = services.auth;
export const db = services.firestore;
