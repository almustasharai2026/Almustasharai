'use client';

import { Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * محرك تتبع الأحداث السيادي.
 */
export function trackEvent(db: Firestore, event: string, payload: any) {
  const analyticsRef = collection(db, "analytics");
  addDoc(analyticsRef, {
    event,
    data: payload,
    createdAt: serverTimestamp()
  }).catch(err => console.warn("[Analytics Protocol Silenced]", err.message));
}
