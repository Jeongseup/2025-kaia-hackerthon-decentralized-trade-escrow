import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Google Font를 next/font를 통해 최적화하여 불러옵니다.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeoSynth API - 강력하고 유연한 위치 데이터 API",
  description: "GeoSynth API로 비즈니스에 필요한 인사이트를 실시간으로 얻고, 사용자의 경험을 혁신하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* 기존 HTML의 <body> 태그에 있던 클래스들을 여기에 적용합니다.
        inter.className을 통해 Inter 폰트를 전역으로 적용합니다.
      */}
      <body className={`${inter.className} bg-white text-gray-800`}>
        {children}
      </body>
    </html>
  );
}