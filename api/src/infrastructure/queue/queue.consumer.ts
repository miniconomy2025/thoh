import { QueueFactory } from './queue.factory';
import { QueueType, CriticalQueueMessage, BusinessQueueMessage, NotificationQueueMessage } from './queue.types';
import { QueueMessage } from './queue.interface';

export class QueueConsumer {
    private isRunning: boolean = false;
    private type: QueueType;
    private messageHandler: (message: any) => Promise<void>;

    constructor(type: QueueType, messageHandler: (message: any) => Promise<void>) {
        this.type = type;
        this.messageHandler = messageHandler;
    }

    async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;
        
        while (this.isRunning) {
            try {
                const queue = QueueFactory.getQueue(this.type);
                const messages = await queue.receiveMessages(10);
                
                await Promise.all(messages.map(async (message) => {
                    try {
                        await this.messageHandler(message.body);
                        await queue.deleteMessage(message.id!);
                    } catch (error) {
                        console.error(`Error processing message ${message.id}:`, error);
                        // Message will return to queue after visibility timeout
                    }
                }));
            } catch (error) {
                console.error('Error in queue consumer:', error);
                // Add delay before retry
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    stop(): void {
        this.isRunning = false;
    }
}

// Example message handlers
export const criticalMessageHandler = async (message: CriticalQueueMessage) => {
    switch (message.type) {
        case 'account_creation':
            // Handle account creation
            break;
        case 'bank_rate_update':
            // Handle bank rate update
            break;
    }
};

export const businessMessageHandler = async (message: BusinessQueueMessage) => {
    switch (message.type) {
        case 'phone_purchase':
            // Handle phone purchase
            break;
        case 'phone_recycle':
            // Handle phone recycle
            break;
    }
};

export const notificationMessageHandler = async (message: NotificationQueueMessage) => {
    switch (message.type) {
        case 'machine_failure':
        case 'truck_failure':
        case 'epoch_update':
            // Handle notifications
            break;
    }
}; 