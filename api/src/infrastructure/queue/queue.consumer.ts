import { QueueFactory } from './queue.factory';
import { QueueType, CriticalQueueMessage, BusinessQueueMessage, NotificationQueueMessage } from './queue.types';
import { QueueMessage } from './queue.interface';
import { Agent, fetch } from 'undici';
import fs from 'fs';
import path from 'path';
import { PersonRepository } from '../persistence/postgres/person.repository';

// Create HTTPS agent for secure connections
const createHttpsAgent = () => new Agent({
    connect: {
        cert: fs.readFileSync(path.join(__dirname, '../../application/user-cases/thoh-client.crt')),
        key: fs.readFileSync(path.join(__dirname, '../../application/user-cases/thoh-client.key')),
        rejectUnauthorized: false
    }
});

export class QueueConsumer {
    private isRunning: boolean = false;
    private type: QueueType;
    private messageHandler: (message: any) => Promise<void>;
    private retryCount: Map<string, number> = new Map();
    private readonly MAX_RETRIES = 3;

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
                        this.retryCount.delete(message.id!);
                    } catch (error) {
                        console.error(`Error processing message ${message.id}:`, error);
                        const retries = (this.retryCount.get(message.id!) || 0) + 1;
                        this.retryCount.set(message.id!, retries);
                        
                        if (retries >= this.MAX_RETRIES) {
                            console.error(`Message ${message.id} failed after ${this.MAX_RETRIES} retries, removing from queue`);
                            await queue.deleteMessage(message.id!);
                            this.retryCount.delete(message.id!);
                        }
                        // Message will return to queue after visibility timeout for retry
                    }
                }));
            } catch (error) {
                console.error('Error in queue consumer:', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    stop(): void {
        this.isRunning = false;
    }
}

// Critical message handler for account creation and bank rate updates
export const criticalMessageHandler = async (message: CriticalQueueMessage) => {
    const agent = createHttpsAgent();

    switch (message.type) {
        case 'account_creation':
            const { salaryCents, personId } = message.payload;
            if (!salaryCents || !personId) {
                throw new Error('Salary cents and person ID required for account creation');
            }
            
            const createAccountResponse = await fetch(process.env.RETAIL_BANK_API_URL + '/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salaryCents }),
                dispatcher: agent
            });

            if (!createAccountResponse.ok) {
                throw new Error(`Failed to create account: ${createAccountResponse.statusText}`);
            }

            const accountData = await createAccountResponse.json() as { accountId: string };
            
            // Update person with new account number
            await PersonRepository.getRepo().update(personId, {
                accountNumber: accountData.accountId
            });

            console.log(`Account created and assigned to person ${personId}`);
            break;

        case 'bank_rate_update':
            const { primeRate, simulationDate, simulationTime } = message.payload;
            if (!primeRate || !simulationDate || !simulationTime) {
                throw new Error('Prime rate, simulation date, and time required for bank rate update');
            }

            const bankRateResponse = await fetch(process.env.BANK_RATE_UPDATE_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primeRate, simulationDate, simulationTime }),
                dispatcher: agent
            });

            if (!bankRateResponse.ok) {
                throw new Error(`Failed to update bank rate: ${bankRateResponse.statusText}`);
            }
            break;
    }
};

// Business message handler for phone-related operations
export const businessMessageHandler = async (message: BusinessQueueMessage) => {
    const agent = createHttpsAgent();

    switch (message.type) {
        case 'phone_purchase':
            const { accountNumber, phoneName, quantity } = message.payload;
            if (!accountNumber || !phoneName) {
                throw new Error('Account number and phone name required for phone purchase');
            }

            const isPearPhone = phoneName.startsWith('ePhone');
            const apiUrl = isPearPhone ? process.env.PEAR_PHONE_API_URL : process.env.SUM_SANG_API_URL;

            const purchaseResponse = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_number: accountNumber,
                    items: [{ name: phoneName, quantity: quantity || 1 }]
                }),
                dispatcher: agent
            });

            if (!purchaseResponse.ok) {
                throw new Error(`Failed to purchase phone: ${purchaseResponse.statusText}`);
            }
            break;

        case 'phone_recycle':
            const { recycleQuantity } = message.payload;
            if (!recycleQuantity) throw new Error('Recycle quantity required');

            const recycleResponse = await fetch(process.env.RECYCLER_API_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: recycleQuantity }),
                dispatcher: agent
            });

            if (!recycleResponse.ok) {
                throw new Error(`Failed to recycle phones: ${recycleResponse.statusText}`);
            }
            break;
    }
};

// Notification message handler for failures and epoch updates
export const notificationMessageHandler = async (message: NotificationQueueMessage) => {
    const agent = createHttpsAgent();

    switch (message.type) {
        case 'machine_failure':
        case 'truck_failure':
            const { itemName, failureQuantity, simulationDate, simulationTime } = message.payload;
            if (!itemName || !failureQuantity || !simulationDate || !simulationTime) {
                throw new Error('Item name, failure quantity, simulation date, and time required for failure notification');
            }

            const urls = message.type === 'machine_failure' 
                ? process.env.MACHINE_FAILURE_URLS?.split(',') 
                : process.env.TRUCK_FAILURE_URLS?.split(',');

            if (!urls || urls.length === 0) {
                console.warn(`No URLs configured for ${message.type} notifications`);
                return;
            }

            await Promise.all(urls.map(async (url) => {
                const response = await fetch(url.trim(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        itemName,
                        failureQuantity,
                        simulationDate,
                        simulationTime
                    }),
                    dispatcher: agent
                });

                if (!response.ok) {
                    throw new Error(`Failed to send ${message.type} notification to ${url}: ${response.statusText}`);
                }
            }));
            break;

        case 'epoch_update':
            const { epochStartTime } = message.payload;
            if (!epochStartTime) throw new Error('Epoch start time required for epoch update');

            const epochUrls = process.env.EPOCH_NOTIFICATION_URLS?.split(',');
            if (!epochUrls || epochUrls.length === 0) {
                console.warn('No URLs configured for epoch notifications');
                return;
            }

            await Promise.all(epochUrls.map(async (url) => {
                const response = await fetch(url.trim(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ epochStartTime }),
                    dispatcher: agent
                });

                if (!response.ok) {
                    throw new Error(`Failed to send epoch notification to ${url}: ${response.statusText}`);
                }
            }));
            break;
    }
}; 