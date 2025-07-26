'use client'
import React from 'react'
import FormField from '@/components/form/FormField'
import CheckboxField from '@/components/form/CheckboxField'
import { useAdditionalInfoForm } from '@/hooks/auth/useAdditionalInfoForm'

export default function AdditionalInfoForm() {
    const { form, isSubmitting, handleChange, handleSubmit } = useAdditionalInfoForm();

    return (
        <form onSubmit={handleSubmit} className="inputs">
            <p className="logo">ON</p>

            <FormField
                label="*이름"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
            />
            <FormField
                label="*닉네임"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                required
            />
            <FormField
                label="*생년월일 (8자리)"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                maxLength={8}
                required
            />

            <CheckboxField
                label="이용약관 · 개인정보 수집 및 이용 · 마케팅 활용 선택에 모두 동의합니다."
                name="agreement"
                checked={form.agreement}
                onChange={handleChange}
            />

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? '제출 중…' : '회원가입'}
            </button>
        </form>
    )
}