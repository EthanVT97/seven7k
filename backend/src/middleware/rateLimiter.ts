import { Request, Response, NextFunction } from 'express';
import ms from 'ms';

interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    keyPrefix?: string;
    handler?: (req: Request, res: Response) => void;
}

interface RequestRecord {
    count: number;
    resetTime: number;
}

export class RateLimiter {
    private store: Map<string, RequestRecord>;
    private windowMs: number;
    private max: number;
    private keyPrefix: string;
    private handler: (req: Request, res: Response) => void;

    constructor(options: RateLimitOptions = {}) {
        this.store = new Map();
        const windowStr = process.env.RATE_LIMIT_WINDOW || '15m';
        this.windowMs = typeof windowStr === 'string' ? ms(windowStr) : 900000; // 15 minutes default
        this.max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
        this.keyPrefix = options.keyPrefix || 'rl:';
        this.handler = options.handler ||
            ((req: Request, res: Response) => {
                res.status(429).json({
                    error: 'Too many requests, please try again later.',
                });
            });
    }

    middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
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

    private cleanup() {
        const now = Date.now();
        for (const [key, record] of this.store.entries()) {
            if (now > record.resetTime) {
                this.store.delete(key);
            }
        }
    }

    static createLimiter(options: RateLimitOptions = {}) {
        const limiter = new RateLimiter(options);
        return limiter.middleware();
    }

    private getKey(req: Request): string {
        const identifier = req.ip;
        const userId = (req as any).user?.id;
        return `${this.keyPrefix}${userId || identifier}`;
    }
}