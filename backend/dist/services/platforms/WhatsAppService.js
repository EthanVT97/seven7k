"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const axios_1 = __importDefault(require("axios"));
const PlatformService_1 = require("./PlatformService");
const config_1 = require("../../config");
const crypto_1 = __importDefault(require("crypto"));
class WhatsAppService extends PlatformService_1.PlatformService {
    constructor() {
        super(...arguments);
        this.apiUrl = 'https://graph.facebook.com/v17.0';
        this.accessToken = '';
        this.phoneNumberId = '';
    }
    async initialize() {
        this.validateConfig(config_1.config.whatsapp, ['accessToken', 'phoneNumberId']);
        this.accessToken = config_1.config.whatsapp.accessToken;
        this.phoneNumberId = config_1.config.whatsapp.phoneNumberId;
        this.initialized = true;
    }
    async sendMessage(recipient, content, options) {
        if (!this.initialized) {
            throw new Error('WhatsApp service not initialized');
        }
        try {
            let messagePayload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipient
            };
            if (options?.attachments && options.attachments.length > 0) {
                const attachment = options.attachments[0]; // WhatsApp allows one attachment per message
                messagePayload.type = attachment.type;
                messagePayload[attachment.type] = {
                    link: attachment.url,
                    caption: content // Use content as caption for media
                };
            }
            else {
                messagePayload.type = 'text';
                messagePayload.text = { body: content };
            }
            // Add reply-to functionality if specified
            if (options?.replyToMessageId) {
                messagePayload.context = {
                    message_id: options.replyToMessageId
                };
            }
            const response = await axios_1.default.post(`${this.apiUrl}/${this.phoneNumberId}/messages`, messagePayload, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                messageId: response.data.messages[0].id,
                timestamp: Date.now(),
                status: 'sent'
            };
        }
        catch (error) {
            console.error('WhatsApp send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.error?.message || error.message
            };
        }
    }
    async getMessageStatus(messageId) {
        if (!this.initialized) {
            throw new Error('WhatsApp service not initialized');
        }
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            const status = response.data.status;
            switch (status) {
                case 'sent':
                    return 'sent';
                case 'delivered':
                    return 'delivered';
                case 'read':
                    return 'read';
                default:
                    return 'failed';
            }
        }
        catch (error) {
            console.error('WhatsApp get message status error:', error);
            return 'failed';
        }
    }
    validateWebhook(headers, body) {
        const signature = headers['x-hub-signature-256'];
        if (!signature)
            return false;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', config_1.config.whatsapp.verifyToken)
            .update(JSON.stringify(body))
            .digest('hex');
        return signature === `sha256=${expectedSignature}`;
    }
    async processWebhook(body) {
        try {
            const entry = body.entry[0];
            const changes = entry.changes[0];
            const value = changes.value;
            if (value.messages) {
                const message = value.messages[0];
                const messageData = {
                    messageId: message.id,
                    from: message.from,
                    timestamp: message.timestamp,
                    type: message.type,
                };
                // Handle different message types
                switch (message.type) {
                    case 'text':
                        messageData.text = message.text.body;
                        break;
                    case 'image':
                        messageData.media = {
                            type: 'image',
                            id: message.image.id,
                            mime_type: message.image.mime_type,
                            sha256: message.image.sha256,
                            url: await this.getMediaUrl(message.image.id)
                        };
                        break;
                    case 'video':
                    case 'audio':
                    case 'document':
                        messageData.media = {
                            type: message.type,
                            id: message[message.type].id,
                            mime_type: message[message.type].mime_type,
                            url: await this.getMediaUrl(message[message.type].id)
                        };
                        break;
                }
                return {
                    type: 'message',
                    data: messageData
                };
            }
            if (value.statuses) {
                const status = value.statuses[0];
                return {
                    type: 'status',
                    data: {
                        messageId: status.id,
                        recipient: status.recipient_id,
                        status: status.status,
                        timestamp: status.timestamp
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
    async getMediaUrl(mediaId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/${mediaId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data.url;
        }
        catch (error) {
            console.error('Failed to get media URL:', error);
            throw error;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
