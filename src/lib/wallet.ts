'use client';

import { Firestore, doc, setDoc, updateDoc, increment, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * إدارة العمليات المالية للمحفظة السيادية.
 */
export function createWallet(db: Firestore, userId: string, initialBalance: number = 50) {
  const walletRef = doc(db, "wallets", userId);
  const data = { balance: initialBalance, lastUpdate: serverTimestamp() };
  setDoc(walletRef, data, { merge: true }).catch(err => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: walletRef.path, operation: 'create', requestResourceData: data }));
  });
}

export function deductBalance(db: Firestore, userId: string, amount: number, reason: string) {
  const walletRef = doc(db, "wallets", userId);
  updateDoc(walletRef, { balance: increment(-amount), lastUpdate: serverTimestamp() }).catch(err => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: walletRef.path, operation: 'update', requestResourceData: { amount: -amount } }));
  });
  
  addDoc(collection(db, "wallets", userId, "transactions"), {
    amount: -amount,
    type: "deduction",
    service: reason,
    timestamp: new Date().toISOString()
  });
}
