import { StompConnectionManager } from './connection/StompConnectionManager';
import { MetaverseEventManager } from './metaverse/MetaverseEventManager';
import { PlayerManager } from './metaverse/PlayerManager';
import { GameEventBus } from '../phaser/game/GameEventBus';

const DEFAULT_PLAYER_SPAWN = {
    x: 400,
    y: 480,
    direction: 'down',
    isMoving: false
};

class MetaverseService {
    constructor() {
        this.isInitialized = false;
        this.connectionManager = new StompConnectionManager();
        this.eventManager = new MetaverseEventManager(this.connectionManager);
        this.playerManager = new PlayerManager(this.eventManager);
        this.onlineCountCallback = null;
        this.chatMessageCallback = null;
        this.errorCallback = null;
        this.currentRoomId = null;
        this.joinStatus = null;
        this.sequenceNumber = 0;
        this.pingInterval = null;
        this.initialSyncRequested = false;
        this.currentOnlineCount = 0;
        this.chatSubscriptionTopic = null;
        this.roomJoinTimestamp = null;
    }

    async initialize() {
        if (this.isInitialized) {
            return this.connectionManager.getClient();
        }
        
        try {
            const client = await this.connectionManager.connect();
            if (!client) {
                throw new Error('STOMP 연결에 실패했습니다.');
            }

            this.isInitialized = true;
            return client;
        } catch (error) {
            this.isInitialized = false;
            throw error;
        }
    }

    // 에러 처리 메서드
    handleError(errorData) {
        const { code, message } = errorData;
        
        // 에러 콜백이 등록되어 있다면 호출
        if (this.errorCallback) {
            this.errorCallback({ code, message });
        }
        
        // MetaverseError 던지기 (상위 컴포넌트에서 처리)
        const error = new Error(message);
        error.code = code;
        error.name = 'MetaverseError';
        throw error;
    }

    // 방 입장 요청
    async joinRoom(roomId, playerData, roomPassword = null) {
        try {
            this.currentRoomId = roomId;
            this.initialSyncRequested = false;
            this.roomJoinTimestamp = null;
            this.unsubscribeChatChannel();
            
            // localStorage에서 nickname 추출
            const nickname = this._getNickname();
            
            // RoomEnterDTO 형태로 데이터 전송
            const roomEnterDto = {
                nickname: nickname,
                password: roomPassword // private 방이면 비밀번호, public 방이면 null
            };
            
            this.connectionManager.publish(`/app/room/${roomId}/join`, roomEnterDto);
            this.playerManager.setCurrentPlayer(playerData.id, playerData);

            // 초기 구독 (/user/queue/join)
            this.setupRoomSubscriptions();
        } catch (error) {
            console.error('Failed to join room:', error);
            throw error;
        }
    }

    // 방 퇴장 요청
    leaveRoom(roomId = this.currentRoomId) {
        if (!roomId) {
            return;
        }

        if (!this.connectionManager || !this.connectionManager.isStompConnected()) {
            return;
        }

        try {
            this.connectionManager.publish(`/app/room/${roomId}/leave`, {});
        } catch (error) {
            console.error('Failed to leave room:', error);
        } finally {
            this.initialSyncRequested = false;
            this.roomJoinTimestamp = null;
            this.unsubscribeChatChannel();
        }
    }

    // 방 입장 응답 처리
    handleJoinResponse(response) {
        const { roomId, message } = response;
        const normalizedCount = this._normalizeCount(response.count);
        this.joinStatus = message;
        
        // 방 인원 수 업데이트 (성공한 경우에만)
        if ((message === 'JOIN' || message === 'ALREADY') && normalizedCount !== null) {
            this._updateOnlineCount(normalizedCount);
        }
        
        switch (message) {
            case 'JOIN': {
                this.setupRoomSubscriptions();
                this.startPingInterval();
                this.roomJoinTimestamp = Date.now();
                this.subscribeChatChannel();
                if (normalizedCount === null) {
                    this._updateOnlineCount(Math.max(this.currentOnlineCount, 1));
                }
                break;
            }
            case 'ALREADY': {
                this.setupRoomSubscriptions();
                this.startPingInterval();
                this.roomJoinTimestamp = Date.now();
                this.subscribeChatChannel();
                if (normalizedCount === null) {
                    this._updateOnlineCount(Math.max(this.currentOnlineCount, 1));
                }
                break;
            }
            case 'FULL':
                this._handleJoinFailure({
                    roomId,
                    code: 'ROOM_FULL',
                    message: '방이 가득찼습니다.',
                    reason: message
                });
                break;
            case 'CLOSED_OR_NOT_FOUND':
                this._handleJoinFailure({
                    roomId,
                    code: 'ROOM_CLOSED_OR_NOT_FOUND',
                    message: '방이 종료되었거나 존재하지 않습니다.',
                    reason: message
                });
                break;
            case 'ERROR':
                this._handleJoinFailure({
                    roomId,
                    code: 'ROOM_JOIN_ERROR',
                    message: '알 수 없는 에러가 발생하였습니다.',
                    reason: message
                });
                break;
            default:
                this._handleJoinFailure({
                    roomId,
                    code: 'ROOM_JOIN_UNKNOWN',
                    message: '방 입장 중 알 수 없는 응답을 받았습니다.',
                    reason: message
                });
        }
    }

    _handleJoinFailure({ roomId, code, message, reason }) {
        this.currentRoomId = null;
        this.initialSyncRequested = false;

        if (this.errorCallback) {
            this.errorCallback({ code, message, roomId, reason, phase: 'JOIN' });
        } else if (typeof window !== 'undefined') {
            alert(message);
        }
    }

    // 방 입장 성공 후 추가 구독들 설정
    setupRoomSubscriptions() {
        if (!this.currentRoomId) return;

         // 개인 입장 응답 큐 구독
        this.connectionManager.subscribe('/user/queue/join', (response) => {
            this.handleJoinResponse(response);
        });

        // 개인 위치 스냅샷 구독
        this.connectionManager.subscribe('/user/queue/pos-snapshot', (snapshot) => {
            GameEventBus.updateAllPlayers(snapshot);
        });

        // 이동 확인 구독 (선택적) - 현재 GameEventBus에서는 처리하지 않음
        this.connectionManager.subscribe('/user/queue/move-ack', (ack) => {
            // 필요시 GameEventBus 이벤트 추가
        });

        // 방 브로드캐스트 구독
        this.connectionManager.subscribe(`/topic/room/${this.currentRoomId}/pos`, (data) => {
            // updates 배열이 있으면 snapshot 데이터로 처리
            if (data.updates && Array.isArray(data.updates)) {
                const enrichedSnapshot = this._enrichSnapshotPayload(data);
                GameEventBus.updateAllPlayers(enrichedSnapshot);
            } else {
                // 개별 플레이어 데이터로 처리
                const enrichedPlayer = this._enrichPlayerPayload(data);
                GameEventBus.updatePlayer(enrichedPlayer);
            }
        });

        // 방 메시지 구독 (새 플레이어 입장/퇴장 알림)
        this.connectionManager.subscribe(`/topic/room/${this.currentRoomId}/msg`, (messageData) => {
            this.handleRoomMessage(messageData);
        });

        // 방 퇴장 브로드캐스트 구독
        this.connectionManager.subscribe(`/topic/room/${this.currentRoomId}/leave`, (leaveData) => {
            this._handlePlayerLeave(leaveData);
        });
    }

    // 방 메시지 처리 (새 사용자 입장 알림)
    handleRoomMessage(messageData) {
        const { roomId, message, count, userId, nickName } = messageData;
        const normalizedCount = this._normalizeCount(count);

        switch (message) {
            case 'JOIN': {
                this._registerJoinedPlayer(userId, nickName || null);
                const nextCount = normalizedCount ?? this.currentOnlineCount + 1;
                this._updateOnlineCount(Math.max(0, nextCount));
                // 동기화 요청하여 새로운 플레이어 정보 가져오기
                this.requestSync();
                break;
            }
            case 'ALREADY': {
                if (normalizedCount !== null) {
                    this._updateOnlineCount(normalizedCount);
                }
                this._registerJoinedPlayer(userId, nickName || null);
                this.requestSync();
                break;
            }
            default:
                break;
        }
    }

    subscribeChatChannel() {
        if (!this.currentRoomId || !this.connectionManager?.isStompConnected?.()) {
            return;
        }

        const topic = `/topic/room/${this.currentRoomId}/chat`;

        if (this.chatSubscriptionTopic === topic) {
            return;
        }

        this.chatSubscriptionTopic = topic;

        this.connectionManager.subscribe(topic, (messageData) => {
            this.handleIncomingChatMessage(messageData);
        });
    }

    unsubscribeChatChannel() {
        if (!this.chatSubscriptionTopic) {
            return;
        }

        try {
            this.connectionManager.unsubscribe(this.chatSubscriptionTopic);
        } catch (error) {
            console.warn('Failed to unsubscribe chat topic:', error);
        } finally {
            this.chatSubscriptionTopic = null;
        }
    }

    handleIncomingChatMessage(messageData = {}) {
        console.log('[chat]',messageData);
        
        const { userId, nickname, content, timestamp } = messageData;

        if (!content) {
            return;
        }

        if (this.roomJoinTimestamp && timestamp) {
            const incomingTime = new Date(timestamp).getTime();
            if (!Number.isNaN(incomingTime) && incomingTime < this.roomJoinTimestamp) {
                return;
            }
        }

        const normalized = {
            userId,
            nickname: nickname || 'Anonymous',
            content,
            timestamp: typeof timestamp === 'number' ? timestamp : Date.now()
        };

        if (this.chatMessageCallback) {
            this.chatMessageCallback(normalized);
        }

            GameEventBus.displayChatMessage({
                playerName: normalized.nickname,
                message: normalized.content,
                timestamp: normalized.timestamp
            });
    }

    _registerJoinedPlayer(userId, nickName) {
        if (!userId) {
            return;
        }

        const currentPlayer = this.playerManager.getCurrentPlayer?.();

        if (currentPlayer && currentPlayer.userId === userId) {
            return;
        }

        const existingPlayer = this.playerManager.getPlayer?.(userId);
        if (existingPlayer) {
            const nextNickName = nickName || existingPlayer.nickName;

            if (nickName && existingPlayer.nickName !== nickName) {
                const updatedPlayer = {
                    ...existingPlayer,
                    nickName: nextNickName
                };

                this.playerManager.addPlayer(updatedPlayer);

                if (GameEventBus && typeof GameEventBus.updatePlayer === 'function') {
                    GameEventBus.updatePlayer(updatedPlayer);
                }
            }
            
            this.playerManager.updatePlayerStatus?.(userId, 'online');
            return;
        }

        try {
            const playerState = {
                userId,
                nickName: nickName || 'Unknown',
                ...DEFAULT_PLAYER_SPAWN
            };

            const newPlayer = this.playerManager.addPlayer(playerState);

            if (newPlayer && GameEventBus && typeof GameEventBus.addPlayer === 'function') {
                GameEventBus.addPlayer(newPlayer);
            }
        } catch (error) {
            console.warn('Failed to register joined player:', error);
        }
    }

    _handlePlayerLeave(payload = {}) {
        const { userId, reason } = payload;
        const targetUserId = userId;

        if (!targetUserId) {
            console.warn('Received player leave message without identifiable userId', payload);
            return;
        }

        this.playerManager.removePlayer(targetUserId);

        // Phaser 씬에서 해당 플레이어 제거
        if (GameEventBus && typeof GameEventBus.removePlayer === 'function') {
            GameEventBus.removePlayer(targetUserId);
        }

        if (reason) {
            console.info(`Player ${targetUserId} left room (${reason})`);
        }

        const nextCount = Math.max(0, this.currentOnlineCount - 1);
        this._updateOnlineCount(nextCount);
    }

    // 내부용 동기화 요청
    requestSync() {
        if (!this.currentRoomId) return;

        this.connectionManager.publish(`/app/room/${this.currentRoomId}/sync`, {});
    }

    // Scene 준비 완료 시 초기 위치 전송 및 동기화
    handleSceneReady(scene) {
        if (!this.currentRoomId || !this.connectionManager?.isStompConnected?.()) {
            return;
        }

        const shouldSendInitialPosition = !this.initialSyncRequested;
        const userId = scene?.userId || this.playerManager.getCurrentPlayer()?.userId;
        const playerSprite = scene?.currentPlayer;

        if (shouldSendInitialPosition && userId && playerSprite) {
            try {
                this.sendPlayerMove({
                    userId,
                    x: playerSprite.x,
                    y: playerSprite.y,
                    direction: playerSprite.lastDirection || 'down',
                    isMoving: false
                });
            } catch (error) {
                console.error('Failed to send initial player position:', error);
            }
        }

        this.requestSync(); // 동기화 요청 보내기

        if (shouldSendInitialPosition) {
            this.initialSyncRequested = true;
        }
    }

    // 핑 간격 시작
    startPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        this.pingInterval = setInterval(() => {
            this.sendPing();
        }, 30000); // 30초마다 핑
    }

    // 핑 전송
    sendPing() {
        if (!this.currentRoomId) return;
        
        this.connectionManager.publish(`/app/room/${this.currentRoomId}/ping`, {});
    }

    // 플레이어 이동 전송 (시퀀스 번호 포함)
    sendPlayerMove(playerData) {
        if (!this.currentRoomId) {
            console.error('No current room to send move to');
            return;
        }

        try {
            this.sequenceNumber++;
            
            // 닉네임은 로컬 저장소에 저장된 값을 우선 사용하고, 없으면 Anonymous로 처리한다.
            const nickname = this._getNickname();
            const moveData = {
                x: playerData.x,
                y: playerData.y,
                seq: this.sequenceNumber,
                direction: playerData.direction,
                isMoving: playerData.isMoving,
                nickname
            };

            this.connectionManager.publish(`/app/room/${this.currentRoomId}/move`, moveData);
            
            this.playerManager.updatePlayerPosition(playerData.userId, 
                { x: playerData.x, y: playerData.y }, 
                playerData.direction
            );
        } catch (error) {
            console.error('Failed to send player move:', error);
            throw error;
        }
    }

    // 플레이어 퇴장 전송
    sendPlayerLeft(userId) {
        try {
            this.connectionManager.publish('/app/playerLeft', userId);
            this.playerManager.removePlayer(userId);
        } catch (error) {
            console.error('Failed to send player left:', error);
            throw error;
        }
    }

    // 채팅 메시지 전송
    sendChatMessage(content) {
        if (!this.currentRoomId) {
            console.error('No active room for sending chat message');
            return;
        }

        if (!content || !content.trim()) {
            return;
        }

        try {
            const nickname = this._getNickname();
            const payload = {
                nickname: nickname || 'Anonymous',
                content: content.trim(),
                timestamp: Date.now()
            };

            this.connectionManager.publish(`/app/room/${this.currentRoomId}/chat`, payload);
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    }

    // 연결 해제
    disconnect() {
        try {
            const activeRoomId = this.currentRoomId;

            if (activeRoomId) {
                this.leaveRoom(activeRoomId);
            }

            // 핑 인터벌 정리
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }

            this.clearUICallbacks();
            this.playerManager.clearAllPlayers();
            this.connectionManager.disconnect();
        } catch (error) {
            console.error('Error during disconnect:', error);
        } finally {
            this.isInitialized = false;
            this.currentRoomId = null;
            this.joinStatus = null;
            this.sequenceNumber = 0;
            this.initialSyncRequested = false;
            this.currentOnlineCount = 0;
            this.roomJoinTimestamp = null;
            this.unsubscribeChatChannel();
        }
    }

    // 연결 상태 확인
    isConnected() {
        return this.connectionManager.isStompConnected();
    }

    // STOMP 클라이언트 반환 (Phaser에서 직접 사용하기 위해)
    getClient() {
        return this.connectionManager.getClient();
    }

    // Player Manager 접근자
    getPlayerManager() {
        return this.playerManager;
    }

    // Connection Manager 접근자
    getConnectionManager() {
        return this.connectionManager;
    }

    // Event Manager 접근자  
    getEventManager() {
        return this.eventManager;
    }

    // 연결 상태 정보
    getConnectionStatus() {
        return this.connectionManager.getConnectionStatus();
    }

    // UI 콜백 등록 메서드
    setOnlineCountCallback(callback) {
        this.onlineCountCallback = callback;

        if (callback && typeof this.currentOnlineCount === 'number') {
            callback(this.currentOnlineCount);
        }
    }

    setChatMessageCallback(callback) {
        this.chatMessageCallback = callback;
    }

    setErrorCallback(callback) {
        this.errorCallback = callback;
    }

    // UI 콜백 해제 메서드
    clearUICallbacks() {
        this.onlineCountCallback = null;
        this.chatMessageCallback = null;
        this.errorCallback = null;
    }

    _updateOnlineCount(count) {
        if (typeof count !== 'number' || Number.isNaN(count)) {
            return;
        }

        this.currentOnlineCount = count;

        if (this.onlineCountCallback) {
            this.onlineCountCallback(count);
        }

        if (GameEventBus && typeof GameEventBus.updateOnlineCount === 'function') {
            GameEventBus.updateOnlineCount(count);
        }
    }

    _normalizeCount(value) {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }

        const stringified = String(value).trim();
        if (stringified.length === 0) {
            return null;
        }

        const digitMatch = stringified.match(/-?\d+/);
        if (!digitMatch) {
            return null;
        }

        const numeric = Number(digitMatch[0]);
        return Number.isNaN(numeric) ? null : numeric;
    }

    _enrichSnapshotPayload(payload) {
        if (!payload) return payload;

        if (Array.isArray(payload)) {
            return payload.map((player) => this._enrichPlayerPayload(player));
        }

        const enriched = { ...payload };

        if (Array.isArray(payload.positions)) {
            enriched.positions = payload.positions.map((player) => this._enrichPlayerPayload(player));
        }

        if (Array.isArray(payload.updates)) {
            enriched.updates = payload.updates.map((player) => this._enrichPlayerPayload(player));
        }

        return enriched;
    }

    _enrichPlayerPayload(playerData) {
        if (!playerData || typeof playerData !== 'object') {
            return playerData;
        }

        const normalized = { ...playerData };

        if (normalized.playerId && !normalized.userId) {
            normalized.userId = normalized.playerId;
        }

        const existing = this.playerManager.getPlayer?.(normalized.userId);
        const existingName = existing?.nickName;

        if (!normalized.nickName && existingName) {
            normalized.nickName = existingName;
        }

        if (!normalized.nickName && normalized.nickname) {
            normalized.nickName = normalized.nickname;
        }

        if (!normalized.nickName) {
            normalized.nickName = 'Unknown';
        }

        return normalized;
    }

    // localStorage 접근 헬퍼 메서드들
    _getAccessToken() {
        try {
            return localStorage.getItem('accessToken');
        } catch (error) {
            console.warn('Failed to get accessToken from localStorage:', error);
            return null;
        }
    }

    _getNickname() {
        try {
            return localStorage.getItem('nickname') || localStorage.getItem('nickName') || 'Anonymous';
        } catch (error) {
            console.warn('Failed to get nickname from localStorage:', error);
            return 'Anonymous';
        }
    }
}

const metaverseService = new MetaverseService();
export default metaverseService;
