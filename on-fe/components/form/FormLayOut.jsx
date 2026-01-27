import React from 'react'

const FormLayOut = ({ children, className }) => {
    return (
        <div className={`flex p-[5dvw] justify-center items-center min-h-screen bg-black ${className}`}>
            <div className='flex p-[4dvw] flex-col items-center shrink-0 rounded-[12px] border border-white/30 bg-black shadow-lg'>
                {children}
            </div>
        </div>
    )
}

export default FormLayOut