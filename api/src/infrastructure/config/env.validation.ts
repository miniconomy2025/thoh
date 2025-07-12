import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const envSchema = z.object({
    // AWS Configuration
    AWS_REGION: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),

    // SQS Queue URLs
    AWS_SQS_CRITICAL_QUEUE_URL: z.string().url().endsWith('.fifo'),
    AWS_SQS_BUSINESS_QUEUE_URL: z.string().url().endsWith('.fifo'),
    AWS_SQS_NOTIFICATION_QUEUE_URL: z.string().url(),

    // API URLs
    RETAIL_BANK_API_URL: z.string().url(),
    BANK_RATE_UPDATE_URL: z.string().url(),
    PEAR_PHONE_API_URL: z.string().url(),
    SUM_SANG_API_URL: z.string().url(),
    RECYCLER_API_URL: z.string().url(),

    // Notification URLs (comma-separated)
    MACHINE_FAILURE_URLS: z.string().min(1),
    TRUCK_FAILURE_URLS: z.string().min(1),
    EPOCH_NOTIFICATION_URLS: z.string().min(1)
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', error.issues);
        }
        process.exit(1);
    }
}

export const env = validateEnv(); 