import "./globals.css";
import { pretendard } from "@/constants/FONT";

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
