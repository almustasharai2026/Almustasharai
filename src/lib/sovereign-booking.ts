'use client';

import { 
  Firestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  DocumentReference
} from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * إنشاء حجز جلسة استشارية جديد في مسار /bookings.
 * يتم التنفيذ بأسلوب غير حاصر لضمان سرعة الواجهة.
 */
export function createSovereignBooking(
  db: Firestore, 
  userId: string, 
  consultantId: string, 
  price: number
): void {
  const bookingsRef = collection(db, "bookings");
  
  const bookingData = {
    userId,
    consultantId,
    price,
    sessionId: "session_" + Date.now(),
    status: "active",
    createdAt: serverTimestamp(),
  };

  addDoc(bookingsRef, bookingData)
    .then((docRef) => {
      console.log(`[Sovereign Protocol] Booking initiated: ${docRef.id}`);
    })
    .catch(async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingsRef.path,
        operation: 'create',
        requestResourceData: bookingData,
      } satisfies SecurityRuleContext));
    });
}
