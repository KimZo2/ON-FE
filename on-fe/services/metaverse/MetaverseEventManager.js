import { GameEventBus } from '../../phaser/game/GameEventBus';

export class MetaverseEventManager {
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        this.eventMappings = new Map();
        this.isSetup = false;
    }

    setupEventMappings() {
        if (this.isSetup) return;

        const mappings = [
            {
                topic: '/topic/existingPlayers',
                eventType: 'players:existing',
                validator: this.validatePlayersData.bind(this)
            },
            {
                topic: '/topic/playerJoined',
                eventType: 'player:joined',
                validator: this.validatePlayerData.bind(this)
            },
            {
                topic: '/topic/playerMoved',
                eventType: 'player:moved',
                validator: this.validatePlayerMovement.bind(this)
            },
            {
                topic: '/topic/playerLeft',
                eventType: 'player:left',
                validator: this.validatePlayerId.bind(this)
            },
            {
                topic: '/topic/onlineCount',
                eventType: 'online:count',
                validator: this.validateOnlineCount.bind(this)
            },
            {
                topic: '/topic/chatMessage',
                eventType: 'chat:message',
                validator: this.validateChatMessage.bind(this)
            }
        ];

        mappings.forEach(({ topic, eventType, validator }) => {
            this.connectionManager.subscribe(topic, (data) => {
                try {
                    const validatedData = validator(data);
                    this.emit(eventType, validatedData);
                } catch (error) {
                    // 검증 실패시 원본 데이터로 이벤트 발생
                    this.emit(eventType, data);
                }
            });
            
            this.eventMappings.set(topic, eventType);
        });

        this.isSetup = true;
    }

    emit(eventType, data) {
        // GameEventBus로 이벤트 발생 - 서버 이벤트를 게임 렌더링 이벤트로 변환
        switch (eventType) {
            case 'players:existing':
            case 'players:snapshot':
                GameEventBus.updateAllPlayers(data);
                break;
            case 'player:joined':
                GameEventBus.addPlayer(data);
                break;
            case 'player:moved':
                GameEventBus.updatePlayer(data);
                break;
            case 'player:left':
                GameEventBus.removePlayer(data);
                break;
            case 'online:count':
                GameEventBus.updateOnlineCount(data);
                break;
            case 'chat:message':
                GameEventBus.displayChatMessage(data);
                break;
            default:
                console.warn('Unknown event type:', eventType, data);
                break;
        }
        
        // 추가적인 내부 이벤트 처리 로직이 필요하면 여기에
        this.handleInternalEvent(eventType, data);
    }

    handleInternalEvent(eventType, data) {
        // 내부 이벤트 처리 로직
        switch (eventType) {
            case 'player:joined':
                break;
            case 'player:left':
                break;
            case 'online:count':
                break;
            default:
                break;
        }
    }

    // 데이터 검증 메서드들
    validatePlayersData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Players data must be an array');
        }
        return data.map(player => this.validatePlayerData(player));
    }

    validatePlayerData(data) {
        if (!data) {
            throw new Error('Player data is required');
        }
        
        // ID 필드 정규화 - userId가 primary
        if (data.userId && !data.id) {
            data.id = data.userId;
        } else if (data.playerId && !data.id) {
            data.id = data.playerId;
        } else if (data.playerid && !data.id) {
            data.id = data.playerid;
        } else if (data.player_id && !data.id) {
            data.id = data.player_id;
        }
        
        // 이름 필드 정규화
        if (data.playerName && !data.name) {
            data.name = data.playerName;
        } else if (data.player_name && !data.name) {
            data.name = data.player_name;
        } else if (data.username && !data.name) {
            data.name = data.username;
        }
        
        // 숫자 타입 유연하게 처리  
        if (data.x !== undefined && data.x !== null) {
            data.x = Number(data.x);
        }
        if (data.y !== undefined && data.y !== null) {
            data.y = Number(data.y);
        }
        
        return data;
    }

    validatePlayerMovement(data) {
        return this.validatePlayerData(data);
    }

    validateUserId(userId) {
        if (!userId || typeof userId !== 'string') {
            throw new Error('User ID is required and must be a string');
        }
        return userId;
    }

    validateOnlineCount(count) {
        const numCount = typeof count === 'string' ? parseInt(count, 10) : count;
        if (isNaN(numCount) || numCount < 0) {
            throw new Error('Online count must be a non-negative number');
        }
        return numCount;
    }

    validateChatMessage(data) {
        if (!data.userId || typeof data.userId !== 'string') {
            throw new Error('Chat message must have a valid user ID');
        }
        if (!data.playerName || typeof data.playerName !== 'string') {
            throw new Error('Chat message must have a valid player name');
        }
        if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
            throw new Error('Chat message cannot be empty');
        }
        if (data.message.length > 200) {
            throw new Error('Chat message too long (max 200 characters)');
        }
        return {
            ...data,
            message: data.message.trim()
        };
    }

    getEventMappings() {
        return Array.from(this.eventMappings.entries());
    }

    isEventMapped(topic) {
        return this.eventMappings.has(topic);
    }
}