import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

export enum TradeStatus {
  Created, // 0: 판매자가 상품 등록. 구매 대기
  Deposited, // 1: 구매자가 거래 생성 및 입금 완료
  Shipping, // 2: 판매자가 송장 입력
  Delivered, // 3: 오라클이 배송 완료 확인
  Completed, // 4: 구매자가 수령 확인
  Withdrawn, // 5: 판매자가 정산 완료
}

// 아이템과 거래 정보를 하나의 인터페이스로 통합
export interface Trade {
  id: number;
  status: TradeStatus;
  amount: number;
  seller: string;
  productName: string;
  productImageUrl: string;
  buyer?: string; // 거래 생성 전에는 비어있음
  deliveryAddress?: string;
  deliveryAddressHash?: `0x${string}`;
  trackingNumber?: string;
}

const TRADES_STORAGE_KEY = "dte-trades-demo-v2";

export const useTradeState = () => {
  const { address } = useAccount();

  const [trades, setTrades] = useState<Trade[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(TRADES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === TRADES_STORAGE_KEY) {
      setTrades(event.newValue ? JSON.parse(event.newValue) : []);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [handleStorageChange]);

  const updateTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
    window.localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(newTrades));
    // 다른 탭/창에 변경사항을 즉시 알리기 위해 이벤트를 수동으로 발생시킵니다.
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: TRADES_STORAGE_KEY,
        newValue: JSON.stringify(newTrades),
      })
    );
  };

  const registerProduct = (product: Omit<Trade, "id" | "status" | "buyer">) => {
    const newTrade: Trade = {
      id: Date.now(),
      status: TradeStatus.Created,
      ...product,
      seller: address || "0xSeller",
    };
    updateTrades([...trades, newTrade]);
  };

  const updateTrade = (updatedTrade: Partial<Trade> & { id: number }) => {
    const newTrades = trades.map((t) =>
      t.id === updatedTrade.id ? { ...t, ...updatedTrade } : t
    );
    updateTrades(newTrades);
  };

  const clearAll = () => {
    updateTrades([]);
  };

  return { trades, registerProduct, updateTrade, clearAll };
};
