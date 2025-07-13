import { AWSSQSService } from './aws-sqs.service';
import { QueueType } from './queue.types';
import { IQueueService } from './queue.interface';

export class QueueFactory {
    private static instances: Map<QueueType, IQueueService> = new Map();
    private static region = process.env.AWS_REGION;

    private static queueUrls = {
        critical: process.env.AWS_SQS_CRITICAL_QUEUE_URL,
        business: process.env.AWS_SQS_BUSINESS_QUEUE_URL,
        notification: process.env.AWS_SQS_NOTIFICATION_QUEUE_URL
    } as const;

    static getQueue(type: QueueType): IQueueService {
        if (!this.region) {
            throw new Error('AWS_REGION environment variable is not set');
        }

        if (!this.instances.has(type)) {
            const queueUrl = this.queueUrls[type];
            if (!queueUrl) {
                throw new Error(`Queue URL not configured for type: ${type}. Please set AWS_SQS_${type.toUpperCase()}_QUEUE_URL`);
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