
'use client';

import { 
  Firestore, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  increment 
} from "firebase/firestore";
import { trackSovereignEvent } from "./sovereign-analytics";

/**
 * ميزان الأسعار السيادي (Sovereign Price Matrix).
 */
export const SOVEREIGN_PRICES = {
  ai_chat: 5,
  document: 15,
  expert: 30
};

/**
 * بروتوكول التحقق والخصم المالي السيادي.
 * يقوم بفحص المحفظة وتنفيذ الخصم بأسلوب غير حاصر.
 */
export const executeSovereignBilling = async (
  db: Firestore, 
  userId: string, 
  serviceType: keyof typeof SOVEREIGN_PRICES,
  userRole?: string
) => {
  const userRef = doc(db, "users", userId);
  
  // 1. جلب بيانات الهوية المالية (Sovereign Identity Check)
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return { canProceed: false, message: "Citizen Record Not Found" };
  }

  const userData = userSnap.data();
  const cost = SOVEREIGN_PRICES[serviceType];

  // 2. فحص الصلاحيات (المالك king2026 معفي من الرسوم)
  if (userRole === 'admin') {
    return { canProceed: true, newBalance: Infinity };
  }

  // 3. التحقق من كفاية الوحدات المالية
  if ((userData.balance || 0) < cost) {
    // تسجيل محاولة فاشلة في الأرشيف
    trackSovereignEvent(db, "billing_failure", { userId, serviceType, cost });
    return { canProceed: false, message: "Balance Insufficient" };
  }

  // 4. تنفيذ الخصم السيادي (Non-blocking Update)
  // نستخدم increment لضمان السلامة البرمجية في التعديلات المالية
  updateDoc(userRef, {
    balance: increment(-cost),
    last_transaction: serverTimestamp(),
    "audit.last_service": serviceType
  }).catch(err => {
    console.error("[Sovereign Billing Error] Sync failed:", err);
  });

  // 5. توثيق النجاح في سجل الأحداث
  trackSovereignEvent(db, "billing_success", { 
    userId, 
    serviceType, 
    cost,
    remainingBefore: userData.balance 
  });

  return { canProceed: true, newBalance: (userData.balance || 0) - cost };
};
