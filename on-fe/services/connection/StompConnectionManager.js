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
        const webSocket = this.client.webSocket;
        if (!webSocket) {
            return;
        }

        // 기존 onmessage 핸들러 백업
        const originalOnMessage = webSocket.onmessage;

        webSocket.onmessage = (event) => {
            try {
                const message = event.data;

                // STOMP 프레임 파싱
                const lines = message.split('\n');
                const command = lines[0];

                if (command === 'MESSAGE') {
                    let destination = '';
                    let body = '';
                    let bodyStarted = false;

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i];

                        if (line.startsWith('destination:')) {
                            destination = line.substring('destination:'.length);
                        } else if (line === '') {
                            bodyStarted = true;
                        } else if (bodyStarted) {
                            // null terminator 제거
                            const cleanLine = line.replace(/\0/g, '');
                            if (cleanLine.length > 0) {
                                if (body.length > 0) {
                                    body += '\n';
                                }
                                body += cleanLine;
                            }
                        }
                    }

                    // 전체 body에서도 null terminator 제거
                    body = body.replace(/\0/g, '');

                    if (destination && body.trim()) {
                        // 빈 배열이나 빈 객체는 스킵
                        if (body.trim() === '[]' || body.trim() === '{}') {
                            return;
                        }

                        this._handleManualMessage(destination, body);
                    }
                }
            } catch (error) {
                // 에러 무시 (원본 핸들러가 처리할 수 있도록)
            }

            // 원본 핸들러도 호출 (STOMP 내부 처리를 위해)
            if (originalOnMessage) {
                originalOnMessage.call(webSocket, event);
            }
        };
    }

    _handleManualMessage(destination, body) {
        try {
            // 등록된 핸들러 찾기
            const handlers = this.subscriptionManager.getHandlerForTopic(destination);

            if (handlers && handlers.length > 0) {
                let parsedBody;
                try {
                    parsedBody = JSON.parse(body);
                } catch (e) {
                    parsedBody = body;
                }

                // Development logging disabled

                handlers.forEach(handler => {
                    try {
                        handler(parsedBody);
                    } catch (error) {
                        // 핸들러 에러는 무시
                    }
                });
            }
        } catch (error) {
            // 에러 무시
        }
    }

    _getAccessToken() {
        try {
            return localStorage.getItem('accessToken');
        } catch (error) {
            console.warn('Failed to get accessToken from localStorage:', error);
            return null;
        }
    }
}