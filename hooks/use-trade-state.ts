// ==================================================================
// FILE: hooks/use-trade-state.ts (수정)
// 설명: 'any' 타입을 명확한 'Trade' 타입으로 변경하여 타입 안정성을 높였습니다.
// ==================================================================
import { useState, useEffect, useCallback } from "react";

// 스마트 컨트랙트의 TradeStatus와 동일한 enum
export enum TradeStatus {
  Created,
  Deposited,
  Shipping,
  Delivered,
  Completed,
  Withdrawn,
  Canceled,
  Disputed,
}

// 1. 거래 데이터 구조에 대한 타입을 명확하게 정의합니다.
// 이렇게 하면 trade 객체의 속성에 접근할 때 자동 완성과 타입 체크의 이점을 얻을 수 있습니다.
export interface Trade {
  id: number;
  status: TradeStatus;
  amount: number;
  seller: string;
  buyer: string;
}

const STORAGE_KEY = "dte-trade-demo";

export const useTradeState = () => {
  // 2. useState의 제네릭 타입으로 'any' 대신 정의한 'Trade' 타입을 사용합니다.
  const [trade, setTrade] = useState<Trade | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // 저장된 데이터가 있을 경우, JSON 파싱 후 Trade 타입으로 간주합니다.
    return stored ? (JSON.parse(stored) as Trade) : null;
  });

  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const newValue = event.newValue;
      setTrade(newValue ? (JSON.parse(newValue) as Trade) : null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [handleStorageChange]);

  // 3. 함수 파라미터의 타입도 'any' 대신 'Trade' 타입으로 명시합니다.
  const updateTradeState = (newTradeState: Trade | null) => {
    setTrade(newTradeState);
    if (newTradeState) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newTradeState));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearTrade = () => {
    updateTradeState(null);
    // 다른 탭에도 즉시 반영되도록 이벤트를 수동으로 발생
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: null,
      })
    );
  };

  return { trade, setTrade: updateTradeState, clearTrade };
};
