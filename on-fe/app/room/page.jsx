'use client'

import React from 'react'
import TextType from '@/components/text/TextType';
import LampOn from '@/components/image/LampOn';
import LampOff from '@/components/image/LampOff';
import StarBorderButton from '@/components/button/StarBorderButton';
import { useState } from 'react';
import Link from 'next/link';
import DefaultPageFrame from '@/components/DefaultPageFrame';


const page = () => {

    const [onMouse, setOnMouse] = useState([false, false]);

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
        <DefaultPageFrame>
            <div className="relative max-w-[1200px] mx-auto p-12 px-6 grid gap-12 items-center justify-items-center text-center min-h-screen">
                <div className='flex flex-col gap-[5dvw]'>
                    <StudyTogether />
                    <div className='flex flex-row justify-between w-[50dvw]'>
                        <div className='flex flex-col justify-between'>
                            {onMouse[0] ? <LampOn /> : <LampOff />}
                            <div onMouseOver={() => onMouseOver(0)} onMouseLeave={() => onMouseLeave(0)}>
                                <Link href="/room/create">
                                    <RoomButton text={"Create Room!"} />
                                </Link>
                            </div>
                        </div>
                         <div className='flex flex-col justify-between'>
                            {onMouse[1] ? <LampOn /> : <LampOff />}
                            <div onMouseOver={() => onMouseOver(1)} onMouseLeave={() => onMouseLeave(1)}>
                                <Link href="/room/join">
                                    <RoomButton text={"Join Room!"} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultPageFrame>
    )
}

const RoomButton = ({ text }) => {
    return (
        <StarBorderButton
            as="button"
            className="custom-class text-xs"
            speed="5s"
        >
            {text}
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