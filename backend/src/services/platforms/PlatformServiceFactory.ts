import { PlatformService } from './PlatformService';
import { WhatsAppService } from './WhatsAppService';
import { FacebookService } from './FacebookService';
import { TelegramService } from './TelegramService';
import { LineService } from './LineService';
import { ViberService } from './ViberService';

export type PlatformType = 'whatsapp' | 'facebook' | 'telegram' | 'line' | 'viber';

export class PlatformServiceFactory {
    private static instances: Map<PlatformType, PlatformService> = new Map();

    static async getPlatformService(platform: PlatformType): Promise<PlatformService> {
        if (!this.instances.has(platform)) {
            const service = this.createPlatformService(platform);
            await service.initialize();
            this.instances.set(platform, service);
        }
        return this.instances.get(platform)!;
    }

    private static createPlatformService(platform: PlatformType): PlatformService {
        switch (platform) {
            case 'whatsapp':
                return new WhatsAppService();
            case 'facebook':
                return new FacebookService();
            case 'telegram':
                return new TelegramService();
            case 'line':
                return new LineService();
            case 'viber':
                return new ViberService();
            default:
                throw new Error(`Platform ${platform} is not supported yet`);
        }
    }

    static async initializeAll(): Promise<void> {
        const platforms: PlatformType[] = ['whatsapp', 'facebook', 'telegram', 'line', 'viber'];
        await Promise.all(
            platforms.map(async (platform) => {
                try {
                    await this.getPlatformService(platform);
                    console.log(`${platform} service initialized successfully`);
                } catch (error) {
                    console.error(`Failed to initialize ${platform} service:`, error);
                }
            })
        );
    }
} 