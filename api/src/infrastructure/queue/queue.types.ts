export enum QueueType {
    CRITICAL = 'critical',
    BUSINESS = 'business',
    NOTIFICATION = 'notification'
}

export interface CriticalQueueMessage {
    type: 'account_creation' | 'bank_rate_update';
    payload: {
        accountNumber?: string;
        salaryCents?: number;
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
        modelId?: string;
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