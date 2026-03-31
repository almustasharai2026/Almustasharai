'use client';

import { Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * محرك تتبع الأحداث السيادي.
 * يقوم بتوثيق كافة النشاطات في مسار /analytics بأسلوب غير حاصر.
 */
export function trackEvent(db: Firestore, event: string, data: any): void {
  const analyticsRef = collection(db, "analytics");
  
  const eventPayload = {
    event,
    data,
    createdAt: serverTimestamp(),
  };

  // إرسال بيانات الحدث بأسلوب غير حاصر (Non-blocking)
  addDoc(analyticsRef, eventPayload)
    .catch(async (error) => {
      // إصدار خطأ سياقي في حال فشل بروتوكول التتبع
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: analyticsRef.path,
        operation: 'create',
        requestResourceData: eventPayload,
      } satisfies SecurityRuleContext));
    });
}
