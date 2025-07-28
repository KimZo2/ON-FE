'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Press_Start_2P } from 'next/font/google';

// 픽셀 폰트 추가
const pressStart2P = Press_Start_2P({
  weight: '400',       
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
