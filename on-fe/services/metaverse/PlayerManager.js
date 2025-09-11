export class PlayerManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.players = new Map();
        this.currentPlayerId = null;
    }

    setCurrentPlayer(playerId, playerData) {
        this.currentPlayerId = playerId;
        this.players.set(playerId, {
            ...playerData,
            isCurrentPlayer: true,
            lastUpdate: Date.now()
        });
    }

    addPlayer(playerData) {
        if (!playerData.id) {
            throw new Error('Player data must have an ID');
        }

        const enrichedPlayer = {
            ...playerData,
            isCurrentPlayer: playerData.id === this.currentPlayerId,
            lastUpdate: Date.now(),
            isOnline: true
        };

        this.players.set(playerData.id, enrichedPlayer);
        return enrichedPlayer;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            return player;
        }
        return null;
    }

    updatePlayerPosition(playerId, position, direction = null) {
        const player = this.players.get(playerId);
        if (!player) {
            console.warn(`Player ${playerId} not found for position update`);
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

        this.players.set(playerId, updatedPlayer);
        return updatedPlayer;
    }

    stopPlayerMovement(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            const updatedPlayer = {
                ...player,
                isMoving: false,
                lastUpdate: Date.now()
            };
            this.players.set(playerId, updatedPlayer);
            return updatedPlayer;
        }
        return null;
    }

    getPlayer(playerId) {
        return this.players.get(playerId);
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

    isPlayerOnline(playerId) {
        const player = this.players.get(playerId);
        return player ? player.isOnline : false;
    }

    updatePlayerStatus(playerId, status) {
        const player = this.players.get(playerId);
        if (player) {
            const updatedPlayer = {
                ...player,
                isOnline: status === 'online',
                lastUpdate: Date.now()
            };
            this.players.set(playerId, updatedPlayer);
            return updatedPlayer;
        }
        return null;
    }

    clearAllPlayers() {
        this.players.clear();
        this.currentPlayerId = null;
    }

    // 플레이어 데이터 직렬화 (저장이나 전송용)
    serializePlayer(playerId) {
        const player = this.players.get(playerId);
        if (!player) return null;

        return {
            id: player.id,
            name: player.name,
            x: player.x,
            y: player.y,
            direction: player.direction,
            isMoving: player.isMoving
        };
    }

    // 현재 플레이어 상태를 서버로 전송하기 위한 데이터
    getCurrentPlayerData() {
        const currentPlayer = this.getCurrentPlayer();
        return currentPlayer ? this.serializePlayer(currentPlayer.id) : null;
    }

    // 비활성 플레이어 정리 (일정 시간 이상 업데이트되지 않은 플레이어)
    cleanupInactivePlayers(inactiveThreshold = 300000) { // 5분
        const now = Date.now();
        const toRemove = [];

        this.players.forEach((player, playerId) => {
            if (!player.isCurrentPlayer && (now - player.lastUpdate) > inactiveThreshold) {
                toRemove.push(playerId);
            }
        });

        toRemove.forEach(playerId => {
            this.removePlayer(playerId);
        });

        return toRemove.length;
    }
}