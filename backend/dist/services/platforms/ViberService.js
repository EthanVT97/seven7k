"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViberService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const PlatformService_1 = require("./PlatformService");
const config_1 = require("../../config");
class ViberService extends PlatformService_1.PlatformService {
    constructor() {
        super(...arguments);
        this.apiUrl = 'https://chatapi.viber.com/pa';
        this.authToken = '';
        this.webhookUrl = '';
        this.sender = { name: 'Bot' };
    }
    async initialize() {
        this.validateConfig(config_1.config.viber, ['authToken']);
        this.authToken = config_1.config.viber.authToken;
        this.sender.name = config_1.config.viber.botName || 'Bot';
        this.sender.avatar = config_1.config.viber.botAvatar;
        // Set webhook if URL is provided
        if (config_1.config.viber.webhookUrl) {
            await this.setWebhook(config_1.config.viber.webhookUrl);
        }
        this.initialized = true;
    }
    async setWebhook(url) {
        try {
            await axios_1.default.post(`${this.apiUrl}/set_webhook`, {
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
            }, {
                headers: {
                    'X-Viber-Auth-Token': this.authToken
                }
            });
        }
        catch (error) {
            console.error('Failed to set Viber webhook:', error);
            throw error;
        }
    }
    async sendMessage(recipient, content, options) {
        if (!this.initialized) {
            throw new Error('Viber service not initialized');
        }
        try {
            let message = {
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
            const response = await axios_1.default.post(`${this.apiUrl}/send_message`, {
                receiver: recipient,
                sender: this.sender,
                ...message
            }, {
                headers: {
                    'X-Viber-Auth-Token': this.authToken
                }
            });
            return {
                messageId: response.data.message_token.toString(),
                timestamp: Date.now(),
                status: 'sent'
            };
        }
        catch (error) {
            console.error('Viber send message error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.status_message || error.message
            };
        }
    }
    async broadcast(userIds, content, options) {
        if (!this.initialized) {
            throw new Error('Viber service not initialized');
        }
        try {
            let message = {
                type: 'text',
                text: content,
                min_api_version: 3
            };
            if (options?.attachments && options.attachments.length > 0) {
                const attachment = options.attachments[0];
                message = this.createMediaMessage(attachment.type, attachment.url, content);
            }
            const response = await axios_1.default.post(`${this.apiUrl}/broadcast_message`, {
                broadcast_list: userIds,
                sender: this.sender,
                ...message
            }, {
                headers: {
                    'X-Viber-Auth-Token': this.authToken
                }
            });
            return {
                messageId: response.data.message_token.toString(),
                timestamp: Date.now(),
                status: 'sent'
            };
        }
        catch (error) {
            console.error('Viber broadcast error:', error.response?.data || error.message);
            return {
                messageId: '',
                timestamp: Date.now(),
                status: 'failed',
                error: error.response?.data?.status_message || error.message
            };
        }
    }
    createMediaMessage(type, url, caption) {
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
    createKeyboard(keyboardData) {
        return {
            Type: 'keyboard',
            DefaultHeight: keyboardData.defaultHeight || false,
            Buttons: keyboardData.buttons.map((button) => ({
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
    async getMessageStatus(messageId) {
        // Viber provides status through webhooks
        return 'sent';
    }
    validateWebhook(headers, body) {
        const signature = headers['x-viber-content-signature'];
        if (!signature)
            return false;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', this.authToken)
            .update(JSON.stringify(body))
            .digest('hex');
        return signature === expectedSignature;
    }
    async processWebhook(body) {
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
        const message = event.message;
        const messageData = {
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
    processStatusEvent(event) {
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
    processUserEvent(event) {
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
exports.ViberService = ViberService;
