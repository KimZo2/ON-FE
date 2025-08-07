# 메타버스 서버

실시간 멀티플레이어 메타버스를 위한 Socket.io 서버입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
cd server
npm install
```

### 2. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## 기능

### 🎮 멀티플레이어
- 실시간 플레이어 참가/퇴장
- 플레이어 이동 동기화
- 온라인 사용자 수 추적

### 💬 채팅 시스템
- 실시간 채팅 메시지
- 채팅 히스토리 저장
- 최대 100개 메시지 보관

### 📊 모니터링 API
- `GET /status` - 서버 상태 확인
- `GET /players` - 현재 접속 플레이어 목록
- `GET /chat-history` - 채팅 히스토리 조회

## 클라이언트 연결

클라이언트에서는 다음과 같이 연결할 수 있습니다:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// 플레이어 참가
socket.emit('playerJoined', {
    id: 'unique-player-id',
    name: 'Player Name',
    x: 100,
    y: 100
});

// 채팅 메시지 전송
socket.emit('chatMessage', {
    playerId: 'unique-player-id',
    playerName: 'Player Name',
    message: 'Hello World!'
});
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 3001)

## 로그

서버는 다음과 같은 이벤트를 로그로 출력합니다:
- ✅ 새로운 사용자 연결
- 🎮 플레이어 참가
- 💬 채팅 메시지
- 👋 플레이어 퇴장
- ❌ 연결 끊김 및 에러

## 보안

- CORS 설정으로 허용된 도메인만 접근 가능
- 채팅 메시지 길이 제한
- 잘못된 데이터 검증