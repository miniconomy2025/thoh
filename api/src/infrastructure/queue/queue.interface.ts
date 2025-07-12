export interface QueueMessage {
    id?: string;
    body: any;
    messageGroupId?: string; // Required for FIFO queues
    attributes?: Record<string, string>; // Message attributes for metadata
}

export interface IQueueService {
    sendMessage(message: QueueMessage): Promise<void>;
    receiveMessages(maxMessages: number): Promise<QueueMessage[]>;
    deleteMessage(messageId: string): Promise<void>;
} 