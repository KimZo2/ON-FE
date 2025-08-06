import { io } from 'socket.io-client';

// TODO: 나중에 BE 소켓 API 명세 나오면 해당 URI로 변경
const socketServerUrl = process.env.NEXT_PUBLIC_BE_SOCKET_SERVER_URL;

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    async connect(serverUrl = 'http://localhost:3001') {
        if (this.socket && this.isConnected) {
            return this.socket;
        }

        return new Promise((resolve, reject) => {
            try {
                this.socket = io(serverUrl, {
                    transports: ['websocket', 'polling'],
                    timeout: 20000,
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: this.maxReconnectAttempts
                });

                // 연결 완료를 기다리는 Promise 로직을 여기에 통합
                const timeoutId = setTimeout(() => {
                    this.socket?.off('connect', onConnect);
                    this.socket?.off('connected', onConnected);
                    this.socket?.off('connect_error', onError);
                    reject(new Error('Socket 연결 시간 초과'));
                }, 10000);

                const onConnect = () => {
                    clearTimeout(timeoutId);
                    this.socket?.off('connect', onConnect);
                    this.socket?.off('connected', onConnected);
                    this.socket?.off('connect_error', onError);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    console.log('✅ Socket connected:', this.socket.id);
                    
                    // 연결 완료 후 일반적인 이벤트 리스너들 설정
                    this.setupEventListeners();
                    
                    resolve(this.socket);
                };

                const onConnected = (data) => {
                    clearTimeout(timeoutId);
                    this.socket?.off('connect', onConnect);
                    this.socket?.off('connected', onConnected);
                    this.socket?.off('connect_error', onError);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    console.log('✅ Server connection confirmed:', data);
                    
                    // 연결 완료 후 일반적인 이벤트 리스너들 설정
                    this.setupEventListeners();
                    
                    resolve(this.socket);
                };

                const onError = (error) => {
                    clearTimeout(timeoutId);
                    this.socket?.off('connect', onConnect);
                    this.socket?.off('connected', onConnected);
                    this.socket?.off('connect_error', onError);
                    this.isConnected = false;
                    console.error('❌ Socket connection error:', error);
                    reject(error);
                };

                // 이벤트 리스너를 소켓 생성 직후 바로 등록
                this.socket.on('connect', onConnect);
                this.socket.on('connected', onConnected);  // 서버에서 보내는 연결 확인 이벤트
                this.socket.on('connect_error', onError);
                
            } catch (error) {
                console.error('Socket connection failed:', error);
                reject(error);
            }
        });
    }

    setupEventListeners() {
        if (!this.socket) return;

        // connect 이벤트는 Promise에서 이미 처리하므로 제거
        
        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnected = false;
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.socket.disconnect();
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Socket reconnection failed');
            this.isConnected = false;
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit:', event);
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket() {
        return this.socket;
    }

    isSocketConnected() {
        return this.isConnected && this.socket && this.socket.connected;
    }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;