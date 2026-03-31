'use client';

/**
 * بروتوكول طابور المهام السيادي (Sovereign Task Queue Protocol).
 * يقوم بمعالجة المهام المتسلسلة لضمان عدم حدوث تعارض في البيانات (Race Conditions)
 * أو استهلاك مفرط لموارد النظام عند تنفيذ عمليات متزامنة.
 */

type Task = () => Promise<void>;

const taskQueue: Task[] = [];
let isProcessing = false;

/**
 * إضافة مهمة جديدة إلى طابور التنفيذ السيادي.
 * @param task وظيفة غير متزامنة يراد تنفيذها
 */
export const addToSovereignQueue = (task: Task): void => {
  taskQueue.push(task);
  console.log(`[Sovereign Queue] New task enlisted. Queue size: ${taskQueue.length}`);
  processSovereignQueue();
};

/**
 * محرك معالجة الطابور الداخلي.
 * يضمن تنفيذ مهمة واحدة فقط في كل مرة لضمان سلامة العمليات السيادية.
 */
const processSovereignQueue = async (): Promise<void> => {
  if (isProcessing) return;

  isProcessing = true;

  while (taskQueue.length > 0) {
    const currentTask = taskQueue.shift();
    if (currentTask) {
      try {
        // تنفيذ المهمة وانتظار اكتمالها قبل الانتقال للمهمة التالية
        await currentTask();
      } catch (error) {
        console.error('[Sovereign Queue] Task execution failed:', error);
      }
    }
  }

  isProcessing = false;
  console.log('[Sovereign Queue] All pending tasks processed.');
};
