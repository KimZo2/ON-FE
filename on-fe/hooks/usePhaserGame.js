import { useCallback, useEffect, useRef } from 'react';
import StartGame from '../phaser/game/main';

export default function usePhaserGame(playerId, playerName, onGameReady, onSceneReady) {
    const gameContainerRef = useRef(null);
    const gameInstanceRef = useRef(null);
    const isInitializingRef = useRef(false);

    const initializeGame = useCallback((containerElement) => {
        if (!containerElement || gameInstanceRef.current || isInitializingRef.current) {
            return null;
        }

        if (!playerId || !playerName) {
            console.warn('Player ID and name are required for game initialization');
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
            
            // Boot 씬이 자동으로 시작되므로 별도 초기화 불필요
            isInitializingRef.current = false;
            
            return phaserGame;
            
        } catch (error) {
            console.error('Game initialization error:', error);
            isInitializingRef.current = false;
            throw error;
        }
    }, [playerId, playerName, onGameReady, onSceneReady]);

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