import express from 'express';
import { WebhookController } from '../controllers/webhookController';
import { RateLimiter } from '../middleware/rateLimiter';
import { MessagingService } from '../services/MessagingService';
import { Server as SocketServer } from 'socket.io';

export function createWebhookRouter(io: SocketServer) {
    const router = express.Router();

    const messagingService = new MessagingService(io);
    const webhookController = new WebhookController(messagingService);

    // Rate limiters for webhooks
    const webhookLimiter = RateLimiter.createLimiter({
        windowMs: 60 * 1000, // 1 minute
        max: 100, // 100 requests per minute
        keyPrefix: 'webhook:'
    });

    // WhatsApp webhooks
    router.get('/whatsapp', webhookController.whatsappWebhook.bind(webhookController));
    router.post('/whatsapp', webhookLimiter, webhookController.whatsappWebhook.bind(webhookController));

    // Facebook Messenger webhooks
    router.get('/facebook', webhookController.facebookWebhook.bind(webhookController));
    router.post('/facebook', webhookLimiter, webhookController.facebookWebhook.bind(webhookController));

    // Telegram webhooks
    router.post('/telegram', webhookLimiter, webhookController.telegramWebhook.bind(webhookController));

    // Line webhooks
    router.post('/line', webhookLimiter, webhookController.lineWebhook.bind(webhookController));

    // Viber webhooks
    router.post('/viber', webhookLimiter, webhookController.viberWebhook.bind(webhookController));

    return router;
} 