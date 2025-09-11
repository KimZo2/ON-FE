'use client'

import React from 'react'
import Header from '@/components/Header'
import FlyingStar from '@/components/background/FlyingStar'

const DefaultPageFrame = ({children}) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black bg-opacity-100">
      <Header />
      <FlyingStar />

      {children}

    </div >
  )
}

export default DefaultPageFrame