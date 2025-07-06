import { Money } from "../../domain/shared/value-objects";

export interface BankPaymentRequest {
    fromAccountId: string;
    toAccountId: string;
    amount: Money;
}

export interface IBankService {
    executeBulkPayments(payments: BankPaymentRequest[]): Promise<void>;
    depositToTreasury(amount: Money): Promise<void>; 
}

export interface INotificationService {
    notify(message: string): Promise<void>;
}