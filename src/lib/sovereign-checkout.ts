
'use client';

/**
 * بروتوكول بدء عملية الدفع السيادية الآلية.
 * يقوم باستدعاء بوابة Stripe عبر مسار API المخصص وتوجيه المواطن لإتمام العملية.
 */
export const createSovereignCheckout = async (planId: string = "basic") => {
  try {
    // 1. طلب إنشاء جلسة دفع مشفرة من المحرك السيادي
    const res = await fetch(`/api/checkout?plan=${planId}`, {
      method: "POST",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "فشل بروتوكول الدفع");
    }

    const data = await res.json();
    
    // 2. التوجيه السيادي المباشر لبوابة Stripe العالمية
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("رابط الدفع غير موجود في الاستجابة");
    }
  } catch (error: any) {
    console.error("[Sovereign Checkout Error]", error.message);
    // في حال الفشل التقني، يتم التوجيه لصفحة الدعم المالي اليدوي كخيار بديل
    window.location.href = `/checkout?plan=${planId}&error=protocol_fail`;
  }
};
