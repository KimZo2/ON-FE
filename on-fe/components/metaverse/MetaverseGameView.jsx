'use client';

import ChatInterface from './ChatInterface';

export default function MetaverseGameView({ 
    gameContainerRef, 
    onlineCount, 
    playerName, 
    messages, 
    onSendMessage,
    userId 
}) {
    return (
        <div className="relative w-full h-screen bg-gray-900">
            {/* Phaser 게임 컨테이너 */}
            <div
                ref={gameContainerRef}
                id="game-container"
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
            />

            {/* 게임 상태 오버레이 */}
            <div className="absolute top-[1rem] right-[1rem] bg-black bg-opacity-50 text-white p-2 rounded">
                {/* TODO: 메타버스 화면 진행 후, 크기에 맞게 스타일 수정 필요 */}
                {/* <div className="text-sm">온라인: {onlineCount}명</div>
                <div className="text-xs text-gray-300">플레이어: {playerName}</div> */}
                <div className="">온라인: {onlineCount}명</div>
                <div className="text-[1.2rem] text-gray-300">플레이어: {playerName}</div>
            </div>

            {/* 채팅 인터페이스 */}
            <ChatInterface 
                onSendMessage={onSendMessage} 
                messages={messages}
                currentPlayerId={userId}
            />

            {/* 게임 컨트롤 안내 */}
            <div className="absolute bottom-[1rem] right-[1rem] bg-black bg-opacity-50 text-white p-[0.7rem] rounded">
                <div>이동: 화살표 키</div>
                <div>채팅: 하단 입력창 사용</div>
            </div>
        </div>
    );
}