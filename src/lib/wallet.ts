'use client';

import { Firestore, doc, getDoc, collection, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * بروتوكول المحفظة السيادية.
 */
export async function getWallet(db: Firestore, userId: string) {
  const walletRef = doc(db, "wallets", userId);
  const transRef = collection(db, "wallets", userId, "transactions");

  try {
    const walletSnap = await getDoc(walletRef);
    const transSnap = await getDocs(transRef);
    
    const transactions = transSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (!walletSnap.exists()) {
      const initialData = { balance: 50, createdAt: serverTimestamp() };
      await setDoc(walletRef, initialData);
      return { ...initialData, transactions: [] };
    }

    return { ...walletSnap.data(), transactions };
  } catch (error) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: walletRef.path,
      operation: 'get'
    }));
    return null;
  }
}
