import { Server as SocketServer } from 'socket.io';
import { WebhookData, WhatsAppMessage, FacebookMessage, TelegramMessage, LineEvent, ViberMessage } from '../types/webhook';
import { RetryMechanism } from '../utils/retryMechanism';
import { Message } from '../models/Message';
import { PlatformServiceFactory } from './PlatformServiceFactory';

export class MessagingService {
    constructor(private io: SocketServer) { }

    async handleWebhook(webhookData: WebhookData): Promise<void> {
        try {
            const message = await this.processWebhookByPlatform(webhookData);
            if (message) {
                await this.saveAndEmitMessage(message);
            }
        } catch (error) {
            console.error(`Error handling ${webhookData.platform} webhook:`, error);
            throw error;
        }
    }

    private async processWebhookByPlatform(webhookData: WebhookData): Promise<any> {
        const platformService = await PlatformServiceFactory.getPlatformService(webhookData.platform);

        switch (webhookData.platform) {
            case 'whatsapp':
                return this.processWhatsAppMessage(webhookData.data as WhatsAppMessage, platformService);
            case 'facebook':
                return this.processFacebookMessage(webhookData.data as FacebookMessage, platformService);
            case 'telegram':
                return this.processTelegramMessage(webhookData.data as TelegramMessage, platformService);
            case 'line':
                return this.processLineEvent(webhookData.data as LineEvent, platformService);
            case 'viber':
                return this.processViberMessage(webhookData.data as ViberMessage, platformService);
            default:
                throw new Error(`Unsupported platform: ${webhookData.platform}`);
        }
    }

    private async processWhatsAppMessage(message: WhatsAppMessage, platformService: any): Promise<any> {
        return RetryMechanism.withRetry(async () => {
            if (message.type === 'text' && message.text) {
                return {
                    platform: 'whatsapp',
                    senderId: message.from,
                    messageType: 'text',
                    content: message.text.body,
                    timestamp: new Date(message.timestamp)
                };
            } else if (message.type === 'image' && message.image) {
                return {
                    platform: 'whatsapp',
                    senderId: message.from,
                    messageType: 'image',
                    content: message.image.id,
                    timestamp: new Date(message.timestamp)
                };
            }
        }, 'WhatsApp message processing');
    }

    private async processFacebookMessage(message: FacebookMessage, platformService: any): Promise<any> {
        return RetryMechanism.withRetry(async () => {
            if (message.message.text) {
                return {
                    platform: 'facebook',
                    senderId: message.sender.id,
                    messageType: 'text',
                    content: message.message.text,
                    timestamp: new Date(message.timestamp)
                };
            } else if (message.message.attachments) {
                const attachment = message.message.attachments[0];
                return {
                    platform: 'facebook',
                    senderId: message.sender.id,
                    messageType: attachment.type,
                    content: attachment.payload.url,
                    timestamp: new Date(message.timestamp)
                };
            }
        }, 'Facebook message processing');
    }

    private async processTelegramMessage(message: TelegramMessage, platformService: any): Promise<any> {
        return RetryMechanism.withRetry(async () => {
            if (message.text) {
                return {
                    platform: 'telegram',
                    senderId: message.from.id.toString(),
                    messageType: 'text',
                    content: message.text,
                    timestamp: new Date(message.date * 1000)
                };
            } else if (message.photo) {
                const photo = message.photo[message.photo.length - 1];
                return {
                    platform: 'telegram',
                    senderId: message.from.id.toString(),
                    messageType: 'photo',
                    content: photo.file_id,
                    timestamp: new Date(message.date * 1000)
                };
            }
        }, 'Telegram message processing');
    }

    private async processLineEvent(event: LineEvent, platformService: any): Promise<any> {
        return RetryMechanism.withRetry(async () => {
            if (event.type === 'message' && event.message) {
                return {
                    platform: 'line',
                    senderId: event.source.userId,
                    messageType: event.message.type,
                    content: event.message.text || event.message.id,
                    timestamp: new Date(event.timestamp)
                };
            }
        }, 'LINE event processing');
    }

    private async processViberMessage(message: ViberMessage, platformService: any): Promise<any> {
        return RetryMechanism.withRetry(async () => {
            return {
                platform: 'viber',
                senderId: message.sender.id,
                messageType: message.message.type,
                content: message.message.text || message.message.media || '',
                timestamp: new Date(message.timestamp * 1000)
            };
        }, 'Viber message processing');
    }

    private async saveAndEmitMessage(messageData: any): Promise<void> {
        try {
            // Create and save message to database
            const message = new Message(messageData);
            await message.save();

            // Emit message to connected clients
            this.io.emit('new_message', message);
        } catch (error) {
            console.error('Error saving/emitting message:', error);
            throw error;
        }
    }
} 