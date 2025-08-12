const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS 설정
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));

// Socket.io 설정
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// 게임 상태 관리
const gameState = {
    players: new Map(),
    chatMessages: [],
    maxChatMessages: 100
};

// 유틸리티 함수
const broadcastOnlineCount = () => {
    io.emit('onlineCount', gameState.players.size);
};

const broadcastToAllExcept = (socketId, event, data) => {
    io.sockets.sockets.forEach((socket, id) => {
        if (id !== socketId) {
            socket.emit(event, data);
        }
    });
};

// Socket.io 연결 처리
io.on('connection', (socket) => {
    console.log(`✅ 새로운 사용자 연결: ${socket.id}`);

    // 클라이언트에게 연결 완료 확인 메시지 전송
    socket.emit('connected', { 
        socketId: socket.id, 
        timestamp: new Date().toISOString(),
        message: '서버 연결 완료' 
    });

    // 연결된 사용자 수 전송
    broadcastOnlineCount();

    // 플레이어 참가 처리
    socket.on('playerJoined', (playerData) => {
        console.log(`🎮 플레이어 참가: ${playerData.name} (${playerData.id})`);
        
        // 플레이어 정보 저장
        const player = {
            id: playerData.id,
            name: playerData.name,
            x: playerData.x,
            y: playerData.y,
            socketId: socket.id,
            joinTime: new Date()
        };
        
        gameState.players.set(playerData.id, player);

        // 기존 플레이어들 정보를 새로운 플레이어에게 전송
        const existingPlayers = Array.from(gameState.players.values())
            .filter(p => p.id !== playerData.id)
            .map(p => ({
                id: p.id,
                name: p.name,
                x: p.x,
                y: p.y
            }));
        
        socket.emit('existingPlayers', existingPlayers);

        // 다른 플레이어들에게 새로운 플레이어 참가 알림
        broadcastToAllExcept(socket.id, 'playerJoined', {
            id: playerData.id,
            name: playerData.name,
            x: playerData.x,
            y: playerData.y
        });

        // 온라인 사용자 수 업데이트
        broadcastOnlineCount();
    });

    // 플레이어 이동 처리
    socket.on('playerMove', (moveData) => {
        const player = gameState.players.get(moveData.id);
        if (player) {
            // 플레이어 위치와 방향 정보 업데이트
            player.x = moveData.x;
            player.y = moveData.y;
            if (moveData.direction) {
                player.direction = moveData.direction;
                player.isMoving = moveData.isMoving || false;
            }
            
            // 다른 플레이어들에게 이동 정보 전송
            broadcastToAllExcept(socket.id, 'playerMoved', {
                id: moveData.id,
                x: moveData.x,
                y: moveData.y,
                direction: moveData.direction,
                isMoving: moveData.isMoving || false
            });
        }
    });

    // 채팅 메시지 처리
    socket.on('chatMessage', (messageData) => {
        const player = gameState.players.get(messageData.playerId);
        if (player && messageData.message && messageData.message.trim()) {
            const chatMessage = {
                id: Date.now() + Math.random(),
                playerId: messageData.playerId,
                playerName: messageData.playerName,
                message: messageData.message.trim(),
                timestamp: new Date()
            };

            // 채팅 메시지 저장 (최대 개수 제한)
            gameState.chatMessages.push(chatMessage);
            if (gameState.chatMessages.length > gameState.maxChatMessages) {
                gameState.chatMessages = gameState.chatMessages.slice(-gameState.maxChatMessages);
            }

            console.log(`💬 채팅 메시지: ${chatMessage.playerName}: ${chatMessage.message}`);

            // 모든 플레이어에게 채팅 메시지 전송
            io.emit('chatMessage', chatMessage);
        }
    });

    // 플레이어 나가기 처리
    socket.on('playerLeft', (playerId) => {
        handlePlayerDisconnect(playerId, socket.id);
    });

    // 연결 끊김 처리
    socket.on('disconnect', (reason) => {
        console.log(`❌ 사용자 연결 끊김: ${socket.id} (${reason})`);
        
        // 해당 소켓의 플레이어 찾기
        let disconnectedPlayerId = null;
        for (const [playerId, player] of gameState.players.entries()) {
            if (player.socketId === socket.id) {
                disconnectedPlayerId = playerId;
                break;
            }
        }

        if (disconnectedPlayerId) {
            handlePlayerDisconnect(disconnectedPlayerId, socket.id);
        }
    });

    // 에러 처리
    socket.on('error', (error) => {
        console.error(`❌ Socket 에러 (${socket.id}):`, error);
    });
});

// 플레이어 연결 해제 처리 함수
const handlePlayerDisconnect = (playerId, socketId) => {
    const player = gameState.players.get(playerId);
    if (player) {
        console.log(`👋 플레이어 퇴장: ${player.name} (${playerId})`);
        
        // 플레이어 데이터 삭제
        gameState.players.delete(playerId);
        
        // 다른 플레이어들에게 퇴장 알림
        io.emit('playerLeft', playerId);
        
        // 온라인 사용자 수 업데이트
        broadcastOnlineCount();
    }
};

// 서버 상태 API
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
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
    console.log(`🚀 메타버스 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📊 서버 상태: http://localhost:${PORT}/status`);
    console.log(`👥 플레이어 목록: http://localhost:${PORT}/players`);
    console.log(`💬 채팅 히스토리: http://localhost:${PORT}/chat-history`);
});

// 정리 작업
process.on('SIGINT', () => {
    console.log('\n🛑 서버 종료 중...');
    
    // 모든 연결된 클라이언트에게 서버 종료 알림
    io.emit('serverShutdown', { message: '서버가 곧 종료됩니다.' });
    
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