export type NotificationJob = {
  type: 'recycler' | 'bulk_logistics' | 'consumer_logistics';
  payload: any;
  attempt: number;
  maxAttempts: number;
  notifyFn: (payload: any) => Promise<void>;
};

class RetryQueueService {
  private static queue: NotificationJob[] = [];
  private static isProcessing = false;
  private static RETRY_DELAY_MS = 10_000; 

  static enqueue(job: NotificationJob) {
    this.queue.push(job);
    this.processQueue();
  }

  private static async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await job.notifyFn(job.payload);
      } catch (err) {
        if (job.attempt < job.maxAttempts) {
          setTimeout(() => {
            RetryQueueService.enqueue({ ...job, attempt: job.attempt + 1 });
          }, this.RETRY_DELAY_MS * Math.pow(2, job.attempt)); // Exponential backoff
        } else {
          console.error(`Notification job failed after ${job.maxAttempts} attempts:`, job, err);
        }
      }
    }
    this.isProcessing = false;
  }
}

export default RetryQueueService; 