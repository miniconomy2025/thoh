import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { epochNotificationConfig } from '../../infrastructure/config/epoch-notification.config';
import { fetch } from 'undici';
import fs from 'fs';
import { Agent } from 'undici';
import path from "node:path";

export class NotifySimulationEpochUseCase {
    constructor() {}

    async execute(simulation: Simulation): Promise<void> {
        try {
            const epochTime = simulation.getUnixEpochStartTime();
            
            let fetchOptions = {};
            
            // Only try to use SSL in production
            if (process.env.NODE_ENV === 'production') {
                try {
                    const certPath = path.join(__dirname, 'thoh-client.crt');
                    const keyPath = path.join(__dirname, 'thoh-client.key');
                    
                    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
                        const agent = new Agent({
                            connect: {
                                cert: fs.readFileSync(certPath),
                                key: fs.readFileSync(keyPath),
                                rejectUnauthorized: false
                            }
                        });
                        fetchOptions = { dispatcher: agent };
                    }
                } catch (error) {
                    console.warn('SSL certificates not found, using regular HTTP');
                }
            }
            
            const notificationEvent = {
                epochStartTime: epochTime
            };

            const sendPromises = epochNotificationConfig.epochNotificationUrls.map(async (targetUrl: string) => {
                try {
                    const response = await fetch(targetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(notificationEvent),
                        ...fetchOptions
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send epoch notification: ${response.statusText}`);
                    }

                    console.log(`Epoch notification sent to ${targetUrl}`);
                } catch (error: unknown) {
                    const err = (error as Error);
                    console.error(`Failed to send epoch notification to ${targetUrl}:`,
                        JSON.stringify({
                            name: err.name,
                            message: err.message,
                            stack: err.stack,
                        })
                    );
                }
            });

            await Promise.all(sendPromises);
            console.log(`Epoch notifications processed for ${epochNotificationConfig.epochNotificationUrls.length} applications`);
        } catch (error: unknown) {
            const err = (error as Error);
            console.error('Error handling epoch notifications:',
                JSON.stringify({
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                })
            );
        }
    }
} 