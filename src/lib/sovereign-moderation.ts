'use client';

/**
 * القائمة السوداء السيادية (Global Banned Words).
 * تضم الكلمات التي تستوجب الحظر الفوري والنهائي من النظام.
 */
export const bannedWords = ["spam", "abuse", "badword", "نصب", "احتيال", "مخدرات"];

/**
 * بروتوكول فحص المحتوى البسيط.
 * يقوم بمطابقة النص مع القائمة السوداء الثابتة.
 * @param text النص المراد فحصه
 * @returns true في حال وجود انتهاك، false في حال الأمان
 */
export const shouldBan = (text: string) => {
  if (!text) return false;
  return bannedWords.some(word =>
    text.toLowerCase().includes(word.toLowerCase())
  );
};

/**
 * بروتوكول فحص المحتوى السيادي الشامل.
 * يقوم بمطابقة النص مع القائمة السوداء العالمية والمحلية المخزنة في Firestore.
 * @param text النص المراد فحصه
 * @param remoteWords قائمة الكلمات الديناميكية من قاعدة البيانات
 * @returns true في حال وجود انتهاك، false في حال الأمان
 */
export function checkSovereignViolation(text: string, remoteWords: any[] = []): boolean {
  if (!text) return false;
  
  // 1. الفحص ضد القائمة السوداء الثابتة (الدرع الأساسي)
  if (shouldBan(text)) return true;

  // 2. الفحص ضد الكلمات الديناميكية التي يضيفها المدير في لوحة التحكم
  const normalizedText = text.toLowerCase();
  const hasRemoteViolation = remoteWords.some(fw => {
    const wordToCheck = String(fw.word || fw.text || "").toLowerCase();
    return wordToCheck !== "" && normalizedText.includes(wordToCheck);
  });

  return hasRemoteViolation;
}
