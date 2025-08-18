import { useState, useCallback,useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { backendApiInstance } from '@/apis/instance'
import { useModal } from '../useModal'

export function useJoinRoom() {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState(''); 
  const { isOpen: showCodeModal, openModal: handleOpenCodeModal, closeModal: handleCloseCodeModal } = useModal(); 

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const itemsPerPage = 6; //  페이지당 보여줄 방의 개수 (예: 3열 * 2행 = 6개)

  // 가짜 방 목록 데이터 (실제 API에서 가져올 데이터)
  const allRooms = useMemo(() => [
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
      { id: 12, name: 'Unity 게임 개발', participants: 1, maxParticipants: 5, isPrivate: false },
      { id: 13, name: '블록체인 스터디', participants: 3, maxParticipants: 7, isPrivate: true },
  ], []); 

  // 검색어에 따라 필터링된 방 목록
  const filteredRooms = useMemo(() => {
    if (!searchTerm) {
      return allRooms;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allRooms.filter(room =>
      room.name.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [allRooms, searchTerm]);

  // 필터링된 방 목록을 기반으로 현재 페이지에 보여줄 방 목록 계산
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRooms.slice(startIndex, endIndex);
  }, [currentPage, filteredRooms, itemsPerPage]);

  // 필터링된 방 목록을 기반으로 총 페이지 수 계산
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // 페이지 변경 핸들러
  const goToNextPage = () => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const goToPrevPage = () => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // 특정 페이지로 이동하는 함수 추가 (점 페이지네이션에서 유용)
  const goToPage = useCallback((pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  }, [totalPages]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // 검색어가 변경되면 첫 페이지로 리셋
  }, []);

  // 코드로 방 입장 처리 (실제 API 호출 필요)
  const handleJoinByCode = useCallback(async (code) => {
    setIsSubmitting(true);
    try {
      // TODO: 코드로 방 입장 시, API 엔드포인트로 변경
      const res = await backendApiInstance.post('/api/rooms/join-by-code', { code });

      if (res.status === 200) {
        alert('코드로 방 입장 성공!');
        router.push(`/room/${res.data.roomId}`); // 예시
      } else {
        throw new Error(`서버 응답 오류: ${res.status}`);
      }
    } catch (err) {
      console.error('코드로 방 입장 실패:', err);
      alert(`코드로 방 입장에 실패하였습니다. ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
      handleCloseCodeModal(false); // 입장 성공/실패 후 모달 닫기
    }
  }, [router]);

  // 기존 방 목록에서 방을 클릭하여 입장하는 함수
  const handleJoinExistingRoom = useCallback(async (roomId) => {
    setIsSubmitting(true);
    try {
      // TODO: 기존 방 입장 API 엔드포인트로 변경
      const res = await backendApiInstance.post(`/api/rooms/${roomId}/join`);

      if (res.status === 200) {
        alert('방 입장 성공!');
        router.push(`/room/${roomId}`);
      } else {
        throw new Error(`서버 응답 오류: ${res.status}`);
      }
    } catch (err) {
      console.error('기존 방 입장 실패:', err);
      alert(`방 입장에 실패하였습니다. ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  return {
    searchTerm, // 검색어
    handleSearchChange, // 검색어 변경 핸들러
    showCodeModal, // 코드 입력 모달 표시 여부
    handleOpenCodeModal, // 코드 입력 모달 열기
    handleCloseCodeModal, // 코드 입력 모달 닫기
    handleJoinByCode, // 코드로 방 입장
    availableRooms: paginatedRooms, // 현재 페이지의 필터링된 방 목록
    isSubmitting,
    handleJoinExistingRoom, // 기존 방 입장 함수
    currentPage,
    totalPages,
    goToNextPage,
    goToPrevPage,
    goToPage, // 특정 페이지로 이동
  };

}
