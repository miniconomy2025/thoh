import { IBankService, BankPaymentRequest } from '../../application/ports/service.ports';
import { Money } from '../../domain/shared/value-objects';

export class BankAdapter implements IBankService {
    async executeBulkPayments(payments: BankPaymentRequest[]): Promise<void> {
        // Stub: simulate payments
        return;
    }
    async depositToTreasury(amount: Money): Promise<void> {
        // Stub: simulate deposit
        return;
    }
    getPrimeRate(): number {
        // Example: return a fixed or random prime rate
        return 0.08 + Math.random() * 0.02; // 8-10%
    }
}
