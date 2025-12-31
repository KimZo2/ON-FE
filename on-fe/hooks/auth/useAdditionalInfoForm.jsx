import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { userService } from '@/apis/client/userService'
import toast from 'react-hot-toast'
import { validateBirthday } from '@/util/validators/birthdayValidator'

export function useAdditionalInfoForm() {
  const router = useRouter()
  const params = useSearchParams()
  const memberId   = params.get('memberId')   || ''

  const [form, setForm] = useState({
    name: '',
    nickname: '',
    birthday: '',
    agreement: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({
    birthday: '',
    agreement: '',
  })


  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    
    // 생년월일 검증
    const birthdayError = validateBirthday(form.birthday)
    if (birthdayError) {
      newErrors.birthday = birthdayError
    }
    // 약관 동의 검증
    if (!form.agreement) {
      newErrors.agreement = '약관에 동의해 주세요.'
    }
    // 오류가 있으면 제출 중단
    if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
    }
    // 오류 없으면 제출 진행
    setErrors({})
    setIsSubmitting(true)

    try {
      const payload = { memberId, ...form }
      await userService.signup(payload)

      // 성공 Toast
      toast.success('회원가입이 완료되었습니다!')
      router.push('/')

    }catch (error) {    
      // 서버 에러 Toast
      toast.error(
        error.type === 'BUSINESS'
          ? error.message
          : '일시적인 오류가 발생했습니다.'
      )
    }finally {
      setIsSubmitting(false)
    }
  }

  return { form, errors, isSubmitting, handleChange, handleSubmit }
}