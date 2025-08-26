export const HowItWorksSection = () => {
  return (
    <section className="bg-trust-light-blue py-16 md:py-20 lg:py-24">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-trust-blue">3단계로 끝내는 안전한 거래</h2>
          <p className="text-gray-700 mt-2 max-w-2xl mx-auto">DTE는 복잡한 절차 없이 투명하고 간단하게 동작합니다.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="text-4xl font-bold text-primary-purple mb-4">Step 1</div>
            <h3 className="text-xl font-semibold mb-2 text-trust-blue">거래 생성 및 대금 예치</h3>
            <p className="text-gray-600">구매자가 카카오페이를 통해 거래를 생성하고 스테이블코인으로 대금을 스마트 컨트랙트에 안전하게 예치합니다.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary-purple mb-4">Step 2</div>
            <h3 className="text-xl font-semibold mb-2 text-trust-blue">배송 및 송장 입력</h3>
            <p className="text-gray-600">판매자가 상품을 발송하고 송장 번호를 입력하면, 오라클이 실시간으로 배송 상태를 추적합니다.</p>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-primary-purple mb-4">Step 3</div>
            <h3 className="text-xl font-semibold mb-2 text-trust-blue">배송 완료 및 자동 정산</h3>
            <p className="text-gray-600">배송이 완료되면 스마트 컨트랙트가 확인 후 자동으로 판매자에게 대금을 즉시 정산합니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
