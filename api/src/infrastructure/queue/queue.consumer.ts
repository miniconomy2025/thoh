import { QueueFactory } from './queue.factory';
import { QueueType, CriticalQueueMessage, BusinessQueueMessage, NotificationQueueMessage } from './queue.types';
import { QueueMessage } from './queue.interface';
import { Agent, fetch } from 'undici';
import fs from 'fs';
import path from 'path';
import { PersonRepository } from '../persistence/postgres/person.repository';
import { json } from 'body-parser';

// Create HTTP client with optional SSL
const createHttpClient = () => {
    let options = {};
    
    // Only try to use SSL in production
    if (process.env.NODE_ENV === 'production') {
        try {
            const certPath = path.join(__dirname, '../../application/user-cases/thoh-client.crt');
            const keyPath = path.join(__dirname, '../../application/user-cases/thoh-client.key');
            
            if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
                const agent = new Agent({
                    connect: {
                        cert: fs.readFileSync(certPath),
                        key: fs.readFileSync(keyPath),
                        rejectUnauthorized: false
                    }
                });
                options = { dispatcher: agent };
            }
        } catch (error) {
            console.warn('SSL certificates not found, using regular HTTP');
        }
    }
    
    return options;
};

const httpClientOptions = createHttpClient();

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

    async initialize(): Promise<void> {
        console.log(`[${this.type}] Initializing consumer...`);
        // Test the connection by trying to receive messages once
        const queue = QueueFactory.getQueue(this.type);
        await queue.receiveMessages(1);
        console.log(`[${this.type}] Successfully initialized`);
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            console.log(`[${this.type}] Consumer already running`);
            return;
        }

        // First initialize
        await this.initialize();
        
        // Then start continuous polling in the background
        this.isRunning = true;
        this.pollMessages().catch(error => {
            console.error(`[${this.type}] Fatal error in message polling:`, error);
            this.isRunning = false;
        });
    }

    private async pollMessages(): Promise<void> {
        console.log(`[${this.type}] Starting continuous message polling...`);
        
        while (this.isRunning) {
            try {
                const queue = QueueFactory.getQueue(this.type);
                const messages = await queue.receiveMessages(10);
                
                if (messages.length > 0) {
                    console.log(`[${this.type}] Received ${messages.length} messages`);
                }
                
                await Promise.all(messages.map(async (message) => {
                    try {
                        console.log(`[${this.type}] Processing message ${message.id}`);
                        await this.messageHandler(message.body);
                        console.log(`[${this.type}] Successfully processed message ${message.id}`);
                        await queue.deleteMessage(message.id!);
                        this.retryCount.delete(message.id!);
                    } catch (error) {
                        console.error(`[${this.type}] Error processing message ${message.id}:`, error);
                        const retries = (this.retryCount.get(message.id!) || 0) + 1;
                        this.retryCount.set(message.id!, retries);
                        
                        if (retries >= this.MAX_RETRIES) {
                            console.error(`[${this.type}] Message ${message.id} failed after ${this.MAX_RETRIES} retries, removing from queue`);
                            await queue.deleteMessage(message.id!);
                            this.retryCount.delete(message.id!);
                        }
                    }
                }));

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`[${this.type}] Error in queue consumer:`, error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    stop(): void {
        console.log(`[${this.type}] Stopping consumer...`);
        this.isRunning = false;
    }
}

// Critical message handler for account creation and bank rate updates
export const criticalMessageHandler = async (message: CriticalQueueMessage) => {
    switch (message.type) {
        case 'account_creation':
            const { salaryCents, personId } = message.payload;
            
            // First check if we have the salary for the API call
            if (!salaryCents) {
                throw new Error('Salary cents required for account creation');
            }

            // In development, simulate account creation without making HTTP requests
            if (process.env.NODE_ENV !== 'production') {
                const accountId = `DEV-${Math.floor(Math.random() * 1000000)}`;
                if (!personId) {
                    throw new Error('Person ID required for internal database update');
                }
                await PersonRepository.getRepo().update(personId, {
                    accountNumber: accountId
                });
                console.log(`Development mode: Created simulated account ${accountId} for person ${personId}`);
                break;
            }
            console.log(process.env.RETAIL_BANK_API_URL , JSON.stringify({salaryCents}));
            const createAccountResponse = await fetch(process.env.RETAIL_BANK_API_URL + '/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ salaryCents }),
                ...httpClientOptions
            });

            if (!createAccountResponse.ok) {
                throw new Error(`Failed to create account: ${createAccountResponse.statusText}`);
            }

            const accountData = await createAccountResponse.json() as { accountId: string };
            
            // Now check if we have the person ID for our internal update
            if (!personId) {
                throw new Error('Person ID required for internal database update');
            }
            
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

            // In development, skip bank rate update
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Development mode: Skipped bank rate update (${primeRate}%)`);
                break;
            }

            const bankRateResponse = await fetch(process.env.BANK_RATE_UPDATE_URL!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primeRate, simulationDate, simulationTime }),
                ...httpClientOptions
            });

            if (!bankRateResponse.ok) {
                throw new Error(`Failed to update bank rate: ${bankRateResponse.statusText}`);
            }
            break;
    }
};

// Business message handler for phone-related operations
export const businessMessageHandler = async (message: BusinessQueueMessage) => {
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
                ...httpClientOptions
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
                ...httpClientOptions
            });

            if (!recycleResponse.ok) {
                throw new Error(`Failed to recycle phones: ${recycleResponse.statusText}`);
            }
            break;
    }
};

// Notification message handler for failures and epoch updates
export const notificationMessageHandler = async (message: NotificationQueueMessage) => {
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
                    ...httpClientOptions
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
                    ...httpClientOptions
                });

                if (!response.ok) {
                    throw new Error(`Failed to send epoch notification to ${url}: ${response.statusText}`);
                }
            }));
            break;
    }
}; 