// hooks/useAdditionalInfoForm.js
import { useState } from 'react'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'

export function useAdditionalInfoForm() {
  const router = useRouter()
  const params = useSearchParams()
  const provider   = params.get('provider')   || ''
  const providerId = params.get('providerId') || ''

  const [form, setForm] = useState({
    name: '',
    nickname: '',
    birthday: '',
    agreement: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.nickname || form.birthday.length !== 8) {
      alert('필수 항목을 올바르게 입력해 주세요.')
      return
    }
    if (!form.agreement) {
      alert('약관에 동의해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { provider, providerId, ...form }
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_SERVER_URL}/auth/signup`,
        payload
      )
      if (res.status === 200) {
        alert('회원가입 성공!')
        router.push('/')
      } else {
        throw new Error('서버 응답 오류')
      }
    } catch {
      alert('회원가입 실패, 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, handleChange, handleSubmit }
}