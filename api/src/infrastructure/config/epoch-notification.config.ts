import { z } from 'zod';

const epochNotificationConfigSchema = z.object({
    epochNotificationUrls: z.array(z.string().url()),
});

type EpochNotificationConfig = z.infer<typeof epochNotificationConfigSchema>;

const config: EpochNotificationConfig = {
    epochNotificationUrls: process.env.EPOCH_NOTIFICATION_URLS ? 
        process.env.EPOCH_NOTIFICATION_URLS.split(',') : 
        [],
};

export const epochNotificationConfig = epochNotificationConfigSchema.parse(config); 