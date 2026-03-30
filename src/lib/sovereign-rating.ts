
'use client';

import { 
  Firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  increment 
} from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * بروتوكول التقييم السيادي للخبراء.
 * يقوم بحساب المعدل التراكمي وتحديث ملف الخبير بأسلوب غير حاصر.
 */
export function rateSovereignConsultant(
  db: Firestore, 
  consultantId: string, 
  newRatingValue: number
): void {
  const consultantRef = doc(db, "consultants", consultantId);

  // جلب الحالة الراهنة للحساب
  getDoc(consultantRef).then((snap) => {
    if (!snap.exists()) return;

    const data = snap.data();
    const currentReviews = data.reviews || 0;
    const currentRating = data.rating || 5.0;

    // معادلة المعدل التراكمي السيادي
    const calculatedRating = (currentRating * currentReviews + newRatingValue) / (currentReviews + 1);

    // تحديث ملف الخبير
    updateDoc(consultantRef, {
      rating: Number(calculatedRating.toFixed(1)),
      reviews: increment(1)
    }).catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: consultantRef.path,
        operation: 'update',
        requestResourceData: { rating: calculatedRating, reviews: currentReviews + 1 },
      } satisfies SecurityRuleContext));
    });
  });
}
