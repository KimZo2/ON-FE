'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StartGame from '../../phaser/game/main';
import socketService from '../../services/socket';
import ChatInterface from './ChatInterface';

export default function MetaverseContainer({ userNickName }) {
    const gameRef = useRef(null);
    const phaserGameRef = useRef(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [playerName, setPlayerName] = useState(userNickName || '');
    const [playerId] = useState(() => uuidv4());
    const [onlineCount, setOnlineCount] = useState(0);
    const [currentScene, setCurrentScene] = useState(null);

    useEffect(() => {
        return () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null;
            }
            socketService.disconnect();
        };
    }, []);

    const startMetaverse = useCallback(async () => {
        if (!playerName.trim()) {
            setConnectionError('플레이어 이름을 입력해주세요.');
            return;
        }

        setIsConnecting(true);
        setConnectionError('');

        try {
            // Socket 연결
            const socket = socketService.connect();

            if (!socket) {
                throw new Error('소켓 연결에 실패했습니다.');
            }

            // 연결 완료를 기다림
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('연결 시간 초과'));
                }, 10000);

                // 이미 연결된 경우 바로 resolve
                if (socket.connected) {
                    clearTimeout(timeout);
                    resolve();
                    return;
                }

                // 연결 대기
                const onConnect = () => {
                    clearTimeout(timeout);
                    socket.off('connect', onConnect);
                    socket.off('connect_error', onError);
                    resolve();
                };

                const onError = (error) => {
                    clearTimeout(timeout);
                    socket.off('connect', onConnect);
                    socket.off('connect_error', onError);
                    reject(error);
                };

                socket.on('connect', onConnect);
                socket.on('connect_error', onError);
            });

            // 온라인 카운트 업데이트 리스너
            socket.on('onlineCount', (count) => {
                setOnlineCount(count);
            });

            // Phaser 게임 시작 - DOM 렌더링 완료 후 초기화
            const initializePhaserGame = () => {
                if (gameRef.current && !phaserGameRef.current) {
                    phaserGameRef.current = StartGame(gameRef.current);
                    
                    if (!phaserGameRef.current) {
                        throw new Error('Phaser 게임 초기화 실패');
                    }
                    
                    // 게임이 준비되면 메타버스 씬으로 전환
                    setTimeout(() => {
                        try {
                            phaserGameRef.current.scene.start('MetaverseScene', {
                                socket: socket,
                                playerId: playerId,
                                playerName: playerName.trim()
                            });
                            
                            const scene = phaserGameRef.current.scene.getScene('MetaverseScene');
                            setCurrentScene(scene);
                        } catch (sceneError) {
                            console.error('씬 전환 실패:', sceneError);
                        }
                    }, 1000);
                } else {
                    // gameRef가 null이면 잠시 후 다시 시도
                    if (!gameRef.current) {
                        setTimeout(initializePhaserGame, 500);
                        return;
                    }
                }
            };

            // DOM 렌더링 완료를 기다린 후 Phaser 초기화
            setTimeout(initializePhaserGame, 100);

            setIsGameStarted(true);
            setIsConnecting(false);

        } catch (error) {
            console.error('메타버스 시작 실패:', error);
            setConnectionError('메타버스 연결에 실패했습니다. 서버 상태를 확인해주세요.');
            setIsConnecting(false);
            socketService.disconnect();
        }
    }, [playerName, isGameStarted, isConnecting]);

    useEffect(() => {
        if (userNickName) {
            setPlayerName(userNickName);
            // 로그인된 사용자는 자동으로 메타버스 입장
            if (!isGameStarted && !isConnecting) {
                startMetaverse();
            }
        }
    }, [userNickName, isGameStarted, isConnecting, startMetaverse]);

    const handleChatSend = (message) => {
        if (currentScene && currentScene.sendChatMessage) {
            currentScene.sendChatMessage(message);
        }
    };

    if (isGameStarted) {
        return (
            <div className="relative w-full h-screen bg-gray-900">
                <div
                    ref={gameRef}
                    id="game-container"
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                />

                {/* 게임 UI 오버레이 */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded">
                    <div className="text-sm">온라인: {onlineCount}명</div>
                    <div className="text-xs text-gray-300">플레이어: {playerName}</div>
                </div>

                {/* 채팅 인터페이스 */}
                <ChatInterface onSendMessage={handleChatSend} />

                {/* 게임 컨트롤 안내 */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
                    <div>이동: 화살표 키 또는 WASD</div>
                    <div>채팅: 하단 입력창 사용</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">메타버스 입장</h1>
                    <p className="text-blue-200">가상 세계에서 다른 사용자들과 만나보세요!</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="playerName" className="block text-sm font-medium text-blue-200 mb-2">
                            플레이어 이름
                        </label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="이름을 입력해주세요"
                            className="w-full px-3 py-2 bg-white bg-opacity-20 border border-blue-300 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength={20}
                            disabled={isConnecting}
                        />
                    </div>

                    {connectionError && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-3 py-2 rounded text-sm">
                            {connectionError}
                        </div>
                    )}

                    <button
                        onClick={startMetaverse}
                        disabled={isConnecting || !playerName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                        {isConnecting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                연결 중...
                            </div>
                        ) : (
                            '메타버스 입장'
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-blue-300">
                    <p>• 실시간 멀티플레이어 지원</p>
                    <p>• 채팅 및 상호작용 가능</p>
                    <p>• 가상 세계 탐험</p>
                </div>
            </div>
        </div>
    );
}