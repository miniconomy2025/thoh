import { AWSSQSService } from './aws-sqs.service';
import { QueueType } from './queue.types';
import { IQueueService } from './queue.interface';

export class QueueFactory {
    private static instances: Map<QueueType, IQueueService> = new Map();
    private static region = process.env.AWS_REGION || 'af-south-1';

    private static queueUrls: Record<QueueType, string> = {
        [QueueType.CRITICAL]: process.env.AWS_SQS_CRITICAL_QUEUE_URL || '',
        [QueueType.BUSINESS]: process.env.AWS_SQS_BUSINESS_QUEUE_URL || '',
        [QueueType.NOTIFICATION]: process.env.AWS_SQS_NOTIFICATION_QUEUE_URL || ''
    };

    static getQueue(type: QueueType): IQueueService {
        if (!this.instances.has(type)) {
            const queueUrl = this.queueUrls[type];
            if (!queueUrl) {
                throw new Error(`Queue URL not configured for type: ${type}`);
            }
            this.instances.set(type, new AWSSQSService(this.region, queueUrl));
        }
        return this.instances.get(type)!;
    }

    static getCriticalQueue(): IQueueService {
        return this.getQueue(QueueType.CRITICAL);
    }

    static getBusinessQueue(): IQueueService {
        return this.getQueue(QueueType.BUSINESS);
    }

    static getNotificationQueue(): IQueueService {
        return this.getQueue(QueueType.NOTIFICATION);
    }
} 