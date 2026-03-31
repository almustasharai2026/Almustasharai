'use client';

/**
 * بروتوكول التحليل الاستراتيجي (Sovereign Decision Engine).
 */
export type DecisionResult = {
  risk: "low" | "medium" | "high";
  decision: string;
  recommendations: string[];
  confidence: number;
};

export const analyzeCase = (input: string): DecisionResult => {
  const text = input.toLowerCase();
  let risk: "low" | "medium" | "high" = "low";
  let decision = "نوصي بالبدء باستشارة عامة لفهم أبعاد الموضوع وتحديد المسار القانوني الأنسب.";
  let recommendations: string[] = ["يرجى تقديم مزيد من التفاصيل لتعميق التحليل.", "تأكد من توثيق كافة التفاعلات المتعلقة بالحالة."];
  let confidence = 70;

  if (text.includes("دعوى") || text.includes("محكمة") || text.includes("قضية")) {
    risk = "high";
    decision = "يجب استشارة خبير قانوني فوراً لوجود إجراءات قضائية نشطة تتطلب تدخلاً متخصصاً.";
    recommendations = ["تجهيز كافة المستندات والوثائق فوراً.", "تجنب التصريحات غير الموثقة مع الخصم.", "تفعيل بروتوكول الحجز مع محامي معتمد."];
    confidence = 95;
  } else if (text.includes("مال") || text.includes("دين") || text.includes("رصيد")) {
    risk = "medium";
    decision = "يتطلب الموقف مراجعة دقيقة للوضع المالي والالتزامات التعاقدية لضمان الامتثال.";
    recommendations = ["تتبع التدفقات النقدية ذات الصلة.", "مراجعة العقود الموقعة مسبقاً.", "استشارة مستشار مالي لتقييم الأثر."];
    confidence = 85;
  }

  return { risk, decision, recommendations, confidence };
};
