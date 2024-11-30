"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class CacheService {
    constructor() {
        this.redis = null;
        this.memoryCache = new Map();
        // Only try to connect to Redis if explicitly configured
        if (process.env.USE_REDIS === 'true') {
            try {
                this.redis = new ioredis_1.default({
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
            }
            catch {
                console.log('Redis not available, using in-memory cache instead');
                this.redis = null;
            }
        }
        else {
            console.log('Using in-memory cache');
        }
        // Start cleanup interval
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }
    async get(key) {
        if (this.redis) {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        }
        else {
            const now = Date.now();
            const item = this.memoryCache.get(key);
            if (!item)
                return null;
            if (item.expiry && item.expiry < now) {
                this.memoryCache.delete(key);
                return null;
            }
            return item.value;
        }
    }
    async set(key, value, ttl) {
        if (this.redis) {
            await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
        }
        else {
            this.memoryCache.set(key, {
                value,
                expiry: ttl ? Date.now() + ttl * 1000 : 0
            });
        }
    }
    async delete(key) {
        if (this.redis) {
            await this.redis.del(key);
        }
        else {
            this.memoryCache.delete(key);
        }
    }
    async deletePattern(pattern) {
        if (this.redis) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
        else {
            const regex = new RegExp(pattern.replace('*', '.*'));
            for (const key of this.memoryCache.keys()) {
                if (regex.test(key)) {
                    this.memoryCache.delete(key);
                }
            }
        }
    }
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.memoryCache.entries()) {
            if (item.expiry && item.expiry < now) {
                this.memoryCache.delete(key);
            }
        }
    }
    async close() {
        if (this.redis) {
            await this.redis.quit();
        }
        clearInterval(this.cleanupInterval);
    }
}
exports.CacheService = CacheService;
