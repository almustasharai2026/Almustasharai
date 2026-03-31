'use client';

/**
 * بروتوكول طلبات الدفع السيادية.
 */
export const initiateCheckout = async (planId: string = "basic") => {
  try {
    const res = await fetch(`/api/checkout?plan=${planId}`, { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error("فشل توجيه الدفع");
    }
  } catch (error) {
    console.error("[Payment Protocol Fail]", error);
    window.location.href = `/checkout?plan=${planId}&status=error`;
  }
};
