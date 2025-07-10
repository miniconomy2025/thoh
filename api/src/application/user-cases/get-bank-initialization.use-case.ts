interface BankInitializationResponse {
    primeRate: number;
    investmentValue: number;
}

export class GetBankInitializationUseCase {
    execute(): BankInitializationResponse {
        // Generate random prime rate between 4% and 16% with 2 decimal places
        const primeRate = Number((Math.random() * (16 - 4) + 4).toFixed(2));
        
        // Generate random investment value between 10B and 100B
        const minInvestment = 10_000_000_000;
        const maxInvestment = 100_000_000_000;
        const investmentValue = Math.floor(
            Math.random() * (maxInvestment - minInvestment + 1) + minInvestment
        );

        return {
            primeRate,
            investmentValue
        };
    }
} 