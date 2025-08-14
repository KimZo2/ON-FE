// app/some/page.tsx (또는 해당 컴포넌트 파일)
import { Prompt, Press_Start_2P } from 'next/font/google';

export const prompt = Prompt({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  display: 'swap',
});

// 픽셀 폰트 추가
export const pressStart2P = Press_Start_2P({
  weight: '400',       
  subsets: ['latin'],
  display: 'swap',
});