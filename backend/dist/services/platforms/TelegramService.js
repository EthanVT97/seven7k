"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const axios_1 = __importDefault(require("axios"));
const PlatformService_1 = require("./PlatformService");
const config_1 = require("../../config");
class TelegramService extends PlatformService_1.PlatformService {
    constructor() {
        super(...arguments);
        this.apiUrl = 'https://api.telegram.org/bot';
        this.botToken = '';
        this.secretToken = '';
    }
    async initialize() {
        this.validateConfig(config_1.config.telegram, ['botToken', 'secretToken']);
        this.botToken = config_1.config.telegram.botToken;
        this.secretToken = config_1.config.telegram.secretToken;
        // Set webhook URL if provided
        if (config_1.config.telegram.webhookUrl) {
            await this.setWebhook(config_1.config.telegram.webhookUrl);
        }
        this.initialized = true;
    }
    async setWebhook(url) {
        try {
            await axios_1.default.post(`${this.apiUrl}${this.botToken}/setWebhook`, {
                url,
                secret_token: this.secretToken,
                allowed_updates: ['message', 'callback_query', 'edited_message']
            });
        }
        catch (error) {
            console.error('Failed to set Telegram webhook:', error);
            throw error;
        }
    }
    async sendMessage(recipient, content, options) {
        if (!this.initialized) {
            throw new Error('Telegram service not initialized');
        }
        try {
            let messagePayload = {
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
                const response = await axios_1.default.post(`${this.apiUrl}${this.botToken}/${method}`, messagePayload);
                return {
                    messageId: response.data.result.message_id.toString(),
                    timestamp: Date.now(),
                    status: 'sent'
                };
            }
            else {
                messagePayload.text = content;
                // Handle custom keyboard if provided in metadata
                if (options?.metadata?.keyboard) {
                    messagePayload.reply_markup = this.buildKeyboard(options.metadata.keyboard);
                }
                // Handle reply to message
                if (options?.replyToMessageId) {
                    messagePayload.reply_to_message_id = options.replyToMessageId;
                }
                const response = await axios_1.default.post(`${this.apiUrl}${this.botToken}/sendMessage`, messagePayload);
                return {
                    messageId: response.data.result.message_id.toString(),
                    timestamp: Date.now(),
                    status: 'sent'
                };
            }
        }
        catch (error) {
            console.error('Telegram send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.description || error.message
            };
        }
    }
    getMethodForAttachment(type) {
        switch (type) {
            case 'image': return 'sendPhoto';
            case 'video': return 'sendVideo';
            case 'audio': return 'sendAudio';
            case 'document': return 'sendDocument';
            default: throw new Error(`Unsupported attachment type: ${type}`);
        }
    }
    getFieldForAttachment(type) {
        switch (type) {
            case 'image': return 'photo';
            case 'video': return 'video';
            case 'audio': return 'audio';
            case 'document': return 'document';
            default: throw new Error(`Unsupported attachment type: ${type}`);
        }
    }
    buildKeyboard(keyboardData) {
        if (keyboardData.inline) {
            return {
                inline_keyboard: keyboardData.buttons.map((row) => row.map(button => ({
                    text: button.text,
                    callback_data: button.data,
                    url: button.url
                })))
            };
        }
        else {
            return {
                keyboard: keyboardData.buttons.map((row) => row.map(button => ({
                    text: button.text,
                    request_contact: button.request_contact,
                    request_location: button.request_location
                }))),
                resize_keyboard: true,
                one_time_keyboard: keyboardData.one_time
            };
        }
    }
    async getMessageStatus(messageId) {
        // Telegram doesn't provide message status API
        // Messages are considered delivered when sent successfully
        return 'delivered';
    }
    validateWebhook(headers, body) {
        // Telegram uses X-Telegram-Bot-Api-Secret-Token header for validation
        const secretToken = headers['x-telegram-bot-api-secret-token'];
        return secretToken === this.secretToken;
    }
    async processWebhook(body) {
        try {
            if (body.message) {
                const message = body.message;
                const messageData = {
                    messageId: message.message_id.toString(),
                    from: message.from.id.toString(),
                    timestamp: message.date * 1000,
                    type: this.getMessageType(message)
                };
                // Handle different message types
                if (message.text) {
                    messageData.text = message.text;
                }
                else if (message.photo) {
                    messageData.media = {
                        type: 'image',
                        file_id: message.photo[message.photo.length - 1].file_id
                    };
                }
                else if (message.video) {
                    messageData.media = {
                        type: 'video',
                        file_id: message.video.file_id
                    };
                }
                else if (message.document) {
                    messageData.media = {
                        type: 'document',
                        file_id: message.document.file_id,
                        mime_type: message.document.mime_type
                    };
                }
                else if (message.location) {
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
        }
        catch (error) {
            return {
                type: 'error',
                data: {
                    error: error.message,
                    body
                }
            };
        }
    }
    getMessageType(message) {
        if (message.text)
            return 'text';
        if (message.photo)
            return 'image';
        if (message.video)
            return 'video';
        if (message.audio)
            return 'audio';
        if (message.voice)
            return 'voice';
        if (message.document)
            return 'document';
        if (message.location)
            return 'location';
        if (message.contact)
            return 'contact';
        if (message.sticker)
            return 'sticker';
        return 'unknown';
    }
}
exports.TelegramService = TelegramService;
