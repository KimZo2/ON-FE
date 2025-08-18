'use client'

import { useCreateRoom } from '@/hooks/CreateRoomFormHook';
import React from 'react'
import Link from 'next/link';
import FormField from './FormField';
import CheckboxField from './CheckboxField';
import { prompt } from '@/constants/FONT';

const CreateRoomForm = ({className}) => {
    const { form, isSubmitting, handleChange, handleSubmit } = useCreateRoom();

    return (
        <form onSubmit={handleSubmit} className={`${className}`}>
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
                label="*인원 수"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                required
                type="number"
                inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                labelClass={`text-white ${prompt.className}`}
            />
            <FormField
                label="*방 유지 시간 (시간)"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                maxLength={8}
                type="number"
                required
                inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                labelClass={`text-white ${prompt.className}`}
            />

            <CheckboxField
                label="비공개 방 (비공개시 비밀번호를 입력해주세요.)"
                name="visibility"
                checked={form.visibility}
                onChange={handleChange}
                labelClass={prompt.className}
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
                {isSubmitting ? '제출 중…' : '생성하기'}
            </button>
        </form>
    )
}

export default CreateRoomForm