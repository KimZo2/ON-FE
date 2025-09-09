import { useState, useCallback, useEffect, useRef } from 'react';
import StartGame from '../phaser/game/main';
import metaverseService from '../services/metaverseService';

export default function useGameInstance(playerId, playerName) {
    const [gameInstance, setGameInstance] = useState(null);
    const [currentScene, setCurrentScene] = useState(null);
    const [isGameReady, setIsGameReady] = useState(false);
    
    const gameContainerRef = useRef(null);

    const initializeGame = useCallback((containerElement) => {
        if (!containerElement || gameInstance) return;

        try {
            const phaserGame = StartGame(containerElement);
            
            if (!phaserGame) {
                throw new Error('Phaser 게임 초기화 실패');
            }
            
            setGameInstance(phaserGame);
            
            // 게임이 준비되면 메타버스 씬으로 전환
            const initializeScene = () => {
                try {
                    phaserGame.scene.start('MetaverseScene', {
                        metaverseService: metaverseService,
                        playerId: playerId,
                        playerName: playerName
                    });
                    
                    const scene = phaserGame.scene.getScene('MetaverseScene');
                    setCurrentScene(scene);
                    setIsGameReady(true);
                } catch (sceneError) {
                    console.error('Scene initialization error:', sceneError);
                }
            };
            
            // DOM 렌더링 완료를 기다린 후 씬 초기화
            setTimeout(initializeScene, 1000);
            
        } catch (error) {
            console.error('Game initialization error:', error);
            throw error;
        }
    }, [gameInstance, playerId, playerName]);

    const destroyGame = useCallback(() => {
        if (gameInstance) {
            try {
                gameInstance.destroy(true);
            } catch (error) {
                console.error('Game destruction error:', error);
            } finally {
                setGameInstance(null);
                setCurrentScene(null);
                setIsGameReady(false);
            }
        }
    }, [gameInstance]);

    const sendChatMessage = useCallback((message) => {
        // 여러 방법으로 MetaverseScene에 접근 시도
        if (currentScene && currentScene.sendChatMessage) {
            currentScene.sendChatMessage(message);
            return true;
        }
        
        // currentScene이 없으면 Phaser 게임에서 직접 씬을 찾기
        if (gameInstance) {
            const metaverseScene = gameInstance.scene.getScene('MetaverseScene');
            if (metaverseScene && metaverseScene.sendChatMessage) {
                metaverseScene.sendChatMessage(message);
                setCurrentScene(metaverseScene);
                return true;
            }
        }
        
        return false;
    }, [currentScene, gameInstance]);

    // 정리 작업
    useEffect(() => {
        return () => {
            destroyGame();
        };
    }, [destroyGame]);

    return {
        gameInstance,
        currentScene,
        isGameReady,
        gameContainerRef,
        initializeGame,
        destroyGame,
        sendChatMessage
    };
}