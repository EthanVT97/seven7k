"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryMechanism = void 0;
const config_1 = require("../config");
class RetryMechanism {
    static async withRetry(operation, context, maxRetries = config_1.config.retryConfig.maxRetries) {
        let lastError;
        let delay = config_1.config.retryConfig.initialDelay;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                console.error(`${context} - Attempt ${attempt}/${maxRetries} failed:`, error);
                if (attempt === maxRetries) {
                    break;
                }
                // Exponential backoff with jitter
                delay = Math.min(delay * 2 * (1 + Math.random() * 0.1), config_1.config.retryConfig.maxDelay);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error(`${context} - All ${maxRetries} attempts failed. Last error: ${lastError?.message}`);
    }
    static isRetryableError(error) {
        // Add conditions for retryable errors
        if (error.response) {
            const status = error.response.status;
            // Retry on rate limits, server errors, and network errors
            return (status === 429 || // Too Many Requests
                (status >= 500 && status <= 599) || // Server errors
                status === 408 // Request Timeout
            );
        }
        // Network errors, timeouts, etc.
        return error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNREFUSED' ||
            error.message.includes('network');
    }
}
exports.RetryMechanism = RetryMechanism;
