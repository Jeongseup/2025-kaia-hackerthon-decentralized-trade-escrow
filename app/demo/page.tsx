// FILE: app/demo/page.tsx (수정)
// 설명: 배경을 보라색 그라데이션으로 변경하고, 텍스트 색상을 조정하여 가독성을 확보했습니다.
"use client";

import { useState } from 'react';
import { PhoneMockup } from '@/components/phone-mockup';
import { Button } from '@/components/ui/button';
import { ArrowRight, RotateCw, CheckCircle } from 'lucide-react';
import { Header } from '@/components/header';

// 거래 단계별 컴포넌트 정의 (실제 구현 시 별도 파일로 분리 권장)
const steps = [
  // Step 0: 초기 화면
  {
    buyer: () => <InitialView role="구매자" />,
    seller: () => <InitialView role="판매자" />,
    description: "데모를 시작하려면 '다음 단계' 버튼을 클릭하세요. 구매자와 판매자의 화면이 각 단계에 맞게 변경됩니다."
  },
  // Step 1: 판매자, 거래 생성
  {
    buyer: () => <TradeStatus status="대기 중" message="판매자가 거래를 생성하고 있습니다." />,
    seller: () => <CreateTradeForm />,
    description: "판매자가 DTE 서비스를 통해 새로운 거래를 생성하고, 거래 정보를 입력합니다."
  },
  // Step 2: 구매자, 대금 입금
  {
    buyer: () => <DepositScreen />,
    seller: () => <TradeStatus status="입금 대기 중" message="구매자가 거래 대금을 에스크로에 입금하고 있습니다." />,
    description: "판매자가 생성한 거래 링크를 받은 구매자가 내용을 확인하고, 카카오페이를 통해 대금을 스테이블코인으로 변환하여 스마트 컨트랙트에 예치합니다."
  },
  // Step 3: 판매자, 송장 입력
  {
    buyer: () => <TradeStatus status="배송 준비 중" message="판매자가 상품을 준비하고 송장 번호를 입력할 예정입니다." />,
    seller: () => <EnterTrackingNumber />,
    description: "판매자는 입금 내역을 확인하고 상품을 발송한 뒤, 송장 번호를 DTE에 입력합니다."
  },
  // Step 4: 배송 중 (오라클 확인)
  {
    buyer: () => <TradeStatus status="배송 중" message="상품이 배송되고 있습니다. DTE가 배송 상태를 추적합니다." />,
    seller: () => <TradeStatus status="배송 중" message="송장 번호가 확인되었습니다. 배송이 완료되면 자동 정산됩니다." />,
    description: "DTE 오라클이 입력된 송장 번호를 통해 실제 배송 상태를 주기적으로 확인합니다. 이 과정은 자동으로 진행됩니다."
  },
  // Step 5: 배송 완료 및 정산
  {
    buyer: () => <TradeCompleteView role="구매자" />,
    seller: () => <TradeCompleteView role="판매자" />,
    description: "배송이 완료되고 구매자의 이의 제기가 없으면, 스마트 컨트랙트가 판매자에게 대금을 자동으로 정산합니다. 모든 거래가 안전하게 종료되었습니다."
  }
];

// 각 단계별 화면 컴포넌트들
const InitialView = ({ role }: { role: string }) => (
  <div className="p-6 text-center">
    <h2 className="font-bold text-lg mb-2">{role} 화면</h2>
    <p className="text-sm text-gray-500">DTE(Decentralized Trade Escrow) 데모에 오신 것을 환영합니다.</p>
    <div className="mt-8">
      <div className="bg-gray-200 h-32 rounded-lg animate-pulse"></div>
      <div className="bg-gray-200 h-8 mt-4 rounded-lg animate-pulse"></div>
    </div>
  </div>
);

const CreateTradeForm = () => (
    <div className="p-4">
        <h2 className="font-bold text-lg mb-4 text-center">새 거래 생성</h2>
        <div className="space-y-3">
            <div>
                <label className="text-xs font-medium text-gray-600">상품명</label>
                <input type="text" value="빈티지 카메라" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-600">판매 금액</label>
                <input type="text" value="250,000 KRW" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-600">구매자</label>
                <input type="text" value="김카카오" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" />
            </div>
            <Button className="w-full bg-primary-purple hover:bg-primary-purple/90 mt-4">거래 생성하기</Button>
        </div>
    </div>
);

const DepositScreen = () => (
    <div className="p-4">
        <h2 className="font-bold text-lg mb-2 text-center">거래 정보 확인</h2>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">상품명</span><strong>빈티지 카메라</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">판매자</span><strong>김라인</strong></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="text-gray-500">결제 금액</span><strong className="text-primary-purple">250,000 KRW</strong></div>
        </div>
        <p className="text-xs text-center my-3 text-gray-500">안전한 거래를 위해 DTE 에스크로에 대금이 보관됩니다.</p>
        <Button className="w-full bg-kaia-yellow text-black hover:bg-kaia-yellow/90">카카오페이로 결제</Button>
    </div>
);

const EnterTrackingNumber = () => (
    <div className="p-4">
        <h2 className="font-bold text-lg mb-4 text-center">송장 번호 입력</h2>
        <div className="space-y-3">
            <div>
                <label className="text-xs font-medium text-gray-600">택배사</label>
                <input type="text" value="우체국택배" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-600">송장 번호</label>
                <input type="text" value="6896724158888" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" />
            </div>
            <Button className="w-full bg-primary-purple hover:bg-primary-purple/90 mt-4">송장 번호 제출</Button>
        </div>
    </div>
);

const TradeStatus = ({ status, message }: { status: string; message: string }) => (
    <div className="p-6 text-center flex flex-col justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mb-4"></div>
        <h2 className="font-bold text-lg mb-2">{status}</h2>
        <p className="text-sm text-gray-500">{message}</p>
    </div>
);

const TradeCompleteView = ({ role }: { role: string }) => (
    <div className="p-6 text-center flex flex-col justify-center items-center h-full">
        <CheckCircle className="h-16 w-16 text-trust-green mb-4" />
        <h2 className="font-bold text-lg mb-2">거래 완료</h2>
        <p className="text-sm text-gray-500">
            {role === '구매자' ? '상품 구매가 안전하게 완료되었습니다.' : '판매 대금이 지갑으로 정산되었습니다.'}
        </p>
    </div>
);

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const BuyerComponent = steps[currentStep].buyer;
  const SellerComponent = steps[currentStep].seller;

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-primary-purple to-secondary-purple min-h-screen">
        <div className="container py-8 md:py-12">
          <div className="text-center mb-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold">DTE 인터랙티브 데모</h1>
            <p className="text-purple-200 mt-2">구매자와 판매자의 입장에서 DTE의 안전한 거래 과정을 직접 확인해보세요.</p>
          </div>

          <div className="flex flex-col lg:flex-row justify-center items-start gap-8 md:gap-12">
            {/* Buyer's Phone */}
            <div className="w-full max-w-sm mx-auto lg:mx-0">
              <h2 className="text-center font-bold text-xl mb-4 text-white">구매자 (김카카오)</h2>
              <PhoneMockup>
                <BuyerComponent />
              </PhoneMockup>
            </div>

            {/* Seller's Phone */}
            <div className="w-full max-w-sm mx-auto lg:mx-0">
              <h2 className="text-center font-bold text-xl mb-4 text-white">판매자 (김라인)</h2>
              <PhoneMockup>
                <SellerComponent />
              </PhoneMockup>
            </div>
          </div>

          <div className="mt-8 md:mt-12 max-w-3xl mx-auto text-center">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg text-primary-purple">STEP {currentStep}: 진행 상황</h3>
                <p className="text-gray-700 mt-2">{steps[currentStep].description}</p>
            </div>
            <div className="mt-6 flex justify-center items-center gap-4">
              <Button onClick={handleReset} variant="outline" size="lg" className="bg-white/20 text-white border-white hover:bg-white/30">
                <RotateCw className="mr-2 h-4 w-4" /> 처음으로
              </Button>
              <Button onClick={handleNextStep} size="lg" className="bg-kaia-yellow text-gray-900 hover:bg-kaia-yellow/90">
                다음 단계 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
