import React from 'react';
import { cn } from "@/lib/utils"; // shadcn/ui에 포함된 classname 유틸리티를 활용합니다.

// 1. 타입 정의: React.FC를 사용하는 대신, props 타입을 직접 정의합니다.
// 이는 최신 React 패턴으로, 불필요한 타이핑을 줄이고 컴포넌트의 props를 명확하게 만듭니다.
// className prop을 추가하여 컴포넌트 사용 시 외부에서 스타일을 주입할 수 있도록 유연성을 높입니다.
type PhoneMockupProps = {
  children: React.ReactNode;
  className?: string;
};

// 2. 컴포넌트 선언: 화살표 함수를 사용한 간결한 선언.
export const PhoneMockup = ({ children, className }: PhoneMockupProps) => {
  // 3. 내부 컴포넌트 분리: 목업의 각 부분(노치, 버튼)을 내부 컴포넌트로 분리하여 JSX의 가독성을 높입니다.
  // 이렇게 하면 각 요소의 역할을 명확히 알 수 있고, 수정이 필요할 때 해당 부분만 쉽게 찾을 수 있습니다.
  const Notch = () => (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 h-[18px] w-[140px] rounded-b-[1rem] bg-gray-800" />
  );

  const SideButtons = () => (
    <>
      {/* Left buttons */}
      <div className="absolute -left-[13px] top-[72px] h-[32px] w-[3px] rounded-l-lg bg-gray-800" />
      <div className="absolute -left-[13px] top-[124px] h-[32px] w-[3px] rounded-l-lg bg-gray-800" />
      {/* Right button */}
      <div className="absolute -right-[13px] top-[100px] h-[48px] w-[3px] rounded-r-lg bg-gray-800" />
    </>
  );

  return (
    // 4. 스타일링과 구조:
    // - cn 유틸리티를 사용하여 기본 클래스와 외부에서 주입된 className을 안전하게 병합합니다.
    // - 각 요소에 z-index를 부여하여 렌더링 순서를 명확히 합니다.
    <div className={cn(
      "relative mx-auto h-[550px] w-[280px] rounded-[2.5rem] border-[10px] border-gray-800 bg-gray-800 shadow-xl",
      className
    )}>
      <Notch />
      <SideButtons />
      
      {/* 5. 콘텐츠 스크린:
          - overflow-hidden을 통해 내부 콘텐츠가 둥근 모서리를 넘어가지 않도록 합니다.
          - z-index를 주어 노치나 다른 UI 요소 아래에 위치하도록 합니다.
          - 다크모드에서 프레임과 스크린이 구분되도록 배경색을 조정합니다. (dark:bg-gray-900)
      */}
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white dark:bg-gray-900 z-10">
        {children}
      </div>
    </div>
  );
};

