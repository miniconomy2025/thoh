import { Simulation } from '../../domain/simulation/simulation.aggregate';
import { epochNotificationConfig } from '../../infrastructure/config/epoch-notification.config';
import { fetch } from 'undici';
import fs from 'fs';
import { Agent } from 'undici';

export class NotifySimulationEpochUseCase {
    constructor() {}

    async execute(simulation: Simulation): Promise<void> {
        try {
            const epochTime = simulation.getUnixEpochStartTime();

            const agent = new Agent({
                connect: {
                    cert: fs.readFileSync('/thoh-client.crt'),
                    key: fs.readFileSync('/thoh-client.key'),
                    ca: fs.readFileSync('/root-ca.crt'),
                }
            });
            
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
                        dispatcher: agent
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send epoch notification: ${response.statusText}`);
                    }

                    console.log(`Epoch notification sent to ${targetUrl}`);
                } catch (error: unknown) {
                    console.error(`Failed to send epoch notification to ${targetUrl}:`, (error as Error).message);
                }
            });

            await Promise.all(sendPromises);
            console.log(`Epoch notifications processed for ${epochNotificationConfig.epochNotificationUrls.length} applications`);
        } catch (error: unknown) {
            console.error('Error handling epoch notifications:', (error as Error).message);
        }
    }
} 