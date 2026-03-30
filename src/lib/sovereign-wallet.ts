
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
 * إنشاء المحفظة السيادية للمواطن الجديد في مسار /wallets.
 */
export function createSovereignWallet(db: Firestore, userId: string, initialBalance: number = 100) {
  const walletRef = doc(db, "wallets", userId);
  
  const data = {
    balance: initialBalance,
    lastUpdate: serverTimestamp(),
  };

  setDoc(walletRef, data, { merge: true })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: walletRef.path,
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext));
    });
}

/**
 * شحن الرصيد السيادي في مسار /wallets.
 */
export function rechargeSovereignBalance(db: Firestore, userId: string, amount: number, reason: string = "شحن رصيد") {
  const walletRef = doc(db, "wallets", userId);
  const transactionRef = collection(db, "wallets", userId, "transactions");

  updateDoc(walletRef, {
    balance: increment(amount),
    lastUpdate: serverTimestamp()
  }).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: walletRef.path,
      operation: 'update',
      requestResourceData: { amount, type: 'recharge' },
    } satisfies SecurityRuleContext));
  });

  addDoc(transactionRef, {
    amount: amount,
    type: "recharge",
    service: reason,
    timestamp: new Date().toISOString()
  });
}

/**
 * خصم الرصيد مقابل الخدمات من مسار /wallets.
 */
export function deductSovereignBalance(db: Firestore, userId: string, amount: number, serviceName: string) {
  const walletRef = doc(db, "wallets", userId);
  const transactionRef = collection(db, "wallets", userId, "transactions");

  updateDoc(walletRef, {
    balance: increment(-amount),
    lastUpdate: serverTimestamp()
  }).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: walletRef.path,
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
