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
 * إنشاء المحفظة السيادية للمواطن الجديد.
 * يتم استدعاؤها عادةً عند التسجيل لأول مرة.
 */
export function createSovereignWallet(db: Firestore, userId: string, initialBalance: number = 50) {
  const userRef = doc(db, "users", userId);
  
  const data = {
    balance: initialBalance,
    lastWalletUpdate: serverTimestamp(),
  };

  setDoc(userRef, data, { merge: true })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext));
    });
}

/**
 * شحن الرصيد السيادي (Recharge).
 * تستخدم ميزة increment لضمان الدقة الحسابية.
 */
export function rechargeSovereignBalance(db: Firestore, userId: string, amount: number, reason: string = "شحن رصيد") {
  const userRef = doc(db, "users", userId);
  const transactionRef = collection(db, "users", userId, "transactions");

  // 1. تحديث الرصيد (Non-blocking)
  updateDoc(userRef, {
    balance: increment(amount),
    lastActivity: serverTimestamp()
  }).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: { amount, type: 'recharge' },
    } satisfies SecurityRuleContext));
  });

  // 2. تسجيل المعاملة في السجل المالي (Ledger)
  const txData = {
    amount: amount,
    type: "recharge",
    service: reason,
    timestamp: new Date().toISOString()
  };

  addDoc(transactionRef, txData).catch(() => {
    // خطأ في تسجيل المعاملة لا يعيق عملية الشحن الأساسية ولكن يتم رصده
    console.error("Sovereign Ledger Error: Failed to log transaction");
  });
}

/**
 * خصم الرصيد مقابل الخدمات (Deduction).
 */
export function deductSovereignBalance(db: Firestore, userId: string, amount: number, serviceName: string) {
  const userRef = doc(db, "users", userId);
  const transactionRef = collection(db, "users", userId, "transactions");

  updateDoc(userRef, {
    balance: increment(-amount),
    lastActivity: serverTimestamp()
  }).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: userRef.path,
      operation: 'update',
      requestResourceData: { amount: -amount, service: serviceName },
    } satisfies SecurityRuleContext));
  });

  addDoc(transactionRef, {
    amount: -amount,
    type: "deduction",
    service: serviceName,
    timestamp: new Date().toISOString()
  });
}
