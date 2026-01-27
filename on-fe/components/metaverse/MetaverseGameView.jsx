'use client';

import ChatInterface from './ChatInterface';
import { toast } from 'react-hot-toast';

export default function MetaverseGameView({ 
    gameContainerRef, 
    onlineCount, 
    playerName, 
    messages, 
    onSendMessage,
    userId,
    roomName, // <-- 추가: 부모로부터 방 이름 받음
    onLeaveRoom = () => { window.history.back(); },
    onInviteFriend = () => { 
        try {
            //TODO: 초대 기능(코드로 방 입장 기능) 개선 필요
            toast('초대 기능은 곧 추가될 예정이에요!', {icon: '👋🏻',  duration: 1000 });
            return;

        } catch (e) {
            alert('초대 코드 복사에 실패했습니다.');
        }
    }
}) {
    return (
        <div className="relative w-full h-screen bg-gray-900">
            {/* 최상단 헤더/액션바 */}
            <div className="absolute top-0 w-full z-40">
                <div className="w-full mx-auto flex items-center justify-between p-[1rem] gap-[2rem] bg-gray-900 bg-opacity-50 text-white">
                    <div className="flex items-center gap-[1rem] px-[1rem]">
                        {/* TODO: 방 이름 표시할 경우, 적용 아니면 제거 */}
                        {/* <div className="text-2xl font-semibold">{roomName}</div> */}
                        <div className="text-xl text-gray-300">참여 중인 플레이어: {onlineCount}명</div>
                        <br/>
                        <div className="text-xl text-gray-300">플레이어: {playerName}</div>
                    </div>

                    <div className="flex items-center gap-[1rem]">
                        {/* <button
                            onClick={onInviteFriend}
                            className="px-[1rem] py-[0.5rem] rounded-xl bg-yellow-400 hover:bg-yellow-600 text-2xl text-black"
                            title="친구 초대 (링크 복사)"
                        >
                            친구 초대
                        </button> */}
                        <button
                            onClick={onInviteFriend}
                            className="relative px-[1rem] py-[0.5rem] rounded-xl 
                                    bg-yellow-400 hover:bg-yellow-500 
                                    text-2xl text-black opacity-80"
                            title="초대 기능 준비 중"
                        >
                        친구 초대
                        <span className="ml-2 text-sm text-gray-700">(준비 중)</span>
                        </button>


                        <button
                            onClick={onLeaveRoom}
                            className="px-[1rem] py-[0.5rem] rounded-xl bg-gray-300 hover:bg-gray-400/70 text-2xl text-black"
                            title="방 나가기"
                        >
                            방 나가기
                        </button>
                    </div>
                </div>
            </div>
 
             {/* Phaser 게임 컨테이너 */}
             <div
                 ref={gameContainerRef}
                 id="game-container"
                 className="w-full h-full"
                 style={{ width: '100%', height: '100%' }}
             />
 
            {/* TODO: 상단 헤더로 옮김. 추후 확정 시 수정 */}
             {/* 게임 상태 오버레이 */}
            {/* <div className="absolute top-[4.5rem] right-[1rem] bg-black bg-opacity-50 text-white p-2 rounded">
                <div className="">온라인: {onlineCount}명</div>
                <div className="text-[1.2rem] text-gray-300">플레이어: {playerName}</div>
            </div> */}
 
             {/* 채팅 인터페이스 */}
             <ChatInterface 
                 onSendMessage={onSendMessage} 
                 messages={messages}
                 currentPlayerId={userId}
             />
 
             {/* 게임 컨트롤 안내 */}
             <div className="absolute top-[8rem] right-[1rem] bg-black bg-opacity-50 text-white p-[0.7rem] rounded">
                 <div>이동: 화살표 키</div>
                 <div>채팅: 하단 입력창 사용</div>
             </div>
         </div>
     );
 }