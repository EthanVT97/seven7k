import { Request, Response } from 'express';
import { MessagingService } from '../services/MessagingService';
import { WebhookData } from '../types/webhook';
import { config } from '../config';
import { SignatureVerification } from '../utils/signatureVerification';
import { RetryMechanism } from '../utils/retryMechanism';

export class WebhookController {
    constructor(private messagingService: MessagingService) { }

    async whatsappWebhook(req: Request, res: Response) {
        try {
            if (req.method === 'GET') {
                const mode = req.query['hub.mode'];
                const token = req.query['hub.verify_token'];
                const challenge = req.query['hub.challenge'];

                if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
                    res.status(200).send(challenge);
                } else {
                    res.status(403).json({ error: 'Verification failed' });
                }
            } else {
                const webhookData: WebhookData = {
                    platform: 'whatsapp',
                    data: req.body
                };

                await RetryMechanism.withRetry(
                    async () => await this.messagingService.handleWebhook(webhookData),
                    'WhatsApp webhook processing'
                );

                res.status(200).json({ message: 'WhatsApp webhook processed' });
            }
        } catch (error) {
            console.error('WhatsApp webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async facebookWebhook(req: Request, res: Response) {
        try {
            if (req.method === 'GET') {
                const mode = req.query['hub.mode'];
                const token = req.query['hub.verify_token'];
                const challenge = req.query['hub.challenge'];

                if (mode === 'subscribe' && token === config.facebook.verifyToken) {
                    res.status(200).send(challenge);
                } else {
                    res.status(403).json({ error: 'Verification failed' });
                }
            } else {
                const signature = req.headers['x-hub-signature'] as string;
                if (!SignatureVerification.verifyFacebookSignature(req.body, signature)) {
                    return res.status(403).json({ error: 'Invalid signature' });
                }

                const webhookData: WebhookData = {
                    platform: 'facebook',
                    data: req.body
                };

                await RetryMechanism.withRetry(
                    async () => await this.messagingService.handleWebhook(webhookData),
                    'Facebook webhook processing'
                );

                res.status(200).json({ message: 'Facebook webhook processed' });
            }
        } catch (error) {
            console.error('Facebook webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async telegramWebhook(req: Request, res: Response) {
        try {
            const secretToken = req.headers['x-telegram-bot-api-secret-token'];
            if (secretToken !== config.telegram.secretToken) {
                return res.status(403).json({ error: 'Invalid secret token' });
            }

            const webhookData: WebhookData = {
                platform: 'telegram',
                data: req.body
            };

            await RetryMechanism.withRetry(
                async () => await this.messagingService.handleWebhook(webhookData),
                'Telegram webhook processing'
            );

            res.status(200).json({ message: 'Telegram webhook processed' });
        } catch (error) {
            console.error('Telegram webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async lineWebhook(req: Request, res: Response) {
        try {
            const signature = req.headers['x-line-signature'] as string;
            if (!SignatureVerification.verifyLineSignature(req.body, signature)) {
                return res.status(403).json({ error: 'Invalid signature' });
            }

            const webhookData: WebhookData = {
                platform: 'line',
                data: req.body
            };

            await RetryMechanism.withRetry(
                async () => await this.messagingService.handleWebhook(webhookData),
                'LINE webhook processing'
            );

            res.status(200).json({ message: 'LINE webhook processed' });
        } catch (error) {
            console.error('LINE webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async viberWebhook(req: Request, res: Response) {
        try {
            const signature = req.headers['x-viber-content-signature'] as string;
            if (!SignatureVerification.verifyViberSignature(req.body, signature)) {
                return res.status(403).json({ error: 'Invalid signature' });
            }

            const webhookData: WebhookData = {
                platform: 'viber',
                data: req.body
            };

            await RetryMechanism.withRetry(
                async () => await this.messagingService.handleWebhook(webhookData),
                'Viber webhook processing'
            );

            res.status(200).json({ message: 'Viber webhook processed' });
        } catch (error) {
            console.error('Viber webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 