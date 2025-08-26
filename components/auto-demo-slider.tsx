// ==================================================================
// FILE: components/auto-demo-slider.tsx (신규 생성)
// 설명: 1초마다 자동으로 다음 단계로 넘어가는 인터랙티브 데모 슬라이더입니다.
// useEffect와 setInterval을 사용하여 자동 재생 기능을 구현했습니다.
// ==================================================================
"use client";

import { useState, useEffect } from 'react';
import { PhoneMockup } from '@/components/phone-mockup';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// 거래 단계별 컴포넌트 정의
const steps = [
  {
    buyer: () => <InitialView role="구매자" />,
    seller: () => <InitialView role="판매자" />,
    description: "판매자가 DTE 서비스를 통해 새로운 거래를 생성하고, 거래 정보를 입력합니다."
  },
  {
    buyer: () => <TradeStatus status="대기 중" message="판매자가 거래를 생성하고 있습니다." />,
    seller: () => <CreateTradeForm />,
    description: "판매자가 생성한 거래 링크를 받은 구매자가 내용을 확인하고, 대금을 스마트 컨트랙트에 예치합니다."
  },
  {
    buyer: () => <DepositScreen />,
    seller: () => <TradeStatus status="입금 대기 중" message="구매자가 거래 대금을 에스크로에 입금하고 있습니다." />,
    description: "판매자는 입금 내역을 확인하고 상품을 발송한 뒤, 송장 번호를 DTE에 입력합니다."
  },
  {
    buyer: () => <TradeStatus status="배송 준비 중" message="판매자가 상품을 준비하고 송장 번호를 입력할 예정입니다." />,
    seller: () => <EnterTrackingNumber />,
    description: "DTE 오라클이 입력된 송장 번호를 통해 실제 배송 상태를 주기적으로 확인합니다."
  },
  {
    buyer: () => <TradeStatus status="배송 중" message="상품이 배송되고 있습니다. DTE가 배송 상태를 추적합니다." />,
    seller: () => <TradeStatus status="배송 중" message="송장 번호가 확인되었습니다. 배송이 완료되면 자동 정산됩니다." />,
    description: "배송이 완료되고 구매자의 이의 제기가 없으면, 스마트 컨트랙트가 판매자에게 대금을 자동으로 정산합니다."
  },
  {
    buyer: () => <TradeCompleteView role="구매자" />,
    seller: () => <TradeCompleteView role="판매자" />,
    description: "모든 거래가 안전하게 종료되었습니다."
  }
];

// 각 단계별 화면 컴포넌트들 (기존 데모 페이지에서 가져옴)
const InitialView = ({ role }: { role: string }) => (
    <div className="p-6 text-center">
        <h2 className="font-bold text-lg mb-2">{role} 화면</h2>
        <p className="text-sm text-gray-500">DTE 데모 화면입니다.</p>
        <div className="mt-8">
            <div className="bg-gray-200 h-32 rounded-lg"></div>
            <div className="bg-gray-200 h-8 mt-4 rounded-lg"></div>
        </div>
    </div>
);
const CreateTradeForm = () => (
    <div className="p-4">
        <h2 className="font-bold text-lg mb-4 text-center">새 거래 생성</h2>
        <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600">상품명</label><input type="text" value="빈티지 카메라" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" /></div>
            <div><label className="text-xs font-medium text-gray-600">판매 금액</label><input type="text" value="250,000 KRW" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" /></div>
            <Button className="w-full bg-primary-purple hover:bg-primary-purple/90 mt-4">거래 링크 생성</Button>
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
        <p className="text-xs text-center my-3 text-gray-500">안전한 거래를 위해 대금이 에스크로에 보관됩니다.</p>
        <Button className="w-full bg-kaia-yellow text-black hover:bg-kaia-yellow/90">카카오페이로 결제</Button>
    </div>
);
const EnterTrackingNumber = () => (
    <div className="p-4">
        <h2 className="font-bold text-lg mb-4 text-center">송장 번호 입력</h2>
        <div className="space-y-3">
            <div><label className="text-xs font-medium text-gray-600">택배사</label><input type="text" value="우체국택배" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" /></div>
            <div><label className="text-xs font-medium text-gray-600">송장 번호</label><input type="text" value="6896724158888" readOnly className="w-full p-2 border rounded-md bg-gray-100 text-sm" /></div>
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
        <p className="text-sm text-gray-500">{role === '구매자' ? '안전하게 구매 완료!' : '대금 정산 완료!'}</p>
    </div>
);

export const AutoDemoSlider = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // 3초(3000ms)마다 currentStep을 1씩 증가시키는 인터벌 설정
        const interval = setInterval(() => {
            setCurrentStep(prevStep => (prevStep + 1) % steps.length);
        }, 3000);

        // 컴포넌트가 언마운트될 때 인터벌을 정리하여 메모리 누수 방지
        return () => clearInterval(interval);
    }, []);

    const BuyerComponent = steps[currentStep].buyer;
    const SellerComponent = steps[currentStep].seller;

    return (
        <section className="bg-gradient-to-br from-primary-purple to-secondary-purple py-16 md:py-20 lg:py-24">
            <div className="container">
                <div className="text-center mb-8 md:mb-12 text-white">
                    <h2 className="text-3xl md:text-4xl font-bold">한눈에 보는 DTE 거래 과정</h2>
                    <p className="text-purple-200 mt-2">구매자와 판매자의 화면이 어떻게 변화하는지 확인해보세요.</p>
                </div>

                <div className="flex flex-col lg:flex-row justify-center items-center gap-8 md:gap-12">
                    <div className="w-full max-w-sm mx-auto lg:mx-0">
                        <PhoneMockup><BuyerComponent /></PhoneMockup>
                    </div>
                    <div className="w-full max-w-sm mx-auto lg:mx-0">
                        <PhoneMockup><SellerComponent /></PhoneMockup>
                    </div>
                </div>
                
                <div className="mt-8 max-w-2xl mx-auto text-center">
                    <p className="text-white font-medium min-h-[48px]">{steps[currentStep].description}</p>
                    {/* 진행 상태를 보여주는 인디케이터 */}
                    <div className="flex justify-center gap-2 mt-4">
                        {steps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStep(index)}
                                className={cn(
                                    "h-2 w-2 rounded-full transition-all",
                                    currentStep === index ? "bg-white w-6" : "bg-white/50"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

