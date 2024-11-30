"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformServiceFactory = void 0;
const WhatsAppService_1 = require("./WhatsAppService");
const FacebookService_1 = require("./FacebookService");
const TelegramService_1 = require("./TelegramService");
const LineService_1 = require("./LineService");
const ViberService_1 = require("./ViberService");
class PlatformServiceFactory {
    static async getPlatformService(platform) {
        if (!this.instances.has(platform)) {
            const service = this.createPlatformService(platform);
            await service.initialize();
            this.instances.set(platform, service);
        }
        return this.instances.get(platform);
    }
    static createPlatformService(platform) {
        switch (platform) {
            case 'whatsapp':
                return new WhatsAppService_1.WhatsAppService();
            case 'facebook':
                return new FacebookService_1.FacebookService();
            case 'telegram':
                return new TelegramService_1.TelegramService();
            case 'line':
                return new LineService_1.LineService();
            case 'viber':
                return new ViberService_1.ViberService();
            default:
                throw new Error(`Platform ${platform} is not supported yet`);
        }
    }
    static async initializeAll() {
        const platforms = ['whatsapp', 'facebook', 'telegram', 'line', 'viber'];
        await Promise.all(platforms.map(async (platform) => {
            try {
                await this.getPlatformService(platform);
                console.log(`${platform} service initialized successfully`);
            }
            catch (error) {
                console.error(`Failed to initialize ${platform} service:`, error);
            }
        }));
    }
}
exports.PlatformServiceFactory = PlatformServiceFactory;
PlatformServiceFactory.instances = new Map();
