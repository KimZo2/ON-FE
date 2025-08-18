'use client'

import React from 'react'
import FormField from './FormField';
import { prompt } from '@/constants/FONT';
import { useJoinRoom } from '@/hooks/JoinRoomFormHook';

const JoinRoomForm = ({className, onFormSubmissionStart, onFormSubmissionComplete}) => {

    const { 
        form, 
        isSubmitting, 
        handleChange, 
        handleSubmit,
        availableRooms, // 현재 존재하는 공개방 목록
        handleJoinExistingRoom, // 기존 방 목록에서 입장하는 함수


        } = useJoinRoom(onFormSubmissionStart, onFormSubmissionComplete); // 훅에 콜백 함수 전달

    // '공개방 목록'에서 방 클릭 핸들러
    const handleRoomSelect = async (roomId) => {
        onFormSubmissionStart && onFormSubmissionStart(false); // 로딩 시작 (방 입장)
        await handleJoinExistingRoom(roomId); // 기존 방 입장 로직 호출
        onFormSubmissionComplete && onFormSubmissionComplete(); // 로딩 및 모달 닫기
    };

    return (
        <form onSubmit={handleSubmit} className={`${className}`}>

            {/* TODO: 검색창 추가 */}
            <form role="search" className="flex gap-2">
                <input type="search" id="site-search" name="q" placeholder="검색하기" className="
                h-12 rounded-xl
                bg-transparent
                text-white placeholder:text-white/50
                border border-white
                px-4 outline-none
                focus:border-white focus:ring-1 focus:ring-white
                "/>
            </form>

            {/* TODO: 코드로 입장하기 위한 코드 버튼 추가 */}
            <button class="bg-transparent border border-white text-white px-4 py-2 rounded">
                code
            </button>         

            {/* TODO: 현재 존재하는 방 목록 보여주는 부분 추가 */}
            <div>
                <h3 className="text-lg font-medium mb-4 text-white">공개방 목록</h3>
                {/* availableRooms 배열이 있고 비어있지 않을 때만 목록을 보여줍니다. */}
                {availableRooms && availableRooms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2"> {/* 스크롤바를 위한 pr-2 */}
                        {availableRooms.map(room => (
                            <div
                                key={room.id}
                                onClick={() => !isSubmitting && handleRoomSelect(room.id)} // 제출 중에는 클릭 비활성화
                                className={`bg-white text-gray-900 p-4 rounded-lg cursor-pointer transition-colors 
                                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                            >
                                <h4 className="font-medium text-sm mb-1">{room.name}</h4>
                                <p className="text-xs text-gray-600">
                                    {room.participants}/{room.maxParticipants}명 참여중
                                </p>
                                {/* 비공개방이라면 자물쇠 아이콘 등을 추가할 수 있습니다. */}
                                {room.isPrivate && <span className="text-xs text-gray-500 float-right">🔒</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    // 공개방이 없을 때 표시될 메시지
                    <p className="text-gray-400 text-sm text-center">현재 참여 가능한 공개방이 없습니다.</p>
                )}
            </div>

            {/* <FormField
                className=""
                label="*방 이름"
                name="roomName"
                value={form.roomName}
                onChange={handleChange}
                required
                inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                labelClass={`text-white ${prompt.className}`}
            /> */}

            {/* <FormField
                label="방 비밀번호"
                name="password"
                value={form.password}
                onChange={handleChange}
                maxLength={4}
                required={false}
                inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                labelClass={`text-white ${prompt.className}`}
            /> */}

            <button type="submit" className="bg-[#444] rounded-xl w-full h-[3rem] text-white" disabled={isSubmitting}>
                {isSubmitting ? '제출 중…' : '입장하기'}
            </button>
        </form>
    )
}

export default JoinRoomForm