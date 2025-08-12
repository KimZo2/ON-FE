import React from 'react'

const FormLayOut = ({ children }) => {
    return (
        <div className='flex p-[5dvw] justify-center items-center min-h-screen bg-black'>
            <div className='flex p-[4dvw] flex-col items-center shrink-0 rounded-[12px] border border-white/30 bg-black shadow-lg'>
                {children}
            </div>
        </div>
    )
}

export default FormLayOut