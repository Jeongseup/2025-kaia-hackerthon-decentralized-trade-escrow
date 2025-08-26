/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem", // 24px
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // --- 브랜드 컬러 ---
        "primary-purple": "#667eea", // (유지) 밝고 친근한 메인 퍼플
        "secondary-purple": "#764ba2", // (유지) 깊고 신뢰감 있는 서브 퍼플

        // --- Accent Color (포인트 컬러) ---
        "kaia-yellow": "#FEE500", // (유지) 가장 중요한 CTA를 위한 강력한 대비 색상

        // --- Semantic Colors (상태별 정보 전달 컬러) ---
        // 기존 색상보다 브랜드 컬러(보라색)와 조화롭고 현대적인 톤으로 변경했습니다.
        "trust-green": "#16a34a", // 성공(Success): 선명하고 긍정적인 녹색
        "trust-light-green": "#dcfce7", // 성공 배경: 부드러운 파스텔 톤 녹색

        "trust-blue": "#2563eb", // 정보(Info): 명확하고 깔끔한 파란색
        "trust-light-blue": "#dbeafe", // 정보 배경: 부드러운 파스텔 톤 파란색

        "trust-yellow": "#d97706", // 경고(Warning): 주의를 끄는 호박색(Amber) 계열
        "trust-light-yellow": "#fef3c7", // 경고 배경: 부드러운 파스텔 톤 노란색
        // shadcn/ui 기본 색상 설정
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
