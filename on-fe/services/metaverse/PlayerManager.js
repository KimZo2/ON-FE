export class PlayerManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.players = new Map();
        this.currentPlayerId = null;
    }

    setCurrentPlayer(userId, playerData) {
        this.currentPlayerId = userId;
        this.players.set(userId, {
            ...playerData,
            isCurrentPlayer: true,
            lastUpdate: Date.now()
        });
    }

    addPlayer(playerData) {
        if (!playerData.userId) {
            throw new Error('Player data must have a userId');
        }

        const nickname = playerData.nickname || playerData.nickName || 'Unknown';

        const enrichedPlayer = {
            userId: playerData.userId,
            nickname,
            x: playerData.x || 0,
            y: playerData.y || 0,
            direction: playerData.direction || 'down',
            isMoving: playerData.isMoving || false,
            image: playerData.image || 'public/asset/girl1.png',
            isCurrentPlayer: playerData.userId === this.currentPlayerId,
            lastUpdate: Date.now(),
            isOnline: true
        };

        // 하위 호환을 위해 nickName 필드도 유지
        enrichedPlayer.nickName = nickname;

        this.players.set(playerData.userId, enrichedPlayer);
        return enrichedPlayer;
    }

    removePlayer(userId) {
        const player = this.players.get(userId);
        if (player) {
            this.players.delete(userId);
            return player;
        }
        return null;
    }

    updatePlayerPosition(userId, position, direction = null) {
        const player = this.players.get(userId);
        if (!player) {
            console.warn(`Player ${userId} not found for position update`);
            return null;
        }

        const updatedPlayer = {
            ...player,
            x: position.x,
            y: position.y,
            ...(direction && { direction }),
            isMoving: true,
            lastUpdate: Date.now()
        };

        this.players.set(userId, updatedPlayer);
        return updatedPlayer;
    }

    stopPlayerMovement(userId) {
        const player = this.players.get(userId);
        if (player) {
            const updatedPlayer = {
                ...player,
                isMoving: false,
                lastUpdate: Date.now()
            };
            this.players.set(userId, updatedPlayer);
            return updatedPlayer;
        }
        return null;
    }

    getPlayer(userId) {
        return this.players.get(userId);
    }

    getCurrentPlayer() {
        return this.currentPlayerId ? this.players.get(this.currentPlayerId) : null;
    }

    getAllPlayers() {
        return Array.from(this.players.values());
    }

    getOtherPlayers() {
        return this.getAllPlayers().filter(player => !player.isCurrentPlayer);
    }

    getOnlinePlayers() {
        return this.getAllPlayers().filter(player => player.isOnline);
    }

    getPlayerCount() {
        return this.players.size;
    }

    isPlayerOnline(userId) {
        const player = this.players.get(userId);
        return player ? player.isOnline : false;
    }

    updatePlayerStatus(userId, status) {
        const player = this.players.get(userId);
        if (player) {
            const updatedPlayer = {
                ...player,
                isOnline: status === 'online',
                lastUpdate: Date.now()
            };
            this.players.set(userId, updatedPlayer);
            return updatedPlayer;
        }
        return null;
    }

    clearAllPlayers() {
        this.players.clear();
        this.currentPlayerId = null;
    }

    // 플레이어 데이터 직렬화 (저장이나 전송용)
    serializePlayer(userId) {
        const player = this.players.get(userId);
        if (!player) return null;

        return {
            userId: player.userId,
            nickname: player.nickname || player.nickName,
            nickName: player.nickname || player.nickName,
            x: player.x,
            y: player.y,
            direction: player.direction,
            isMoving: player.isMoving,
            image: player.image
        };
    }

    // 현재 플레이어 상태를 서버로 전송하기 위한 데이터
    getCurrentPlayerData() {
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer ? this.serializePlayer(currentPlayer.userId) : null;
    }

    // 비활성 플레이어 정리 (일정 시간 이상 업데이트되지 않은 플레이어)
    cleanupInactivePlayers(inactiveThreshold = 300000) { // 5분
        const now = Date.now();
        const toRemove = [];

        this.players.forEach((player, userId) => {
            if (!player.isCurrentPlayer && (now - player.lastUpdate) > inactiveThreshold) {
                toRemove.push(userId);
            }
        });

        toRemove.forEach(userId => {
            this.removePlayer(userId);
        });

        return toRemove.length;
    }
}
