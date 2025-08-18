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
        currentPage,
        totalPages,
        goToNextPage,
        goToPrevPage,


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
                {availableRooms && availableRooms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 pb-4"> {/* 하단 패딩 추가 */}
                        {availableRooms.map(room => (
                            <div
                                key={room.id}
                                onClick={() => !isSubmitting && handleRoomSelect(room.id)}
                                className={`bg-white text-gray-900 p-4 rounded-lg cursor-pointer transition-colors
                                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                            >
                                <h4 className="font-medium text-sm mb-1">{room.name}</h4>
                                <p className="text-xs text-gray-600">
                                    {room.participants}/{room.maxParticipants}명 참여중
                                </p>
                                {room.isPrivate && <span className="text-xs text-gray-500 float-right">🔒</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm text-center">현재 참여 가능한 공개방이 없습니다.</p>
                )}

                {/* 페이지네이션 UI 추가 */}
                {totalPages > 1 && ( // 총 페이지가 1보다 클 때만 페이지네이션 표시
                    <div className="flex justify-center items-center space-x-4 mt-4">
                        <button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1 || isSubmitting}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            이전
                        </button>
                        <span className="text-white text-sm">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || isSubmitting}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            다음
                        </button>
                    </div>
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

            {/* <button type="submit" className="bg-[#444] rounded-xl w-full h-[3rem] text-white" disabled={isSubmitting}>
                {isSubmitting ? '제출 중…' : '입장하기'}
            </button> */}
        </form>
    )
}

export default JoinRoomForm