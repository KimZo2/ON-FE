import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { userService } from '@/apis/client/userService'

export function useAdditionalInfoForm() {
  const router = useRouter()
  const params = useSearchParams()
  const memberId   = params.get('memberId')   || ''

  const [form, setForm] = useState({
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
    if (!form.nickname || form.birthday.length !== 8) {
      alert('필수 항목을 올바르게 입력해 주세요.')
      return
    }
    if (!form.agreement) {
      alert('약관에 동의해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { memberId, ...form }
      await userService.signup(payload)
      
      alert('회원가입 성공!')
      router.push('/')

    }catch (error) {    
      if (error.type === "BUSINESS") {
        alert(error.message);
      } else {
        alert("일시적인 오류가 발생했습니다.");
      }
    }finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, handleChange, handleSubmit }
}