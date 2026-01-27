export class MetaverseErrorHandler {
    static handleConnectionError(error) {
        console.error('Metaverse Connection Error:', error);
        
        const errorTypes = {
            NETWORK_ERROR: 'Network connection failed. Check your internet connection.',
            SERVER_ERROR: 'Server is temporarily unavailable. Please try again later.',
            TIMEOUT_ERROR: 'Connection timeout. Please try again.',
            AUTH_ERROR: 'Authentication failed. Please refresh and try again.',
            STOMP_ERROR: 'Real-time communication error. Please check server status.'
        };

        // 에러 타입 감지
        if (error.message?.includes('WebSocket')) {
            return errorTypes.NETWORK_ERROR;
        } else if (error.message?.includes('timeout')) {
            return errorTypes.TIMEOUT_ERROR;
        } else if (error.message?.includes('STOMP')) {
            return errorTypes.STOMP_ERROR;
        } else if (error.code >= 500) {
            return errorTypes.SERVER_ERROR;
        }

        return error.message || 'An unexpected error occurred.';
    }

    static createRetryableError(originalError, retryCount = 0) {
        return {
            ...originalError,
            retryCount,
            canRetry: retryCount < 3,
            nextRetryDelay: Math.pow(2, retryCount) * 1000
        };
    }

    static isRetryableError(error) {
        const retryableTypes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
        return retryableTypes.some(type => error.message?.includes(type));
    }
}