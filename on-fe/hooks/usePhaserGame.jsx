import { useCallback, useEffect, useRef } from 'react';
import StartGame from '@/phaser/game/main';

export default function usePhaserGame(userId, playerName, roomId, onGameReady, onSceneReady) {
    const gameContainerRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const isInitializingRef = useRef(false);

    const initializeGame = useCallback((containerElement) => {
        if (!containerElement || gameInstanceRef.current || isInitializingRef.current) {
            return null;
        }

        if (!userId || !playerName || !roomId) {
            console.warn('Player ID, name, and room ID are required for game initialization');
            return null;
        }

        isInitializingRef.current = true;

        try {
            const phaserGame = StartGame(containerElement);
            
            if (!phaserGame) {
                throw new Error('Phaser 게임 초기화 실패');
            }
            
            gameInstanceRef.current = phaserGame;
            
            if (onGameReady) {
                onGameReady(phaserGame);
            }
            
            // MetaverseScene에 데이터 전달하며 재시작
            const metaverseScene = phaserGame.scene.getScene('MetaverseScene');
            if (metaverseScene) {
                // 씬을 데이터와 함께 재시작
                const sceneData = {
                    userId,
                    playerName,
                    roomId
                };
                metaverseScene.scene.restart(sceneData);
                
                if (onSceneReady) {
                    onSceneReady(metaverseScene);
                }
            } else {
                // 씬이 아직 준비되지 않았다면 씬 이벤트 리스너 등록
                phaserGame.events.once('ready', () => {
                    const scene = phaserGame.scene.getScene('MetaverseScene');
                    if (scene) {
                        const sceneData = {
                            userId,
                            playerName,
                            roomId
                        };
                        scene.scene.restart(sceneData);
                        
                        if (onSceneReady) {
                            onSceneReady(scene);
                        }
                    }
                });
            }
            
            isInitializingRef.current = false;
            
            return phaserGame;
            
        } catch (error) {
            console.error('Game initialization error:', error);
            isInitializingRef.current = false;
            throw error;
        }
    }, [userId, playerName, roomId, onGameReady, onSceneReady]);

    const destroyGame = useCallback(() => {
        if (gameInstanceRef.current) {
            try {
                gameInstanceRef.current.destroy(true);
            } catch (error) {
                console.error('Game destruction error:', error);
            } finally {
                gameInstanceRef.current = null;
                isInitializingRef.current = false;
            }
        }
    }, []);

    // 자동 정리
    useEffect(() => {
        return () => {
            destroyGame();
        };
    }, [destroyGame]);

    // 컨테이너가 변경되면 게임 초기화
    useEffect(() => {
        if (gameContainerRef.current && !gameInstanceRef.current) {
            initializeGame(gameContainerRef.current);
        }
    }, [initializeGame]);

    return {
        gameContainerRef,
        gameInstance: gameInstanceRef.current,
        initializeGame,
        destroyGame,
        isInitializing: isInitializingRef.current
    };
}