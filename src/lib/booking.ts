'use client';

import { Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * بروتوكول حجز الجلسات الاستشارية.
 */
export function createBooking(db: Firestore, userId: string, consultantId: string, price: number) {
  const bookingsRef = collection(db, "bookings");
  const data = { userId, consultantId, price, status: "active", createdAt: serverTimestamp() };

  addDoc(bookingsRef, data).catch(err => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({ path: bookingsRef.path, operation: 'create', requestResourceData: data }));
  });
}
