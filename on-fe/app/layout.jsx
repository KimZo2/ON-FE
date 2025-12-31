import "./globals.css";
import { pretendard } from "@/constants/FONT";
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${pretendard.className} antialiased`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
