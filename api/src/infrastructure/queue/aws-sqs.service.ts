import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, SendMessageBatchCommand, DeleteMessageBatchCommand } from '@aws-sdk/client-sqs';
import { IQueueService, QueueMessage } from './queue.interface';

export class AWSSQSService implements IQueueService {
    private sqs: SQSClient;
    private queueUrl: string;

    constructor(region: string, queueUrl: string) {
        this.sqs = new SQSClient({ region });
        this.queueUrl = queueUrl;
    }

    async sendMessage(message: QueueMessage): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(message.body),
            MessageGroupId: message.messageGroupId, // Add MessageGroupId for FIFO queues
            MessageAttributes: message.attributes ? this.convertAttributes(message.attributes) : undefined
        });

        await this.sqs.send(command);
    }

    async sendBatchMessages(messages: QueueMessage[]): Promise<void> {
        const entries = messages.map((msg, index) => ({
            Id: `${index}`,
            MessageBody: JSON.stringify(msg.body),
            MessageGroupId: msg.messageGroupId, // Add MessageGroupId for FIFO queues
            MessageAttributes: msg.attributes ? this.convertAttributes(msg.attributes) : undefined
        }));

        const command = new SendMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: entries
        });

        await this.sqs.send(command);
    }

    async receiveMessages(maxMessages: number = 10): Promise<QueueMessage[]> {
        const command = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: maxMessages,
            WaitTimeSeconds: 20, // Long polling
            MessageAttributeNames: ['All']
        });

        const response = await this.sqs.send(command);
        
        if (!response.Messages) {
            return [];
        }

        return response.Messages.map(msg => ({
            id: msg.ReceiptHandle,
            body: JSON.parse(msg.Body || '{}'),
            attributes: msg.MessageAttributes ? this.parseAttributes(msg.MessageAttributes) : undefined
        }));
    }

    async deleteMessage(messageId: string): Promise<void> {
        const command = new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: messageId
        });

        await this.sqs.send(command);
    }

    async deleteBatchMessages(messageIds: string[]): Promise<void> {
        const entries = messageIds.map((id, index) => ({
            Id: `${index}`,
            ReceiptHandle: id
        }));

        const command = new DeleteMessageBatchCommand({
            QueueUrl: this.queueUrl,
            Entries: entries
        });

        await this.sqs.send(command);
    }

    private convertAttributes(attributes: Record<string, string>): Record<string, any> {
        const converted: Record<string, any> = {};
        for (const [key, value] of Object.entries(attributes)) {
            converted[key] = {
                DataType: 'String',
                StringValue: value
            };
        }
        return converted;
    }

    private parseAttributes(attributes: Record<string, any>): Record<string, string> {
        const parsed: Record<string, string> = {};
        for (const [key, value] of Object.entries(attributes)) {
            if (value.StringValue) {
                parsed[key] = value.StringValue;
            }
        }
        return parsed;
    }
} 