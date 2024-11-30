import axios from 'axios';
import crypto from 'crypto';
import { PlatformService, MessageOptions, SendMessageResult } from './PlatformService';
import { config } from '../../config';

interface ViberKeyboard {
    Type: 'keyboard';
    DefaultHeight?: boolean;
    Buttons: Array<{
        Columns: number;
        Rows: number;
        ActionType: 'reply' | 'open-url';
        ActionBody: string;
        Text: string;
        TextSize?: 'small' | 'medium' | 'large';
        TextVAlign?: 'top' | 'middle' | 'bottom';
        TextHAlign?: 'left' | 'center' | 'right';
        BgColor?: string;
        Image?: string;
    }>;
}

interface ViberMessage {
    type: 'text' | 'picture' | 'video' | 'file' | 'contact' | 'location' | 'rich_media';
    text?: string;
    media?: string;
    thumbnail?: string;
    file_name?: string;
    size?: number;
    duration?: number;
    contact?: {
        name: string;
        phone_number: string;
    };
    location?: {
        lat: number;
        lon: number;
    };
    keyboard?: ViberKeyboard;
    rich_media?: any;
    min_api_version?: number;
}

export class ViberService extends PlatformService {
    private apiUrl: string = 'https://chatapi.viber.com/pa';
    private authToken: string = '';
    private webhookUrl: string = '';
    private sender: { name: string; avatar?: string } = { name: 'Bot' };

    async initialize(): Promise<void> {
        this.validateConfig(config.viber, ['authToken']);
        this.authToken = config.viber.authToken;
        this.sender.name = config.viber.botName || 'Bot';
        this.sender.avatar = config.viber.botAvatar;

        // Set webhook if URL is provided
        if (config.viber.webhookUrl) {
            await this.setWebhook(config.viber.webhookUrl);
        }

        this.initialized = true;
    }

    private async setWebhook(url: string): Promise<void> {
        try {
            await axios.post(
                `${this.apiUrl}/set_webhook`,
                {
                    url,
                    event_types: [
                        'delivered',
                        'seen',
                        'failed',
                        'subscribed',
                        'unsubscribed',
                        'conversation_started'
                    ],
                    send_name: true,
                    send_photo: true
                },
                {
                    headers: {
                        'X-Viber-Auth-Token': this.authToken
                    }
                }
            );
        } catch (error) {
            console.error('Failed to set Viber webhook:', error);
            throw error;
        }
    }

    async sendMessage(
        recipient: string,
        content: string,
        options?: MessageOptions
    ): Promise<SendMessageResult> {
        if (!this.initialized) {
            throw new Error('Viber service not initialized');
        }

        try {
            let message: ViberMessage = {
                type: 'text',
                text: content,
                min_api_version: 3
            };

            if (options?.attachments && options.attachments.length > 0) {
                const attachment = options.attachments[0];
                message = this.createMediaMessage(attachment.type, attachment.url, content);
            }

            // Add keyboard if provided in metadata
            if (options?.metadata?.keyboard) {
                message.keyboard = this.createKeyboard(options.metadata.keyboard);
            }

            // Add rich media if provided
            if (options?.metadata?.rich_media) {
                message.type = 'rich_media';
                message.rich_media = options.metadata.rich_media;
            }

            const response = await axios.post(
                `${this.apiUrl}/send_message`,
                {
                    receiver: recipient,
                    sender: this.sender,
                    ...message
                },
                {
                    headers: {
                        'X-Viber-Auth-Token': this.authToken
                    }
                }
            );

            return {
                messageId: response.data.message_token.toString(),
                timestamp: Date.now(),
                status: 'sent'
            };
        } catch (error: any) {
            console.error('Viber send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.status_message || error.message
            };
        }
    }

    async broadcast(
        userIds: string[],
        content: string,
        options?: MessageOptions
    ): Promise<SendMessageResult> {
        if (!this.initialized) {
            throw new Error('Viber service not initialized');
        }

        try {
            let message: ViberMessage = {
                type: 'text',
                text: content,
                min_api_version: 3
            };

            if (options?.attachments && options.attachments.length > 0) {
                const attachment = options.attachments[0];
                message = this.createMediaMessage(attachment.type, attachment.url, content);
            }

            const response = await axios.post(
                `${this.apiUrl}/broadcast_message`,
                {
                    broadcast_list: userIds,
                    sender: this.sender,
                    ...message
                },
                {
                    headers: {
                        'X-Viber-Auth-Token': this.authToken
                    }
                }
            );

            return {
                messageId: response.data.message_token.toString(),
                timestamp: Date.now(),
                status: 'sent'
            };
        } catch (error: any) {
            console.error('Viber broadcast error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.status_message || error.message
            };
        }
    }

    private createMediaMessage(type: string, url: string, caption?: string): ViberMessage {
        switch (type) {
            case 'image':
                return {
                    type: 'picture',
                    text: caption,
                    media: url,
                    thumbnail: url
                };
            case 'video':
                return {
                    type: 'video',
                    media: url,
                    thumbnail: url,
                    size: 0,
                    duration: 0
                };
            case 'file':
                return {
                    type: 'file',
                    media: url,
                    file_name: caption || 'file',
                    size: 0
                };
            default:
                throw new Error(`Unsupported media type: ${type}`);
        }
    }

    private createKeyboard(keyboardData: any): ViberKeyboard {
        return {
            Type: 'keyboard',
            DefaultHeight: keyboardData.defaultHeight || false,
            Buttons: keyboardData.buttons.map((button: any) => ({
                Columns: button.columns || 6,
                Rows: button.rows || 1,
                ActionType: button.url ? 'open-url' : 'reply',
                ActionBody: button.url || button.payload,
                Text: button.text,
                TextSize: button.textSize || 'medium',
                TextVAlign: button.textVAlign || 'middle',
                TextHAlign: button.textHAlign || 'center',
                BgColor: button.bgColor,
                Image: button.image
            }))
        };
    }

    async getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'> {
        // Viber provides status through webhooks
        return 'sent';
    }

    validateWebhook(headers: Record<string, any>, body: any): boolean {
        const signature = headers['x-viber-content-signature'];
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', this.authToken)
            .update(JSON.stringify(body))
            .digest('hex');

        return signature === expectedSignature;
    }

    async processWebhook(body: any): Promise<{ type: 'message' | 'status' | 'error'; data: any }> {
        try {
            switch (body.event) {
                case 'message':
                    return this.processMessageEvent(body);
                case 'delivered':
                case 'seen':
                case 'failed':
                    return this.processStatusEvent(body);
                case 'subscribed':
                case 'unsubscribed':
                case 'conversation_started':
                    return this.processUserEvent(body);
                default:
                    return {
                        type: 'error',
                        data: {
                            error: `Unknown event type: ${body.event}`,
                            body
                        }
                    };
            }
        } catch (error: any) {
            return {
                type: 'error',
                data: {
                    error: error.message,
                    body
                }
            };
        }
    }

    private processMessageEvent(event: any): { type: 'message'; data: any } {
        const message = event.message;
        const messageData: any = {
            messageId: event.message_token,
            from: event.sender.id,
            timestamp: Date.now(),
            type: message.type,
            sender: {
                id: event.sender.id,
                name: event.sender.name,
                avatar: event.sender.avatar
            }
        };

        switch (message.type) {
            case 'text':
                messageData.text = message.text;
                break;
            case 'picture':
                messageData.media = {
                    type: 'image',
                    url: message.media,
                    thumbnail: message.thumbnail
                };
                break;
            case 'video':
                messageData.media = {
                    type: 'video',
                    url: message.media,
                    thumbnail: message.thumbnail,
                    duration: message.duration,
                    size: message.size
                };
                break;
            case 'contact':
                messageData.contact = message.contact;
                break;
            case 'location':
                messageData.location = message.location;
                break;
        }

        return {
            type: 'message',
            data: messageData
        };
    }

    private processStatusEvent(event: any): { type: 'status'; data: any } {
        return {
            type: 'status',
            data: {
                messageId: event.message_token,
                userId: event.user_id,
                status: event.event,
                timestamp: Date.now()
            }
        };
    }

    private processUserEvent(event: any): { type: 'status'; data: any } {
        return {
            type: 'status',
            data: {
                type: event.event,
                userId: event.user.id,
                timestamp: Date.now(),
                user: {
                    name: event.user.name,
                    avatar: event.user.avatar,
                    language: event.user.language,
                    country: event.user.country
                }
            }
        };
    }
} 