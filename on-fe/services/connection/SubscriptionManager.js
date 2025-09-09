export class SubscriptionManager {
    constructor() {
        this.subscriptions = new Map();
        this.handlers = new Map();
    }

    subscribe(topic, handler, stompClient, headers = {}) {
        if (!stompClient || !stompClient.connected) {
            throw new Error('STOMP client is not connected');
        }

        // 기존 구독이 있으면 해제
        if (this.subscriptions.has(topic)) {
            this.unsubscribe(topic);
        }

        try {
            const wrappedCallback = (message) => {
                try {
                    const data = JSON.parse(message.body);
                    handler(data);
                } catch (error) {
                    handler(message.body);
                }
            };

            const subscription = stompClient.subscribe(topic, wrappedCallback, headers);
            this.subscriptions.set(topic, subscription);
            this.handlers.set(topic, handler);
            
            return subscription;
        } catch (error) {
            throw new Error(`Failed to subscribe to ${topic}: ${error.message}`);
        }
    }

    unsubscribe(topic) {
        if (this.subscriptions.has(topic)) {
            try {
                this.subscriptions.get(topic).unsubscribe();
            } catch (error) {
                console.warn(`Error unsubscribing from ${topic}:`, error);
            } finally {
                this.subscriptions.delete(topic);
                this.handlers.delete(topic);
            }
        }
    }

    unsubscribeAll() {
        this.subscriptions.forEach((subscription, topic) => {
            try {
                subscription.unsubscribe();
            } catch (error) {
                console.warn(`Error unsubscribing from ${topic}:`, error);
            }
        });
        
        this.subscriptions.clear();
        this.handlers.clear();
    }

    getActiveSubscriptions() {
        return Array.from(this.subscriptions.keys());
    }

    isSubscribed(topic) {
        return this.subscriptions.has(topic);
    }

    getSubscriptionCount() {
        return this.subscriptions.size;
    }

    getHandlerForTopic(topic) {
        const handler = this.handlers.get(topic);
        return handler ? [handler] : [];
    }
}