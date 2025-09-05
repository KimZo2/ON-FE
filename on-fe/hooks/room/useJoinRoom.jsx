import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { backendApiInstance } from '@/apis/instance';
import { useModal } from '../useModal';

export function useJoinRoom() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const itemsPerPage = 6;
  
  const { isOpen: showCodeModal, openModal: handleOpenCodeModal, closeModal: handleCloseCodeModal } = useModal();

  // API 호출 함수: 페이지, 개수를 쿼리 파라미터로 보냄
  const fetchRooms = useCallback(async (page, size) => {
    setIsLoading(true);
    
    try {
      const res = await backendApiInstance.get(`/room?page=${page}&size=${size}`);
      
      const {
        rooms,
        totalElement,
        hasNext,
      } = res.data;

      setRooms(rooms);
      setTotalElements(totalElement);
      setHasNext(hasNext);
      
      // 총 페이지 수 계산
      setTotalPages(Math.ceil(totalElement / itemsPerPage));

    } catch (err) {
      console.error("방 목록을 가져오는 데 실패했습니다:", err);
      setRooms([]);
      setTotalElements(0);
      setHasNext(false);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  // currentPage나 searchTerm이 변경될 때마다 데이터 다시 불러오기
  useEffect(() => {
    fetchRooms(currentPage, itemsPerPage, searchTerm);
  }, [currentPage, searchTerm, fetchRooms, itemsPerPage]);

  // 다음 페이지로 이동
  const goToNextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  }, [hasNext]);

  // 이전 페이지로 이동
  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  }, [currentPage]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // 새 검색 시 첫 페이지로 리셋
  }, []);
  
  // 코드로 방 입장
  const handleJoinByCode = useCallback(async (code) => {
    setIsSubmitting(true);
    try {
      const res = await backendApiInstance.post('/api/rooms/join-by-code', { code }); // TODO: 코드 입장 API 수정 필요

      if (res.status === 200) {
        alert('코드로 방 입장 성공!');
        router.push(`/room/${res.data.roomId}`);
      } else {
        throw new Error(`서버 응답 오류: ${res.status}`);
      }
    } catch (err) {
      console.error('코드로 방 입장 실패:', err);
      alert(`코드로 방 입장에 실패하였습니다. ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
      handleCloseCodeModal();
    }
  }, [router]);

  // 기존 방 목록에서 방 입장
  const handleJoinExistingRoom = useCallback(async (roomId) => {
    setIsSubmitting(true);
    try {
      const res = await backendApiInstance.post(`/room/${roomId}`); // TODO: 방 입장 API 수정 필요

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
    searchTerm,
    handleSearchChange,
    showCodeModal,
    handleOpenCodeModal,
    handleCloseCodeModal,
    handleJoinByCode,
    availableRooms: rooms,
    isSubmitting,
    isLoading,
    handleJoinExistingRoom,
    currentPage,
    totalPages,
    totalElements,
    hasNext,
    goToNextPage,
    goToPrevPage,
  };
}