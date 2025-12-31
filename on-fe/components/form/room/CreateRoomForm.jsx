'use client'

import { useCreateRoom } from '@/hooks/room/useCreateRoom';
import React from 'react'
import FormField from '../FormField';
import { prompt } from '@/constants/FONT';

const CreateRoomForm = ({ className, onFormSubmissionStart, onFormSubmissionComplete }) => {
    const { form, errors, isSubmitting, handleChange, handleSubmit } = useCreateRoom({
        onFormSubmissionStart,
        onFormSubmissionComplete,
    });

    return (
        <form onSubmit={handleSubmit} className={`${className}`}>
            <FormField
                className=""
                label="*방 이름"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                inputClass={`text-white ${prompt.className} !bg-black !border-gray-500 border-1`}
                labelClass={`text-white ${prompt.className}`}
            />
            <FormField
                label="*인원 수"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                required
                type="number"
                inputClass={`text-white ${prompt.className} !bg-black !border-gray-500 border-1`}
                labelClass={`text-white ${prompt.className}`}
                error={errors.maxParticipants}
            />
            <FormField
                label="*방 유지 시간 (시간)"
                name="roomTime"
                value={form.roomTime}
                onChange={handleChange}
                maxLength={8}
                type="number"
                required
                inputClass={`text-white ${prompt.className} !bg-black !border-gray-500 border-1`}
                labelClass={`text-white ${prompt.className}`}
                error={errors.roomTime}
            />

            {/* <CheckboxField
                label="비공개 방 (비공개시 비밀번호를 입력해주세요.)"
                name="isPrivate"
                checked={form.isPrivate}
                onChange={handleChange}
                labelClass={prompt.className}
            />

            {form.isPrivate && (
                <FormField
                    label="방 비밀번호"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    maxLength={4}
                    required={form.isPrivate} 
                    disabled={isSubmitting} 
                    inputClass={`text-white ${prompt.className} !bg-black !border-white border-1`}
                    labelClass={`text-white ${prompt.className}`}
                />
            )} */}

            <button 
                type="submit" 
                className="bg-gray-500 rounded-xl w-full h-[4.5rem] text-white" 
                disabled={isSubmitting}
            >
            {isSubmitting ? '생성 중' : '생성하기'}
            </button>
        </form>
    )
}

export default CreateRoomForm
