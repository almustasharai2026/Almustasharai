'use client';

/**
 * محرك الردود السريعة السيادي.
 * يقدم استجابات فورية بناءً على تحليل الكلمات المفتاحية لضمان سرعة الخدمة.
 */
export const getSovereignQuickReply = async (message: string): Promise<string> => {
  const lowerMessage = message.toLowerCase();

  // 🔥 ميزان الكلمات المفتاحية السيادي
  if (lowerMessage.includes("قانون") || lowerMessage.includes("law") || lowerMessage.includes("محامي")) {
    return "بناءً على معطيات الحالة، نوصيك بالتشاور مع خبير قانوني معتمد فوراً. يمكنك استخدام بوابة 'مجلس الخبراء' للاتصال المرئي المشفر.";
  }

  if (lowerMessage.includes("مال") || lowerMessage.includes("رصيد") || lowerMessage.includes("money") || lowerMessage.includes("فلوس")) {
    return "النظام يرصد استفساراً مالياً. يرجى مراجعة سجلات محفظتك السيادية أو التوجه لبوابة 'شحن الرصيد' لإدارة وحداتك المالية.";
  }

  if (lowerMessage.includes("عقد") || lowerMessage.includes("اتفاقية") || lowerMessage.includes("contract")) {
    return "تم رصد طلب متعلق بالوثائق. نوصيك بالتوجه إلى 'المكتبة السيادية' لتوليد نموذج عقد معتمد وموثق برمجياً.";
  }

  return "لقد استلم المحرك السيادي استفسارك. جاري تحليل الحالة بعمق لإصدار التوصية القانونية الأنسب لموقفك...";
};
