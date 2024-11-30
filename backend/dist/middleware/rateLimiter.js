"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const ms_1 = __importDefault(require("ms"));
class RateLimiter {
    constructor(options = {}) {
        this.store = new Map();
        const windowStr = process.env.RATE_LIMIT_WINDOW || '15m';
        this.windowMs = typeof windowStr === 'string' ? (0, ms_1.default)(windowStr) : 900000; // 15 minutes default
        this.max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
        this.keyPrefix = options.keyPrefix || 'rl:';
        this.handler = options.handler ||
            ((req, res) => {
                res.status(429).json({
                    error: 'Too many requests, please try again later.',
                });
            });
    }
    middleware() {
        return (req, res, next) => {
            const key = this.getKey(req);
            const now = Date.now();
            // Clean up expired entries
            this.cleanup();
            let record = this.store.get(key);
            if (!record) {
                record = { count: 0, resetTime: now + this.windowMs };
                this.store.set(key, record);
            }
            if (now > record.resetTime) {
                record.count = 0;
                record.resetTime = now + this.windowMs;
            }
            if (record.count >= this.max) {
                return this.handler(req, res);
            }
            record.count++;
            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', this.max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - record.count));
            res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
            next();
        };
    }
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetTime) {
                this.store.delete(key);
            }
        }
    }
    static createLimiter(options = {}) {
        const limiter = new RateLimiter(options);
        return limiter.middleware();
    }
    getKey(req) {
        const identifier = req.ip;
        const userId = req.user?.id;
        return `${this.keyPrefix}${userId || identifier}`;
    }
}
exports.RateLimiter = RateLimiter;
