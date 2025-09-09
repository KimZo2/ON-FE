'use client';

import { MetaverseProvider } from '../../contexts/MetaverseContext';
import useMetaverse from '../../hooks/useMetaverse';
import usePhaserGame from '../../hooks/usePhaserGame';
import MetaverseLoginForm from './MetaverseLoginForm';
import MetaverseGameView from './MetaverseGameView';

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

    // 메타버스가 연결되지 않았으면 로그인 폼 표시
    if (!metaverse.isConnected) {
        return (
            <MetaverseLoginForm
                onConnect={metaverse.connect}
                connectionStatus={metaverse.connectionStatus}
                error={metaverse.error}
                playerName={metaverse.playerName}
            />
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