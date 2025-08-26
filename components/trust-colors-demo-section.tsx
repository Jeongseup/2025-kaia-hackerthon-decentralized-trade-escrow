import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Info, AlertTriangle } from "lucide-react"

export const TrustColorsDemoSection = () => {
  return (
    <section className="pb-16 md:pb-20 lg:pb-24">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">명확한 정보 전달</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">거래의 모든 단계를 사용자에게 투명하게 공유합니다.</p>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
            <Alert className="bg-trust-light-green border-trust-green text-trust-green [&>svg]:text-trust-green">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>성공!</AlertTitle>
              <AlertDescription>
                거래가 생성되었습니다. 판매자에게 링크를 공유하세요.
              </AlertDescription>
            </Alert>
            <Alert className="bg-trust-light-blue border-trust-blue text-trust-blue [&>svg]:text-trust-blue">
              <Info className="h-4 w-4" />
              <AlertTitle>정보</AlertTitle>
              <AlertDescription>
                판매자가 송장 번호를 입력했습니다. 배송이 시작되었습니다.
              </AlertDescription>
            </Alert>
            <Alert className="bg-trust-light-yellow border-trust-yellow text-trust-yellow [&>svg]:text-trust-yellow">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>경고</AlertTitle>
              <AlertDescription>
                구매 확정까지 3일 남았습니다. 문제가 있다면 이의를 제기해주세요.
              </AlertDescription>
            </Alert>
        </div>
      </div>
    </section>
  );
};