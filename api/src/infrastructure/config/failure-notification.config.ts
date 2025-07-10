import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Schema for validating environment variables
const failureNotificationConfigSchema = z.object({
    MACHINE_FAILURE_URLS: z.string()
        .transform((str: string) => str.split(',').map((url: string) => url.trim()))
        .refine((urls: string[]) => urls.length > 0, 'At least one machine failure URL must be configured'),
    
    TRUCK_FAILURE_URLS: z.string()
        .transform((str: string) => str.split(',').map((url: string) => url.trim()))
        .refine((urls: string[]) => urls.length > 0, 'At least one truck failure URL must be configured')
});

// Configuration type derived from schema
type FailureNotificationConfig = z.infer<typeof failureNotificationConfigSchema>;

// Validate and export configuration
let config: FailureNotificationConfig;

try {
    config = failureNotificationConfigSchema.parse({
        MACHINE_FAILURE_URLS: process.env.MACHINE_FAILURE_URLS,
        TRUCK_FAILURE_URLS: process.env.TRUCK_FAILURE_URLS
    });
} catch (error: unknown) {
    if (error instanceof z.ZodError) {
        console.error('Invalid failure notification configuration:', error.issues);
    }
    throw new Error('Failed to load failure notification configuration');
}

export const failureNotificationConfig = {
    machineFailureUrls: config.MACHINE_FAILURE_URLS,
    truckFailureUrls: config.TRUCK_FAILURE_URLS
} as const; 