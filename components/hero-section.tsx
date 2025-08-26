import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary-purple to-secondary-purple text-white py-20 md:py-28 lg:py-32">
      <div className="container text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">Pay Trustless, Trade Real<br />믿지 않아도 안전한 거래</h1>
        <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto mb-8">
          스마트 컨트랙트 기반 에스크로 DTE로 중고거래 사기 위험을 없애고, 판매자와 구매자 모두를 보호하세요.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" variant="outline" asChild className="border-2 border-white text-primary-purple font-bold hover:bg-white text-lg px-8 py-6 w-full sm:w-auto">
            <Link href="/demo">데모 체험하기</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-2 border-white text-primary-purple font-bold hover:bg-white text-lg px-8 py-6 w-full sm:w-auto">
            <Link href="#">API 문서 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};