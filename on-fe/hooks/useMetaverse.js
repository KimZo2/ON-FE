import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useMetaverseContext } from '../contexts/MetaverseContext';
import metaverseService from '../services/metaverseService';

export default function useMetaverse(userNickName, roomId) {
    const { state, actions } = useMetaverseContext();
    const router = useRouter();
    const playerIdRef = useRef(uuidv4());
    const playerNameRef = useRef(userNickName || '');

    // 메타버스 연결
    const connect = useCallback(async (playerName) => {
        if (!playerName?.trim()) {
            actions.setError('플레이어 이름을 입력해주세요.');
            return false;
        }

        actions.connectRequest();
        playerNameRef.current = playerName.trim();

        try {
            // 메타버스 서비스 초기화
            const client = await metaverseService.initialize();
            
            if (!client) {
                throw new Error('메타버스 서비스 연결에 실패했습니다.');
            }

            // UI 콜백 등록
            metaverseService.setOnlineCountCallback((count) => {
                actions.updateOnlineCount(count);
            });

            metaverseService.setChatMessageCallback((messageData) => {
                actions.addChatMessage({
                    text: messageData.message,
                    playerName: messageData.playerName,
                    isOwn: messageData.playerId === playerIdRef.current
                });
            });

            // 에러 콜백 등록 (MetaverseError 발생 시 라우팅)
            metaverseService.setErrorCallback(({ code, message }) => {
                console.error(`에러 - 코드: ${code}, 메시지: ${message}`);
                
                // 사용자에게 에러 알림
                if (typeof window !== 'undefined') {
                    alert(`${message}\n방 목록으로 이동합니다.`);
                }
                
                // 방 나가기 후 /room으로 리다이렉트
                metaverseService.disconnect();
                router.push('/room');
            });

            // 플레이어 데이터 설정
            const playerData = {
                id: playerIdRef.current,
                name: playerNameRef.current
            };

            // 방 입장
            if (roomId) {
                await metaverseService.joinRoom(roomId, playerData);
            }

            actions.connectSuccess(playerData);
            return true;

        } catch (error) {
            const errorMessage = error.message || '메타버스 연결에 실패했습니다. 서버 상태를 확인해주세요.';
            actions.connectFailed(errorMessage);
            metaverseService.disconnect();
            return false;
        }
    }, [actions]);

    // 메타버스 연결 해제
    const disconnect = useCallback(() => {
        metaverseService.disconnect();
        actions.disconnect();
    }, [actions]);

    // 채팅 메시지 전송
    const sendChatMessage = useCallback((message) => {
        if (!message?.trim() || !state.player) return false;

        try {
            const messageData = {
                playerId: state.player.id,
                playerName: state.player.name,
                message: message.trim(),
                timestamp: new Date().toISOString()
            };

            // 현재 씬을 통해 메시지 전송
            if (state.currentScene && state.currentScene.sendChatMessage) {
                state.currentScene.sendChatMessage(message);
                return true;
            }
            
            // 게임 인스턴스를 통해 씬 찾기
            if (state.gameInstance) {
                const metaverseScene = state.gameInstance.scene.getScene('MetaverseScene');
                if (metaverseScene && metaverseScene.sendChatMessage) {
                    metaverseScene.sendChatMessage(message);
                    actions.setCurrentScene(metaverseScene);
                    return true;
                }
            }

            // 직접 서비스를 통해 전송
            metaverseService.sendChatMessage(messageData);
            return true;

        } catch (error) {
            console.error('Failed to send chat message:', error);
            return false;
        }
    }, [state.player, state.currentScene, state.gameInstance, actions]);

    // 자동 연결 (로그인된 사용자)
    useEffect(() => {
        if (userNickName && state.connectionStatus === 'disconnected') {
            connect(userNickName);
        }
    }, [userNickName, state.connectionStatus, connect]);

    // 정리 작업
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        // 상태
        connectionStatus: state.connectionStatus,
        error: state.error,
        player: state.player,
        onlineCount: state.onlineCount,
        chatMessages: state.chatMessages,
        gameInstance: state.gameInstance,
        currentScene: state.currentScene,
        isGameReady: state.isGameReady,

        // 편의 상태
        isConnected: state.connectionStatus === 'connected',
        isConnecting: state.connectionStatus === 'connecting',
        playerId: playerIdRef.current,
        playerName: playerNameRef.current,

        // 액션
        connect,
        disconnect,
        sendChatMessage,
        
        // 게임 관련 액션
        setGameInstance: actions.setGameInstance,
        setCurrentScene: actions.setCurrentScene,
        setGameReady: actions.setGameReady,
        
        // 에러 관련
        clearError: actions.clearError
    };
}