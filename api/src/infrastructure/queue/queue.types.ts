export type QueueType = 'critical' | 'business' | 'notification';

export const QueueType = {
    CRITICAL: 'critical' as QueueType,
    BUSINESS: 'business' as QueueType,
    NOTIFICATION: 'notification' as QueueType
};

export interface CriticalQueueMessage {
    type: 'account_creation' | 'bank_rate_update';
    payload: {
        accountNumber?: string;
        salaryCents?: number;
        personId?: number;
        primeRate?: number;
        simulationDate?: string;
        simulationTime?: string;
    };
}

export interface BusinessQueueMessage {
    type: 'phone_purchase' | 'phone_recycle';
    payload: {
        accountNumber?: string;
        phoneName?: string;
        quantity?: number;
        recycleQuantity?: number;
    };
}

export interface NotificationQueueMessage {
    type: 'machine_failure' | 'truck_failure' | 'epoch_update';
    payload: {
        itemName?: string;
        failureQuantity?: number;
        simulationDate?: string;
        simulationTime?: string;
        epochStartTime?: number;
    };
} 