import 'dotenv/config';
import { QueueFactory } from '../infrastructure/queue/queue.factory';
import { QueueType } from '../infrastructure/queue/queue.types';

async function testQueues() {
    try {
        console.log('🧪 Starting queue functionality test...');

        // Test Critical Queue (FIFO)
        console.log('\n📝 Testing Critical Queue (FIFO)...');
        const criticalQueue = QueueFactory.getCriticalQueue();
        const criticalMessage = {
            body: {
                type: 'bank_rate_update',
                payload: {
                    primeRate: 5.5,
                    simulationDate: new Date().toISOString(),
                    simulationTime: Date.now()
                }
            },
            messageGroupId: 'test-group-1', // Required for FIFO queues
            attributes: {
                MessageDeduplicationId: `dedup-${Date.now()}` // Required for FIFO queues unless content-based deduplication is enabled
            }
        };
        await criticalQueue.sendMessage(criticalMessage);
        console.log('✅ Successfully sent message to Critical Queue');

        // Test Business Queue (FIFO)
        console.log('\n📝 Testing Business Queue (FIFO)...');
        const businessQueue = QueueFactory.getBusinessQueue();
        const businessMessage = {
            body: {
                type: 'phone_recycle',
                payload: {
                    recycleQuantity: 5
                }
            },
            messageGroupId: 'test-group-1', // Required for FIFO queues
            attributes: {
                MessageDeduplicationId: `dedup-${Date.now()}` // Required for FIFO queues unless content-based deduplication is enabled
            }
        };
        await businessQueue.sendMessage(businessMessage);
        console.log('✅ Successfully sent message to Business Queue');

        // Test Notification Queue (Standard)
        console.log('\n📝 Testing Notification Queue...');
        const notificationQueue = QueueFactory.getNotificationQueue();
        await notificationQueue.sendMessage({
            body: {
                type: 'machine_failure',
                payload: {
                    itemName: 'Test Machine',
                    failureQuantity: 2,
                    simulationDate: new Date().toISOString(),
                    simulationTime: Date.now()
                }
            }
        });
        console.log('✅ Successfully sent message to Notification Queue');

        // Test message consumption
        console.log('\n📝 Testing message consumption...');
        console.log('Waiting for messages (will timeout after 30 seconds)...');

        const queues = [
            { type: QueueType.CRITICAL, queue: criticalQueue },
            { type: QueueType.BUSINESS, queue: businessQueue },
            { type: QueueType.NOTIFICATION, queue: notificationQueue }
        ];

        // Set a timeout for message consumption
        const timeout = setTimeout(() => {
            console.log('⚠️ Timeout reached while waiting for messages');
            process.exit(0);
        }, 30000);

        // Try to receive messages from all queues
        for (const { type, queue } of queues) {
            const messages = await queue.receiveMessages(10);
            console.log(`\nReceived ${messages.length} messages from ${type} queue:`);
            
            for (const message of messages) {
                console.log('Message:', JSON.stringify(message.body, null, 2));
                // Delete the message after processing
                if (message.id) {
                    await queue.deleteMessage(message.id);
                    console.log('✅ Successfully deleted message');
                }
            }
        }

        clearTimeout(timeout);
        console.log('\n✅ Queue test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error during queue test:', error);
        process.exit(1);
    }
}

// Run the test
testQueues(); 