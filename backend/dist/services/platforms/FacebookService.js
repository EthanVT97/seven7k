"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const PlatformService_1 = require("./PlatformService");
const config_1 = require("../../config");
class FacebookService extends PlatformService_1.PlatformService {
    constructor() {
        super(...arguments);
        this.apiUrl = 'https://graph.facebook.com/v17.0';
        this.pageAccessToken = '';
        this.appSecret = '';
    }
    async initialize() {
        this.validateConfig(config_1.config.facebook, ['pageAccessToken', 'appSecret']);
        this.pageAccessToken = config_1.config.facebook.pageAccessToken;
        this.appSecret = config_1.config.facebook.appSecret;
        this.initialized = true;
    }
    async sendMessage(recipient, content, options) {
        if (!this.initialized) {
            throw new Error('Facebook service not initialized');
        }
        try {
            let messagePayload = {
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
            }
            else {
                messagePayload.message = { text: content };
            }
            // Add quick replies if provided in metadata
            if (options?.metadata?.quick_replies) {
                messagePayload.message.quick_replies = options.metadata.quick_replies;
            }
            const response = await axios_1.default.post(`${this.apiUrl}/me/messages`, messagePayload, {
                headers: {
                    'Authorization': `Bearer ${this.pageAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                messageId: response.data.message_id,
                timestamp: Date.now(),
                status: 'sent'
            };
        }
        catch (error) {
            console.error('Facebook send message error:', error.response?.data || error.message);
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
            throw new Error('Facebook service not initialized');
        }
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/${messageId}`, {
                headers: {
                    'Authorization': `Bearer ${this.pageAccessToken}`
                }
            });
            // Facebook doesn't provide direct status API, we infer from delivery/read receipts
            if (response.data.read)
                return 'read';
            if (response.data.delivered)
                return 'delivered';
            if (response.data.sent)
                return 'sent';
            return 'failed';
        }
        catch (error) {
            console.error('Facebook get message status error:', error);
            return 'failed';
        }
    }
    validateWebhook(headers, body) {
        const signature = headers['x-hub-signature-256'];
        if (!signature)
            return false;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.appSecret)
            .update(JSON.stringify(body))
            .digest('hex');
        return signature === `sha256=${expectedSignature}`;
    }
    async processWebhook(body) {
        try {
            const entry = body.entry[0];
            const messaging = entry.messaging[0];
            if (messaging.message) {
                const message = messaging.message;
                const messageData = {
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
}
exports.FacebookService = FacebookService;
