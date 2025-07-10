import { BankPaymentRequest, IBankService, INotificationService } from "../../application/ports/service.ports";
import { Money } from "../../domain/shared/value-objects";

export class StubBankService implements IBankService {
    public async executeBulkPayments(payments: BankPaymentRequest[]): Promise<void> {
        if (payments.length === 0) {
            return;
        }
    }

    public async depositToTreasury(amount: Money): Promise<void> {
    }
}

export class ConsoleNotificationService implements INotificationService {
    public async notify(message: string): Promise<void> {
    }
}