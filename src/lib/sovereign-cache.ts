'use client';

/**
 * بروتوكول التخزين المؤقت السيادي (Sovereign Cache Protocol).
 * يقوم بحفظ مخرجات المحركات والنتائج في الذاكرة لفترة محدودة (٦٠ ثانية)
 * لتقليل النداءات البرمجية واستهلاك الموارد وضمان سرعة الاستجابة القصوى.
 */

const sovereignCache: Record<string, { value: any; timestamp: number }> = {};
const CACHE_EXPIRY_MS = 60000; // ٦٠ ثانية كفترة صلاحية سيادية

/**
 * حفظ البيانات في الخزنة المؤقتة.
 * @param key المفتاح الفريد للبيانات
 * @param value القيمة المراد تخزينها
 */
export const setSovereignCache = (key: string, value: any): void => {
  sovereignCache[key] = {
    value,
    timestamp: Date.now(),
  };
  console.log(`[Sovereign Cache] Data secured under key: ${key}`);
};

/**
 * استعادة البيانات من الخزنة المؤقتة في حال عدم انتهاء صلاحيتها.
 * @param key المفتاح الفريد للبحث
 * @returns القيمة المخزنة أو null في حال عدم الوجود أو انتهاء الصلاحية
 */
export const getSovereignCache = (key: string): any | null => {
  const entry = sovereignCache[key];
  
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRY_MS;
  
  if (isExpired) {
    console.log(`[Sovereign Cache] Entry expired for key: ${key}`);
    delete sovereignCache[key];
    return null;
  }

  console.log(`[Sovereign Cache] Fast-hit recovery for key: ${key}`);
  return entry.value;
};

/**
 * إفراغ الخزنة السيادية بالكامل.
 */
export const clearSovereignCache = (): void => {
  Object.keys(sovereignCache).forEach(key => delete sovereignCache[key]);
  console.log('[Sovereign Cache] All entries purged.');
};
