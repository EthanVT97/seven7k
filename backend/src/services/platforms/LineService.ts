import axios from 'axios';
import crypto from 'crypto';
import { PlatformService, MessageOptions, SendMessageResult } from './PlatformService';
import { config } from '../../config';

interface LineMessage {
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker' | 'template' | 'flex';
    text?: string;
    originalContentUrl?: string;
    previewImageUrl?: string;
    duration?: number;
    title?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    packageId?: string;
    stickerId?: string;
    template?: any;
    contents?: any;
}

export class LineService extends PlatformService {
    private apiUrl: string = 'https://api.line.me/v2/bot';
    private channelAccessToken: string = '';
    private channelSecret: string = '';

    async initialize(): Promise<void> {
        this.validateConfig(config.line, ['channelAccessToken', 'channelSecret']);
        this.channelAccessToken = config.line.channelAccessToken;
        this.channelSecret = config.line.channelSecret;
        this.initialized = true;
    }

    async sendMessage(
        recipient: string,
        content: string,
        options?: MessageOptions
    ): Promise<SendMessageResult> {
        if (!this.initialized) {
            throw new Error('LINE service not initialized');
        }

        try {
            let messages: LineMessage[] = [];

            if (options?.metadata?.template) {
                // Handle template messages
                messages.push({
                    type: 'template',
                    template: options.metadata.template
                });
            } else if (options?.metadata?.flex) {
                // Handle Flex messages
                messages.push({
                    type: 'flex',
                    contents: options.metadata.flex
                });
            } else if (options?.attachments && options.attachments.length > 0) {
                // Handle media messages
                const attachment = options.attachments[0];
                const message = this.createMediaMessage(attachment.type, attachment.url, content);
                messages.push(message);
            } else {
                // Handle text message
                messages.push({
                    type: 'text',
                    text: content
                });
            }

            const response = await axios.post(
                `${this.apiUrl}/message/push`,
                {
                    to: recipient,
                    messages
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.channelAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                messageId: response.data.messageId || Date.now().toString(),
                timestamp: Date.now(),
                status: 'sent'
            };
        } catch (error: any) {
            console.error('LINE send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.message || error.message
            };
        }
    }

    private createMediaMessage(type: string, url: string, caption?: string): LineMessage {
        switch (type) {
            case 'image':
                return {
                    type: 'image',
                    originalContentUrl: url,
                    previewImageUrl: url
                };
            case 'video':
                return {
                    type: 'video',
                    originalContentUrl: url,
                    previewImageUrl: url // Should be a thumbnail image URL
                };
            case 'audio':
                return {
                    type: 'audio',
                    originalContentUrl: url,
                    duration: 60000 // Duration in milliseconds
                };
            case 'file':
                return {
                    type: 'file',
                    originalContentUrl: url,
                    title: caption || 'File'
                };
            default:
                throw new Error(`Unsupported media type: ${type}`);
        }
    }

    async getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'> {
        // LINE doesn't provide message status API
        return 'sent';
    }

    validateWebhook(headers: Record<string, any>, body: any): boolean {
        const signature = headers['x-line-signature'];
        if (!signature) return false;

        const bodyStr = JSON.stringify(body);
        const expectedSignature = crypto
            .createHmac('SHA256', this.channelSecret)
            .update(bodyStr)
            .digest('base64');

        return signature === expectedSignature;
    }

    async processWebhook(body: any): Promise<{ type: 'message' | 'status' | 'error'; data: any }> {
        try {
            const events = body.events;
            if (!events || events.length === 0) {
                return {
                    type: 'error',
                    data: {
                        error: 'No events in webhook',
                        body
                    }
                };
            }

            const event = events[0]; // Process first event
            switch (event.type) {
                case 'message':
                    return this.processMessageEvent(event);
                case 'postback':
                    return this.processPostbackEvent(event);
                case 'follow':
                case 'unfollow':
                    return this.processFollowEvent(event);
                default:
                    return {
                        type: 'error',
                        data: {
                            error: `Unsupported event type: ${event.type}`,
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
        const messageData: any = {
            messageId: event.message.id,
            from: event.source.userId,
            timestamp: event.timestamp,
            type: event.message.type,
            replyToken: event.replyToken
        };

        switch (event.message.type) {
            case 'text':
                messageData.text = event.message.text;
                break;
            case 'image':
            case 'video':
            case 'audio':
            case 'file':
                messageData.media = {
                    type: event.message.type,
                    id: event.message.id,
                    contentProvider: event.message.contentProvider
                };
                break;
            case 'location':
                messageData.location = {
                    title: event.message.title,
                    address: event.message.address,
                    latitude: event.message.latitude,
                    longitude: event.message.longitude
                };
                break;
            case 'sticker':
                messageData.sticker = {
                    packageId: event.message.packageId,
                    stickerId: event.message.stickerId
                };
                break;
        }

        return {
            type: 'message',
            data: messageData
        };
    }

    private processPostbackEvent(event: any): { type: 'message'; data: any } {
        return {
            type: 'message',
            data: {
                messageId: `postback_${event.timestamp}`,
                from: event.source.userId,
                timestamp: event.timestamp,
                type: 'postback',
                postback: event.postback,
                replyToken: event.replyToken
            }
        };
    }

    private processFollowEvent(event: any): { type: 'status'; data: any } {
        return {
            type: 'status',
            data: {
                type: event.type,
                userId: event.source.userId,
                timestamp: event.timestamp
            }
        };
    }
} 