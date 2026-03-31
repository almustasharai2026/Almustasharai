'use client';

import { Firestore, doc, updateDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * القائمة السوداء السيادية (Global Banned Words).
 * تضم الكلمات التي تستوجب الحظر الفوري والنهائي من النظام.
 */
export const bannedWords = ["spam", "abuse", "badword", "نصب", "احتيال", "مخدرات"];

/**
 * بروتوكول فحص المحتوى البسيط.
 * يقوم بمطابقة النص مع القائمة السوداء الثابتة.
 */
export const shouldBan = (text: string) => {
  if (!text) return false;
  return bannedWords.some(word =>
    text.toLowerCase().includes(word.toLowerCase())
  );
};

/**
 * بروتوكول فحص المحتوى السيادي الشامل.
 */
export function checkSovereignViolation(text: string, remoteWords: any[] = []): boolean {
  if (!text) return false;
  
  if (shouldBan(text)) return true;

  const normalizedText = text.toLowerCase();
  const hasRemoteViolation = remoteWords.some(fw => {
    const wordToCheck = String(fw.word || fw.text || "").toLowerCase();
    return wordToCheck !== "" && normalizedText.includes(wordToCheck);
  });

  return hasRemoteViolation;
}

/**
 * بروتوكول الحظر السيادي (Sovereign Ban Action).
 * يقوم بتجميد أو فك تجميد حساب المواطن في قاعدة البيانات بأسلوب غير حاصر.
 */
export function banSovereignUser(db: Firestore, userId: string, targetBannedStatus: boolean): void {
  const userRef = doc(db, "users", userId);
  const data = { isBanned: targetBannedStatus };

  // تنفيذ التحديث السيادي بأسلوب غير حاصر
  updateDoc(userRef, data)
    .then(() => {
      console.log(`[Sovereign Protocol] User ${userId} status updated: ${targetBannedStatus ? 'BANNED' : 'UNBANNED'}`);
    })
    .catch(async (error) => {
      // تبليغ النظام في حال فشل الإجراء (مثلاً بسبب نقص الصلاحيات للمراقبين)
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext));
    });
}
