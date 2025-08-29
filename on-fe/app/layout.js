import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { pressStart2P, pretendard } from "@/constants/FONT";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${pretendard.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
