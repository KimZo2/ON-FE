'use client'

import React from 'react'
import DefaultPageFrame from '@/components/DefaultPageFrame'
import FormLayOut from '@/components/form/FormLayOut'
import CreateRoomForm from '@/components/form/CreateRoomForm'
import BaseModal from '@/components/modal/BaseModal'

const page = () => {
  return (
   <DefaultPageFrame>
      <FormLayOut className=''>

        <BaseModal>
          <CreateRoomForm className='w-[15dvw] flex flex-col justify-between gap-3'>

        </CreateRoomForm>
        </BaseModal>
      </FormLayOut>

   </DefaultPageFrame>
  )
}

export default page