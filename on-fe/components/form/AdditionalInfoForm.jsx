'use client'
import React from 'react'
import FormField from '@/components/form/FormField'
import CheckboxField from '@/components/form/CheckboxField'
import { useAdditionalInfoForm } from '@/hooks/auth/useAdditionalInfoForm'
import Link from 'next/link'
import { pressStart2P } from '@/constants/FONT'

export default function AdditionalInfoForm() {
    const { form, errors, isSubmitting, handleChange, handleSubmit } = useAdditionalInfoForm();

    return (
        <form onSubmit={handleSubmit} className="inputs flex flex-col gap-[2rem] w-full">
            <Link href="/" className={`${pressStart2P.className} text-white text-center text-[2.5rem]`}>ON</Link>
            <p className='text-center text-white'>회원가입을 위해 아래 정보를 입력해주세요 !</p>
            <FormField
                className=""
                label="* 이름"
                name="name"
                value={form.name}
                onChange={handleChange}
                required={true}
                labelClass="text-white"
                inputClass="!h-[4rem] !w-full"
            />
            <FormField
                label="* 닉네임"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                required={true}
                labelClass="text-white"
                inputClass="!h-[4rem] !w-full"
            />
            <FormField
                label="* 생년월일 (8자리)"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                maxLength={8}
                required={true}
                labelClass="text-white"
                inputClass="!h-[4rem] !w-full"
                placeholder="예: 19900101"
                error={errors.birthday}
            />

            <CheckboxField
                label="이용약관 · 개인정보 수집 및 이용 · 마케팅 활용 선택에 모두 동의합니다."
                name="agreement"
                checked={form.agreement}
                onChange={handleChange}
                error={errors.agreement}
            />

            <button 
                type="submit" 
                className="submit-btn w-full bg-yellow-400 text-black p-[1rem] rounded-xl disabled={isSubmitting}"
                disabled={isSubmitting}
            >
                {isSubmitting ? '제출 중' : '회원가입'}
            </button>
        </form>
    )
}