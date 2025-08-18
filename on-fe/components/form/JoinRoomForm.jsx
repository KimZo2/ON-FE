'use client'

import React from 'react'
import FormField from './FormField';
import { prompt } from '@/constants/FONT';
import { useJoinRoom } from '@/hooks/JoinRoomFormHook';

const JoinRoomForm = ({className}) => {

    const { form, isSubmitting, handleChange, handleSubmit } = useJoinRoom();

    return (
        <form onSubmit={handleSubmit} className={`${className}`}>

            {/* TODO: 검색창 추가 */}

            {/* TODO: 코드로 입장하기 위한 코드 버튼 추가 */}

            {/* TODO: 현재 존재하는 방 목록 보여주는 부분 추가 */}

            <FormField
                className=""
                label="*방 이름"
                name="roomName"
                value={form.roomName}
                onChange={handleChange}
                required
                inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                labelClass={`text-white ${prompt.className}`}
            />

            <FormField
                label="방 비밀번호"
                name="password"
                value={form.password}
                onChange={handleChange}
                maxLength={4}
                required={false}
                inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                labelClass={`text-white ${prompt.className}`}
            />

            <button type="submit" className="bg-[#444] rounded-xl w-full h-[3rem] text-white" disabled={isSubmitting}>
                {isSubmitting ? '제출 중…' : '입장하기'}
            </button>
        </form>
    )
}

export default JoinRoomForm