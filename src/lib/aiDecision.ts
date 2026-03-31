'use client';

/**
 * محرك التحليل الاستراتيجي السريع.
 */
export type DecisionResult = {
  risk: "low" | "medium" | "high";
  decision: string;
  recommendations: string[];
  confidence: number;
};

export const analyzeCase = (input: string): DecisionResult => {
  let risk: "low" | "medium" | "high" = "low";
  let decision = "نوصي بالبدء باستشارة عامة لفهم أبعاد الموضوع.";
  let recommendations: string[] = ["يرجى تقديم مزيد من التفاصيل لتعميق التحليل."];
  let confidence = 70;

  const text = input.toLowerCase();

  if (text.includes("دعوى") || text.includes("محكمة") || text.includes("court")) {
    risk = "high";
    decision = "يجب استشارة خبير قانوني فوراً لوجود إجراءات قضائية نشطة.";
    recommendations = [
      "تجهيز كافة المستندات والوثائق المتعلقة بالقضية.",
      "تجنب المواجهة المباشرة أو التصريحات غير الموثقة.",
      "البدء في إجراءات توكيل محامي معتمد عبر مجلس الخبراء."
    ];
    confidence = 95;
  } else if (text.includes("مال") || text.includes("دين") || text.includes("money")) {
    risk = "medium";
    decision = "يتطلب الموقف مراجعة دقيقة للوضع المالي والالتزامات التعاقدية.";
    recommendations = [
      "تتبع كافة المصروفات والتدفقات النقدية ذات الصلة.",
      "مراجعة العقود والبنود المالية الموقعة مسبقاً."
    ];
    confidence = 85;
  }

  return { risk, decision, recommendations, confidence };
};
