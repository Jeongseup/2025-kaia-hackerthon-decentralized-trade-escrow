// ==================================================================
// FILE: components/demo-client.tsx (신규 생성)
// 설명: 데모의 모든 상태 관리와 UI 렌더링을 담당하는 핵심 클라이언트 컴포넌트입니다.
// useTradeState 훅을 사용하여 브라우저 간 상태를 동기화합니다.
// ==================================================================
"use client";

import { useState } from 'react';
import { PhoneMockup } from '@/components/phone-mockup';
import { Button } from '@/components/ui/button';
import { useTradeState, TradeStatus, Trade } from '@/hooks/use-trade-state';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, CheckCircle, Hourglass, Truck, PackageCheck, Banknote } from 'lucide-react';

// 각 역할과 거래 상태에 맞는 UI를 렌더링하는 컴포넌트
const TradeScreen = ({ role, trade, setTrade }: { role: 'buyer' | 'seller', trade: Trade | null, setTrade: (trade: Trade | null) => void }) => {
    if (!trade) {
        if (role === 'buyer') {
            return <BuyerStartView setTrade={setTrade} />;
        }
        return <SellerWaitView />;
    }

    switch (trade.status) {
        case TradeStatus.Created:
            return role === 'buyer' ? <DepositView trade={trade} setTrade={setTrade} /> : <SellerWaitView message="구매자의 입금을 기다리고 있습니다." />;
        case TradeStatus.Deposited:
            return role === 'seller' ? <SubmitTrackingView trade={trade} setTrade={setTrade} /> : <WaitView status="배송 준비 중" message="판매자가 상품을 발송하고 송장 번호를 입력할 예정입니다." />;
        case TradeStatus.Shipping:
             return <WaitView status="배송 중" message="오라클이 배송 상태를 추적하고 있습니다." />;
        case TradeStatus.Delivered:
            return role === 'buyer' ? <ConfirmDeliveryView trade={trade} setTrade={setTrade} /> : <WaitView status="수령 확인 대기" message="구매자의 상품 수령 확인을 기다리고 있습니다." />;
        case TradeStatus.Completed:
            return role === 'seller' ? <WithdrawView trade={trade} setTrade={setTrade} /> : <WaitView status="정산 대기 중" message="판매자가 에스크로 대금을 인출할 예정입니다." />;
        case TradeStatus.Withdrawn:
            return <TradeCompleteView />;
        default:
            return <SellerWaitView />;
    }
};

export const DemoClient = () => {
const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
  const { trade, setTrade, clearTrade } = useTradeState();
  const { isConnected, address } = useAccount();

  // 지갑이 연결되지 않았을 때의 UI
  const ConnectWalletView = () => (
    <div className="flex flex-col items-center gap-4 text-white">
        <p>데모를 시작하려면 지갑을 연결해주세요.</p>
        <ConnectButton />
    </div>
  );

  // 지갑 연결 후 역할 선택 UI
  const RoleSelectionView = () => (
    <div className="flex flex-col items-center gap-8 text-white">
        <div className='text-center'>
            <p className="font-bold">지갑 연결 완료!</p>
            <p className="text-sm text-purple-200 truncate max-w-xs">{address}</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Button size="lg" onClick={() => setRole('buyer')} className="bg-white text-primary-purple hover:bg-white/90">구매자로 시작</Button>
            <Button size="lg" onClick={() => setRole('seller')} className="bg-white text-secondary-purple hover:bg-white/90">판매자로 시작</Button>
        </div>
    </div>
  );


  // 역할 선택 후 실제 데모 UI
  const DemoView = () => (
     <div>
      <div className="w-full max-w-sm mx-auto">
        <h2 className="text-center font-bold text-xl mb-4 text-white">{role === 'buyer' ? '구매자 (김카카오)' : '판매자 (김라인)'}</h2>
        <PhoneMockup>
          <TradeScreen role={role!} trade={trade} setTrade={setTrade} />
        </PhoneMockup>
      </div>
      <div className="text-center mt-6">
        <Button onClick={() => { clearTrade(); setRole(null); }} variant="ghost" className="text-white/70 hover:text-white">데모 초기화</Button>
      </div>
    </div>
  );
  
  if (!isConnected) {
    return <ConnectWalletView />;
  }

  if (!role) {
    return <RoleSelectionView />;
  }

  return <DemoView />;
};

// --- 단계별 UI 컴포넌트 ---

const BuyerStartView = ({ setTrade }: { setTrade: (trade: Trade | null) => void }) => {
    const handleCreate = () => {
        setTrade({
            id: 1,
            status: TradeStatus.Created,
            amount: 250000,
            seller: '0xSellerAddr',
            buyer: '0xBuyerAddr',
        });
    };
    return (
        <div className="p-4 text-center flex flex-col justify-center h-full">
            <h2 className="font-bold text-lg mb-4">거래 시작하기</h2>
            <p className="text-sm text-gray-500 mb-6">&apos;
                빈티지 카메라&apos;를 250,000 KRW에 구매합니다.</p>
            <Button onClick={handleCreate} className="w-full bg-primary-purple hover:bg-primary-purple/90"><Wallet className="mr-2 h-4 w-4" /> 거래 생성</Button>
        </div>
    );
};

const SellerWaitView = ({ message = "구매자가 거래를 생성하기를 기다리고 있습니다." }: { message?: string }) => (
    <div className="p-6 text-center flex flex-col justify-center items-center h-full">
        <Hourglass className="h-12 w-12 text-gray-400 mb-4 animate-pulse" />
        <h2 className="font-bold text-lg mb-2">대기 중</h2>
        <p className="text-sm text-gray-500">{message}</p>
    </div>
);

const DepositView = ({ trade, setTrade }: { trade: Trade, setTrade: (trade: Trade | null) => void }) => {
    const handleDeposit = () => setTrade({ ...trade, status: TradeStatus.Deposited });
    return (
        <div className="p-4">
            <h2 className="font-bold text-lg mb-2 text-center">대금 입금</h2>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500">결제 금액</span><strong className="text-primary-purple">{trade.amount.toLocaleString()} KRW</strong></div>
            </div>
            <Button onClick={handleDeposit} className="w-full bg-kaia-yellow text-black hover:bg-kaia-yellow/90">카카오페이로 입금</Button>
        </div>
    );
};

const SubmitTrackingView = ({ trade, setTrade }: { trade: Trade, setTrade: (trade: Trade | null) => void }) => {
    const handleSubmit = () => {
        // 오라클 콜백 시뮬레이션
        setTrade({ ...trade, status: TradeStatus.Shipping });
        setTimeout(() => {
            setTrade({ ...trade, status: TradeStatus.Delivered });
        }, 2000); // 2초 후 배송완료로 변경
    };
    return (
        <div className="p-4">
            <h2 className="font-bold text-lg mb-4 text-center">송장 번호 입력</h2>
            <p className="text-sm text-center text-gray-500 mb-4">구매자의 입금이 확인되었습니다. 상품을 발송하고 송장번호를 입력하세요.</p>
            <Button onClick={handleSubmit} className="w-full bg-primary-purple hover:bg-primary-purple/90"><Truck className="mr-2 h-4 w-4" /> 송장 제출 (시뮬레이션)</Button>
        </div>
    );
};

const ConfirmDeliveryView = ({ trade, setTrade }: { trade: Trade, setTrade: (trade: Trade | null) => void }) => {
    const handleConfirm = () => setTrade({ ...trade, status: TradeStatus.Completed });
    return (
        <div className="p-4 text-center flex flex-col justify-center h-full">
            <PackageCheck className="h-12 w-12 text-trust-green mb-4" />
            <h2 className="font-bold text-lg mb-4">배송 완료</h2>
            <p className="text-sm text-gray-500 mb-6">상품을 잘 받으셨나요? 수령 확인을 눌러 거래를 완료하세요.</p>
            <Button onClick={handleConfirm} className="w-full bg-trust-green hover:bg-trust-green/90">수령 확인</Button>
        </div>
    );
};

const WithdrawView = ({ trade, setTrade }: { trade: Trade, setTrade: (trade: Trade | null) => void }) => {
    const handleWithdraw = () => setTrade({ ...trade, status: TradeStatus.Withdrawn });
    return (
        <div className="p-4 text-center flex flex-col justify-center h-full">
            <Banknote className="h-12 w-12 text-primary-purple mb-4" />
            <h2 className="font-bold text-lg mb-4">정산 가능</h2>
            <p className="text-sm text-gray-500 mb-6">구매자가 수령을 확인했습니다. 판매 대금을 인출하세요.</p>
            <Button onClick={handleWithdraw} className="w-full bg-primary-purple hover:bg-primary-purple/90">대금 인출하기</Button>
        </div>
    );
};

const WaitView = ({ status, message }: { status: string, message: string }) => (
    <div className="p-6 text-center flex flex-col justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mb-4"></div>
        <h2 className="font-bold text-lg mb-2">{status}</h2>
        <p className="text-sm text-gray-500">{message}</p>
    </div>
);

const TradeCompleteView = () => (
    <div className="p-6 text-center flex flex-col justify-center items-center h-full">
        <CheckCircle className="h-16 w-16 text-trust-green mb-4" />
        <h2 className="font-bold text-lg mb-2">거래 성공</h2>
        <p className="text-sm text-gray-500">모든 거래 절차가 안전하게 완료되었습니다.</p>
    </div>
);


