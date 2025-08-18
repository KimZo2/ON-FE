import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { backendApiInstance } from '@/apis/instance'
import { useMemo } from 'react'

export function useJoinRoom() {
  const router = useRouter()

  const [form, setForm] = useState({
    roomName: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)


  // 페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 6; // ✨ 페이지당 보여줄 방의 개수 (예: 2열 * 2행 = 4개)

  // 가짜 방 목록 데이터 (실제 API에서 가져올 데이터)
  const allAvailableRooms = [ // 모든 방 데이터를 별도 변수로 저장
      { id: 1, name: 'JavaScript 스터디', participants: 8, maxParticipants: 15, isPrivate: false },
      { id: 2, name: 'React 프로젝트', participants: 5, maxParticipants: 10, isPrivate: false },
      { id: 3, name: '알고리즘 문제풀이', participants: 12, maxParticipants: 20, isPrivate: false },
      { id: 4, name: 'Python 기초', participants: 3, maxParticipants: 8, isPrivate: false },
      { id: 5, name: 'CS 면접 준비', participants: 7, maxParticipants: 12, isPrivate: false },
      { id: 6, name: '데이터베이스 공부', participants: 4, maxParticipants: 10, isPrivate: false },
      { id: 7, name: 'Vue.js 학습', participants: 6, maxParticipants: 10, isPrivate: false },
      { id: 8, name: 'Node.js 백엔드', participants: 9, maxParticipants: 15, isPrivate: false },
      { id: 9, name: 'TypeScript 고급', participants: 2, maxParticipants: 8, isPrivate: false },
      { id: 10, name: 'iOS 앱 개발', participants: 10, maxParticipants: 12, isPrivate: false },
      { id: 11, name: 'Android 앱 개발', participants: 8, maxParticipants: 10, isPrivate: false },
  ];
  // 현재 페이지에 보여줄 방 목록 계산
    const paginatedRooms = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allAvailableRooms.slice(startIndex, endIndex);
    }, [currentPage, allAvailableRooms, itemsPerPage]);

    // 총 페이지 수 계산
    const totalPages = Math.ceil(allAvailableRooms.length / itemsPerPage);

    // 페이지 변경 핸들러
    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };
    const goToPrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };



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
        alert('방 입장 성공!')
        router.push('/')  // TODO: 입장하려는 방(res.data.id)으로 이동
      } else {
        throw new Error('서버 응답 오류')
      }
    } catch (err) {
      console.error(err)
      alert('방 입장에 실패하였습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form, router])

  return { 
    form, 
    availableRooms: paginatedRooms, // 분리된 방 목록을 반환
    isSubmitting, 
    handleChange, 
    handleSubmit,
    // 페이지네이션 관련 반환 값 추가
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
  
  }
}
