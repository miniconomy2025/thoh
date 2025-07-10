export class UpdateBankPrimeRateUseCase {
    constructor() {}

    execute(): { primeRate: number } {
        // Generate random prime rate between 4% and 16% with 2 decimal places
        const minRate = 4.00;
        const maxRate = 16.00;
        const primeRate = Number((Math.random() * (maxRate - minRate) + minRate).toFixed(2));
        
        return { primeRate };
    }
} 