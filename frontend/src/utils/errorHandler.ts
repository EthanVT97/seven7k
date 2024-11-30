import { addNotification } from '../store/slices/uiSlice';
import { store } from '../store';

export class ErrorHandler {
    static handle(error: any, context: string) {
        // Log error to monitoring service
        this.logError(error, context);

        // Show user-friendly message
        this.showUserMessage(error);

        // Report to error tracking service
        this.reportError(error, context);
    }

    private static logError(error: any, context: string) {
        console.error(`[${context}] Error:`, {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    private static showUserMessage(error: any) {
        const message = this.getUserFriendlyMessage(error);
        store.dispatch(addNotification({
            type: 'error',
            message
        }));
    }

    private static getUserFriendlyMessage(error: any): string {
        if (error.response?.status === 401) {
            return 'Your session has expired. Please log in again.';
        }
        if (error.response?.status === 403) {
            return 'You do not have permission to perform this action.';
        }
        if (error.response?.status === 404) {
            return 'The requested resource was not found.';
        }
        if (error.code === 'NETWORK_ERROR') {
            return 'Unable to connect to the server. Please check your internet connection.';
        }
        return 'An unexpected error occurred. Please try again later.';
    }

    private static reportError(error: any, context: string) {
        // Implement error reporting service (e.g., Sentry)
        if (process.env.NODE_ENV === 'production') {
            // Sentry.captureException(error, { extra: { context } });
        }
    }
} 