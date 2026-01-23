'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MetaverseProvider, useMetaverseContext } from '../../contexts/MetaverseContext';
import useMetaverse from '../../hooks/useMetaverse';
import usePhaserGame from '../../hooks/usePhaserGame';
import MetaverseGameView from './MetaverseGameView';
import FlyingStar from '../background/FlyingStar';
import LoadingSpinner from '../loading/LoadingSpinner';
import AlertModal from '../modal/AlertModal';

function MetaverseContent({ userId, userNickname, roomId }) {
    const router = useRouter();
    const metaverse = useMetaverse(userId, userNickname, roomId);
    const { state, actions } = useMetaverseContext();
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

    // 방 10분 알람 토스트 표시
    useEffect(() => {
        if (state.roomNotification) {
            console.log('Room Notification:', state.roomNotification); // 디버깅용 로그, 필요시 제거
            toast.success('🔔 ' + state.roomNotification.message, {
                duration: 6000,
                position: 'top-center',
                style: {
                    fontSize: '16px',
                    padding: '20px',
                    backgroundColor: '#FF8C00',
                    color: 'white',
                    fontWeight: 'bold'
                }
            });
            
            // 토스트 표시 후 상태 초기화
            const timer = setTimeout(() => {
                actions.clearRoomNotification();
            }, 6100);
            
            return () => clearTimeout(timer);
        }
    }, [state.roomNotification, actions]);

    // 방 만료 시 AlertModal 표시
    const handleRoomExpiredConfirm = () => {
        actions.setRoomExpired(false);
        // 방 목록 페이지로 이동
        router.push('/room');
    };

    // STOMP 연결 여부에 따른 조건부 렌더링
    return (
        <>
            {!metaverse.isConnected ? (
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
            ) : (
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
            )}

            {/* 방 만료 AlertModal (최상위 레벨에 한 번만 렌더링) */}
            <AlertModal
                open={state.roomExpired}
                title="방이 만료되었습니다"
                description="학습 시간이 종료되어 방을 퇴장합니다."
                confirmText="확인"
                onConfirm={handleRoomExpiredConfirm}
            />
        </>
    );
}

export default function MetaverseContainer({ userId, userNickname, roomId }) {
    return (
        <MetaverseProvider>
            <MetaverseContent userId={userId} userNickname={userNickname} roomId={roomId} />
        </MetaverseProvider>
    );
}
