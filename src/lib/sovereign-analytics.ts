
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
 * بروتوكول تتبع الأحداث السيادي.
 * يقوم بتوثيق كافة النشاطات والتفاعلات داخل النظام لغايات التحليل والرقابة.
 * يتم التنفيذ بأسلوب "Non-blocking" لضمان عدم تأثر سرعة واجهة المستخدم.
 * 
 * @param db مثيل Firestore السيادي
 * @param event اسم الحدث البرمجي
 * @param data حمولة البيانات المرتبطة بالحدث
 */
export function trackSovereignEvent(db: Firestore, event: string, data: any): void {
  const analyticsRef = collection(db, "analytics");
  
  const eventPayload = {
    event,
    data,
    createdAt: serverTimestamp(),
  };

  // إرسال بيانات الحدث بأسلوب غير حاصر (Non-blocking)
  // لا نستخدم await هنا لضمان استجابة الواجهة فوراً
  addDoc(analyticsRef, eventPayload)
    .then((docRef) => {
      console.log(`[Sovereign Analytics] Event documented: ${event} (${docRef.id})`);
    })
    .catch(async (error) => {
      // إصدار خطأ سياقي في حال فشل بروتوكول التتبع (مثل انتهاء الصلاحيات)
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: analyticsRef.path,
        operation: 'create',
        requestResourceData: eventPayload,
      } satisfies SecurityRuleContext));
    });
}
