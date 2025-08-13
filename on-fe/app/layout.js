'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { pressStart2P } from "@/constants/FONT";

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
