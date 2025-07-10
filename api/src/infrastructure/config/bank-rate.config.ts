import { z } from 'zod';

const bankRateConfigSchema = z.object({
    bankRateUpdateUrl: z.string().url().optional(),
});

type BankRateConfig = z.infer<typeof bankRateConfigSchema>;

const config: BankRateConfig = {
    bankRateUpdateUrl: process.env.BANK_RATE_UPDATE_URL,
};

export const bankRateConfig = bankRateConfigSchema.parse(config); 