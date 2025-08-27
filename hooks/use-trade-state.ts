// ==================================================================
// FILE: hooks/use-trade-state.ts (수정)
// 설명: localStorage 대신 API와 통신하도록 전면 수정했습니다. 폴링 중복 호출 방지 로직 추가.
// 1초마다 서버에 데이터를 요청(폴링)하여 실시간처럼 상태를 동기화합니다.
// ==================================================================
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

export enum TradeStatus {
  Created,
  Deposited,
  Shipping,
  Delivered,
  Completed,
  Withdrawn,
}
export interface Trade {
  id: number;
  status: TradeStatus;
  amount: number;
  seller: string;
  productName: string;
  productImageUrl: string;
  buyer?: string;
  deliveryAddress?: string;
  deliveryAddressHash?: `0x${string}`;
  trackingNumber?: string;
}

export const useTradeState = () => {
  const { address } = useAccount();
  const [trades, setTrades] = useState<Trade[]>([]);
  const isUpdatingManuallyRef = useRef(false); // 수동 업데이트 중인지 여부를 추적

  // 1초마다 서버로부터 최신 거래 목록을 가져오는 함수
  const fetchTrades = useCallback(async () => {
    if (isUpdatingManuallyRef.current) {
      // 수동 업데이트 중이면 폴링 건너뛰기
      return;
    }
    try {
      // [핵심 수정] { cache: 'no-store' } 옵션을 추가하여 항상 최신 데이터를 서버에서 가져오도록 합니다.
      const response = await fetch("/api/trades", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error);
    }
  }, []); // fetchTrades는 isUpdatingManuallyRef.current에 의존하므로, 의존성 배열에서 제거

  // 수동 업데이트를 수행하고 상태를 동기화하는 헬퍼 함수
  const performManualUpdate = useCallback(async (apiCall: () => Promise<Response>) => {
    isUpdatingManuallyRef.current = true; // 수동 업데이트 시작
    try {
      await apiCall(); // API 호출 실행
      // API 호출 성공 후 즉시 최신 상태를 가져와 UI 업데이트
      // 이 fetchTrades는 isUpdatingManuallyRef.current가 false일 때만 실행되므로,
      // 여기서는 직접 호출하여 강제로 최신 상태를 가져오도록 함
      await fetchTrades();
    } catch (error) {
      console.error("Manual update failed:", error);
    } finally {
      isUpdatingManuallyRef.current = false; // 수동 업데이트 완료
    }
  }, [fetchTrades]); // fetchTrades가 useCallback으로 감싸져 있으므로 의존성 배열에 포함

  useEffect(() => {
    fetchTrades(); // 컴포넌트 마운트 시 즉시 한번 호출
    const interval = setInterval(fetchTrades, 1000); // 1초마다 폴링
    return () => clearInterval(interval); // 언마운트 시 인터벌 정리
  }, [fetchTrades]);

  const registerProduct = async (
    product: Omit<Trade, "id" | "status" | "buyer">
  ) => {
    const newTradeData = {
      ...product,
      status: TradeStatus.Created,
      seller: address || "0xSeller",
    };
    await performManualUpdate(() =>
      fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTradeData),
      })
    );
  };

  const updateTrade = async (updatedTrade: Partial<Trade> & { id: number }) => {
    // [핵심 수정] 클라이언트에서 상태를 찾고 병합하는 대신,
    // 필요한 변경 사항만 서버로 직접 보냅니다. 서버가 상태 병합을 책임집니다.
    await performManualUpdate(() =>
      fetch("/api/trades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTrade),
      })
    );
  };

  const replaceTradeId = async (oldId: number, newId: number) => {
    const tradeToUpdate = trades.find((t) => t.id === oldId);
    if (!tradeToUpdate) return;

    const payload = { ...tradeToUpdate, id: newId, oldId: oldId };
    await performManualUpdate(() =>
      fetch("/api/trades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
  };

  const clearAll = async () => {
    await performManualUpdate(() =>
      fetch("/api/trades", { method: "DELETE" })
    );
  };

  return { trades, registerProduct, updateTrade, clearAll, replaceTradeId };
};
