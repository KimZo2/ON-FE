import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { backendApiInstance } from '@/apis/instance'
import ROUTES from '@/constants/ROUTES'

export function useCreateRoom() {
  const router = useRouter()

  const [form, setForm] = useState({
    roomName: '',
    capacity: '',
    duration: '',
    visibility: false,
    password : ''
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
    if (!form.roomName || !form.capacity || !form.duration) {
      alert('필수 항목을 올바르게 입력해 주세요.')
      return
    }

    if(form.visibility && !form.password){
      alert("비밀번호를 입력하세요.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { ...form }
      const res = await backendApiInstance.post( // TODO: axios 객체 커스텀 하기
        ROUTES.ROOM, 
        payload
      )
      if (res.status===201) {
        alert('방 생성 성공!')
        router.push(ROUTES.MAIN) // TODO: 생성한 방으로 이동하기
      } else {
        throw new Error('서버 응답 오류')
      }
    } catch {
      alert('방 생성에 실패하였습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, handleChange, handleSubmit }
}