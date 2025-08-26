import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const FinalCtaSection = () => {
  return (
    <section className="bg-gradient-to-br from-primary-purple to-secondary-purple text-white">
      <div className="container py-16 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">지금 바로 Trustless Trade로<br />안전한 거래 환경을 구축하세요</h2>
        <p className="text-purple-200 max-w-2xl mx-auto mb-8">
          플랫폼의 사기 거래 비율을 획기적으로 낮추고, 사용자 신뢰를 확보하여 비즈니스를 성장시키세요.
        </p>
        <Button size="lg" variant="outline" asChild className="text-primary-purple font-bold hover:bg-white text-lg px-8 py-6">
            <Link href="#">연동 문의하기</Link>
        </Button>
      </div>
    </section>
  );
};