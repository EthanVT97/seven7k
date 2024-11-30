"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhookRouter = createWebhookRouter;
const express_1 = __importDefault(require("express"));
const webhookController_1 = require("../controllers/webhookController");
const rateLimiter_1 = require("../middleware/rateLimiter");
const MessagingService_1 = require("../services/MessagingService");
function createWebhookRouter(io) {
    const router = express_1.default.Router();
    const messagingService = new MessagingService_1.MessagingService(io);
    const webhookController = new webhookController_1.WebhookController(messagingService);
    // Rate limiters for webhooks
    const webhookLimiter = rateLimiter_1.RateLimiter.createLimiter({
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
