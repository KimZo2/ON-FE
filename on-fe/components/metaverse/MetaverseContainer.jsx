'use client';

import { MetaverseProvider } from '../../contexts/MetaverseContext';
import useMetaverse from '../../hooks/useMetaverse';
import usePhaserGame from '../../hooks/usePhaserGame';
import MetaverseGameView from './MetaverseGameView';
import FlyingStar from '../background/FlyingStar';
import LoadingSpinner from '../loading/LoadingSpinner';

function MetaverseContent({ userNickName }) {
    const metaverse = useMetaverse(userNickName);
    const phaserGame = usePhaserGame(
        metaverse.playerId,
        metaverse.playerName,
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
                <div className="w-[10dvw] relative z-10 bg-black bg-opacity-50 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-8 text-center">
                    <LoadingSpinner message='메타버스에 연결 중..' color='white'/>
                    {/* TODO: STOMP 연결 예외 발생 시 에러 처리 어떻게 할 건지? */}
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

    // 메타버스가 연결되었으면 게임 뷰 표시
    return (
        <MetaverseGameView
            gameContainerRef={phaserGame.gameContainerRef}
            onlineCount={metaverse.onlineCount}
            playerName={metaverse.player?.name || metaverse.playerName}
            messages={metaverse.chatMessages}
            onSendMessage={metaverse.sendChatMessage}
            playerId={metaverse.playerId}
        />
    );
}

export default function MetaverseContainer({ userNickName }) {
    return (
        <MetaverseProvider>
            <MetaverseContent userNickName={userNickName} />
        </MetaverseProvider>
    );
}