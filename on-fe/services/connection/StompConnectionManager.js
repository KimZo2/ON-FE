import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ReconnectionStrategy } from './ReconnectionStrategy';
import { SubscriptionManager } from './SubscriptionManager';
import { MetaverseErrorHandler } from '../../util/ErrorHandler';

const DEFAULT_URL = process.env.NEXT_PUBLIC_BE_STOMP_SERVER_URL || 'http://localhost:3001/ws';

export class StompConnectionManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionPromise = null;
        this.subscriptionManager = new SubscriptionManager();
        this.reconnectionStrategy = new ReconnectionStrategy();
    }

    async connect(serverUrl = DEFAULT_URL, options = {}) {
        if (this.client && this.isConnected) {
            return this.client;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._establishConnection(serverUrl, options);

        try {
            return await this.connectionPromise;
        } finally {
            this.connectionPromise = null;
        }
    }

    async _establishConnection(serverUrl, options) {
        // localStorage에서 accessToken 추출
        const accessToken = this._getAccessToken();
        
        const config = {
            webSocketFactory: () => new SockJS(serverUrl),
            debug: function (str) {
                // STOMP debug disabled
            },
            reconnectDelay: options.reconnectDelay || 5000,
            heartbeatIncoming: options.heartbeatIncoming || 0,
            heartbeatOutgoing: options.heartbeatOutgoing || 0,
            connectionTimeout: options.connectionTimeout || 30000,
            connectHeaders: {
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                ...(options.connectHeaders || {})
            },
            ...options
        };

        return this.reconnectionStrategy.executeWithRetry(async () => {
            return new Promise((resolve, reject) => {
                this.client = new Client(config);

                this.client.onConnect = (frame) => {
                    this.isConnected = true;

                    // STOMP 7.1.1 호환성 문제로 인한 수동 파싱 설정
                    this._setupManualMessageParsing();

                    resolve(this.client);
                };

                this.client.onStompError = (frame) => {
                    this.isConnected = false;
                    const error = new Error(frame.headers['message'] || 'STOMP connection error');
                    error.type = 'STOMP_ERROR';
                    reject(error);
                };

                this.client.onWebSocketError = (event) => {
                    this.isConnected = false;
                    const error = new Error('WebSocket connection error');
                    error.type = 'NETWORK_ERROR';
                    reject(error);
                };

                this.client.onDisconnect = (frame) => {
                    this.isConnected = false;
                    this.subscriptionManager.unsubscribeAll();
                };

                try {
                    this.client.activate();
                } catch (error) {
                    reject(new Error(`Failed to activate STOMP client: ${error.message}`));
                }
            });
        });
    }

    subscribe(topic, handler, headers = {}) {
        if (!this.isConnected || !this.client) {
            throw new Error('STOMP client is not connected. Call connect() first.');
        }

        // localStorage에서 accessToken 추출하여 헤더에 추가
        const accessToken = this._getAccessToken();
        const subscribeHeaders = {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            ...headers
        };

        return this.subscriptionManager.subscribe(topic, handler, this.client, subscribeHeaders);
    }

    unsubscribe(topic) {
        this.subscriptionManager.unsubscribe(topic);
    }

    publish(destination, body, headers = {}) {
        if (!this.isConnected || !this.client) {
            throw new Error('STOMP client is not connected');
        }

        // localStorage에서 accessToken 추출하여 헤더에 추가
        const accessToken = this._getAccessToken();
        const publishHeaders = {
            'content-type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            ...headers
        };

        // Development logging disabled

        try {
            this.client.publish({
                destination,
                body: typeof body === 'string' ? body : JSON.stringify(body),
                headers: publishHeaders
            });
        } catch (error) {
            throw new Error(`Failed to publish to ${destination}: ${error.message}`);
        }
    }

    disconnect() {
        try {
            if (this.client) {
                this.subscriptionManager.unsubscribeAll();
                this.client.deactivate();
            }
        } catch (error) {
            console.warn('Error during disconnect:', error);
        } finally {
            this.client = null;
            this.isConnected = false;
            this.connectionPromise = null;
            this.reconnectionStrategy.reset();
        }
    }

    isStompConnected() {
        return this.isConnected && this.client && this.client.connected;
    }

    getClient() {
        return this.client;
    }

    getActiveSubscriptions() {
        return this.subscriptionManager.getActiveSubscriptions();
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            subscriptionCount: this.subscriptionManager.getSubscriptionCount(),
            canRetry: this.reconnectionStrategy.canRetry()
        };
    }

    _setupManualMessageParsing() {
        // STOMP Client 7.1.x의 기본 onmessage 처리를 그대로 사용한다.
        // 과거 수동 파싱 로직은 subscribe 핸들러를 두 번 호출하게 만들어
        // 메시지가 중복 표시되는 문제가 있어 비활성화한다.
    }

    _getAccessToken() {
        try {
            return (
                localStorage.getItem('j')
            );
        } catch (error) {
            console.warn('Failed to get accessToken from localStorage:', error);
            return null;
        }
    }
}
