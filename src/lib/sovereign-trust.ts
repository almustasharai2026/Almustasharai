'use client';

/**
 * بروتوكول حساب معدل الموثوقية السيادي (Sovereign Trust Score).
 * يقوم بتقييم سلوك المواطن الرقمي بناءً على وزن تراكمي للجلسات والتقييم والامتثال.
 */
export const calculateSovereignTrust = (data: {
  completedSessions?: number;
  rating?: number;
  reports?: number;
}) => {
  // القيمة المبدئية السيادية (مستوى الثقة الأساسي)
  let score = 50;

  // تطبيق ميزان القوى السيادي المحدث (Continuous Weighting)
  
  // 1. وزن التقييم (السمعة الرقمية التراكمية)
  score += (data.rating || 0) * 2;

  // 2. مكافأة الالتزام (نمو الثقة عبر الجلسات المكتملة)
  score += (data.completedSessions || 0) * 0.5;

  // 3. عقوبة الانتهاك (تأثير التقارير السلبي على السيادة الرقمية)
  score -= (data.reports || 0) * 2;

  // ضمان بقاء النتيجة ضمن النطاق السيادي (0-100)
  return Math.max(0, Math.min(100, score));
};
