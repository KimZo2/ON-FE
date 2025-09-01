import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { backendApiInstance } from '@/apis/instance'
import ROUTES from '@/constants/ROUTES'
import { getNickName } from '@/util/AuthUtil'

export function useCreateRoom() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    creatorNickname: getNickName(),
    maxParticipants: '',
    isPrivate: false,
    password : '',
    roomTime: '',

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
    if (!form.name || !form.maxParticipants || !form.roomTime) {
      console.log(form.name);
      console.log(form.maxParticipants);
      console.log(form.roomTime);
      
      alert('필수 항목을 올바르게 입력해 주세요.')
      return
    }

    if(form.isPrivate && !form.password){
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