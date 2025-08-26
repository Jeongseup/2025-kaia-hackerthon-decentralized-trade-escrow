// FILE: app/demo/page.tsx (전면 수정)
// 설명: Web3 데모를 위한 기본 레이아웃을 설정하고, 클라이언트 컴포넌트를 불러옵니다.
// 서버 컴포넌트로 유지하여 초기 로딩 성능을 확보합니다.
import { Header } from "@/components/header";
import { DemoClient } from "@/components/demo-client";

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className="bg-gradient-to-br from-primary-purple to-secondary-purple min-h-screen">
        <div className="container py-8 md:py-12">
          <div className="text-center mb-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold">Trustless Trade 인터랙티브 데모</h1>
            <p className="text-purple-200 mt-2">
              두 개의 브라우저 창을 열어 한쪽은 구매자, 다른 한쪽은 판매자로 시작해보세요!
            </p>
          </div>
          <DemoClient />
        </div>
      </main>
    </>
  );
}

