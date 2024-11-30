import { config } from '../config';

export class RetryMechanism {
    static async withRetry<T>(
        operation: () => Promise<T>,
        context: string,
        maxRetries: number = config.retryConfig.maxRetries
    ): Promise<T> {
        let lastError: Error | undefined;
        let delay = config.retryConfig.initialDelay;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;
                console.error(`${context} - Attempt ${attempt}/${maxRetries} failed:`, error);

                if (attempt === maxRetries) {
                    break;
                }

                // Exponential backoff with jitter
                delay = Math.min(
                    delay * 2 * (1 + Math.random() * 0.1),
                    config.retryConfig.maxDelay
                );

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error(
            `${context} - All ${maxRetries} attempts failed. Last error: ${lastError?.message}`
        );
    }

    static isRetryableError(error: any): boolean {
        // Add conditions for retryable errors
        if (error.response) {
            const status = error.response.status;
            // Retry on rate limits, server errors, and network errors
            return (
                status === 429 || // Too Many Requests
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