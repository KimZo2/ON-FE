'use client'

import React from 'react'
import DefaultPageFrame from '@/components/DefaultPageFrame'
import FormLayOut from '@/components/form/FormLayOut'
import JoinRoomForm from '@/components/form/room/JoinRoomForm'

const page = () => {
  return (
    <DefaultPageFrame>
      <FormLayOut className=''>
        <JoinRoomForm className='w-[15dvw] flex flex-col justify-between gap-3'>
        </JoinRoomForm>

      </FormLayOut>
    </DefaultPageFrame>
  )
}

export default page