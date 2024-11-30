import dotenv from 'dotenv';

dotenv.config();

interface WhatsAppConfig {
    verifyToken: string;
    accessToken: string;
    phoneNumberId: string;
}

interface FacebookConfig {
    verifyToken: string;
    appSecret: string;
    pageAccessToken: string;
}

interface TelegramConfig {
    secretToken: string;
    botToken: string;
    webhookUrl?: string;
}

interface LineConfig {
    channelSecret: string;
    channelAccessToken: string;
}

interface ViberConfig {
    authToken: string;
    botName?: string;
    botAvatar?: string;
    webhookUrl?: string;
}

interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
}

interface Config {
    whatsapp: WhatsAppConfig;
    facebook: FacebookConfig;
    telegram: TelegramConfig;
    line: LineConfig;
    viber: ViberConfig;
    retryConfig: RetryConfig;
}

export const config: Config = {
    whatsapp: {
        verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    },
    facebook: {
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || '',
        appSecret: process.env.FACEBOOK_APP_SECRET || '',
        pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || ''
    },
    telegram: {
        secretToken: process.env.TELEGRAM_SECRET_TOKEN || '',
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL
    },
    line: {
        channelSecret: process.env.LINE_CHANNEL_SECRET || '',
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || ''
    },
    viber: {
        authToken: process.env.VIBER_AUTH_TOKEN || '',
        botName: process.env.VIBER_BOT_NAME,
        botAvatar: process.env.VIBER_BOT_AVATAR,
        webhookUrl: process.env.VIBER_WEBHOOK_URL
    },
    retryConfig: {
        maxRetries: 3,
        initialDelay: 1000, // 1 second
        maxDelay: 5000 // 5 seconds
    }
}; 