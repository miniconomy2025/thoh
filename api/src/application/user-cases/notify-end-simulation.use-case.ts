import fs from 'fs';
import path from "node:path";
import { Agent, fetch } from 'undici';
import { endSimulationNotificationConfig } from '../../infrastructure/config/end-simulation-notification.config';

export class NotifyEndSimulationUseCase {
    constructor() {}

    async execute(): Promise<void> {
        try {
            const sendPromises = endSimulationNotificationConfig.endSimulationNotificationUrls.map(async (targetUrl: string) => {
                try {
                    const response = await fetch(targetUrl, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Client-Id': 'thoh'
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send end simulation notification: ${response.statusText}`);
                    }

                    console.log(`End simulation notification sent to ${targetUrl}`);
                } catch (error: unknown) {
                    console.error(`Failed to send end simulation notification to ${targetUrl}:`, (error as Error).message);
                }
            });

            await Promise.all(sendPromises);
            console.log(`End simulation notifications processed for ${endSimulationNotificationConfig.endSimulationNotificationUrls.length} applications`);
        } catch (error: unknown) {
            console.error('Error handling end simulation notifications:', (error as Error).message);
        }
    }
}