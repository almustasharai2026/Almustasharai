'use client';

import { Firestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { trackEvent } from "./analytics";

/**
 * بروتوكول حجز الجلسات الاستشارية السيادي.
 */
export function createBooking(db: Firestore, userId: string, consultantId: string, price: number): void {
  const bookingsRef = collection(db, "bookings");
  
  const bookingData = {
    userId,
    consultantId,
    price,
    status: "active",
    createdAt: serverTimestamp(),
  };

  // 1. إنشاء سجل الحجز بأسلوب غير حاصر
  addDoc(bookingsRef, bookingData)
    .then(() => {
      // 2. تتبع الحدث سيادياً فور نجاح المبادرة
      trackEvent(db, "booking_created", {
        userId,
        consultantId,
        price
      });
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingsRef.path,
        operation: 'create',
        requestResourceData: bookingData,
      } satisfies SecurityRuleContext));
    });
}
