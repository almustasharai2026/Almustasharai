
'use client';

import { 
  Firestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * بروتوكول أرشفة القضايا السيادي.
 * يقوم بتوثيق الحالات القانونية في مسار /cases بأسلوب غير حاصر.
 * @param db مثيل Firestore
 * @param data بيانات القضية (userId, title, description, etc.)
 */
export function storeSovereignCase(db: Firestore, data: any): void {
  const casesRef = collection(db, "cases");
  
  const casePayload = {
    ...data,
    createdAt: serverTimestamp(),
    status: data.status || "open"
  };

  // إرسال البيانات بأسلوب غير حاصر (Non-blocking)
  // لا نستخدم await هنا لضمان استجابة الواجهة فوراً
  addDoc(casesRef, casePayload)
    .then((docRef) => {
      console.log(`[Sovereign Archive] Case documented successfully: ${docRef.id}`);
    })
    .catch(async (error) => {
      // إصدار خطأ سياقي في حال فشل البروتوكول (مثلاً بسبب قيود الصلاحيات)
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: casesRef.path,
        operation: 'create',
        requestResourceData: casePayload,
      } satisfies SecurityRuleContext));
    });
}
