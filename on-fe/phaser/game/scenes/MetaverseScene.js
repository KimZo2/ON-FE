import { EventBus } from '../EventBus';

// Dynamic import for Phaser to avoid SSR issues
let Phaser = null;
if (typeof window !== 'undefined') {
    Phaser = require('phaser');
}

export class MetaverseScene extends (Phaser?.Scene || Object) {
    constructor() {
        super('MetaverseScene');
        this.players = new Map();
        this.currentPlayer = null;
        this.socket = null;
        this.chatMessages = [];
    }

    init(data) {
        this.socket = data.socket;
        this.playerId = data.playerId;
        this.playerName = data.playerName || `Player${Math.floor(Math.random() * 1000)}`;
    }

    preload() {
        // 기본 플레이어 스프라이트 생성
        this.load.image('player', 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#4A90E2" stroke="#2C5C8A" stroke-width="2"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
                <circle cx="20" cy="12" r="2" fill="white"/>
                <path d="M10 20 Q16 24 22 20" stroke="white" stroke-width="2" fill="none"/>
            </svg>
        `));

        // 맵 타일 생성
        this.load.image('ground', 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" fill="#90EE90" stroke="#228B22" stroke-width="1"/>
            </svg>
        `));

        this.load.image('wall', 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" fill="#8B4513" stroke="#654321" stroke-width="1"/>
            </svg>
        `));

        this.load.image('water', 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" fill="#4169E1" stroke="#191970" stroke-width="1"/>
            </svg>
        `));
    }

    create() {
        // 배경색 설정
        this.cameras.main.setBackgroundColor(0x87CEEB);

        // 맵 생성
        this.createMap();

        // 현재 플레이어 생성
        this.createCurrentPlayer();

        // 키보드 입력 설정
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');

        // 소켓 이벤트 리스너 설정
        this.setupSocketListeners();

        // 카메라가 플레이어를 따라가도록 설정
        this.cameras.main.startFollow(this.currentPlayer);
        this.cameras.main.setZoom(1.5);

        // UI 생성
        this.createUI();

        EventBus.emit('current-scene-ready', this);
    }

    createMap() {
        const mapWidth = 20;
        const mapHeight = 15;
        const tileSize = 32;

        // 맵 데이터 (0: 땅, 1: 벽, 2: 물)
        const mapData = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0,1],
            [1,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0,1],
            [1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0,1],
            [1,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0,1],
            [1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.map = this.add.group();
        this.walls = this.physics.add.staticGroup();

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileType = mapData[y][x];
                let tileName = 'ground';

                switch (tileType) {
                    case 1:
                        tileName = 'wall';
                        break;
                    case 2:
                        tileName = 'water';
                        break;
                    default:
                        tileName = 'ground';
                }

                const tile = this.add.image(x * tileSize + 16, y * tileSize + 16, tileName);
                this.map.add(tile);

                // 벽은 충돌 객체로 추가
                if (tileType === 1) {
                    const wall = this.physics.add.staticSprite(x * tileSize + 16, y * tileSize + 16, 'wall');
                    this.walls.add(wall);
                }
            }
        }
    }

    createCurrentPlayer() {
        // 플레이어 시작 위치 (맵 중앙)
        const startX = 320;
        const startY = 240;

        this.currentPlayer = this.physics.add.sprite(startX, startY, 'player');
        this.currentPlayer.setCollideWorldBounds(true);
        this.currentPlayer.setScale(1.2);
        
        // 플레이어 이름 표시
        this.currentPlayer.nameText = this.add.text(startX, startY - 30, this.playerName, {
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 벽과 충돌 설정
        this.physics.add.collider(this.currentPlayer, this.walls);

        // 플레이어 정보를 서버에 전송
        if (this.socket) {
            this.socket.emit('playerJoined', {
                id: this.playerId,
                name: this.playerName,
                x: startX,
                y: startY
            });
        }
    }

    createUI() {
        // 채팅 입력창 및 버튼은 React 컴포넌트에서 처리
        // 여기서는 게임 내 UI만 생성
        
        // 온라인 플레이어 수 표시
        this.onlineCountText = this.add.text(16, 16, '온라인: 1명', {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0);

        // 채팅 메시지 표시 영역
        this.chatDisplayText = this.add.text(16, this.scale.height - 120, '', {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            wordWrap: { width: 400 }
        }).setScrollFactor(0);
    }

    setupSocketListeners() {
        if (!this.socket) return;

        // 다른 플레이어 참가
        this.socket.on('playerJoined', (playerData) => {
            if (playerData.id !== this.playerId) {
                this.addOtherPlayer(playerData);
            }
        });

        // 플레이어 이동
        this.socket.on('playerMoved', (playerData) => {
            if (playerData.id !== this.playerId) {
                this.updateOtherPlayer(playerData);
            }
        });

        // 플레이어 퇴장
        this.socket.on('playerLeft', (playerId) => {
            this.removeOtherPlayer(playerId);
        });

        // 채팅 메시지 수신
        this.socket.on('chatMessage', (messageData) => {
            this.addChatMessage(messageData);
        });

        // 온라인 플레이어 수 업데이트
        this.socket.on('onlineCount', (count) => {
            this.onlineCountText.setText(`온라인: ${count}명`);
        });

        // 기존 플레이어들 정보 수신
        this.socket.on('existingPlayers', (players) => {
            players.forEach(player => {
                if (player.id !== this.playerId) {
                    this.addOtherPlayer(player);
                }
            });
        });
    }

    addOtherPlayer(playerData) {
        const otherPlayer = this.physics.add.sprite(playerData.x, playerData.y, 'player');
        otherPlayer.setTint(0xff6b6b); // 다른 플레이어는 다른 색상
        otherPlayer.setScale(1.2);

        // 플레이어 이름 표시
        otherPlayer.nameText = this.add.text(playerData.x, playerData.y - 30, playerData.name, {
            fontSize: '12px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.players.set(playerData.id, otherPlayer);
    }

    updateOtherPlayer(playerData) {
        const otherPlayer = this.players.get(playerData.id);
        if (otherPlayer) {
            otherPlayer.setPosition(playerData.x, playerData.y);
            otherPlayer.nameText.setPosition(playerData.x, playerData.y - 30);
        }
    }

    removeOtherPlayer(playerId) {
        const otherPlayer = this.players.get(playerId);
        if (otherPlayer) {
            otherPlayer.nameText.destroy();
            otherPlayer.destroy();
            this.players.delete(playerId);
        }
    }

    addChatMessage(messageData) {
        this.chatMessages.push(messageData);
        
        // 최근 5개 메시지만 표시
        const recentMessages = this.chatMessages.slice(-5);
        const displayText = recentMessages.map(msg => 
            `${msg.playerName}: ${msg.message}`
        ).join('\n');
        
        this.chatDisplayText.setText(displayText);

        // 메시지가 표시된 후 5초 후에 페이드 아웃
        this.time.delayedCall(5000, () => {
            this.chatDisplayText.setAlpha(0.5);
        });
    }

    update() {
        if (!this.currentPlayer) return;

        const speed = 200;
        let moved = false;

        // 플레이어 이동
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.currentPlayer.setVelocityX(-speed);
            moved = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.currentPlayer.setVelocityX(speed);
            moved = true;
        } else {
            this.currentPlayer.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.currentPlayer.setVelocityY(-speed);
            moved = true;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.currentPlayer.setVelocityY(speed);
            moved = true;
        } else {
            this.currentPlayer.setVelocityY(0);
        }

        // 이름 텍스트 위치 업데이트
        this.currentPlayer.nameText.setPosition(
            this.currentPlayer.x, 
            this.currentPlayer.y - 30
        );

        // 이동했다면 서버에 위치 전송
        if (moved && this.socket) {
            this.socket.emit('playerMove', {
                id: this.playerId,
                x: this.currentPlayer.x,
                y: this.currentPlayer.y
            });
        }
    }

    // 채팅 메시지 전송 (외부에서 호출)
    sendChatMessage(message) {
        if (this.socket && message.trim()) {
            this.socket.emit('chatMessage', {
                playerId: this.playerId,
                playerName: this.playerName,
                message: message.trim()
            });
        }
    }

    // 씬 종료시 정리
    shutdown() {
        if (this.socket) {
            this.socket.emit('playerLeft', this.playerId);
        }
    }
}