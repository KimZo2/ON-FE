import React from 'react'
import Image from 'next/image'

const LampOn = () => {
    return (
            <Image
                src="/assets/on_icon.svg"
                width={300}
                height={300}
                alt='on' />
    )
}

export default LampOn