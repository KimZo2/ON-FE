'use client';

import React, { useState } from 'react';
import TextType from '@/components/text/TextType';
import LampOn from '@/components/image/LampOn';
import LampOff from '@/components/image/LampOff';
import StarBorderButton from '@/components/button/StarBorderButton';
import DefaultPageFrame from '@/components/DefaultPageFrame';
import CreateRoomModal from '@/components/modal/CreateRoomModal';
import JoinRoomModal from '@/components/modal/JoinRoomModal';
import LoadingSpinner from '@/components/loading/LoadingSpinner'; 
import { useModal } from '@/hooks/useModal';
import { pressStart2P } from '@/constants/FONT';

const page = () => { 

    // 램프 마우스오버 상태
    const [onMouse, setOnMouse] = useState([false, false]);

    // 램프 마우스 이벤트 핸들러
    const handleMouseOver = (index) => { 
        const newObj = [...onMouse];
        newObj[index] = true;
        setOnMouse(newObj);
    }
    const handleMouseLeave = (index) => { 
        const newObj = [...onMouse];
        newObj[index] = false;
        setOnMouse(newObj);
    }

    // useModal 훅을 사용하여 각 모달의 상태를 관리
    const { isOpen: isCreateModalOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
    const { isOpen: isJoinModalOpen, openModal: openJoinModal, closeModal: closeJoinModal } = useModal();

    const [showLoadingSpinner, setShowLoadingSpinner] = useState(false); // 로딩 스피너 상태
    const startLoading = () => setShowLoadingSpinner(true); // 로딩 스피너 시작/중지 함수
    const stopLoading = () => setShowLoadingSpinner(false);

    return (
        <DefaultPageFrame>

            {/* 램프 모양과 버튼 부분 */}
            <div className="relative max-w-[1200px] mx-auto p-12 px-6 grid gap-12 items-center justify-items-center text-center min-h-screen">
                <div className='flex flex-col gap-[5dvw]'>
                    <StudyTogether />
                    <div className='flex flex-row justify-between w-[50dvw]'>
                        <div className='flex flex-col justify-between'>
                            {onMouse[0] ? <LampOn /> : <LampOff />}
                            <div onMouseOver={() => handleMouseOver(0)} onMouseLeave={() => handleMouseLeave(0)}>
                                <RoomButton text={"Create Room"} onClick={openCreateModal} />
                            </div>
                        </div>
                        <div className='flex flex-col justify-between'>
                            {onMouse[1] ? <LampOn /> : <LampOff />}
                            <div onMouseOver={() => handleMouseOver(1)} onMouseLeave={() => handleMouseLeave(1)}>
                                <RoomButton text={"Join Room"} onClick={openJoinModal} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 조건부 렌더링 */}
            {isCreateModalOpen && (
                <CreateRoomModal
                    onClose={closeCreateModal}
                    onStartLoading={startLoading}
                    onStopLoading={stopLoading}
                />
            )}
            {isJoinModalOpen && (
                <JoinRoomModal
                    onClose={closeJoinModal}
                    onStartLoading={startLoading}
                    onStopLoading={stopLoading}
                />
            )}

            {showLoadingSpinner && <LoadingSpinner />}
        </DefaultPageFrame>
    );
};

const RoomButton = ({ text, onClick }) => {
    return (
        <StarBorderButton
            as="button"
            className={`${pressStart2P.className} custom-class text-xs`}
            speed="5s"
            onClick={onClick}
        >
            {text}
        </StarBorderButton>
    );
};

const StudyTogether = () => {
    return (
        <TextType
            text={["다른 사람들과 함께", "공부하는 경험을", "쌓아보세요!"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className='text-3xl'
        />
    );
};

export default page;