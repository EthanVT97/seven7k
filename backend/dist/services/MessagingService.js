"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const retryMechanism_1 = require("../utils/retryMechanism");
const Message_1 = require("../models/Message");
const PlatformServiceFactory_1 = require("./PlatformServiceFactory");
class MessagingService {
    constructor(io) {
        this.io = io;
    }
    async handleWebhook(webhookData) {
        try {
            const message = await this.processWebhookByPlatform(webhookData);
            if (message) {
                await this.saveAndEmitMessage(message);
            }
        }
        catch (error) {
            console.error(`Error handling ${webhookData.platform} webhook:`, error);
            throw error;
        }
    }
    async processWebhookByPlatform(webhookData) {
        const platformService = await PlatformServiceFactory_1.PlatformServiceFactory.getPlatformService(webhookData.platform);
        switch (webhookData.platform) {
            case 'whatsapp':
                return this.processWhatsAppMessage(webhookData.data, platformService);
            case 'facebook':
                return this.processFacebookMessage(webhookData.data, platformService);
            case 'telegram':
                return this.processTelegramMessage(webhookData.data, platformService);
            case 'line':
                return this.processLineEvent(webhookData.data, platformService);
            case 'viber':
                return this.processViberMessage(webhookData.data, platformService);
            default:
                throw new Error(`Unsupported platform: ${webhookData.platform}`);
        }
    }
    async processWhatsAppMessage(message, platformService) {
        return retryMechanism_1.RetryMechanism.withRetry(async () => {
            if (message.type === 'text' && message.text) {
                return {
                    platform: 'whatsapp',
                    senderId: message.from,
                    messageType: 'text',
                    content: message.text.body,
                    timestamp: new Date(message.timestamp)
                };
            }
            else if (message.type === 'image' && message.image) {
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
    async processFacebookMessage(message, platformService) {
        return retryMechanism_1.RetryMechanism.withRetry(async () => {
            if (message.message.text) {
                return {
                    platform: 'facebook',
                    senderId: message.sender.id,
                    messageType: 'text',
                    content: message.message.text,
                    timestamp: new Date(message.timestamp)
                };
            }
            else if (message.message.attachments) {
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
    async processTelegramMessage(message, platformService) {
        return retryMechanism_1.RetryMechanism.withRetry(async () => {
            if (message.text) {
                return {
                    platform: 'telegram',
                    senderId: message.from.id.toString(),
                    messageType: 'text',
                    content: message.text,
                    timestamp: new Date(message.date * 1000)
                };
            }
            else if (message.photo) {
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
    async processLineEvent(event, platformService) {
        return retryMechanism_1.RetryMechanism.withRetry(async () => {
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
    async processViberMessage(message, platformService) {
        return retryMechanism_1.RetryMechanism.withRetry(async () => {
            return {
                platform: 'viber',
                senderId: message.sender.id,
                messageType: message.message.type,
                content: message.message.text || message.message.media || '',
                timestamp: new Date(message.timestamp * 1000)
            };
        }, 'Viber message processing');
    }
    async saveAndEmitMessage(messageData) {
        try {
            // Create and save message to database
            const message = new Message_1.Message(messageData);
            await message.save();
            // Emit message to connected clients
            this.io.emit('new_message', message);
        }
        catch (error) {
            console.error('Error saving/emitting message:', error);
            throw error;
        }
    }
}
exports.MessagingService = MessagingService;
