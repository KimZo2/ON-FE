const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));

// WebSocket 서버 설정 (/ws 경로에)
const wss = new WebSocket.Server({ 
    server: server,
    path: '/ws',
    protocols: ['v10.stomp', 'v11.stomp', 'v12.stomp']
});

// STOMP 프레임 파싱 및 생성 유틸리티
class StompFrameHandler {
    static parseFrame(data) {
        const lines = data.toString().split('\n');
        const command = lines[0];
        const headers = {};
        let bodyStart = -1;
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '') {
                bodyStart = i + 1;
                break;
            }
            const [key, value] = lines[i].split(':');
            if (key && value !== undefined) {
                headers[key] = value;
            }
        }
        
        const body = bodyStart >= 0 ? lines.slice(bodyStart).join('\n').replace(/\0$/, '') : '';
        
        return { command, headers, body };
    }
    
    static createFrame(command, headers = {}, body = '') {
        let frame = command + '\n';
        Object.entries(headers).forEach(([key, value]) => {
            frame += `${key}:${value}\n`;
        });
        frame += '\n' + body + '\0';
        return frame;
    }
}

// 클라이언트 관리
const clients = new Map();
const subscriptions = new Map(); // destination -> Set of client IDs

// 게임 상태 관리
const gameState = {
    players: new Map(),
    chatMessages: [],
    maxChatMessages: 100
};

// 유틸리티 함수
const broadcastOnlineCount = () => {
    broadcastToTopic('/topic/onlineCount', gameState.players.size);
};

const broadcastToTopic = (destination, data) => {
    console.log(`📢 브로드캐스트 시도: ${destination} -> 데이터:`, data);
    
    if (!subscriptions.has(destination)) {
        console.log(`⚠️  구독자가 없음: ${destination}`);
        return;
    }
    
    const subscribers = subscriptions.get(destination);
    console.log(`👥 구독자 수: ${subscribers.size}명 (${destination})`);
    
    const messageFrame = StompFrameHandler.createFrame('MESSAGE', {
        'destination': destination,
        'message-id': Date.now().toString(),
        'content-type': 'application/json'
    }, JSON.stringify(data));
    
    subscribers.forEach(clientId => {
        const client = clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
            console.log(`📤 메시지 전송: ${destination} -> ${clientId}`);
            client.send(messageFrame);
        } else {
            console.log(`⚠️  클라이언트 연결 상태 불량: ${clientId}`);
        }
    });
};

const sendToClient = (clientId, destination, data) => {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
        const messageFrame = StompFrameHandler.createFrame('MESSAGE', {
            'destination': destination,
            'message-id': Date.now().toString(),
            'content-type': 'application/json'
        }, JSON.stringify(data));
        client.send(messageFrame);
    }
};

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    const clientId = 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    clients.set(clientId, ws);
    ws.clientId = clientId;
    
    console.log(`✅ 새로운 STOMP 클라이언트 연결: ${clientId}`);
    
    ws.on('message', (data) => {
        try {
            console.log(`📥 원본 메시지 수신 (${clientId}):`, data.toString().substring(0, 200) + '...');
            const frame = StompFrameHandler.parseFrame(data);
            console.log(`🔍 파싱된 프레임:`, { command: frame.command, destination: frame.headers?.destination, bodyLength: frame.body?.length });
            handleStompFrame(ws, frame);
        } catch (error) {
            console.error('STOMP 프레임 파싱 오류:', error);
            console.error('원본 데이터:', data.toString());
        }
    });
    
    ws.on('close', () => {
        console.log(`❌ 클라이언트 연결 끊김: ${clientId}`);
        handleClientDisconnect(clientId);
        clients.delete(clientId);
    });
    
    ws.on('error', (error) => {
        console.error(`❌ WebSocket 에러 (${clientId}):`, error);
    });
});

// STOMP 프레임 처리
const handleStompFrame = (ws, frame) => {
    const { command, headers, body } = frame;
    const clientId = ws.clientId;
    
    switch (command) {
        case 'CONNECT':
        case 'STOMP':
            console.log(`🔗 STOMP 연결 요청 받음 (${clientId}):`, headers);
            
            // 클라이언트가 요청한 버전 확인
            const acceptVersion = headers['accept-version'] || '1.0';
            const supportedVersions = ['1.0', '1.1', '1.2'];
            const clientVersions = acceptVersion.split(',').map(v => v.trim());
            const negotiatedVersion = clientVersions.find(v => supportedVersions.includes(v)) || '1.0';
            
            // 연결 응답
            const connectedFrame = StompFrameHandler.createFrame('CONNECTED', {
                'version': negotiatedVersion,
                'heart-beat': '0,0',
                'session': clientId
            });
            console.log(`📤 CONNECTED 프레임 전송 (${clientId}, version: ${negotiatedVersion}):`, connectedFrame.substring(0, 200));
            ws.send(connectedFrame);
            broadcastOnlineCount();
            break;
            
        case 'SUBSCRIBE':
            const destination = headers.destination;
            if (!subscriptions.has(destination)) {
                subscriptions.set(destination, new Set());
            }
            subscriptions.get(destination).add(clientId);
            console.log(`📡 구독: ${clientId} -> ${destination}`);
            break;
            
        case 'UNSUBSCRIBE':
            const unsubDest = headers.destination;
            if (subscriptions.has(unsubDest)) {
                subscriptions.get(unsubDest).delete(clientId);
            }
            break;
            
        case 'SEND':
            handleAppMessage(headers.destination, body, headers, clientId);
            break;
            
        case 'DISCONNECT':
            ws.close();
            break;
    }
};

// 애플리케이션 메시지 처리
const handleAppMessage = (destination, body, headers, clientId) => {
    try {
        console.log(`📨 앱 메시지 수신: ${destination}, body: "${body}", clientId: ${clientId}`);
        
        // body가 비어있거나 null인 경우 처리
        if (!body || body.trim() === '') {
            console.warn(`⚠️  빈 body로 메시지 수신: ${destination}`);
            // Optionally send an ERROR frame back to the client
            // ws.send(StompFrameHandler.createFrame('ERROR', { message: 'Malformed JSON body' }));
            return;
        }
        
        const data = JSON.parse(body);
        
        switch (destination) {
            case '/app/playerJoined':
                handlePlayerJoined(data, clientId);
                break;
            case '/app/playerMove':
                handlePlayerMove(data);
                break;
            case '/app/chatMessage':
                handleChatMessage(data, clientId);
                break;
            case '/app/playerLeft':
                handlePlayerLeft(data, clientId);
                break;
            default:
                console.warn(`⚠️  알 수 없는 destination: ${destination}`);
        }
    } catch (error) {
        console.error('앱 메시지 처리 오류:', error);
        console.error(`- destination: ${destination}`);
        console.error(`- body: "${body}"`);
        console.error(`- clientId: ${clientId}`);
    }
};

// 플레이어 참가 처리
const handlePlayerJoined = (playerData, clientId) => {
    console.log(`🎮 플레이어 참가: ${playerData.name} (${playerData.id})`);
    
    // 플레이어 정보 저장
    const player = {
        id: playerData.id,
        name: playerData.name,
        x: playerData.x,
        y: playerData.y,
        clientId: clientId,
        joinTime: new Date()
    };
    
    gameState.players.set(playerData.id, player);

    // 기존 플레이어들 정보를 새로운 플레이어에게 전송 (구독 완료 후)
    const existingPlayers = Array.from(gameState.players.values())
        .filter(p => p.id !== playerData.id)
        .map(p => ({
            id: p.id,
            name: p.name,
            x: p.x,
            y: p.y
        }));
    
    // 구독이 완료될 시간을 주기 위해 약간 지연 후 전송
    console.log(`👥 기존 플레이어 목록 준비: ${existingPlayers.length}명`);
    setTimeout(() => {
        console.log(`📤 기존 플레이어 정보 전송 (${clientId}):`, existingPlayers);
        sendToClient(clientId, '/topic/existingPlayers', existingPlayers);
    }, 500);

    // 다른 플레이어들에게 새로운 플레이어 참가 알림
    broadcastToTopic('/topic/playerJoined', {
        id: playerData.id,
        name: playerData.name,
        x: playerData.x,
        y: playerData.y
    });

    // 온라인 사용자 수 업데이트
    broadcastOnlineCount();
};

// 플레이어 이동 처리
const handlePlayerMove = (moveData) => {
    const player = gameState.players.get(moveData.id);
    if (player) {
        if (typeof moveData.x !== 'number' || typeof moveData.y !== 'number') {
            console.warn(`⚠️  Invalid move data received for player ${moveData.id}: x or y is not a number`);
            return;
        }
        // Further validation for bounds, etc. can be added here
        // 플레이어 위치와 방향 정보 업데이트
        player.x = moveData.x;
        player.y = moveData.y;
        if (moveData.direction) {
            player.direction = moveData.direction;
            player.isMoving = moveData.isMoving || false;
        }
        
        // 다른 플레이어들에게 이동 정보 전송
        broadcastToTopic('/topic/playerMoved', {
            id: moveData.id,
            x: moveData.x,
            y: moveData.y,
            direction: moveData.direction,
            isMoving: moveData.isMoving || false
        });
    }
};

// 채팅 메시지 처리
const handleChatMessage = (messageData, clientId) => {
    // 1️⃣ 기본 구조 검증
    if (
        !messageData ||
        typeof messageData.message !== 'string' ||
        typeof messageData.playerId !== 'string'
    ) {
        console.warn('⚠️  Invalid chat message payload:', messageData);
        sendToClient(clientId, '/topic/chatError', {
            error: 'INVALID_PAYLOAD',
            message: '잘못된 채팅 데이터입니다.'
        });
        return;
    }
    const trimmedMessage = messageData.message.trim();
    // 2️⃣ 메시지 길이 검증
    if (trimmedMessage.length === 0) {
        return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        sendToClient(clientId, '/topic/chatError', {
            error: 'MESSAGE_TOO_LONG',
            message: `채팅 메시지는 최대 ${MAX_MESSAGE_LENGTH}자까지 가능합니다.`
        });
        return;
    }

    // 3️⃣ 플레이어 검증
    const player = gameState.players.get(messageData.playerId);

    if (!player) {
        sendToClient(clientId, '/topic/chatError', {
            error: 'INVALID_PLAYER',
            message: '유효하지 않은 플레이어입니다.'
        });
        return;
    }

    // 4️⃣ playerName 신뢰 금지 (서버 값 사용)
    const chatMessage = {
        id: Date.now() + Math.random(),
        playerId: player.id,
        playerName: player.name, // 클라이언트 값 무시
        message: trimmedMessage,
        timestamp: new Date()
    };

    // 5️⃣ 메시지 저장 (개수 제한)
    gameState.chatMessages.push(chatMessage);
    if (gameState.chatMessages.length > gameState.maxChatMessages) {
        gameState.chatMessages = gameState.chatMessages.slice(-gameState.maxChatMessages);
    }

    console.log(`💬 채팅 메시지: ${chatMessage.playerName}: ${chatMessage.message}`);

    // 6️⃣ 브로드캐스트
    broadcastToTopic('/topic/chatMessage', chatMessage);
};

// 플레이어 나가기 처리
const handlePlayerLeft = (playerId, clientId) => {
    handlePlayerDisconnect(playerId, clientId);
};

// 클라이언트 연결 해제 처리
const handleClientDisconnect = (clientId) => {
    // 해당 클라이언트의 플레이어 찾기
    let disconnectedPlayerId = null;
    for (const [playerId, player] of gameState.players.entries()) {
        if (player.clientId === clientId) {
            disconnectedPlayerId = playerId;
            break;
        }
    }

    if (disconnectedPlayerId) {
        handlePlayerDisconnect(disconnectedPlayerId, clientId);
    }
    
    // 모든 구독에서 클라이언트 제거
    subscriptions.forEach((clientSet) => {
        clientSet.delete(clientId);
    });
};

// 플레이어 연결 해제 처리 함수
const handlePlayerDisconnect = (playerId, clientId) => {
    const player = gameState.players.get(playerId);
    if (player) {
        console.log(`👋 플레이어 퇴장: ${player.name} (${playerId})`);
        
        // 플레이어 데이터 삭제
        gameState.players.delete(playerId);
        
        // 다른 플레이어들에게 퇴장 알림
        broadcastToTopic('/topic/playerLeft', playerId);
        
        // 온라인 사용자 수 업데이트
        broadcastOnlineCount();
    }
};

// 서버 상태 API
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        protocol: 'STOMP',
        onlinePlayers: gameState.players.size,
        totalChatMessages: gameState.chatMessages.length,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 플레이어 목록 API
app.get('/players', (req, res) => {
    const players = Array.from(gameState.players.values()).map(player => ({
        id: player.id,
        name: player.name,
        joinTime: player.joinTime
    }));
    
    res.json({
        players: players,
        count: players.length
    });
});

// 채팅 히스토리 API
app.get('/chat-history', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const recentMessages = gameState.chatMessages.slice(-limit);
    
    res.json({
        messages: recentMessages,
        total: gameState.chatMessages.length
    });
});

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 STOMP 메타버스 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`🔗 STOMP WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`📊 서버 상태: http://localhost:${PORT}/status`);
    console.log(`👥 플레이어 목록: http://localhost:${PORT}/players`);
    console.log(`💬 채팅 히스토리: http://localhost:${PORT}/chat-history`);
});

// 정리 작업
process.on('SIGINT', () => {
    console.log('\n🛑 서버 종료 중...');
    
    // 모든 연결된 클라이언트에게 서버 종료 알림
    broadcastToTopic('/topic/serverShutdown', { message: '서버가 곧 종료됩니다.' });
    
    // 서버 종료
    server.close(() => {
        console.log('✅ 서버가 정상적으로 종료되었습니다.');
        process.exit(0);
    });
});

// 예상치 못한 에러 처리
process.on('uncaughtException', (error) => {
    console.error('❌ 예상치 못한 에러:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 처리되지 않은 Promise 거부:', reason);
});