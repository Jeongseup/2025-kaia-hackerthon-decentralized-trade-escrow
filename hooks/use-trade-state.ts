// ==================================================================
// FILE: hooks/use-trade-state.ts (수정)
// 설명: localStorage 대신 API와 통신하도록 전면 수정했습니다.
// 1초마다 서버에 데이터를 요청(폴링)하여 실시간처럼 상태를 동기화합니다.
// ==================================================================
"use client";

import { useState, useEffect, useCallback } from "react";
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

  // 1초마다 서버로부터 최신 거래 목록을 가져오는 함수
  const fetchTrades = useCallback(async () => {
    try {
      const response = await fetch("/api/trades");
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error("Failed to fetch trades:", error);
    }
  }, []);

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
    await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTradeData),
    });
    fetchTrades(); // 즉시 상태 업데이트
  };

  const updateTrade = async (updatedTrade: Partial<Trade> & { id: number }) => {
    const currentTrade = trades.find((t) => t.id === updatedTrade.id);
    if (!currentTrade) return;

    const newTradeState = { ...currentTrade, ...updatedTrade };
    await fetch("/api/trades", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTradeState),
    });
    fetchTrades(); // 즉시 상태 업데이트
  };

  const replaceTradeId = async (oldId: number, newId: number) => {
    const tradeToUpdate = trades.find((t) => t.id === oldId);
    if (!tradeToUpdate) return;

    const payload = { ...tradeToUpdate, id: newId, oldId: oldId };

    await fetch("/api/trades", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    fetchTrades(); // 즉시 상태 업데이트
  };

  const clearAll = async () => {
    await fetch("/api/trades", { method: "DELETE" });
    fetchTrades(); // 즉시 상태 업데이트
  };

  return { trades, registerProduct, updateTrade, clearAll, replaceTradeId };
};
