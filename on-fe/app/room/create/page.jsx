'use client'

import React from 'react'
import DefaultPageFrame from '@/components/DefaultPageFrame'
import FormLayOut from '@/components/form/FormLayOut'
import CreateRoomForm from '@/components/form/CreateRoomForm'

const page = () => {
  return (
   <DefaultPageFrame>
      <FormLayOut className=''>
        <CreateRoomForm className='w-[15dvw] flex flex-col justify-between gap-3'>

        </CreateRoomForm>
      </FormLayOut>

   </DefaultPageFrame>
  )
}

export default page