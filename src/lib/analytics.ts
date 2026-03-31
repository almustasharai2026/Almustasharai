'use client';

import { Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * بروتوكول تتبع الأحداث السيادي (Non-blocking).
 */
export function trackEvent(db: Firestore, event: string, data: any): void {
  const analyticsRef = collection(db, "analytics");
  
  const payload = {
    event,
    data,
    createdAt: serverTimestamp(),
  };

  addDoc(analyticsRef, payload).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: analyticsRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
}
