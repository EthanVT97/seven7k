import axios from 'axios';
import crypto from 'crypto';
import { PlatformService, MessageOptions, SendMessageResult } from './PlatformService';
import { config } from '../../config';

export class FacebookService extends PlatformService {
    private apiUrl: string = 'https://graph.facebook.com/v17.0';
    private pageAccessToken: string = '';
    private appSecret: string = '';

    async initialize(): Promise<void> {
        this.validateConfig(config.facebook, ['pageAccessToken', 'appSecret']);
        this.pageAccessToken = config.facebook.pageAccessToken;
        this.appSecret = config.facebook.appSecret;
        this.initialized = true;
    }

    async sendMessage(
        recipient: string,
        content: string,
        options?: MessageOptions
    ): Promise<SendMessageResult> {
        if (!this.initialized) {
            throw new Error('Facebook service not initialized');
        }

        try {
            let messagePayload: any = {
                recipient: { id: recipient },
                message: {}
            };

            if (options?.attachments && options.attachments.length > 0) {
                const attachment = options.attachments[0];
                messagePayload.message = {
                    attachment: {
                        type: attachment.type,
                        payload: {
                            url: attachment.url,
                            is_reusable: true
                        }
                    }
                };

                // Add caption if provided
                if (content) {
                    messagePayload.message.text = content;
                }
            } else {
                messagePayload.message = { text: content };
            }

            // Add quick replies if provided in metadata
            if (options?.metadata?.quick_replies) {
                messagePayload.message.quick_replies = options.metadata.quick_replies;
            }

            const response = await axios.post(
                `${this.apiUrl}/me/messages`,
                messagePayload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.pageAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                messageId: response.data.message_id,
                timestamp: Date.now(),
                status: 'sent'
            };
        } catch (error: any) {
            console.error('Facebook send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.error?.message || error.message
            };
        }
    }

    async getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'> {
        if (!this.initialized) {
            throw new Error('Facebook service not initialized');
        }

        try {
            const response = await axios.get(
                `${this.apiUrl}/${messageId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.pageAccessToken}`
                    }
                }
            );

            // Facebook doesn't provide direct status API, we infer from delivery/read receipts
            if (response.data.read) return 'read';
            if (response.data.delivered) return 'delivered';
            if (response.data.sent) return 'sent';
            return 'failed';
        } catch (error) {
            console.error('Facebook get message status error:', error);
            return 'failed';
        }
    }

    validateWebhook(headers: Record<string, any>, body: any): boolean {
        const signature = headers['x-hub-signature-256'];
        if (!signature) return false;

        const expectedSignature = crypto
            .createHmac('sha256', this.appSecret)
            .update(JSON.stringify(body))
            .digest('hex');

        return signature === `sha256=${expectedSignature}`;
    }

    async processWebhook(body: any): Promise<{ type: 'message' | 'status' | 'error'; data: any }> {
        try {
            const entry = body.entry[0];
            const messaging = entry.messaging[0];

            if (messaging.message) {
                const message = messaging.message;
                const messageData: any = {
                    messageId: message.mid,
                    from: messaging.sender.id,
                    timestamp: messaging.timestamp,
                    type: message.attachments ? message.attachments[0].type : 'text'
                };

                if (message.text) {
                    messageData.text = message.text;
                }

                if (message.attachments) {
                    messageData.media = {
                        type: message.attachments[0].type,
                        url: message.attachments[0].payload.url
                    };
                }

                if (message.quick_reply) {
                    messageData.quickReply = message.quick_reply.payload;
                }

                return {
                    type: 'message',
                    data: messageData
                };
            }

            if (messaging.delivery) {
                return {
                    type: 'status',
                    data: {
                        messageId: messaging.delivery.mids[0],
                        recipient: messaging.recipient.id,
                        status: 'delivered',
                        timestamp: messaging.delivery.watermark
                    }
                };
            }

            if (messaging.read) {
                return {
                    type: 'status',
                    data: {
                        recipient: messaging.recipient.id,
                        status: 'read',
                        timestamp: messaging.read.watermark
                    }
                };
            }

            return {
                type: 'error',
                data: {
                    error: 'Unknown webhook event type',
                    body
                }
            };
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
} 