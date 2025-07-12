import { QueueConsumer, criticalMessageHandler, businessMessageHandler, notificationMessageHandler } from './queue.consumer';
import { QueueType } from './queue.types';

export class QueueInitializer {
    private consumers: QueueConsumer[] = [];

    async initialize(): Promise<void> {
        try {
            console.log('Creating queue consumers...');
            
            // Create consumers for each queue type
            const criticalConsumer = new QueueConsumer(QueueType.CRITICAL, criticalMessageHandler);
            const businessConsumer = new QueueConsumer(QueueType.BUSINESS, businessMessageHandler);
            const notificationConsumer = new QueueConsumer(QueueType.NOTIFICATION, notificationMessageHandler);

            // Store consumers for cleanup
            this.consumers.push(criticalConsumer, businessConsumer, notificationConsumer);

            // Initialize all consumers first
            console.log('Initializing queue consumers...');
            await Promise.all([
                criticalConsumer.initialize(),
                businessConsumer.initialize(),
                notificationConsumer.initialize()
            ]);

            // Start continuous polling for all consumers
            console.log('Starting continuous polling for all consumers...');
            await Promise.all([
                criticalConsumer.start(),
                businessConsumer.start(),
                notificationConsumer.start()
            ]);

            console.log('All queue consumers are running');

            // Handle graceful shutdown
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());
        } catch (error) {
            console.error('Error during queue initialization:', error);
            throw error;
        }
    }

    private shutdown(): void {
        console.log('Shutting down queue consumers...');
        this.consumers.forEach(consumer => consumer.stop());
    }
} 