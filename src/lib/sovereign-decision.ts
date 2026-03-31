'use client';

/**
 * بروتوكول التحليل الاستراتيجي السريع.
 * يقوم بتحليل الحالة برمجياً لتقديم نتائج فورية قبل معالجة الذكاء الاصطناعي المعمق.
 */

export type DecisionResult = {
  risk: "low" | "medium" | "high";
  decision: string;
  recommendations: string[];
  confidence: number;
};

export const analyzeSovereignCase = (input: string): DecisionResult => {
  let risk: "low" | "medium" | "high" = "low";
  let decision = "نوصي بالبدء باستشارة عامة لفهم أبعاد الموضوع.";
  let recommendations: string[] = ["يرجى تقديم مزيد من التفاصيل لتعميق التحليل."];
  let confidence = 70;

  const text = input.toLowerCase();

  // 🔥 ميزان التحليل البرمجي السيادي
  if (text.includes("دعوى") || text.includes("محكمة") || text.includes("lawsuit") || text.includes("court")) {
    risk = "high";
    decision = "يجب استشارة خبير قانوني فوراً لوجود إجراءات قضائية نشطة.";
    recommendations = [
      "تجهيز كافة المستندات والوثائق المتعلقة بالقضية.",
      "تجنب المواجهة المباشرة أو التصريحات غير الموثقة.",
      "البدء في إجراءات توكيل محامي معتمد عبر مجلس الخبراء."
    ];
    confidence = 95;
  } else if (text.includes("مال") || text.includes("دين") || text.includes("money") || text.includes("debt")) {
    risk = "medium";
    decision = "يتطلب الموقف مراجعة دقيقة للوضع المالي والالتزامات التعاقدية.";
    recommendations = [
      "تتبع كافة المصروفات والتدفقات النقدية ذات الصلة.",
      "مراجعة العقود والبنود المالية الموقعة مسبقاً.",
      "استشارة مستشار مالي أو محاسب قانوني متخصص."
    ];
    confidence = 85;
  }

  return { risk, decision, recommendations, confidence };
};
