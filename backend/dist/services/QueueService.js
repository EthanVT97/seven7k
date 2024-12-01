"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const bull_1 = __importDefault(require("bull"));
const logger_1 = __importDefault(require("../utils/logger"));
class QueueService {
    constructor() {
        this.messageQueue = new bull_1.default('messages', {
            redis: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        });
        this.setupQueueHandlers();
    }
    static getInstance() {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }
    setupQueueHandlers() {
        this.messageQueue.on('failed', (job, err) => {
            logger_1.default.error('Message processing failed', {
                jobId: job.id,
                error: err.message,
                attempts: job.attemptsMade
            });
        });
        this.messageQueue.on('completed', (job) => {
            logger_1.default.info('Message processed successfully', {
                jobId: job.id,
                processingTime: Date.now() - job.timestamp
            });
        });
    }
    async addToQueue(message, options) {
        try {
            const job = await this.messageQueue.add(message, options);
            logger_1.default.info('Message added to queue', { jobId: job.id });
            return job;
        }
        catch (error) {
            logger_1.default.error('Failed to add message to queue', { error });
            throw error;
        }
    }
    async processQueue(processor) {
        this.messageQueue.process(processor);
    }
    async getQueueStatus() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.messageQueue.getWaitingCount(),
            this.messageQueue.getActiveCount(),
            this.messageQueue.getCompletedCount(),
            this.messageQueue.getFailedCount()
        ]);
        return {
            waiting,
            active,
            completed,
            failed
        };
    }
}
exports.QueueService = QueueService;
