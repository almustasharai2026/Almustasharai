'use client';

/**
 * بروتوكول حساب معدل الموثوقية السيادي (Sovereign Trust Score).
 * يقوم بتقييم سلوك المواطن الرقمي بناءً على تاريخ الجلسات والتقارير والالتزام ببروتوكولات المنصة.
 */
export const calculateSovereignTrust = (data: {
  completedSessions?: number;
  rating?: number;
  reports?: number;
}) => {
  // القيمة المبدئية السيادية (مستوى الثقة الأساسي)
  let score = 50;

  // 1. مكافأة الالتزام (الجلسات المكتملة)
  if ((data.completedSessions || 0) > 5) score += 20;

  // 2. وزن التقييم (السمعة الرقمية)
  if ((data.rating || 0) > 4.5) score += 20;

  // 3. عقوبة الانتهاك (التقارير المسجلة)
  if ((data.reports || 0) > 0) score -= 30;

  // ضمان بقاء النتيجة ضمن النطاق السيادي (0-100)
  return Math.max(0, Math.min(100, score));
};
