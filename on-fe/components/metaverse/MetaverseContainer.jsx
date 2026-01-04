'use client';

import { MetaverseProvider } from '../../contexts/MetaverseContext';
import useMetaverse from '../../hooks/useMetaverse';
import usePhaserGame from '../../hooks/usePhaserGame';
import MetaverseGameView from './MetaverseGameView';
import FlyingStar from '../background/FlyingStar';
import LoadingSpinner from '../loading/LoadingSpinner';

function MetaverseContent({ userId, userNickname, roomId }) {
    const metaverse = useMetaverse(userId, userNickname, roomId);
    const phaserGame = usePhaserGame(
        metaverse.userId,
        metaverse.playerName,
        roomId,
        // onGameReady callback
        (gameInstance) => {
            metaverse.setGameInstance(gameInstance);
        },
        // onSceneReady callback
        (scene) => {
            metaverse.setCurrentScene(scene);
            metaverse.setGameReady(true);
        }
    );

    // STOMP 연결 중이면 연결 대기 화면 표시
    if (!metaverse.isConnected) {
        return (
            <div className="relative flex items-center justify-center w-full h-screen bg-black overflow-hidden">
                <FlyingStar />
                <div className="relative z-10 bg-black bg-opacity-50 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-8 text-center">
                    <LoadingSpinner message='메타버스에 연결 중..' color='white'/>
                    <p className="text-gray-300 mt-4">
                        {metaverse.error ? `연결 오류: ${metaverse.error}` : '잠시만 기다려주세요'}
                    </p>
                    {metaverse.error && (
                        <button
                            onClick={metaverse.connect}
                            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                        >
                            다시 연결
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // STOMP 연결 완료 후 게임 뷰 표시
    return (
        <MetaverseGameView
            gameContainerRef={phaserGame.gameContainerRef}
            onlineCount={metaverse.onlineCount}
            playerName={metaverse.player?.name || metaverse.playerName}
            messages={metaverse.chatMessages}
            onSendMessage={metaverse.sendChatMessage}
            userId={metaverse.userId}
            // TODO: 방 이름 전달 metaverse에 roomName이 없으면 roomId 사용
            roomName={metaverse.roomName || "학습 공간 (추후 방 이름)"}
        />
    );
}

export default function MetaverseContainer({ userId, userNickname, roomId }) {
    return (
        <MetaverseProvider>
            <MetaverseContent userId={userId} userNickname={userNickname} roomId={roomId} />
        </MetaverseProvider>
    );
}
