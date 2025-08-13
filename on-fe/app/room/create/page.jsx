'use client'

import React from 'react'
import Header from '@/components/Header'
import FlyingStar from '@/components/background/FlyingStar'
import DefaultPageFrame from '@/components/DefaultPageFrame'
import FormLayOut from '@/components/form/FormLayOut'
import CreateRoomForm from '@/components/form/CreateRoomForm'

const page = () => {
  return (
   <DefaultPageFrame>
      <FormLayOut className=''>
        <CreateRoomForm className='w-[20dvw] flex flex-col justify-between align-center gap-3'>

        </CreateRoomForm>
      </FormLayOut>

   </DefaultPageFrame>
  )
}

export default page