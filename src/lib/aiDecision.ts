'use client';

/**
 * بروتوكول التحليل الاستراتيجي السريع (Sovereign Decision Engine).
 * يقوم بتحليل المعطيات القانونية والمالية وإصدار أحكام فورية مبنية على القواعد.
 */

export type DecisionResult = {
  risk: "low" | "medium" | "high";
  decision: string;
  recommendations: string[];
  confidence: number;
};

export const analyzeCase = (input: string): DecisionResult => {
  let risk: "low" | "medium" | "high" = "low";
  let decision = "نوصي بالبدء باستشارة عامة لفهم أبعاد الموضوع وتحديد المسار القانوني الأنسب.";
  let recommendations: string[] = ["يرجى تقديم مزيد من التفاصيل لتعميق التحليل.", "تأكد من توثيق كافة التفاعلات المتعلقة بالحالة."];
  let confidence = 70;

  const text = input.toLowerCase();

  // 🔥 ميزان التحليل السيادي (Sovereign Decision Matrix)
  if (text.includes("lawsuit") || text.includes("court") || text.includes("دعوى") || text.includes("محكمة")) {
    risk = "high";
    decision = "يجب استشارة خبير قانوني فوراً لوجود إجراءات قضائية نشطة تتطلب تدخلاً متخصصاً.";
    recommendations = [
      "تجهيز كافة المستندات والوثائق المتعلقة بالقضية فوراً.",
      "تجنب المواجهة المباشرة أو التصريحات غير الموثقة مع الخصم.",
      "البدء في إجراءات توكيل محامي معتمد عبر بوابة مجلس الخبراء."
    ];
    confidence = 90;
  } else if (text.includes("money") || text.includes("debt") || text.includes("مال") || text.includes("دين")) {
    risk = "medium";
    decision = "يتطلب الموقف مراجعة دقيقة للوضع المالي والالتزامات التعاقدية لضمان الامتثال.";
    recommendations = [
      "تتبع كافة المصروفات والتدفقات النقدية ذات الصلة بالموضوع.",
      "مراجعة العقود والبنود المالية الموقعة مسبقاً للبحث عن ثغرات.",
      "استشارة مستشار مالي أو محاسب قانوني لتقييم الأثر المالي."
    ];
    confidence = 80;
  }

  return { risk, decision, recommendations, confidence };
};
