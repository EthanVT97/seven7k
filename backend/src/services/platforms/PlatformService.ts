export interface MessageAttachment {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    name?: string;
    size?: number;
}

export interface PlatformMessage {
    platformMessageId?: string;
    content: string;
    recipient: string;
    attachments?: MessageAttachment[];
    replyToId?: string;
}

export interface PlatformResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface MessageOptions {
    replyToMessageId?: string;
    attachments?: Array<{
        type: 'image' | 'video' | 'audio' | 'document';
        url: string;
        caption?: string;
    }>;
    metadata?: Record<string, any>;
}

export interface SendMessageResult {
    messageId: string;
    timestamp: number;
    status: 'sent' | 'failed';
    error?: string;
}

export abstract class PlatformService {
    protected initialized: boolean = false;

    abstract initialize(): Promise<void>;

    abstract sendMessage(
        recipient: string,
        content: string,
        options?: MessageOptions
    ): Promise<SendMessageResult>;

    abstract getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'>;

    abstract validateWebhook(headers: Record<string, any>, body: any): boolean;

    abstract processWebhook(body: any): Promise<{
        type: 'message' | 'status' | 'error';
        data: any;
    }>;

    isInitialized(): boolean {
        return this.initialized;
    }

    protected validateConfig(config: Record<string, any>, requiredFields: string[]): void {
        const missingFields = requiredFields.filter(field => !config[field]);
        if (missingFields.length > 0) {
            throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
        }
    }
}