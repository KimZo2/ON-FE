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
            <Link href="" className="text-white text-center font-press-start text-[36px]">Create Room!</Link>

            <FormField
                className=""
                label="*방 이름"
                name="roomName"
                value={form.roomName}
                onChange={handleChange}
                required
                style={
                    {
                        titleColor:"white",
                        font : prompt.className
                    }
                }
            />
            <FormField
                label="*인원 수"
                name="nickname"
                value={form.capacity}
                onChange={handleChange}
                required
                style={
                    {
                        titleColor:"white",
                        font : prompt.className
                    }
                }
            />
            <FormField
                label="*방 유지 시간"
                name="birthday"
                value={form.duration}
                onChange={handleChange}
                maxLength={8}
                required
                style={
                    {
                        titleColor:"white",
                        font : prompt.className
                    }
                }
            />

            <CheckboxField
                label="방 공개 여부 (비공개시 비밀번호를 입력해주세요.)"
                name="visibility"
                checked={form.visibility}
                onChange={handleChange}
                style = {
                    {
                        font : prompt.className
                    }
                }
            />

            <FormField
                label="방 비밀번호"
                name="password"
                value={form.password}
                onChange={handleChange}
                maxLength={4}
                required
                style={
                    {
                        titleColor:"white",
                        font : prompt.className
                    }
                }
            />

            <button type="submit" className="bg-white" disabled={isSubmitting}>
                {isSubmitting ? '제출 중…' : '생성하기'}
            </button>
        </form>
    )
}

export default CreateRoomForm