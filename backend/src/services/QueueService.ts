import Bull, { Job } from 'bull';
import logger from '../utils/logger';

interface QueueJob {
    id: string;
    content: string;
    timestamp: number;
}

export class QueueService {
    private static instance: QueueService;
    private messageQueue: Bull.Queue<QueueJob>;

    private constructor() {
        this.messageQueue = new Bull('messages', {
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

    static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    private setupQueueHandlers() {
        this.messageQueue.on('failed', (job: Job<QueueJob>, err: Error) => {
            logger.error('Message processing failed', {
                jobId: job.id,
                error: err.message,
                attempts: job.attemptsMade
            });
        });

        this.messageQueue.on('completed', (job: Job<QueueJob>) => {
            logger.info('Message processed successfully', {
                jobId: job.id,
                processingTime: Date.now() - job.timestamp
            });
        });
    }

    async addToQueue(message: QueueJob, options?: Bull.JobOptions) {
        try {
            const job = await this.messageQueue.add(message, options);
            logger.info('Message added to queue', { jobId: job.id });
            return job;
        } catch (error) {
            logger.error('Failed to add message to queue', { error });
            throw error;
        }
    }

    async processQueue(processor: Bull.ProcessCallbackFunction<QueueJob>) {
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