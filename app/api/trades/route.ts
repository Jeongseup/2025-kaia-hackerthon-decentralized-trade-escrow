// FILE: app/api/trades/route.ts (신규 생성)
// 설명: 모든 거래 데이터를 관리하는 API 엔드포인트입니다.
// 서버에서 단일 변수(in-memory DB)를 사용하여 상태를 저장합니다.

import { NextResponse } from "next/server";
import { Trade } from "@/hooks/use-trade-state";

// 서버 메모리에 거래 데이터를 저장할 변수 (간단한 인메모리 DB 역할)
let trades: Trade[] = [];

// GET: 현재 모든 거래 목록을 반환
export async function GET() {
  return NextResponse.json(trades);
}

// POST: 새로운 상품(거래)을 등록
export async function POST(request: Request) {
  const newTradeData = await request.json();
  const newTrade: Trade = {
    ...newTradeData,
    id: Date.now(), // 서버에서 고유 ID 생성
  };
  trades.push(newTrade);
  return NextResponse.json(newTrade, { status: 201 });
}

// PUT: 기존 거래의 상태를 업데이트
export async function PUT(request: Request) {
  const updatedTrade: Trade = await request.json();
  trades = trades.map((t) => (t.id === updatedTrade.id ? updatedTrade : t));
  return NextResponse.json(updatedTrade);
}

// DELETE: 모든 거래 데이터를 초기화
export async function DELETE() {
  trades = [];
  return NextResponse.json({ message: "All trades cleared" }, { status: 200 });
}
