'use client'

import React from 'react'
import './spinner.css'

export default function LoadingSpinner() {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p>서버 응답을 기다리는 중입니다...</p>
    </div>
  )
}