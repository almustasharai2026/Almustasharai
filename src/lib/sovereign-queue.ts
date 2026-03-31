'use client';

/**
 * بروتوكول طابور المهام السيادي.
 */
type Task = () => Promise<void>;
const taskQueue: Task[] = [];
let isProcessing = false;

export const addToSovereignQueue = (task: Task): void => {
  taskQueue.push(task);
  processQueue();
};

const processQueue = async (): Promise<void> => {
  if (isProcessing) return;
  isProcessing = true;

  while (taskQueue.length > 0) {
    const currentTask = taskQueue.shift();
    if (currentTask) {
      try {
        await currentTask();
      } catch (error) {
        console.error('[Sovereign Queue] Task failed:', error);
      }
    }
  }

  isProcessing = false;
};
