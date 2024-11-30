"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const config_1 = require("../config");
const signatureVerification_1 = require("../utils/signatureVerification");
const retryMechanism_1 = require("../utils/retryMechanism");
class WebhookController {
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    async whatsappWebhook(req, res) {
        try {
            if (req.method === 'GET') {
                const mode = req.query['hub.mode'];
                const token = req.query['hub.verify_token'];
                const challenge = req.query['hub.challenge'];
                if (mode === 'subscribe' && token === config_1.config.whatsapp.verifyToken) {
                    res.status(200).send(challenge);
                }
                else {
                    res.status(403).json({ error: 'Verification failed' });
                }
            }
            else {
                const webhookData = {
                    platform: 'whatsapp',
                    data: req.body
                };
                await retryMechanism_1.RetryMechanism.withRetry(async () => await this.messagingService.handleWebhook(webhookData), 'WhatsApp webhook processing');
                res.status(200).json({ message: 'WhatsApp webhook processed' });
            }
        }
        catch (error) {
            console.error('WhatsApp webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async facebookWebhook(req, res) {
        try {
            if (req.method === 'GET') {
                const mode = req.query['hub.mode'];
                const token = req.query['hub.verify_token'];
                const challenge = req.query['hub.challenge'];
                if (mode === 'subscribe' && token === config_1.config.facebook.verifyToken) {
                    res.status(200).send(challenge);
                }
                else {
                    res.status(403).json({ error: 'Verification failed' });
                }
            }
            else {
                const signature = req.headers['x-hub-signature'];
                if (!signatureVerification_1.SignatureVerification.verifyFacebookSignature(req.body, signature)) {
                    return res.status(403).json({ error: 'Invalid signature' });
                }
                const webhookData = {
                    platform: 'facebook',
                    data: req.body
                };
                await retryMechanism_1.RetryMechanism.withRetry(async () => await this.messagingService.handleWebhook(webhookData), 'Facebook webhook processing');
                res.status(200).json({ message: 'Facebook webhook processed' });
            }
        }
        catch (error) {
            console.error('Facebook webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async telegramWebhook(req, res) {
        try {
            const secretToken = req.headers['x-telegram-bot-api-secret-token'];
            if (secretToken !== config_1.config.telegram.secretToken) {
                return res.status(403).json({ error: 'Invalid secret token' });
            }
            const webhookData = {
                platform: 'telegram',
                data: req.body
            };
            await retryMechanism_1.RetryMechanism.withRetry(async () => await this.messagingService.handleWebhook(webhookData), 'Telegram webhook processing');
            res.status(200).json({ message: 'Telegram webhook processed' });
        }
        catch (error) {
            console.error('Telegram webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async lineWebhook(req, res) {
        try {
            const signature = req.headers['x-line-signature'];
            if (!signatureVerification_1.SignatureVerification.verifyLineSignature(req.body, signature)) {
                return res.status(403).json({ error: 'Invalid signature' });
            }
            const webhookData = {
                platform: 'line',
                data: req.body
            };
            await retryMechanism_1.RetryMechanism.withRetry(async () => await this.messagingService.handleWebhook(webhookData), 'LINE webhook processing');
            res.status(200).json({ message: 'LINE webhook processed' });
        }
        catch (error) {
            console.error('LINE webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async viberWebhook(req, res) {
        try {
            const signature = req.headers['x-viber-content-signature'];
            if (!signatureVerification_1.SignatureVerification.verifyViberSignature(req.body, signature)) {
                return res.status(403).json({ error: 'Invalid signature' });
            }
            const webhookData = {
                platform: 'viber',
                data: req.body
            };
            await retryMechanism_1.RetryMechanism.withRetry(async () => await this.messagingService.handleWebhook(webhookData), 'Viber webhook processing');
            res.status(200).json({ message: 'Viber webhook processed' });
        }
        catch (error) {
            console.error('Viber webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.WebhookController = WebhookController;
