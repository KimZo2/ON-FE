/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',  // App Router
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Tailwind 기본 sans-serif 설정 덮어쓰기
        sans: ['Pretendard', 'sans-serif'],

        // 내가 쓸 custom 폰트는 따로 등록
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
};