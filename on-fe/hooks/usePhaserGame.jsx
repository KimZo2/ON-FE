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
            
            /**
             * Scene은 start / restart 하지 않는다
             * BootScene에서 MetaverseScene으로 이미 진입함
             * -> 데이터만 전달
             */
            const metaverseScene = phaserGame.scene.getScene('MetaverseScene');
            if (metaverseScene && metaverseScene.scene.isActive()) {
                // 이미 준비된 경우
                metaverseScene.setPlayerData({ userId, playerName, roomId });
                onSceneReady?.(metaverseScene);
            } else {
            // 아직 준비 안 된 경우 → 이벤트 대기
            phaserGame.events.once('metaverse-scene-ready', (scene) => {
                scene.setPlayerData({ userId, playerName, roomId });
                onSceneReady?.(scene);
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