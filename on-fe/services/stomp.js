// stompService.js
import { Client } from '@stomp/stompjs';

const DEFAULT_URL = process.env.NEXT_PUBLIC_BE_STOMP_SERVER_URL || 'ws://localhost:3001/ws';

class StompService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this._connectPromise = null;
        this.subscriptions = new Map();
        this.messageHandlers = new Map();
    }

    connect(serverUrl = DEFAULT_URL, connectTimeout = 30000) {
        if (this.client && this.isConnected) return Promise.resolve(this.client);
        if (this._connectPromise) return this._connectPromise;

        this._connectPromise = new Promise((resolve, reject) => {
            this.client = new Client({
                brokerURL: serverUrl,
                debug: function (str) {
                    console.log('🔧 STOMP 디버그:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 0,
                heartbeatOutgoing: 0,
                connectionTimeout: connectTimeout
            });

            this.client.onConnect = (frame) => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this._setupDefaultSubscriptions();
                resolve(this.client);
            };

            this.client.onStompError = (frame) => {
                this.isConnected = false;
                reject(new Error(frame.headers['message'] || 'STOMP connection error'));
            };

            this.client.onWebSocketError = (event) => {
                this.isConnected = false;
                reject(new Error('WebSocket connection error'));
            };

            this.client.onDisconnect = (frame) => {
                this.isConnected = false;
                this._clearSubscriptions();
            };

            // 연결 상태 변화를 추적하는 추가 로그
            this.client.activate();
        }).finally(() => {
            this._connectPromise = null;
        });

        return this._connectPromise;
    }

    _setupDefaultSubscriptions() {
        // 기본 구독은 설정하지 않음 - 사용하는 곳에서 필요한 구독을 직접 설정
    }

    subscribe(destination, callback) {
        if (this.client && this.isConnected) {
            const wrappedCallback = (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                } catch (error) {
                    callback(message.body);
                }
            };
            const subscription = this.client.subscribe(destination, wrappedCallback);
            this.subscriptions.set(destination, subscription);
            
            return subscription;
        } else {
            return null;
        }
    }

    unsubscribe(destination) {
        if (this.subscriptions.has(destination)) {
            this.subscriptions.get(destination).unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    _clearSubscriptions() {
        this.subscriptions.forEach((subscription) => {
            try {
                subscription.unsubscribe();
            } catch (e) {
            }
        });
        this.subscriptions.clear();
    }

    disconnect() {
        if (this.client) {
            try {
                this._clearSubscriptions();
                this.client.deactivate();
            } finally {
                this.client = null;
                this.isConnected = false;
                this._connectPromise = null;
                this.messageHandlers.clear();
            }
        }
    }

    publish(destination, body, headers = {}) {
        if (this.client && this.isConnected) {
            this.client.publish({
                destination: destination,
                body: typeof body === 'string' ? body : JSON.stringify(body),
                headers: headers
            });
        }
    }

    isStompConnected() {
        return this.isConnected && this.client && this.client.connected;
    }

    getClient() {
        return this.client;
    }
}

const stompService = new StompService();
export default stompService;