export const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">신뢰를 구축하는 기술</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">DTE는 블록체인 기술로 투명하고 안전한 거래 환경을 제공합니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="bg-purple-100 text-primary-purple rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">탈중앙화 에스크로</h3>
            <p className="text-gray-600">중앙 중개자 없이 스마트 컨트랙트가 거래 대금을 안전하게 보호하고, 조건 충족 시 자동으로 정산합니다.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="bg-purple-100 text-primary-purple rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">자동화된 배송 추적</h3>
            <p className="text-gray-600">오라클이 택배사 API와 연동하여 배송 상태를 자동으로 추적하고, &apos;배송 완료&apos; 시 정산 절차를 진행합니다.</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl hover:-translate-y-2 transition-all">
            <div className="bg-purple-100 text-primary-purple rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">간편한 연동</h3>
            <p className="text-gray-600">카카오페이처럼, 몇 줄의 코드만으로 기존 중고거래 플랫폼에 안전한 에스크로 기능을 추가할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
};