import { z } from 'zod';

const endSimulationNotificationConfigSchema = z.object({
    endSimulationNotificationUrls: z.array(z.string().url()),
});

type EndSimulationNotificationConfig = z.infer<typeof endSimulationNotificationConfigSchema>;

const config: EndSimulationNotificationConfig = {
    endSimulationNotificationUrls: process.env.END_SIMULATION_URLS ? 
        process.env.END_SIMULATION_URLS.split(',') : 
        [],
};

export const endSimulationNotificationConfig = endSimulationNotificationConfigSchema.parse(config);