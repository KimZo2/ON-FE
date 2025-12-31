import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { roomService } from '@/apis/client/roomService'
import ROUTES from '@/constants/ROUTES'
import { getNickname } from '@/util/AuthUtil'
import { toast } from 'react-hot-toast'

export function useCreateRoom({ onFormSubmissionStart, onFormSubmissionComplete } = {}) {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    creatorNickname: getNickname(),
    maxParticipants: '',
    roomTime: '',
    // TODO: 추후 방 타입 추가 시 활성화
    // roomType: 0, 
    // TODO: 추후 비공개 방 기능 추가 시 활성화
    // isPrivate: false, 
    // password: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({
    maxParticipants: '',
    roomTime: '',
  })


  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    let nextValue;

    if (type === 'checkbox') {
      nextValue = checked;
    } else if (type === 'number') {
      nextValue = value === '' ? '' : parseInt(value);
    } else {
      nextValue = value;
    }

    setForm(prev => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    const max = form.maxParticipants
    const time = form.roomTime

    // TODO: 인원수 결정 필요
    if (max < 2 || max > 10) {
      newErrors.maxParticipants = '인원 수는 2~10명 사이여야 합니다.' 
    }

    // TODO: 시간 결정 필요
    if (time < 1 || time > 120) {
      newErrors.roomTime = '시간은 1시간~12시간 사이여야 합니다.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onFormSubmissionStart?.()
    setIsSubmitting(true)

    try {
      const payload = { ...form, isPrivate: false, password: '', roomType: 0 }
      await roomService.create(payload)

      // 성공 Toast
      toast.success('방이 생성되었습니다!')
      router.push(ROUTES.ROOM)
      onFormSubmissionComplete?.()
    } catch {
      // 실패 Toast
      toast.error('방 생성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, errors, isSubmitting, handleChange, handleSubmit }
}
