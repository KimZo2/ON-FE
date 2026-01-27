import React from 'react'
import Image from 'next/image'

const LampOff = () => {
    return (
        <Image
            src="/assets/off_icon.svg"
            width={300}
            height={300}
            alt='off' />
    )
}

export default LampOff