
'use client';

import { Firestore, doc, updateDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * القائمة السوداء السيادية الثابتة (Hardcoded Backup).
 */
export const staticBannedWords = ["spam", "abuse", "نصب", "احتيال", "مخدرات", "إرهاب"];

/**
 * بروتوكول فحص المحتوى السيادي الشامل.
 * يقوم بمطابقة النص مع القائمة المحلية والبعيدة من Firestore.
 */
export function checkSovereignViolation(text: string, remoteWords: any[] = []): boolean {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();

  // 1. فحص القائمة الثابتة
  const hasStaticViolation = staticBannedWords.some(word =>
    normalizedText.includes(word.toLowerCase())
  );
  if (hasStaticViolation) return true;

  // 2. فحص القائمة السحابية (المتحكم بها من لوحة الإدارة)
  const hasRemoteViolation = remoteWords.some(fw => {
    const wordToCheck = String(fw.word || fw.text || "").toLowerCase().trim();
    return wordToCheck !== "" && normalizedText.includes(wordToCheck);
  });

  return hasRemoteViolation;
}

/**
 * بروتوكول الحظر السيادي (Sovereign Ban Action).
 */
export function banSovereignUser(db: Firestore, userId: string, targetBannedStatus: boolean): void {
  const userRef = doc(db, "users", userId);
  const data = { isBanned: targetBannedStatus };

  updateDoc(userRef, data)
    .then(() => {
      console.log(`[Sovereign Protocol] User ${userId} status updated: ${targetBannedStatus ? 'BANNED' : 'UNBANNED'}`);
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext));
    });
}
