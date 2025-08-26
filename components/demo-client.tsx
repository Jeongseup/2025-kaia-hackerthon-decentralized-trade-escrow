// FILE: components/demo-client.tsx (수정)
// 설명: handleInitiateTrade 함수 내에 각 트랜잭션 호출 후 2초의 지연 시간을 추가하여 안정성을 높였습니다.
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PhoneMockup } from '@/components/phone-mockup';
import { Button } from '@/components/ui/button';
import { useTradeState, TradeStatus, Trade } from '@/hooks/use-trade-state';
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { dteAbi, erc20Abi } from '@/lib/abi';
import { parseEther, keccak256, stringToBytes, parseEventLogs, Log } from 'viem';
import { Truck, PackageCheck, Banknote, Upload, ShieldCheck, ShoppingBag, Landmark, RefreshCw, Hourglass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// --- 환경 변수 ---
const dteContractAddress = process.env.NEXT_PUBLIC_DTE_CONTRACT_ADDRESS as `0x${string}`;
const stableKrwAddress = process.env.NEXT_PUBLIC_STABLE_KRW_CONTRACT_ADDRESS as `0x${string}`;
const buyerDeliveryAddress = "서울시 강남구 테헤란로 123";
const buyerDeliveryAddressHash = keccak256(stringToBytes(buyerDeliveryAddress));
const itemName = "나이키 알파플라이 3";
const itemPrice = 10; // KRW
const itemImageUrl = "https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/3d5aaf55-e2c6-4b73-b981-812c887010fd/AIR+ZOOM+ALPHAFLY+NEXT%25+3+PRM.png";
const deliveryTrackingNumber = "6896724158888";
const accID = 1146;
const callbackGasLimit = 500000;

// --- 타입 정의 ---
type TradeCreatedEventLog = Log & {
    args: {
        tradeId: bigint;
    };
};

// --- UI 컴포넌트 ---

const SellerRegistrationView = ({ registerProduct }: { registerProduct: (product: Omit<Trade, 'id' | 'status' | 'buyer'>) => void }) => {
    const handleRegister = () => {
        registerProduct({
            productName: itemName,
            amount: itemPrice,
            productImageUrl: itemImageUrl,
            seller: "",
        });
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <h2 className="font-bold text-lg mb-4 text-center">상품 등록</h2>
            <div className="space-y-3 text-left flex-grow">
                <div><label className="text-xs font-medium text-gray-600">상품명</label><Input value={itemName} /></div>
                <div><label className="text-xs font-medium text-gray-600">판매 금액 (KRW)</label><Input type="number" value={itemPrice} /></div>
            </div>
            <Button onClick={handleRegister} className="w-full mt-4"><Upload className="mr-2 h-4 w-4" /> 상품 등록하기</Button>
        </div>
    );
};


const BuyerProductListView = ({ trades, updateTrade, replaceTradeId }: { trades: Trade[], updateTrade: (trade: Partial<Trade> & { id: number }) => void, replaceTradeId: (oldId: number, newId: number) => void }) => {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentTargetId, setCurrentTargetId] = useState<number | null>(null);

    const { writeContractAsync: createTradeAsync } = useWriteContract();
    const { writeContractAsync: approveAsync } = useWriteContract();
    const { writeContractAsync: depositAsync } = useWriteContract();

    const handleInitiateTrade = async (localTradeId: number) => {
        const trade = trades.find(t => t.id === localTradeId);
        if (!trade || !publicClient) return;

        setCurrentTargetId(localTradeId);
        setIsLoading(true);

        try {
            // --- Step 1: Create Trade ---
            toast.info("1/6: 거래 생성 요청", { description: "지갑에서 트랜잭션에 서명해주세요." });
            const createTxHash = await createTradeAsync({
                address: dteContractAddress,
                abi: dteAbi,
                functionName: 'createTrade',
                args: [trade.seller as `0x${string}`, parseEther(trade.amount.toString()), buyerDeliveryAddressHash],
            });

            // --- Step 2: Wait for Create Trade Receipt ---
            toast.info("2/6: 거래 생성 확인 중...", { description: "블록체인에서 트랜잭션이 처리되기를 기다립니다." });
            const createReceipt = await publicClient.waitForTransactionReceipt({ hash: createTxHash });
            if (createReceipt.status === 'reverted') throw new Error("거래 생성 트랜잭션이 실패했습니다.");

            const logs = parseEventLogs({
                abi: dteAbi,
                logs: createReceipt.logs,
                eventName: "TradeCreated",
            }) as TradeCreatedEventLog[];

            if (logs.length === 0 || !logs[0].args.tradeId) {
                throw new Error("TradeCreated 이벤트를 찾을 수 없거나 tradeId가 없습니다.");
            }
            const onChainTradeId = Number(logs[0].args.tradeId);
            console.log("온체인 거래 ID:", onChainTradeId);
            replaceTradeId(localTradeId, onChainTradeId);

            // --- Step 3: Approve Tokens ---
            toast.info("3/6: 토큰 사용 승인 요청", { description: "지갑에서 토큰 사용 승인에 서명해주세요." });
            const approveTxHash = await approveAsync({
                address: stableKrwAddress,
                abi: erc20Abi,
                functionName: 'approve',
                args: [dteContractAddress, parseEther(trade.amount.toString())],
            });

            // --- Step 4: Wait for Approve Receipt ---
            toast.info("4/6: 토큰 사용 승인 확인 중...", { description: "블록체인에서 승인 처리를 기다립니다." });
            const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
            if (approveReceipt.status === 'reverted') throw new Error("토큰 사용 승인 트랜잭션이 실패했습니다.");

            // --- Step 5: Deposit Funds ---
            toast.info("5/6: 에스크로 입금 요청", { description: "지갑에서 입금 트랜잭션에 서명해주세요." });
            const depositTxHash = await depositAsync({
                address: dteContractAddress,
                abi: dteAbi,
                functionName: 'deposit',
                args: [BigInt(onChainTradeId)],
            });

            // --- Step 6: Wait for Deposit Receipt ---
            toast.info("6/6: 에스크로 입금 확인 중...", { description: "블록체인에서 입금 처리를 기다립니다." });
            const depositReceipt = await publicClient.waitForTransactionReceipt({ hash: depositTxHash });
            if (depositReceipt.status === 'reverted') throw new Error("에스크로 입금 트랜잭션이 실패했습니다.");

            // --- Final Step: Update local state ---
            toast.success("거래 성공!", { description: "안전 거래가 성공적으로 생성되었습니다." });

            let updatedTrade = trade;
            updatedTrade = { ...updatedTrade, id: onChainTradeId, status: TradeStatus.Deposited, buyer: address || "0xBuyer", deliveryAddress: buyerDeliveryAddress, deliveryAddressHash: buyerDeliveryAddressHash };
            console.log("update trade: ", updatedTrade);
            updateTrade(updatedTrade);

        } catch (error) {
            console.error("Transaction failed:", error);
            let errorMessage = "알 수 없는 오류가 발생했습니다.";
            if (error instanceof Error) {
                if (error.message.includes("User denied transaction signature")) {
                    errorMessage = "사용자가 지갑에서 서명을 거부하여 거래가 취소되었습니다.";
                } else {
                    errorMessage = `트랜잭션 처리 중 오류가 발생했습니다: ${error.message}`;
                }
            }
            toast.error("오류 발생", { description: errorMessage });
        } finally {
            setIsLoading(false);
            setCurrentTargetId(null);
        }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="font-bold text-lg mb-4 text-center">상품 목록</h2>
            {trades.length === 0 ? <WaitView message="등록된 상품이 없습니다." /> : (
                <div className="space-y-2 overflow-y-auto">
                    {trades.map(trade => {
                        const isCurrentLoading = isLoading && currentTargetId === trade.id;
                        return (
                            <Card key={trade.id}>
                                <CardHeader className="p-0 relative aspect-square">
                                    {trade.productImageUrl && <Image src={trade.productImageUrl} alt={trade.productName || ""} fill className="object-cover rounded-t-lg" sizes="(max-width: 280px) 100vw" />}
                                </CardHeader>
                                <CardContent className="p-3">
                                    <CardTitle className="text-base">{trade.productName}</CardTitle>
                                    <p className="text-sm text-primary-purple font-bold">{trade.amount.toLocaleString()} KRW</p>
                                </CardContent>
                                <CardFooter className="p-3">
                                    <Button onClick={() => handleInitiateTrade(trade.id)} disabled={isCurrentLoading} className="w-full">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        {isCurrentLoading ? '처리 중...' : '거래하기'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

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

const SellerTradeDetailView = ({ trade, updateTrade }: { trade: Trade, updateTrade: (trade: Partial<Trade> & { id: number }) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { refetch } = useReadContract({
        address: dteContractAddress,
        abi: dteAbi,
        functionName: 'getTrade',
        args: [BigInt(trade.id)]
    });
    const { writeContractAsync: submitTrackingAsync } = useWriteContract();
    const publicClient = usePublicClient();

    const handleSubmit = async () => {
        if (!deliveryTrackingNumber || !publicClient) return;
        setIsLoading(true);
        toast.info("송장 정보 제출 중...", { description: "블록체인에 송장 정보를 기록합니다." });
        try {
            const txHash = await submitTrackingAsync({
                address: dteContractAddress,
                abi: dteAbi,
                functionName: 'submitTrackingInfo',
                args: [BigInt(trade.id), deliveryTrackingNumber, accID, callbackGasLimit],
            });

            await publicClient.waitForTransactionReceipt({ hash: txHash });
            toast.success("송장 정보 제출 완료!");
            let updatedTrade = trade;
            updatedTrade = { ...updatedTrade, status: TradeStatus.Shipping, trackingNumber: deliveryTrackingNumber };
            updateTrade(updatedTrade);

            // 오라클의 응답을 2초마다 확인하는 로직 시작
            const intervalId = setInterval(async () => {
                console.log("Checking trade status...");
                const resp = await refetch(); // 상태를 다시 가져오는 함수 (useReadContract의 refetch 등)

                if (resp.data && typeof resp.data === 'object' && 'status' in resp.data) {
                    const data = resp.data as { status: TradeStatus };

                    // 조건 확인: 상태가 'Delivered'인가?
                    if (data.status === TradeStatus.Delivered) {
                        console.log("Delivery confirmed! Stopping the check.");

                        // 1. 반복을 중단합니다. (매우 중요!)
                        clearInterval(intervalId);

                        // 2. 최종 상태를 업데이트합니다.
                        updatedTrade = { ...updatedTrade, status: TradeStatus.Delivered };

                        updateTrade(updatedTrade);
                    }
                }
            }, 2000); // 2000ms = 2초            

        } catch (error) {
            let errorMessage = "알 수 없는 오류가 발생했습니다.";
            if (error instanceof Error) errorMessage = error.message.includes("User denied") ? "사용자가 서명을 거부했습니다." : error.message;
            toast.error("오류 발생", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

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
                <Input value={deliveryTrackingNumber} />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full mt-2">
                    <Truck className="mr-2 h-4 w-4" />
                    {isLoading ? '제출 중...' : '송장번호 제출하기'}
                </Button>
            </div>
        </div>
    );
};


const BuyerConfirmView = ({ trade, updateTrade }: { trade: Trade, updateTrade: (trade: Partial<Trade> & { id: number }) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { writeContractAsync: confirmDeliveryAsync } = useWriteContract();
    const publicClient = usePublicClient();

    const handleConfirm = async () => {
        if (!publicClient) return;
        setIsLoading(true);
        toast.info("수령 확인 중...", { description: "블록체인에 거래 완료를 기록합니다." });

        try {
            const txHash = await confirmDeliveryAsync({
                address: dteContractAddress,
                abi: dteAbi,
                functionName: 'confirmDelivery',
                args: [BigInt(trade.id)],
            });
            await publicClient.waitForTransactionReceipt({ hash: txHash });
            toast.success("수령 확인 완료!");
            let updatedTrade = trade;
            updatedTrade = { ...updatedTrade, status: TradeStatus.Completed };
            updateTrade(updatedTrade);
        } catch (error) {
            let errorMessage = "알 수 없는 오류가 발생했습니다.";
            if (error instanceof Error) errorMessage = error.message.includes("User denied") ? "사용자가 서명을 거부했습니다." : error.message;
            toast.error("오류 발생", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 text-center flex flex-col justify-center h-full">
            <PackageCheck className="h-12 w-12 text-trust-green mb-4 mx-auto" />
            <h2 className="font-bold text-lg mb-4">배송 완료</h2>
            <Button onClick={handleConfirm} disabled={isLoading} className="w-full bg-trust-green hover:bg-trust-green/90">
                {isLoading ? '처리 중...' : '수령 확인'}
            </Button>
        </div>
    );
};


const SellerWithdrawView = ({ trade, updateTrade }: { trade: Trade, updateTrade: (trade: Partial<Trade> & { id: number }) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { writeContractAsync: withdrawAsync } = useWriteContract();
    const publicClient = usePublicClient();

    const handleWithdraw = async () => {
        if (!publicClient) return;
        setIsLoading(true);
        toast.info("대금 인출 중...", { description: "에스크로된 자금을 인출하고 있습니다." });

        try {
            const txHash = await withdrawAsync({
                address: dteContractAddress,
                abi: dteAbi,
                functionName: 'withdraw',
                args: [BigInt(trade.id)],
            });
            await publicClient.waitForTransactionReceipt({ hash: txHash });
            toast.success("대금 인출 완료!");
            let updatedTrade = trade;
            updatedTrade = { ...updatedTrade, status: TradeStatus.Withdrawn };
            updateTrade(updatedTrade);
        } catch (error) {
            let errorMessage = "알 수 없는 오류가 발생했습니다.";
            if (error instanceof Error) errorMessage = error.message.includes("User denied") ? "사용자가 서명을 거부했습니다." : error.message;
            toast.error("오류 발생", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="p-4 text-center flex flex-col justify-center h-full">
            <Landmark className="h-12 w-12 text-primary-purple mb-4 mx-auto" />
            <h2 className="font-bold text-lg mb-4">정산 가능</h2>
            <Button onClick={handleWithdraw} disabled={isLoading} className="w-full">
                <Banknote className="mr-2 h-4 w-4" /> 
                {isLoading ? '인출 중...' : '대금 인출하기'}
            </Button>
        </div>
    );
};


const WaitView = ({ message }: { message: string }) => (<div className="p-6 text-center flex flex-col justify-center items-center h-full"><Hourglass className="h-12 w-12 text-gray-400 mb-4 animate-pulse" /><h2 className="font-bold text-lg mb-2">대기 중</h2><p className="text-sm text-gray-500">{message}</p></div>);
const CompletedTradeList = ({ trades }: { trades: Trade[] }) => (<div className="p-4"><h2 className="font-bold text-lg mb-4 text-center">완료된 거래</h2>{trades.map(t => <div key={t.id} className="p-3 bg-gray-50 rounded-lg text-center text-sm"><ShieldCheck className="h-6 w-6 text-trust-green mx-auto mb-1" />{t.productName} 거래 완료</div>)}</div>);


// --- 메인 클라이언트 컴포넌트 ---
export const DemoClient = () => {
    const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
    const { trades, registerProduct, updateTrade, clearAll, replaceTradeId } = useTradeState();
    const { isConnected, address } = useAccount();

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
        const myTrades = trades.filter(t => role === 'buyer' ? (t.buyer === myAddress || !t.buyer) : (t.seller === myAddress));
        const activeTrade = myTrades.find(t => t.status !== TradeStatus.Withdrawn && t.status !== TradeStatus.Created);

        let screen;
        if (activeTrade) {
            switch (activeTrade.status) {
                case TradeStatus.Deposited:
                    screen = role === 'seller' ? <SellerTradeDetailView trade={activeTrade} updateTrade={updateTrade} /> : <WaitView message="판매자가 상품을 발송할 예정입니다." />;
                    break;
                case TradeStatus.Shipping:
                    screen = role === 'buyer' ? <WaitView message={`배송 추적 중... (${activeTrade.trackingNumber})`} /> : <WaitView message="송장번호 제출을 완료하였습니다. 오라클 서비스가 곧 데이터를 업데이트 할 것입니다." />;
                    break;
                case TradeStatus.Delivered:
                    screen = role === 'buyer' ? <BuyerConfirmView trade={activeTrade} updateTrade={updateTrade} /> : <WaitView message="구매자의 수령 확인을 기다리고 있습니다." />;
                    break;
                case TradeStatus.Completed:
                    screen = role === 'seller' ? <SellerWithdrawView trade={activeTrade} updateTrade={updateTrade} /> : <CompletedTradeList trades={myTrades.filter(t => t.status === TradeStatus.Withdrawn)} />;
                    break;
            }
        } else {
            if (role === 'seller') {
                const myRegisteredItems = trades.filter(t => t.seller === myAddress && t.status === TradeStatus.Created);
                screen = myRegisteredItems.length > 0 ? <SellerDashboardView trades={myRegisteredItems} /> : <SellerRegistrationView registerProduct={registerProduct} />;
            } else { // buyer
                const availableItems = trades.filter(t => t.status === TradeStatus.Created);
                screen = <BuyerProductListView trades={availableItems} updateTrade={updateTrade} replaceTradeId={replaceTradeId} />;
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
