'use client';

import { 
  Firestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

/**
 * بروتوكول إرسال الرسائل اللحظية السيادي.
 * يتم التنفيذ بأسلوب غير حاصر لضمان سرعة الدردشة في غرف الاستشارة المباشرة.
 */
export function sendSovereignLiveMessage(
  db: Firestore, 
  sessionId: string, 
  senderId: string, 
  senderName: string,
  text: string
): void {
  const messagesRef = collection(db, "liveConsultations", sessionId, "messages");
  
  const messageData = {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp(),
    role: "user"
  };

  // إرسال الرسالة بأسلوب غير حاصر (Non-blocking)
  // لا نستخدم await هنا لضمان سرعة استجابة الواجهة السيادية
  addDoc(messagesRef, messageData)
    .then((docRef) => {
      console.log(`[Sovereign Chat] Message transmitted: ${docRef.id}`);
    })
    .catch(async (error) => {
      // تبليغ النظام في حال فشل الإرسال (مثلاً بسبب حظر المستخدم)
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: messagesRef.path,
        operation: 'create',
        requestResourceData: messageData,
      } satisfies SecurityRuleContext));
    });
}
