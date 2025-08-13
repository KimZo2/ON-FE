// socketService.js
import { io } from 'socket.io-client';

const DEFAULT_URL =
    process.env.NEXT_PUBLIC_BE_SOCKET_SERVER_URL || 'http://localhost:3001';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this._connectPromise = null; // 중복 connect() 방지
    }

    connect(serverUrl = DEFAULT_URL, connectTimeout = 15000) {
        if (this.socket && this.isConnected) return Promise.resolve(this.socket);
        if (this._connectPromise) return this._connectPromise;

        this._connectPromise = new Promise((resolve, reject) => {
            this.socket = io(serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: connectTimeout,              // 엔진 타임아웃과 동일하게
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: this.maxReconnectAttempts,
            });

            const s = this.socket;

            const cleanup = () => {
                s.off('connect', onConnect);
                s.off('connect_error', onError);
                clearTimeout(timer);
            };

            const fail = (err) => {
                cleanup();
                try { s.disconnect(); } catch { }
                this.socket = null;
                this.isConnected = false;
                reject(err);
            };

            const onConnect = () => {
                cleanup();
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this._installLongLivedListeners();
                resolve(s);
            };

            const onError = (e) => fail(e instanceof Error ? e : new Error(String(e)));

            s.once('connect', onConnect);
            s.once('connect_error', onError);

            // 수동 타임아웃: 반드시 소켓도 끊어준다
            const timer = setTimeout(() => {
                fail(new Error('Socket 연결 시간 초과'));
            }, connectTimeout);
        }).finally(() => {
            this._connectPromise = null;
        });

        return this._connectPromise;
    }

    _installLongLivedListeners() {
        const s = this.socket;
        if (!s || s.__listenersInstalled) return;
        s.__listenersInstalled = true; // 중복 설치 방지

        s.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
        });

        s.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnected = false;
            this.reconnectAttempts += 1;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                try { s.disconnect(); } catch { }
            }
        });

        s.on('reconnect', (attempt) => {
            console.log(`🔄 reconnected after ${attempt} attempts`);
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        // 참고: v4에선 이 이벤트들이 일반적
        s.on('reconnect_attempt', (n) => console.log('reconnect_attempt', n));
        s.on('reconnect_error', (e) => console.log('reconnect_error', e));
    }

    disconnect() {
        if (this.socket) {
            try { this.socket.disconnect(); } finally {
                this.socket = null;
                this.isConnected = false;
                this._connectPromise = null;
            }
        }
    }

    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    }

    on(event, callback) {
        if (this.socket) this.socket.on(event, callback);
    }

    off(event, callback) {
        if (this.socket) this.socket.off(event, callback);
    }

    isSocketConnected() {
        return !!(this.socket && this.socket.connected);
    }

    getSocket() {
        return this.socket;
    }
}

const socketService = new SocketService();
export default socketService;