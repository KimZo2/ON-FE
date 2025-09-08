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
        this.metaverseService = null;
        this.lastSentMoving = false;
    }

    init(data) {
        this.metaverseService = data.metaverseService;
        this.playerId = data.playerId;
        this.playerName = data.playerName || `Player${Math.floor(Math.random() * 1000)}`;
    }

    preload() {
        // 플레이어 스프라이트시트 로드 (girl1.png)
        this.load.spritesheet('player', '/assets/girl1.png', {
            frameWidth: 64,  // 각 프레임의 가로 크기 (4x4 그리드이므로 전체 이미지를 4로 나눈 크기)
            frameHeight: 64  // 각 프레임의 세로 크기
        });

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

        // 소켓 이벤트 리스너 설정 (플레이어 생성 전에 먼저 설정)
        this.setupSocketListeners();

        // 현재 플레이어 생성
        this.createCurrentPlayer();

        // 키보드 입력 설정 (화살표 키만 사용)
        this.cursors = this.input.keyboard.createCursorKeys();

        // 카메라가 플레이어를 따라가도록 설정
        this.cameras.main.startFollow(this.currentPlayer);
        this.cameras.main.setZoom(1.5);

        // 플레이어 애니메이션 생성
        this.createPlayerAnimations();

        // UI 생성
        this.createUI();

        EventBus.emit('current-scene-ready', this);
        
        // 온라인 카운트 업데이트 리스너 (EventBus를 통해)
        EventBus.on('onlineCount', (count) => {
            this.onlineCountText.setText(`온라인: ${count}명`);
        });
    }

    createPlayerAnimations() {
        // 아래쪽을 향한 걷기 애니메이션 (첫 번째 행: 프레임 0-3)
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        // 왼쪽을 향한 걷기 애니메이션 (두 번째 행: 프레임 4-7)
        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        // 오른쪽을 향한 걷기 애니메이션 (세 번째 행: 프레임 8-11)
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });

        // 위쪽을 향한 걷기 애니메이션 (네 번째 행: 프레임 12-15)
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
            frameRate: 8,
            repeat: -1
        });

        // 정지 상태 애니메이션들 (각 방향의 첫 번째 프레임)
        this.anims.create({
            key: 'idle-down',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1
        });

        this.anims.create({
            key: 'idle-left',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 1
        });

        this.anims.create({
            key: 'idle-right',
            frames: [{ key: 'player', frame: 8 }],
            frameRate: 1
        });

        this.anims.create({
            key: 'idle-up',
            frames: [{ key: 'player', frame: 12 }],
            frameRate: 1
        });
    }

    createMap() {
        const mapWidth = 25;  // 강의실 너비 증가
        const mapHeight = 18; // 강의실 높이 증가
        const tileSize = 32;
        
        // 월드 크기 설정
        this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

        // 강의실 맵 데이터 (0: 바닥, 1: 벽, 3: 책상, 4: 칠판)
        const mapData = [
            // 외벽
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            // 칠판 앞 공간
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,1], // 칠판
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // 첫 번째 줄 (4+4)
            [1,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // 두 번째 줄 (4+4)
            [1,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // 세 번째 줄 (4+4)
            [1,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // 네 번째 줄 (4+4)
            [1,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // 다섯 번째 줄 (2+2)
            [1,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  // 외벽
        ];

        this.map = this.add.group();
        this.walls = this.physics.add.staticGroup();
        this.desks = this.physics.add.staticGroup();

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileType = mapData[y][x];
                let tileName = 'ground';
                let tileColor = 0xf5f5dc; // 베이지 색 바닥

                switch (tileType) {
                    case 1: // 벽
                        tileName = 'wall';
                        tileColor = 0x8b4513; // 갈색 벽
                        break;
                    case 3: // 책상
                        tileName = 'desk';
                        tileColor = 0xdeb887; // 나무색 책상
                        break;
                    case 4: // 칠판
                        tileName = 'blackboard';
                        tileColor = 0x2f4f2f; // 어두운 초록색 칠판
                        break;
                    default:
                        tileName = 'ground';
                        tileColor = 0xf5f5dc; // 베이지 색 바닥
                }

                // 타일 생성 (색상으로 구분)
                const tile = this.add.rectangle(x * tileSize + 16, y * tileSize + 16, tileSize, tileSize, tileColor);
                tile.setStrokeStyle(1, 0x000000, 0.3); // 경계선 추가
                this.map.add(tile);

                // 충돌 객체 추가
                if (tileType === 1) { // 벽
                    const wall = this.physics.add.staticSprite(x * tileSize + 16, y * tileSize + 16, 'wall');
                    wall.setVisible(false); // 보이지 않게 설정 (색상으로 표현)
                    this.walls.add(wall);
                } else if (tileType === 3) { // 책상
                    const desk = this.physics.add.staticSprite(x * tileSize + 16, y * tileSize + 16, 'desk');
                    desk.setVisible(false); // 보이지 않게 설정 (색상으로 표현)
                    this.desks.add(desk);
                }
            }
        }
    }

    createCurrentPlayer() {
        // 플레이어 시작 위치 (강의실 뒤쪽 중앙 통로)
        const startX = 400; // 강의실 중앙 통로
        const startY = 480; // 강의실 뒤쪽

        this.currentPlayer = this.physics.add.sprite(startX, startY, 'player');
        this.currentPlayer.setCollideWorldBounds(true);
        this.currentPlayer.setScale(0.7); // 스프라이트 크기 조정
        
        // 충돌 박스 크기 조정 (실제 캐릭터 몸체에 맞게)
        this.currentPlayer.body.setSize(32, 40); // 가로 32, 세로 40 픽셀로 충돌영역 설정
        this.currentPlayer.body.setOffset(16, 24); // 충돌영역의 위치 조정 (중앙 하단 부분)
        
        // 기본 애니메이션 설정 (아래쪽을 보고 있는 정지 상태)
        this.currentPlayer.play('idle-down');
        
        // 플레이어 이름 표시
        this.currentPlayer.nameText = this.add.text(startX, startY - 30, this.playerName, {
            fontSize: '12px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // 벽과 충돌 설정
        this.physics.add.collider(this.currentPlayer, this.walls);
        
        // 책상과 충돌 설정
        this.physics.add.collider(this.currentPlayer, this.desks);

        // 플레이어 정보를 서버에 전송
        if (this.metaverseService) {
            const playerData = {
                id: this.playerId,
                name: this.playerName,
                x: startX,
                y: startY
            };
                this.metaverseService.sendPlayerJoined(playerData);
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
        if (!this.metaverseService) {
            return;
        }

        // EventBus를 통한 이벤트 리스너 등록
        EventBus.on('player:joined', (playerData) => {
            if (playerData.id !== this.playerId) {
                this.addOtherPlayer(playerData);
            }
        });

        EventBus.on('player:moved', (playerData) => {
            if (playerData.id !== this.playerId) {
                this.updateOtherPlayer(playerData);
            }
        });

        EventBus.on('player:left', (playerId) => {
            this.removeOtherPlayer(playerId);
        });

        // 기존 플레이어들 정보 수신 핸들러
        EventBus.on('players:existing', (players) => {
            if (Array.isArray(players)) {
                players.forEach(player => {
                    if (player.id !== this.playerId) {
                        this.addOtherPlayer(player);
                    }
                });
            }
        });
    }

    addOtherPlayer(playerData) {
        // 이미 존재하는 플레이어인지 확인
        if (this.players.has(playerData.id)) {
            return;
        }
        
        const otherPlayer = this.physics.add.sprite(playerData.x, playerData.y, 'player');
        otherPlayer.setTint(0xff6b6b); // 다른 플레이어는 다른 색상
        otherPlayer.setScale(0.7); // 스프라이트 크기 조정 (현재 플레이어와 동일)
        
        // 충돌 박스 크기 조정 (현재 플레이어와 동일)
        otherPlayer.body.setSize(32, 40);
        otherPlayer.body.setOffset(16, 24);
        
        // 기본 정지 애니메이션 설정
        otherPlayer.play('idle-down');

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
            
            // 방향과 이동 상태에 따른 애니메이션 처리
            if (playerData.direction) {
                if (playerData.isMoving) {
                    // 이동 중일 때 걷기 애니메이션
                    const walkAnim = `walk-${playerData.direction}`;
                    if (otherPlayer.anims.currentAnim?.key !== walkAnim) {
                        otherPlayer.play(walkAnim);
                    }
                    // 마지막 방향 저장
                    otherPlayer.lastDirection = playerData.direction;
                } else {
                    // 정지 상태일 때 정지 애니메이션
                    const idleAnim = `idle-${playerData.direction}`;
                    if (otherPlayer.anims.currentAnim?.key !== idleAnim) {
                        otherPlayer.play(idleAnim);
                    }
                    otherPlayer.lastDirection = playerData.direction;
                }
            }
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


    update() {
        if (!this.currentPlayer) return;

        const speed = 200;
        let moved = false;
        let direction = null;

        // 플레이어 이동과 애니메이션 (화살표 키만 사용)
        let horizontalDirection = null;
        let verticalDirection = null;
        
        if (this.cursors.left.isDown) {
            this.currentPlayer.setVelocityX(-speed);
            horizontalDirection = 'left';
            moved = true;
        } else if (this.cursors.right.isDown) {
            this.currentPlayer.setVelocityX(speed);
            horizontalDirection = 'right';
            moved = true;
        } else {
            this.currentPlayer.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.currentPlayer.setVelocityY(-speed);
            verticalDirection = 'up';
            moved = true;
        } else if (this.cursors.down.isDown) {
            this.currentPlayer.setVelocityY(speed);
            verticalDirection = 'down';
            moved = true;
        } else {
            this.currentPlayer.setVelocityY(0);
        }
        
        // 방향 우선순위: 세로 방향을 우선으로 설정 (대각선 이동 시)
        if (verticalDirection) {
            direction = verticalDirection;
        } else if (horizontalDirection) {
            direction = horizontalDirection;
        }

        // 애니메이션 처리
        if (moved && direction) {
            // 이동 중일 때 걷기 애니메이션 재생
            const walkAnim = `walk-${direction}`;
            if (this.currentPlayer.anims.currentAnim?.key !== walkAnim) {
                this.currentPlayer.play(walkAnim);
            }
            // 마지막 방향 저장
            this.currentPlayer.lastDirection = direction;
        } else {
            // 정지 상태일 때 정지 애니메이션 재생
            const lastDirection = this.currentPlayer.lastDirection || 'down';
            const idleAnim = `idle-${lastDirection}`;
            if (this.currentPlayer.anims.currentAnim?.key !== idleAnim) {
                this.currentPlayer.play(idleAnim);
            }
        }

        // 이름 텍스트 위치 업데이트
        this.currentPlayer.nameText.setPosition(
            this.currentPlayer.x, 
            this.currentPlayer.y - 30
        );

        // 이동 상태 변화가 있을 때만 서버에 전송
        if (moved && this.metaverseService && direction) {
            this.metaverseService.sendPlayerMove({
                id: this.playerId,
                x: this.currentPlayer.x,
                y: this.currentPlayer.y,
                direction: direction,
                isMoving: true
            });
            this.lastSentMoving = true;
        } else if (this.metaverseService && this.lastSentMoving === true) {
            // 이전에 이동 중이었는데 지금 정지한 경우
            this.metaverseService.sendPlayerMove({
                id: this.playerId,
                x: this.currentPlayer.x,
                y: this.currentPlayer.y,
                direction: this.currentPlayer.lastDirection || 'down',
                isMoving: false
            });
            this.lastSentMoving = false;
        }
    }

    // 채팅 메시지 전송 (외부에서 호출)
    sendChatMessage(message) {
        if (this.metaverseService && message.trim()) {
            this.metaverseService.sendChatMessage({
                playerId: this.playerId,
                playerName: this.playerName,
                message: message.trim()
            });
        }
    }

    // 씬 종료시 정리
    shutdown() {
        if (this.metaverseService) {
            this.metaverseService.sendPlayerLeft(this.playerId);
        }
        // EventBus 리스너 정리
        EventBus.off('onlineCount');
        EventBus.off('player:joined');
        EventBus.off('player:moved');
        EventBus.off('player:left');
        EventBus.off('players:existing');
    }
}