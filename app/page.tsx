"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

// Shadcn UI 컴포넌트 임포트
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 컴포넌트 분리
// NOTE: 이 컴포넌트들이 별도의 파일로 존재한다고 가정합니다.
import PhoneMockup from "@/components/PhoneMockup";
import PhoneScreen from "@/components/PhoneScreen";
import EscrowInfoBox from "@/components/EscrowInfoBox";
import ProductCard from "@/components/ProductCard";
import InfoBox from "@/components/InfoBox";
import InfoRow from "@/components/InfoRow";
import InputGroup from "@/components/InfoGroup";
import RecentTradeItem from "@/components/RecentTradeItem";


// 메인 페이지 컴포넌트
export default function Home() {
  const { isConnected } = useAccount();

  // 상태(state) 정의: 입력 필드의 값을 관리
  const [productName, setProductName] = useState("맥북 프로 13인치 2020년형");
  const [productDesc, setProductDesc] = useState("2020년 구매, 박스 및 충전기 포함\n사용감 적음, 배터리 상태 양호");
  const [productPrice, setProductPrice] = useState("₩1,200,000");
  const [recipientName, setRecipientName] = useState("김철수");
  const [recipientContact, setRecipientContact] = useState("010-1234-5678");
  const [shippingAddr, setShippingAddr] = useState("서울특별시 강남구 테헤란로 123");
  const [shippingAddrDetail, setShippingAddrDetail] = useState("5층 501호");
  const [shippingMemo, setShippingMemo] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-primary-purple to-secondary-purple font-sans text-gray-800">
      <div className="absolute top-8 right-8 z-10">
        <ConnectButton />
      </div>
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-center text-4xl font-bold text-white mb-12">
          Trustless Trade - Decentralized Trade Escrow
        </h1>

        <div className="flex flex-col space-y-12 md:space-y-24">
          {/* Mockup Screen 0, 1, 2: Login, Seller, Buyer screens side by side */}
          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
            <PhoneMockup title="0. 로그인 / 회원가입">
              <div className="flex flex-col h-full justify-center p-8 bg-gradient-to-br from-primary-purple to-secondary-purple text-white">
                <div className="text-center mb-10">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-2xl flex items-center justify-center text-4xl font-bold text-primary-purple shadow-lg">
                    TS
                  </div>
                  <h1 className="text-3xl font-bold">TrustShip</h1>
                  <p className="text-sm opacity-90">블록체인 기반 안전거래 플랫폼</p>
                </div>
                <Card className="p-6 bg-white rounded-2xl text-black">
                  <CardTitle className="text-center text-xl font-bold mb-2">시작하기</CardTitle>
                  <CardDescription className="text-center text-xs mb-6">카카오 계정으로 간편하게 시작하세요</CardDescription>
                  <Button className="w-full py-3 text-base bg-kaia-yellow hover:bg-yellow-400 text-black rounded-lg font-semibold flex items-center justify-center mb-4">
                    <span className="mr-2">💛</span> 카카오 로그인
                  </Button>
                  <div className="space-y-3">
                    <div className="flex items-start p-3 bg-gray-100 rounded-lg">
                      <span className="text-2xl mr-3">💳</span>
                      <div>
                        <h4 className="font-semibold text-sm">카카오페이 자동 연동</h4>
                        <p className="text-xs text-gray-600">카카오 계정으로 로그인하면 카카오페이가 자동으로 연동되어 안전한 결제가 가능합니다</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-gray-100 rounded-lg">
                      <span className="text-2xl mr-3">🔒</span>
                      <div>
                        <h4 className="font-semibold text-sm">블록체인 에스크로</h4>
                        <p className="text-xs text-gray-600">스마트 컨트랙트로 구매자와 판매자 모두를 보호하는 안전한 거래</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-400 text-xs mt-4">카카오 계정이 필요합니다<br />카카오페이 미가입 시 로그인 후 간편 가입 가능</p>
                </Card>
              </div>
            </PhoneMockup>

            <PhoneMockup title="1. 물품 등록 - 판매자">
              <PhoneScreen title="판매 물품 등록" subtitle="TrustShip 안전거래 설정">
                <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
                  <h3 className="text-lg font-semibold mb-3">물품 정보</h3>
                  <div className="space-y-4">
                    <InputGroup label="물품명" placeholder="판매할 물품명을 입력하세요" value={productName} onChange={(e) => setProductName(e.target.value)} />
                    <InputGroup label="카테고리" isSelect options={["전자기기", "의류/패션", "가구/인테리어"]} />
                    <InputGroup label="판매 가격" placeholder="₩0" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                    <InputGroup label="물품 설명" isTextarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)} />
                  </div>
                </div>
                <EscrowInfoBox title="거래 ID 생성" subtitle="등록 시 고유 거래 ID가 자동 생성됩니다">
                  <span className="text-2xl">🔐</span>
                </EscrowInfoBox>
                <Button className="w-full bg-primary-purple hover:bg-secondary-purple text-white font-bold py-4 rounded-xl shadow-md">
                  물품 등록하기
                </Button>
              </PhoneScreen>
            </PhoneMockup>

            <PhoneMockup title="2. 구매 확인 - 구매자">
              <PhoneScreen title="구매 확인" subtitle="TrustShip 안전거래" hasBackBtn>
                <ProductCard />
                <EscrowInfoBox title="TrustShip 구매자 보호" subtitle="스마트 컨트랙트로 안전한 거래 보장">
                  <span className="text-2xl">🛡️</span>
                  <div className="p-4 bg-white rounded-lg mt-3">
                    <div className="flex items-center mb-2">
                      <div className="w-[30px] h-[30px] rounded-full bg-trust-light-green flex items-center justify-center mr-3">✓</div>
                      <span className="text-sm">물품 미수령 시 100% 환불</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-[30px] h-[30px] rounded-full bg-trust-light-green flex items-center justify-center mr-3">✓</div>
                      <span className="text-sm">배송 지연 시 패널티 환급</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[30px] h-[30px] rounded-full bg-trust-light-green flex items-center justify-center mr-3">✓</div>
                      <span className="text-sm">블록체인 기록으로 투명한 거래</span>
                    </div>
                  </div>
                </EscrowInfoBox>
                <div className="p-[15px] bg-trust-light-yellow rounded-[10px] text-trust-yellow text-xs text-center mb-5">
                  <strong>거래 ID:</strong> TS-2024-0312-A7B9<br />
                  이 거래는 블록체인에 기록됩니다
                </div>
                <Button className="w-full py-[18px] bg-gradient-to-br from-primary-purple to-secondary-purple text-white font-semibold rounded-[15px] text-lg hover:from-secondary-purple hover:to-primary-purple transition-all mb-2">
                  구매 진행하기
                </Button>
                <Button variant="outline" className="w-full py-[15px] bg-white text-primary-purple border-2 border-primary-purple font-semibold rounded-[10px] text-base hover:text-white hover:bg-primary-purple transition-all">
                  취소
                </Button>
              </PhoneScreen>
            </PhoneMockup>
          </div>

          {/* Spacer */}
          <div className="h-12 w-full" />
          
          {/* Mockup Screen 3: Buyer Shipping Info & Buyer Transaction Status */}
          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
            <PhoneMockup title="3. 배송 정보">
              <PhoneScreen title="배송 정보" subtitle="정확한 주소를 입력해주세요" hasBackBtn>
                <div className="p-5 bg-white rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5">
                  <InputGroup label="받는 분" placeholder="이름을 입력하세요" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                  <InputGroup label="연락처" placeholder="010-0000-0000" value={recipientContact} onChange={(e) => setRecipientContact(e.target.value)} />
                  <InputGroup label="배송 주소" placeholder="주소 검색" value={shippingAddr} onChange={(e) => setShippingAddr(e.target.value)} />
                  <InputGroup placeholder="상세 주소" value={shippingAddrDetail} onChange={(e) => setShippingAddrDetail(e.target.value)} />
                  <InputGroup label="배송 메모" placeholder="배송 시 요청사항" value={shippingMemo} onChange={(e) => setShippingMemo(e.target.value)} />
                </div>
                <EscrowInfoBox title="에스크로 보호" subtitle="주소 검증 후 거래가 진행됩니다">
                  <span className="text-2xl">🔒</span>
                </EscrowInfoBox>
                <Button className="w-full py-[18px] bg-gradient-to-br from-primary-purple to-secondary-purple text-white font-semibold rounded-[15px] text-lg hover:from-secondary-purple hover:to-primary-purple transition-all">
                  카카오페이로 결제하기
                </Button>
              </PhoneScreen>
            </PhoneMockup>

            <PhoneMockup title="3. 거래 진행 현황 - 구매자">
              <PhoneScreen title="거래 현황" subtitle="주문번호: TS-2024-0312-1234">
                <EscrowInfoBox title="에스크로 보호 중" subtitle="스마트 컨트랙트 실행 중">
                  <span className="text-2xl">🔒</span>
                  <div className="text-3xl font-bold text-primary-purple mb-2">₩1,200,000</div>
                  <p className="text-sm text-gray-600">배송 완료 시 자동 정산됩니다</p>
                </EscrowInfoBox>
                <Card className="p-5 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-semibold">배송 상태</h3>
                    <div className="px-4 py-2 rounded-full text-xs font-semibold uppercase bg-trust-light-blue text-trust-blue">배송중</div>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-[26px] top-0 w-1 h-full bg-gray-200" />
                    <div className="relative pb-5">
                      <div className="absolute left-[20px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-purple" />
                      <div className="pl-4">
                        <h3 className="text-sm font-semibold">결제 완료</h3>
                        <p className="text-xs text-gray-600">2024.03.12 14:30</p>
                      </div>
                    </div>
                    <div className="relative pb-5">
                      <div className="absolute left-[20px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-purple" />
                      <div className="pl-4">
                        <h3 className="text-sm font-semibold">판매자 확인</h3>
                        <p className="text-xs text-gray-600">2024.03.12 15:00</p>
                      </div>
                    </div>
                    <div className="relative pb-5">
                      <div className="absolute left-[20px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary-purple" />
                      <div className="pl-4">
                        <h3 className="text-sm font-semibold">발송 완료</h3>
                        <p className="text-xs text-gray-600">2024.03.13 10:00</p>
                        <p className="text-primary-purple text-xs">송장: 1234567890</p>
                      </div>
                    </div>
                    <div className="relative pb-5">
                      <div className="absolute left-[20px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-200" />
                      <div className="pl-4">
                        <h3 className="text-sm font-semibold">배송 완료 예정</h3>
                        <p className="text-xs text-gray-600">2024.03.15 (D-2)</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute left-[20px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-200" />
                      <div className="pl-4">
                        <h3 className="text-sm font-semibold">자동 정산</h3>
                        <p className="text-xs text-gray-600">배송 완료 후 7일</p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Button variant="outline" className="w-full py-4 bg-white text-primary-purple border-2 border-primary-purple font-semibold rounded-lg text-base hover:text-white hover:bg-primary-purple transition-all mb-2">
                  택배 추적하기
                </Button>
                <Button variant="outline" className="w-full py-4 bg-white text-primary-purple border-2 border-primary-purple font-semibold rounded-lg text-base hover:text-white hover:bg-primary-purple transition-all">
                  거래 상세 보기
                </Button>
              </PhoneScreen>
            </PhoneMockup>
          </div>
          
          {/* Spacer */}
          <div className="h-12 w-full" />

          {/* Mockup Screen 4: Seller Tracking Info & Transaction Complete */}
          <div className="flex flex-col md:flex-row justify-center items-start gap-8">
            <PhoneMockup title="4. 송장번호 입력 - 판매자">
              <PhoneScreen title="발송 정보 입력" subtitle="48시간 이내 발송 필수">
                <div className="p-4 bg-trust-light-yellow rounded-lg text-center text-trust-yellow font-semibold mb-5">
                  <h3 className="text-sm">남은 발송 시간</h3>
                  <div className="text-3xl font-bold">36:24:15</div>
                </div>
                <Card className="p-5 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5">
                  <h3 className="text-base font-semibold mb-3">주문 정보</h3>
                  <InfoBox title="상품명" content="맥북 프로 13인치 2020년형" />
                  <InfoBox title="구매자" content="김철수 (010-****-5678)" />
                  <InfoBox title="배송지" content="서울시 강남구 테헤란로 123" subContent="5층 501호" />
                </Card>
                <div className="p-5 bg-white rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5">
                  <h3 className="text-base font-semibold mb-3">택배 정보 입력</h3>
                  <InputGroup label="택배사 선택" isSelect options={["택배사를 선택하세요", "CJ대한통운", "우체국택배"]} />
                  <InputGroup label="송장번호" placeholder="송장번호를 입력하세요" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                </div>
                <Button className="w-full py-[18px] bg-gradient-to-br from-primary-purple to-secondary-purple text-white font-semibold rounded-[15px] text-lg hover:from-secondary-purple hover:to-primary-purple transition-all">
                  발송 완료
                </Button>
              </PhoneScreen>
            </PhoneMockup>
          
            <PhoneMockup title="5. 거래 완료">
              <PhoneScreen title="거래 완료" subtitle="안전한 거래가 완료되었습니다">
                <div className="text-center py-10">
                  <div className="w-20 h-20 mx-auto mb-5 bg-trust-light-green text-trust-green rounded-full flex items-center justify-center text-4xl font-bold">
                    ✓
                  </div>
                  <h2 className="text-xl font-bold mb-2">거래가 완료되었습니다!</h2>
                  <p className="text-gray-600 text-sm">스마트 컨트랙트가 정상적으로 실행되었습니다</p>
                </div>
                <Card className="p-5 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5">
                  <h3 className="text-base font-semibold mb-4">거래 요약</h3>
                  <InfoRow title="거래 금액" value="₩1,200,000" />
                  <InfoRow title="배송 기간" value="3일" />
                  <InfoRow title="정산 상태" value="완료" valueColor="text-trust-green" />
                  <InfoRow title="블록체인 TX" value="0x1234...abcd" valueColor="text-primary-purple" />
                </Card>
                <EscrowInfoBox title="스마트 컨트랙트 기록" subtitle="블록체인에 영구 저장되었습니다">
                  <span className="text-2xl">📋</span>
                </EscrowInfoBox>
                <Button className="w-full py-[18px] bg-gradient-to-br from-primary-purple to-secondary-purple text-white font-semibold rounded-[15px] text-lg hover:from-secondary-purple hover:to-primary-purple transition-all mb-2">
                  평가 남기기
                </Button>
                <Button variant="outline" className="w-full py-[15px] bg-white text-primary-purple border-2 border-primary-purple font-semibold rounded-[10px] text-base hover:text-white hover:bg-primary-purple transition-all">
                  거래 내역 보기
                </Button>
              </PhoneScreen>
            </PhoneMockup>
          </div>

          {/* Spacer */}
          <div className="h-12 w-full" />

          {/* Mockup Screen 6: Dashboard */}
          <div className="flex justify-center w-full max-w-[400px] mx-auto">
            <PhoneMockup title="6. 메인 대시보드">
              <PhoneScreen title="TrustShip" subtitle="블록체인 기반 안전거래 플랫폼">
                <EscrowInfoBox title="내 지갑 잔액" subtitle="KRW 스테이블코인">
                  <span className="text-2xl">💰</span>
                  <div className="text-3xl font-bold text-primary-purple mb-2">₩85,000</div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1 py-2 text-primary-purple border border-primary-purple font-semibold rounded-lg">충전</Button>
                    <Button variant="outline" className="flex-1 py-2 text-primary-purple border border-primary-purple font-semibold rounded-lg">출금</Button>
                  </div>
                </EscrowInfoBox>
                <Card className="p-5 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] mb-5">
                  <h3 className="text-base font-semibold mb-4">진행 중인 거래</h3>
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-3xl font-bold text-primary-purple">3</div>
                      <div className="text-xs text-gray-600">구매 중</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-500">2</div>
                      <div className="text-xs text-gray-600">판매 중</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">15</div>
                      <div className="text-xs text-gray-600">완료</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5 rounded-[15px] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                  <h3 className="text-base font-semibold mb-4">최근 거래</h3>
                  <RecentTradeItem title="아이폰 13 프로" status="완료" statusColor="text-green-600" date="2024.03.10" price="₩980,000" />
                  <RecentTradeItem title="에어팟 프로" status="배송중" statusColor="text-blue-600" date="2024.03.12" price="₩280,000" />
                  <RecentTradeItem title="맥북 프로 13인치" status="대기중" statusColor="text-yellow-600" date="2024.03.12" price="₩1,200,000" />
                </Card>
              </PhoneScreen>
            </PhoneMockup>
          </div>
        </div>
      </div>
    </div>
  );
}
