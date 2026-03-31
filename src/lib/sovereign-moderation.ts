
'use client';

import { Firestore, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * القائمة السوداء السيادية الثابتة (Hardcoded Protocol Backup).
 */
export const staticBannedWords = [
  "نصب", "احتيال", "مخدرات", "إرهاب", "داعش", "سلاح", "قتل", 
  "sex", "porn", "abuse", "scam", "hack"
];

/**
 * بروتوكول فحص المحتوى السيادي الشامل.
 * يقوم بمطابقة النص مع القائمة المحلية والبعيدة من Firestore.
 */
export function checkSovereignViolation(text: string, remoteWords: any[] = []): boolean {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();

  // 1. فحص القائمة الثابتة (Hardcoded Shield)
  const hasStaticViolation = staticBannedWords.some(word =>
    normalizedText.includes(word.toLowerCase())
  );
  if (hasStaticViolation) return true;

  // 2. فحص القائمة السحابية (Dynamic Shield)
  const hasRemoteViolation = remoteWords.some(fw => {
    const wordToCheck = String(fw.word || fw.text || "").toLowerCase().trim();
    return wordToCheck !== "" && normalizedText.includes(wordToCheck);
  });

  return hasRemoteViolation;
}

/**
 * بروتوكول الحظر السيادي (Sovereign Ban Action).
 * يقوم بتعطيل حساب المواطن فوراً بقرار من المالك king2026.
 */
export function banSovereignUser(db: Firestore, userId: string, targetBannedStatus: boolean): void {
  const userRef = doc(db, "users", userId);
  const data = { 
    isBanned: targetBannedStatus,
    bannedAt: targetBannedStatus ? new Date().toISOString() : null
  };

  updateDoc(userRef, data)
    .then(() => {
      console.log(`[Sovereign Protocol] Citizen ${userId} status: ${targetBannedStatus ? 'BANNED' : 'AUTHORIZED'}`);
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext));
    });
}

/**
 * بروتوكول الحذف النهائي (Supreme Purge).
 * إزالة المواطن تماماً من سجلات الكوكب.
 */
export function purgeCitizen(db: Firestore, userId: string): void {
  const userRef = doc(db, "users", userId);
  
  deleteDoc(userRef)
    .then(() => {
      console.log(`[Sovereign Purge] ID: ${userId} has been erased from reality.`);
    })
    .catch(async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'delete',
      } satisfies SecurityRuleContext));
    });
}
