import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { backendApiInstance } from '@/apis/instance'

export function useJoinRoom() {
  const router = useRouter()

  const [form, setForm] = useState({
    roomName: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const roomName = form.roomName.trim()
    const password = form.password.trim()

    if (!roomName || !password) {
      alert('방 이름과 비밀번호를 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = { roomName, password }
      const res = await backendApiInstance.post('/room', payload) // TODO: API URI 수정하기

      if (res.status === 201) {
        alert('방 생성 성공!')
        router.push('/')  // TODO: 생성한 방(res.data.id)으로 이동하거나, 메인페이지로 이동하거나 
      } else {
        throw new Error('서버 응답 오류')
      }
    } catch (err) {
      console.error(err)
      alert('방 생성에 실패하였습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, router])

  return { form, isSubmitting, handleChange, handleSubmit }
}
