import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { epochNotificationConfig } from '../../infrastructure/config/epoch-notification.config';
import { fetch } from 'undici';
import fs from 'fs';
import path from "node:path";

export class NotifySimulationEpochUseCase {
    constructor() {}

    async execute(simulation: Simulation): Promise<void> {
        try {
            const epochTime = simulation.getUnixEpochStartTime();
            
            let fetchOptions = {};
            
            
            const notificationEvent = {
                epochStartTime: epochTime
            };

            const sendPromises = epochNotificationConfig.epochNotificationUrls.map(async (targetUrl: string) => {
                try {
                    const response = await fetch(targetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Client-Id': 'thoh'
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