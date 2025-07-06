import { BankPaymentRequest, IBankService, INotificationService } from "../../application/ports/service.ports";
import { Money } from "../../domain/shared/value-objects";

export class StubBankService implements IBankService {
    public async executeBulkPayments(payments: BankPaymentRequest[]): Promise<void> {
        console.log("--- Executing Bulk Payments ---");
        if (payments.length === 0) {
            console.log("No payments to process.");
            return;
        }
        
        payments.forEach(p => {
            console.log(`[BANK] Transferred ${p.amount.amount} ${p.amount.currency} from ${p.fromAccountId} to ${p.toAccountId}`);
        });
        console.log(`--- Total Payments Processed: ${payments.length} ---`);
    }

    public async depositToTreasury(amount: Money): Promise<void> {
        console.log(`[BANK] Deposited ${amount.amount} ${amount.currency} into THoH Treasury.`);
    }
}

export class ConsoleNotificationService implements INotificationService {
    public async notify(message: string): Promise<void> {
        console.log(`[NOTIFICATION] ${message}`);
    }
}