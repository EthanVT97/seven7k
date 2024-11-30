import Redis from 'ioredis';

interface CacheItem<T> {
    value: T;
    expiry: number;
}

export class CacheService {
    private redis: Redis | null = null;
    private memoryCache: Map<string, CacheItem<any>> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Only try to connect to Redis if explicitly configured
        if (process.env.USE_REDIS === 'true') {
            try {
                this.redis = new Redis({
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD,
                    maxRetriesPerRequest: 1,
                    retryStrategy: () => null // Disable retries
                });

                this.redis.on('error', () => {
                    console.log('Redis not available, using in-memory cache instead');
                    this.redis = null;
                });
            } catch {
                console.log('Redis not available, using in-memory cache instead');
                this.redis = null;
            }
        } else {
            console.log('Using in-memory cache');
        }

        // Start cleanup interval
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }

    async get<T>(key: string): Promise<T | null> {
        if (this.redis) {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } else {
            const now = Date.now();
            const item = this.memoryCache.get(key);
            if (!item) return null;
            if (item.expiry && item.expiry < now) {
                this.memoryCache.delete(key);
                return null;
            }
            return item.value as T;
        }
    }

    async set<T>(key: string, value: T, ttl: number): Promise<void> {
        if (this.redis) {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        } else {
            this.memoryCache.set(key, {
                value,
                expiry: ttl ? Date.now() + ttl * 1000 : 0
            });
        }
    }

    async delete(key: string): Promise<void> {
        if (this.redis) {
            await this.redis.del(key);
        } else {
            this.memoryCache.delete(key);
        }
    }

    async deletePattern(pattern: string): Promise<void> {
        if (this.redis) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } else {
            const regex = new RegExp(pattern.replace('*', '.*'));
            for (const key of this.memoryCache.keys()) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                }
            }
        }
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.memoryCache.entries()) {
            if (item.expiry && item.expiry < now) {
                this.memoryCache.delete(key);
            }
        }
    }

    async close(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
        }
        clearInterval(this.cleanupInterval);
    }
} 