// FILE: components/demo-client.tsx (수정)
// 설명: 빌드 경고를 해결하기 위해 사용하지 않는 모든 import 구문과 변수를 제거했습니다.
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PhoneMockup } from '@/components/phone-mockup';
import { Button } from '@/components/ui/button';
import { useTradeState, TradeStatus, Trade } from '@/hooks/use-trade-state';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { keccak256, stringToBytes } from 'viem';
import { Truck, PackageCheck, Banknote, Upload, ShieldCheck, ShoppingBag, Landmark, RefreshCw, Hourglass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// --- UI 컴포넌트 ---

// Status 0: 판매자 - 상품 등록 화면
const SellerRegistrationView = ({ registerProduct }: { registerProduct: (product: Omit<Trade, 'id' | 'status' | 'buyer'>) => void }) => {
    const [productName, setProductName] = useState("나이키 알파플라이 3");
    const [amount, setAmount] = useState("250000");
    const imageUrl = "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/3d5aaf55-e2c6-4b73-b981-812c887010fd/AIR+ZOOM+ALPHAFLY+NEXT%25+3+PRM.png";

    const handleRegister = () => {
        registerProduct({
            productName,
            amount: Number(amount),
            productImageUrl: imageUrl,
            seller: "", // 이 값은 useTradeState 훅 내부에서 현재 지갑 주소로 채워집니다.
        });
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <h2 className="font-bold text-lg mb-4 text-center">상품 등록</h2>
            <div className="space-y-3 text-left flex-grow">
                <input type="hidden" value={imageUrl} />
                <div><label className="text-xs font-medium text-gray-600">상품명</label><Input value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
                <div><label className="text-xs font-medium text-gray-600">판매 금액 (KRW)</label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            </div>
            <Button onClick={handleRegister} className="w-full mt-4"><Upload className="mr-2 h-4 w-4" /> 상품 등록하기</Button>
        </div>
    );
};

// Status 0 & 1: 구매자 - 상품 목록 화면
const BuyerProductListView = ({ trades, createTrade }: { trades: Trade[], createTrade: (tradeId: number) => void }) => (
    <div className="p-4 h-full flex flex-col">
        <h2 className="font-bold text-lg mb-4 text-center">상품 목록</h2>
        {trades.length === 0 ? (
            <WaitView message="등록된 상품이 없습니다." />
        ) : (
            <div className="space-y-2 overflow-y-auto"> {/* 카드 간격을 space-y-2로 줄였습니다. */}
                {trades.map(trade => (
                    <Card key={trade.id}>
                        <CardHeader className="p-0 relative aspect-square">
                           {trade.productImageUrl && 
                                <Image 
                                    src={trade.productImageUrl} 
                                    alt={trade.productName || "Product Image"}
                                    fill
                                    className="object-cover rounded-t-lg"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                           }
                        </CardHeader>
                        <CardContent className="p-3">
                            <CardTitle className="text-base">{trade.productName}</CardTitle>
                            <p className="text-sm text-primary-purple font-bold">{trade.amount.toLocaleString()} KRW</p>
                        </CardContent>
                        <CardFooter className="p-3">
                            <Button onClick={() => createTrade(trade.id)} className="w-full"><ShoppingBag className="mr-2 h-4 w-4" /> 거래하기</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
    </div>
);

// Status 1: 판매자 - 등록된 상품 목록 화면
const SellerDashboardView = ({ trades }: { trades: Trade[] }) => (
    <div className="p-4 h-full flex flex-col">
        <h2 className="font-bold text-lg mb-4 text-center">내 판매 상품</h2>
        <div className="space-y-2 overflow-y-auto">
            {trades.map(trade => (
                <div key={trade.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p className="font-semibold">{trade.productName}</p>
                    <p>{trade.amount.toLocaleString()} KRW - <Badge variant="secondary">거래 대기중</Badge></p>
                </div>
            ))}
        </div>
    </div>
);

// Status 2: 판매자 - 거래 상세 및 송장 제출 대기
const SellerTradeDetailView = ({ trade, submitTracking }: { trade: Trade, submitTracking: (tradeId: number, trackingNumber: string) => void }) => {
    const [trackingNumber, setTrackingNumber] = useState("");
    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="font-bold text-lg mb-2 text-center">거래 생성됨 (ID: {trade.id})</h2>
            <Card>
                <CardContent className="p-3 text-sm space-y-2">
                    <p><strong>구매자:</strong> <span className="truncate w-24">{trade.buyer}</span></p>
                    <p><strong>배송지:</strong> {trade.deliveryAddress}</p>
                    <p><strong>입금액:</strong> {trade.amount.toLocaleString()} KRW <Badge className="bg-trust-green">입금 확인됨</Badge></p>
                </CardContent>
            </Card>
            <div className="mt-4 pt-4 border-t">
                <label className="text-xs font-medium text-gray-600">송장 번호</label>
                <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="1234567890" />
                <Button onClick={() => submitTracking(trade.id, trackingNumber)} className="w-full mt-2"><Truck className="mr-2 h-4 w-4" /> 송장번호 제출하기</Button>
            </div>
        </div>
    );
};

// Status 4: 구매자 - 수령 확인
const BuyerConfirmView = ({ trade, confirmDelivery }: { trade: Trade, confirmDelivery: (tradeId: number) => void }) => (
    <div className="p-4 text-center flex flex-col justify-center h-full">
        <PackageCheck className="h-12 w-12 text-trust-green mb-4 mx-auto" />
        <h2 className="font-bold text-lg mb-4">배송 완료</h2>
        <Button onClick={() => confirmDelivery(trade.id)} className="w-full bg-trust-green hover:bg-trust-green/90">수령 확인</Button>
    </div>
);

// Status 5: 판매자 - 인출 대기
const SellerWithdrawView = ({ trade, withdraw }: { trade: Trade, withdraw: (tradeId: number) => void }) => (
     <div className="p-4 text-center flex flex-col justify-center h-full">
        <Landmark className="h-12 w-12 text-primary-purple mb-4 mx-auto" />
        <h2 className="font-bold text-lg mb-4">정산 가능</h2>
        <Button onClick={() => withdraw(trade.id)} className="w-full"><Banknote className="mr-2 h-4 w-4" /> 대금 인출하기</Button>
    </div>
);

// 공통 컴포넌트
const WaitView = ({ message }: { message: string }) => (<div className="p-6 text-center flex flex-col justify-center items-center h-full"><Hourglass className="h-12 w-12 text-gray-400 mb-4 animate-pulse" /><h2 className="font-bold text-lg mb-2">대기 중</h2><p className="text-sm text-gray-500">{message}</p></div>);
const CompletedTradeList = ({ trades }: { trades: Trade[] }) => (<div className="p-4"><h2 className="font-bold text-lg mb-4 text-center">완료된 거래</h2>{trades.map(t => <div key={t.id} className="p-3 bg-gray-50 rounded-lg text-center text-sm"><ShieldCheck className="h-6 w-6 text-trust-green mx-auto mb-1" />{t.productName} 거래 완료</div>)}</div>);


// --- 메인 클라이언트 컴포넌트 ---
export const DemoClient = () => {
    const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
    const { trades, registerProduct, updateTrade, clearAll } = useTradeState();
    const { isConnected, address } = useAccount();

    const createTrade = (tradeId: number) => {
        const trade = trades.find(t => t.id === tradeId);
        if (!trade) return;
        const deliveryAddress = "서울시 강남구 테헤란로 123";
        const deliveryAddressHash = keccak256(stringToBytes(deliveryAddress));
        
        updateTrade({ id: tradeId, status: TradeStatus.Deposited, buyer: address || "0xBuyer", deliveryAddress, deliveryAddressHash });
    };
    
    const submitTracking = (tradeId: number, trackingNumber: string) => {
        updateTrade({ id: tradeId, status: TradeStatus.Shipping, trackingNumber });
        setTimeout(() => {
            updateTrade({ id: tradeId, status: TradeStatus.Delivered, trackingNumber });
        }, 2000);
    };

    const confirmDelivery = (tradeId: number) => {
        updateTrade({ id: tradeId, status: TradeStatus.Completed });
    };

    const withdraw = (tradeId: number) => {
        updateTrade({ id: tradeId, status: TradeStatus.Withdrawn });
    };

    const renderContent = () => {
        if (!isConnected) return <div className="flex flex-col items-center gap-4 text-white"><p>데모를 시작하려면 지갑을 연결해주세요.</p><ConnectButton /></div>;
        if (!role) return (
            <div className="flex flex-col items-center gap-8 text-white">
                <div className='text-center'><p className="font-bold">지갑 연결 완료!</p><p className="text-sm text-purple-200 truncate max-w-xs">{address}</p></div>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <Button size="lg" onClick={() => setRole('buyer')} className="bg-white text-primary-purple hover:bg-white/90">구매자로 시작</Button>
                    <Button size="lg" onClick={() => setRole('seller')} className="bg-white text-secondary-purple hover:bg-white/90">판매자로 시작</Button>
                </div>
            </div>
        );

        const myAddress = address || "";
        const myTrades = trades.filter(t => role === 'buyer' ? (t.buyer === myAddress || t.buyer === "") : (t.seller === myAddress));
        const activeTrade = myTrades.find(t => t.status !== TradeStatus.Withdrawn && t.status !== TradeStatus.Created);
        
        let screen;
        if (activeTrade) {
            switch (activeTrade.status) {
                case TradeStatus.Deposited:
                    screen = role === 'seller' ? <SellerTradeDetailView trade={activeTrade} submitTracking={submitTracking} /> : <WaitView message="판매자가 상품을 발송할 예정입니다." />;
                    break;
                case TradeStatus.Shipping:
                    screen = role === 'buyer' ? <WaitView message={`배송 추적 중... (${activeTrade.trackingNumber})`} /> : <WaitView message="상품이 배송 중입니다." />;
                    break;
                case TradeStatus.Delivered:
                    screen = role === 'buyer' ? <BuyerConfirmView trade={activeTrade} confirmDelivery={confirmDelivery} /> : <WaitView message="구매자의 수령 확인을 기다리고 있습니다." />;
                    break;
                case TradeStatus.Completed:
                    screen = role === 'seller' ? <SellerWithdrawView trade={activeTrade} withdraw={withdraw} /> : <CompletedTradeList trades={myTrades.filter(t => t.status === TradeStatus.Withdrawn)} />;
                    break;
            }
        } else {
            if (role === 'seller') {
                const myRegisteredItems = trades.filter(t => t.seller === myAddress && t.status === TradeStatus.Created);
                screen = myRegisteredItems.length > 0 ? <SellerDashboardView trades={myRegisteredItems} /> : <SellerRegistrationView registerProduct={registerProduct} />;
            } else { // buyer
                const availableItems = trades.filter(t => t.status === TradeStatus.Created);
                screen = <BuyerProductListView trades={availableItems} createTrade={createTrade} />;
            }
        }
        
        return (
            <div>
                <div className="w-full max-w-sm mx-auto">
                    <h2 className="text-center font-bold text-xl mb-4 text-white">{role === 'buyer' ? '구매자' : '판매자'}</h2>
                    <PhoneMockup>{screen}</PhoneMockup>
                </div>
                <div className="text-center mt-6 flex justify-center items-center gap-4">
                    <Button onClick={() => setRole(null)} variant="ghost" className="text-white/70 hover:text-white">역할 재선택</Button>
                    <Button onClick={() => { clearAll(); setRole(null); }} variant="ghost" className="text-white/70 hover:text-white"><RefreshCw className="mr-2 h-4 w-4" /> 데모 초기화</Button>
                </div>
            </div>
        );
    };
  
    return renderContent();
};
