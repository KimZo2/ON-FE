'use client'

import React from 'react'
import './spinner.css'

export default function LoadingSpinner({message="서버의 응답을 기다리는 중입니다..", color="black"}) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p className={`text-${color}`}>{message}</p>
    </div>
  )
}