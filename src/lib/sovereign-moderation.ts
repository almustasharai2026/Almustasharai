'use client';

/**
 * القائمة السوداء السيادية (Global Banned Words).
 * تضم الكلمات التي تستوجب الحظر الفوري والنهائي من النظام.
 */
const GLOBAL_BANNED_WORDS = ["spam", "abuse", "badword", "نصب", "احتيال", "مخدرات"];

/**
 * بروتوكول فحص المحتوى السيادي.
 * يقوم بمطابقة النص مع القائمة السوداء العالمية والمحلية المخزنة في Firestore.
 * @param text النص المراد فحصه
 * @param remoteWords قائمة الكلمات الديناميكية من قاعدة البيانات
 * @returns true في حال وجود انتهاك، false في حال الأمان
 */
export function checkSovereignViolation(text: string, remoteWords: any[] = []): boolean {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // 1. الفحص ضد القائمة السوداء الثابتة (المقدمة من المستخدم)
  const hasLocalViolation = GLOBAL_BANNED_WORDS.some(word => 
    normalizedText.includes(word.toLowerCase())
  );
  
  if (hasLocalViolation) return true;

  // 2. الفحص ضد الكلمات الديناميكية التي يضيفها المدير في لوحة التحكم
  const hasRemoteViolation = remoteWords.some(fw => {
    const wordToCheck = String(fw.word || fw.text || "").toLowerCase();
    return wordToCheck !== "" && normalizedText.includes(wordToCheck);
  });

  return hasRemoteViolation;
}
