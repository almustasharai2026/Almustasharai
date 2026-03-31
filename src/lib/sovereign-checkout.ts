'use client';

/**
 * بروتوكول بدء عملية الدفع السيادية.
 * يقوم بطلب إنشاء جلسة دفع من الخادم وتوجيه المواطن للرابط المخصص.
 */
export const createSovereignCheckout = async (planId: string = "basic") => {
  try {
    // 1. طلب إنشاء الجلسة من المسار السيادي
    const res = await fetch(`/api/checkout?plan=${planId}`, {
      method: "POST",
    });

    if (!res.ok) throw new Error("فشل بروتوكول الدفع");

    const data = await res.json();
    
    // 2. التوجيه السيادي لصفحة إتمام العملية
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("[Sovereign Checkout Error]", error);
    // في حال فشل الـ Fetch، نقوم بالتوجيه المباشر كخيار احتياطي
    window.location.href = `/checkout?plan=${planId}`;
  }
};
