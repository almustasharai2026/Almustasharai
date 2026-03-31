
'use client';

import { 
  Firestore, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  collection,
  addDoc
} from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * بروتوكول التعديل المالي السيادي المباشر.
 * @param db مثيل Firestore
 * @param userId معرف المواطن
 * @param amount المبلغ (موجب للشحن، سالب للخصم)
 * @param reason سبب العملية لتوثيقها في السجلات
 */
export async function executeSovereignFinancialOp(
  db: Firestore, 
  userId: string, 
  amount: number, 
  reason: string = "تعديل إداري"
): Promise<void> {
  const userRef = doc(db, "users", userId);
  const logRef = collection(db, "system", "logs", "events");

  try {
    // 1. تنفيذ التعديل المالي اللحظي
    await updateDoc(userRef, {
      balance: increment(amount)
    });

    // 2. توثيق العملية في سجل الأحداث السيادي
    await addDoc(logRef, {
      type: amount > 0 ? "BALANCE_RECHARGE" : "BALANCE_DEDUCTION",
      detail: `${amount > 0 ? 'شحن' : 'خصم'} مبلغ ${Math.abs(amount)} EGP. السبب: ${reason}`,
      userId,
      admin: "king2026",
      timestamp: serverTimestamp()
    });

    console.log(`[Sovereign Finance] Operation completed for user: ${userId}`);
  } catch (error: any) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: { balance: amount, reason },
    } satisfies SecurityRuleContext));
    throw error;
  }
}

/**
 * بروتوكول التحويل السيادي (Manual Transfer).
 * يستخدم لنقل الوحدات المالية مباشرة من سلطة الإدارة إلى المواطن.
 */
export function manualSovereignTransfer(
  db: Firestore,
  userId: string,
  amount: number
): void {
  const userRef = doc(db, "users", userId);
  
  updateDoc(userRef, { balance: increment(amount) })
    .then(() => {
      // تسجيل الحدث بأسلوب غير حاصر
      addDoc(collection(db, "system", "logs", "events"), {
        type: "MANUAL_TRANSFER",
        detail: `تم تحويل ${amount} EGP يدوياً للمواطن`,
        userId,
        timestamp: serverTimestamp()
      });
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: { balance: amount, action: 'transfer' },
      } satisfies SecurityRuleContext));
    });
}
