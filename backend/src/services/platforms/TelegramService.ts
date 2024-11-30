import axios from 'axios';
import { PlatformService, MessageOptions, SendMessageResult } from './PlatformService';
import { config } from '../../config';

interface TelegramKeyboard {
    inline_keyboard?: Array<Array<{
        text: string;
        callback_data?: string;
        url?: string;
    }>>;
    keyboard?: Array<Array<{
        text: string;
        request_contact?: boolean;
        request_location?: boolean;
    }>>;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
}

export class TelegramService extends PlatformService {
    private apiUrl: string = 'https://api.telegram.org/bot';
    private botToken: string = '';
    private secretToken: string = '';

    async initialize(): Promise<void> {
        this.validateConfig(config.telegram, ['botToken', 'secretToken']);
        this.botToken = config.telegram.botToken;
        this.secretToken = config.telegram.secretToken;

        // Set webhook URL if provided
        if (config.telegram.webhookUrl) {
            await this.setWebhook(config.telegram.webhookUrl);
        }

        this.initialized = true;
    }

    private async setWebhook(url: string): Promise<void> {
        try {
            await axios.post(`${this.apiUrl}${this.botToken}/setWebhook`, {
                url,
                secret_token: this.secretToken,
                allowed_updates: ['message', 'callback_query', 'edited_message']
            });
        } catch (error) {
            console.error('Failed to set Telegram webhook:', error);
            throw error;
        }
    }

    async sendMessage(
        recipient: string,
        content: string,
        options?: MessageOptions
    ): Promise<SendMessageResult> {
        if (!this.initialized) {
            throw new Error('Telegram service not initialized');
        }

        try {
            let messagePayload: any = {
                chat_id: recipient,
                parse_mode: 'HTML'
            };

            if (options?.attachments && options.attachments.length > 0) {
                const attachment = options.attachments[0];
                const method = this.getMethodForAttachment(attachment.type);

                messagePayload = {
                    ...messagePayload,
                    caption: content,
                    [this.getFieldForAttachment(attachment.type)]: attachment.url
                };

                // Handle custom keyboard if provided in metadata
                if (options.metadata?.keyboard) {
                    messagePayload.reply_markup = this.buildKeyboard(options.metadata.keyboard);
                }

                const response = await axios.post(
                    `${this.apiUrl}${this.botToken}/${method}`,
                    messagePayload
                );

                return {
                    messageId: response.data.result.message_id.toString(),
                    timestamp: Date.now(),
                    status: 'sent'
                };
            } else {
                messagePayload.text = content;

                // Handle custom keyboard if provided in metadata
                if (options?.metadata?.keyboard) {
                    messagePayload.reply_markup = this.buildKeyboard(options.metadata.keyboard);
                }

                // Handle reply to message
                if (options?.replyToMessageId) {
                    messagePayload.reply_to_message_id = options.replyToMessageId;
                }

                const response = await axios.post(
                    `${this.apiUrl}${this.botToken}/sendMessage`,
                    messagePayload
                );

                return {
                    messageId: response.data.result.message_id.toString(),
                    timestamp: Date.now(),
                    status: 'sent'
                };
            }
        } catch (error: any) {
            console.error('Telegram send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.description || error.message
            };
        }
    }

    private getMethodForAttachment(type: string): string {
        switch (type) {
            case 'image': return 'sendPhoto';
            case 'video': return 'sendVideo';
            case 'audio': return 'sendAudio';
            case 'document': return 'sendDocument';
            default: throw new Error(`Unsupported attachment type: ${type}`);
        }
    }

    private getFieldForAttachment(type: string): string {
        switch (type) {
            case 'image': return 'photo';
            case 'video': return 'video';
            case 'audio': return 'audio';
            case 'document': return 'document';
            default: throw new Error(`Unsupported attachment type: ${type}`);
        }
    }

    private buildKeyboard(keyboardData: any): TelegramKeyboard {
        if (keyboardData.inline) {
            return {
                inline_keyboard: keyboardData.buttons.map((row: any[]) =>
                    row.map(button => ({
                        text: button.text,
                        callback_data: button.data,
                        url: button.url
                    }))
                )
            };
        } else {
            return {
                keyboard: keyboardData.buttons.map((row: any[]) =>
                    row.map(button => ({
                        text: button.text,
                        request_contact: button.request_contact,
                        request_location: button.request_location
                    }))
                ),
                resize_keyboard: true,
                one_time_keyboard: keyboardData.one_time
            };
        }
    }

    async getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'> {
        // Telegram doesn't provide message status API
        // Messages are considered delivered when sent successfully
        return 'delivered';
    }

    validateWebhook(headers: Record<string, any>, body: any): boolean {
        // Telegram uses X-Telegram-Bot-Api-Secret-Token header for validation
        const secretToken = headers['x-telegram-bot-api-secret-token'];
        return secretToken === this.secretToken;
    }

    async processWebhook(body: any): Promise<{ type: 'message' | 'status' | 'error'; data: any }> {
        try {
            if (body.message) {
                const message = body.message;
                const messageData: any = {
                    messageId: message.message_id.toString(),
                    from: message.from.id.toString(),
                    timestamp: message.date * 1000,
                    type: this.getMessageType(message)
                };

                // Handle different message types
                if (message.text) {
                    messageData.text = message.text;
                } else if (message.photo) {
                    messageData.media = {
                        type: 'image',
                        file_id: message.photo[message.photo.length - 1].file_id
                    };
                } else if (message.video) {
                    messageData.media = {
                        type: 'video',
                        file_id: message.video.file_id
                    };
                } else if (message.document) {
                    messageData.media = {
                        type: 'document',
                        file_id: message.document.file_id,
                        mime_type: message.document.mime_type
                    };
                } else if (message.location) {
                    messageData.location = {
                        latitude: message.location.latitude,
                        longitude: message.location.longitude
                    };
                }

                return {
                    type: 'message',
                    data: messageData
                };
            }

            if (body.callback_query) {
                return {
                    type: 'message',
                    data: {
                        messageId: body.callback_query.message.message_id.toString(),
                        from: body.callback_query.from.id.toString(),
                        timestamp: Date.now(),
                        type: 'callback_query',
                        callbackData: body.callback_query.data
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

    private getMessageType(message: any): string {
        if (message.text) return 'text';
        if (message.photo) return 'image';
        if (message.video) return 'video';
        if (message.audio) return 'audio';
        if (message.voice) return 'voice';
        if (message.document) return 'document';
        if (message.location) return 'location';
        if (message.contact) return 'contact';
        if (message.sticker) return 'sticker';
        return 'unknown';
    }
} 