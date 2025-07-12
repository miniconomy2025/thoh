import { QueueConsumer, criticalMessageHandler, businessMessageHandler, notificationMessageHandler } from './queue.consumer';
import { QueueType } from './queue.types';

export class QueueInitializer {
    private consumers: QueueConsumer[] = [];

    async initialize(): Promise<void> {
        // Create consumers for each queue type
        const criticalConsumer = new QueueConsumer(QueueType.CRITICAL, criticalMessageHandler);
        const businessConsumer = new QueueConsumer(QueueType.BUSINESS, businessMessageHandler);
        const notificationConsumer = new QueueConsumer(QueueType.NOTIFICATION, notificationMessageHandler);

        // Store consumers for cleanup
        this.consumers.push(criticalConsumer, businessConsumer, notificationConsumer);

        // Start consumers
        await Promise.all([
            criticalConsumer.start(),
            businessConsumer.start(),
            notificationConsumer.start()
        ]);

        console.log('Queue consumers initialized');

        // Handle graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    private shutdown(): void {
        console.log('Shutting down queue consumers...');
        this.consumers.forEach(consumer => consumer.stop());
    }
} 