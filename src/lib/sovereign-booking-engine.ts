
'use client';

import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  increment 
} from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * محرك الحجز السيادي (Sovereign Booking Engine king2026).
 * يتولى إدارة الحجوزات، الطوارئ، واسترداد الأموال آلياً.
 */

export type BookingData = {
  userId: string;
  userName: string;
  consultantId: string;
  consultantName: string;
  date: string;
  slot: string;
  type: 'normal' | 'emergency';
  price: number;
};

// 1. بروتوكول الحجز المباشر (Direct Booking)
export function initiateSovereignBooking(db: Firestore, data: BookingData): void {
  const bookingsRef = collection(db, "bookings");
  const userRef = doc(db, "users", data.userId);

  const payload = {
    ...data,
    status: 'confirmed',
    createdAt: serverTimestamp(),
    smsSent: true, // محاكاة إرسال SMS
    googleSync: false
  };

  // خصم الرصيد بأسلوب غير حاصر
  updateDoc(userRef, {
    balance: increment(-data.price)
  }).catch(e => console.error("Balance update failed", e));

  // إنشاء الحجز
  addDoc(bookingsRef, payload)
    .then((docRef) => {
      console.log(`[Sovereign Booking] ID: ${docRef.id} confirmed.`);
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookingsRef.path,
        operation: 'create',
        requestResourceData: payload,
      } satisfies SecurityRuleContext));
    });
}

// 2. بروتوكول استرداد الأموال الآلي (Auto-Refund)
export function executeAutoRefund(db: Firestore, userId: string, amount: number, bookingId: string): void {
  const userRef = doc(db, "users", userId);
  const bookingRef = doc(db, "bookings", bookingId);

  updateDoc(userRef, {
    balance: increment(amount)
  });

  updateDoc(bookingRef, {
    status: 'cancelled_and_refunded',
    refundedAt: serverTimestamp()
  });
}

// 3. بروتوكول مزامنة جوجل (Google Calendar Sync Simulation)
export function syncWithGoogleCalendar(db: Firestore, bookingId: string): void {
  const bookingRef = doc(db, "bookings", bookingId);
  updateDoc(bookingRef, {
    googleSync: true,
    syncedAt: serverTimestamp()
  });
}
