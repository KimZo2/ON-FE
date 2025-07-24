import React from 'react'

const Form = ({ children }) => {
    return (
        <div className='flex p-[5dvw] justify-center items-center'>
            <div className='flex p-[2dvw] flex-col items-center shrink-0 bg-white rounded-[12px] border-solid border-1px shadow-xs'>
                {children}
            </div>
        </div>
    )
}

export default Form