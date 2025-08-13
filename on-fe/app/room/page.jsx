'use client'

import FlyingStar from '@/components/background/FlyingStar'
import Header from '@/components/Header'
import React from 'react'
import TextType from '@/components/text/TextType';
import LampOn from '@/components/image/LampOn';
import LampOff from '@/components/image/LampOff';
import StarBorderButton from '@/components/button/StarBorderButton';
import { useState } from 'react';

const page = () => {

    const [onMouse, setOnMouse] = useState([false,false]);

    const onMouseOver = (index) => {
        const newObj = [...onMouse];
        newObj[index] = true;
        setOnMouse(newObj);
    }
    const onMouseLeave = (index) => {
        const newObj = [...onMouse];
        newObj[index] = false;
        setOnMouse(newObj);
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-black bg-opacity-100">
            <Header />
            <FlyingStar />


            {/** TODO: 방 생성 / 방 입장 버튼 추가 */}
            <div className="relative max-w-[1200px] mx-auto p-12 px-6 grid gap-12 items-center justify-items-center text-center min-h-screen">
                <div className='flex flex-col gap-[5dvw]'>
                    <StudyTogether />
                    <div className='flex flex-row justify-between w-[50dvw]'>
                        <div className='flex flex-col justify-between'>
                            {onMouse[0] ? <LampOn /> : <LampOff />}
                            <div onMouseOver={() => onMouseOver(0)} onMouseLeave={() => onMouseLeave(0)}>
                                <RoomButton text={"Create Room!"} />
                            </div>
                        </div>
                        <div>
                            {onMouse[1] ? <LampOn /> : <LampOff />}
                            <div onMouseOver={() => onMouseOver(1)} onMouseLeave={() => onMouseLeave(1)}>
                                <RoomButton text={"Join Room!"} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

const RoomButton = ({ text }) => {
    return (
            <StarBorderButton
                as="button"
                className="custom-class text-xs"
                color="cyan"
                speed="5s"
            >
                <button>{text}</button>
            </StarBorderButton>
    );
}

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
    )
}

export default page