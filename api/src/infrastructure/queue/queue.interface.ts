export interface QueueMessage {
    id?: string;
    body: any;
    attributes?: Record<string, string>;
}

export interface IQueueService {
    sendMessage(message: QueueMessage): Promise<void>;
    sendBatchMessages(messages: QueueMessage[]): Promise<void>;
    receiveMessages(maxMessages?: number): Promise<QueueMessage[]>;
    deleteMessage(messageId: string): Promise<void>;
    deleteBatchMessages(messageIds: string[]): Promise<void>;
} 