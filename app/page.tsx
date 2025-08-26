import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { SocialProofSection } from "@/components/social-proof-section";
import { TrustColorsDemoSection } from "@/components/trust-colors-demo-section";
import { FinalCtaSection } from "@/components/final-cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
       {/* 기존 HTML의 body 바로 아래에 있던 요소들을 순서대로 배치합니다.
        <main> 태그는 시맨틱 웹을 위해 남겨두는 것이 좋습니다.
      */}
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <TrustColorsDemoSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}