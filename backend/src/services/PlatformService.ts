export interface WebhookData {
    platform: 'whatsapp' | 'facebook' | 'telegram' | 'line' | 'viber';
    data: any;
}

export interface PlatformService {
    processWebhookEvent(data: WebhookData): Promise<any>;
    // ... other methods
} 