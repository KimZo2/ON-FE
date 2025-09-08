export class ReconnectionStrategy {
    constructor(maxAttempts = 5, baseDelay = 1000) {
        this.maxAttempts = maxAttempts;
        this.baseDelay = baseDelay;
        this.currentAttempt = 0;
        this.isReconnecting = false;
    }

    async executeWithRetry(operation) {
        this.currentAttempt = 0;
        
        while (this.currentAttempt < this.maxAttempts) {
            try {
                const result = await operation();
                this.reset();
                return result;
            } catch (error) {
                this.currentAttempt++;
                
                if (this.currentAttempt >= this.maxAttempts) {
                    this.reset();
                    throw new Error(`Operation failed after ${this.maxAttempts} attempts: ${error.message}`);
                }
                
                const delay = this.getRetryDelay();
                await this.delay(delay);
            }
        }
    }

    getRetryDelay() {
        return this.baseDelay * Math.pow(2, this.currentAttempt - 1);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.currentAttempt = 0;
        this.isReconnecting = false;
    }

    canRetry() {
        return this.currentAttempt < this.maxAttempts;
    }
}