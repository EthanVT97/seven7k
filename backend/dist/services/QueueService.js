"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
class QueueService {
    constructor() {
        this.queues = new Map();
        this.delayedQueues = new Map();
        this.deadLetterQueues = new Map();
        this.maxRetries = 3;
        this.retryDelay = 60000; // 1 minute
    }
    getQueue(platform) {
        if (!this.queues.has(platform)) {
            this.queues.set(platform, []);
        }
        return this.queues.get(platform);
    }
    getDelayedQueue(platform) {
        if (!this.delayedQueues.has(platform)) {
            this.delayedQueues.set(platform, []);
        }
        return this.delayedQueues.get(platform);
    }
    getDeadLetterQueue(platform) {
        if (!this.deadLetterQueues.has(platform)) {
            this.deadLetterQueues.set(platform, []);
        }
        return this.deadLetterQueues.get(platform);
    }
    async enqueue(platform, message) {
        const queueMessage = {
            ...message,
            retryCount: 0,
            timestamp: Date.now()
        };
        const queue = this.getQueue(platform);
        queue.push(queueMessage);
    }
    async dequeue(platform) {
        const queue = this.getQueue(platform);
        return queue.shift() || null;
    }
    async requeueWithBackoff(platform, message) {
        if (message.retryCount >= this.maxRetries) {
            await this.moveToDeadLetter(platform, message, new Error('Max retries exceeded'));
            return;
        }
        message.retryCount++;
        const delay = this.retryDelay * Math.pow(2, message.retryCount - 1);
        await this.scheduleMessage(platform, message, Date.now() + delay);
    }
    async scheduleMessage(platform, message, executeAt) {
        const delayedQueue = this.getDelayedQueue(platform);
        delayedQueue.push({ message, executeAt });
        delayedQueue.sort((a, b) => a.executeAt - b.executeAt);
    }
    async getReadyScheduledMessages(platform) {
        const now = Date.now();
        const delayedQueue = this.getDelayedQueue(platform);
        const readyMessages = delayedQueue
            .filter(item => item.executeAt <= now)
            .map(item => item.message);
        // Remove processed messages
        this.delayedQueues.set(platform, delayedQueue.filter(item => item.executeAt > now));
        return readyMessages;
    }
    async moveToDeadLetter(platform, message, error) {
        const deadLetterQueue = this.getDeadLetterQueue(platform);
        deadLetterQueue.push({
            message,
            error: error.message,
            timestamp: Date.now()
        });
    }
    async getQueueStats(platform) {
        return {
            queueLength: this.getQueue(platform).length,
            delayedCount: this.getDelayedQueue(platform).length,
            deadLetterCount: this.getDeadLetterQueue(platform).length
        };
    }
}
exports.QueueService = QueueService;
