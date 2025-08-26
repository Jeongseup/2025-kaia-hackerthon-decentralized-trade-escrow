import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css"; // RainbowKit CSS 추가
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner"; // Toaster import

// Google Font를 next/font를 통해 최적화하여 불러옵니다.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trustless Trade",
  description: "Pay Trustless, Trade Real, 믿지 않아도 안전한 거래",
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
        <Providers>{children}</Providers>
        <Toaster
            richColors
            toastOptions={{
              classNames: {
                toast: 'border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900',
                title: 'text-neutral-950 dark:text-neutral-50',
                description: 'text-neutral-500 dark:text-neutral-400',
              },
            }}
          />
      </body>
    </html>
  );
}