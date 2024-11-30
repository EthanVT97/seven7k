"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const PlatformService_1 = require("./PlatformService");
const config_1 = require("../../config");
class LineService extends PlatformService_1.PlatformService {
    constructor() {
        super(...arguments);
        this.apiUrl = 'https://api.line.me/v2/bot';
        this.channelAccessToken = '';
        this.channelSecret = '';
    }
    async initialize() {
        this.validateConfig(config_1.config.line, ['channelAccessToken', 'channelSecret']);
        this.channelAccessToken = config_1.config.line.channelAccessToken;
        this.channelSecret = config_1.config.line.channelSecret;
        this.initialized = true;
    }
    async sendMessage(recipient, content, options) {
        if (!this.initialized) {
            throw new Error('LINE service not initialized');
        }
        try {
            let messages = [];
            if (options?.metadata?.template) {
                // Handle template messages
                messages.push({
                    type: 'template',
                    template: options.metadata.template
                });
            }
            else if (options?.metadata?.flex) {
                // Handle Flex messages
                messages.push({
                    type: 'flex',
                    contents: options.metadata.flex
                });
            }
            else if (options?.attachments && options.attachments.length > 0) {
                // Handle media messages
                const attachment = options.attachments[0];
                const message = this.createMediaMessage(attachment.type, attachment.url, content);
                messages.push(message);
            }
            else {
                // Handle text message
                messages.push({
                    type: 'text',
                    text: content
                });
            }
            const response = await axios_1.default.post(`${this.apiUrl}/message/push`, {
                to: recipient,
                messages
            }, {
                headers: {
                    'Authorization': `Bearer ${this.channelAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                messageId: response.data.messageId || Date.now().toString(),
                timestamp: Date.now(),
                status: 'sent'
            };
        }
        catch (error) {
            console.error('LINE send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.message || error.message
            };
        }
    }
    createMediaMessage(type, url, caption) {
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
    async getMessageStatus(messageId) {
        // LINE doesn't provide message status API
        return 'sent';
    }
    validateWebhook(headers, body) {
        const signature = headers['x-line-signature'];
        if (!signature)
            return false;
        const bodyStr = JSON.stringify(body);
        const expectedSignature = crypto_1.default
            .createHmac('SHA256', this.channelSecret)
            .update(bodyStr)
            .digest('base64');
        return signature === expectedSignature;
    }
    async processWebhook(body) {
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
    processMessageEvent(event) {
        const messageData = {
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
    processPostbackEvent(event) {
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
    processFollowEvent(event) {
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
exports.LineService = LineService;
