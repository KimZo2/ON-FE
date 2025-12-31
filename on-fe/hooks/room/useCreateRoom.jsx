import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { roomService } from '@/apis/client/roomService'
import ROUTES from '@/constants/ROUTES'
import { getNickname } from '@/util/AuthUtil'

export function useCreateRoom({ onFormSubmissionStart, onFormSubmissionComplete } = {}) {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    creatorNickname: getNickname(),
    maxParticipants: '',
    roomTime: '',
    roomType: 0, // TODO: 방 타입 추가 시 수정
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, valueAsNumber, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? valueAsNumber : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.maxParticipants || !form.roomTime) {
      alert('필수 항목을 올바르게 입력해 주세요.')
      return
    }

    onFormSubmissionStart?.()
    setIsSubmitting(true)
    try {
      const payload = { ...form, isPrivate: false, password: '' }
      console.log('Creating room with payload:', payload)
      const res = await roomService.create(payload)
      // TODO: API 응답 구조에 맞게 수정 필요
      alert('방 생성 성공!')
      router.push(ROUTES.ROOM)
      onFormSubmissionComplete?.()
      // if (res.status===201) {
      //   alert('방 생성 성공!')
      //   router.push(ROUTES.ROOM)
      //   onFormSubmissionComplete?.()
      // } else {
      //   throw new Error('서버 응답 오류')
      // }
    } catch {
      alert('방 생성에 실패하였습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, handleChange, handleSubmit }
}
