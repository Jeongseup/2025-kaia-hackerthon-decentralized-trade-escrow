# Decentralized Trade Escrow Contract

## 1. DecentralizedTradeEscrow.sol 코드 분석 및 설명

먼저 현재 작성된 DecentralizedTradeEscrow.sol 코드가 requirement.md의 요구사항을 어떻게 구현했는지 살펴보겠습니다. 전반적으로 매우 훌륭하게 핵심 기능들이 구현되어 있습니다.

### 구조 및 설계 결정 (The "Why")

- **상태 관리 (`TradeStatus` enum)**: 요구사항의 거래 흐름(생성 → 입금 → 송장 입력 → 배송완료 → 정산)을 enum으로 명확하게 정의했습니다. `Created`, `Deposited`, `Shipping`, `Delivered`, `Completed` 상태가 이 흐름을 직접적으로 반영합니다. 여기에 `Canceled`, `Disputed`와 같은 예외 상황을 처리하기 위한 상태를 추가한 것은 매우 좋은 설계입니다. 실제 서비스에서는 예외 처리가 핵심이기 때문입니다.
- **오라클 연동 (`RequestResponseConsumerBase`)**: Kaia Orakl(Orakl)의 Request-Response 모델을 사용하기 위해 `RequestResponseConsumerBase`를 상속했습니다. 이는 오프체인(택배사 API)의 데이터를 온체인 컨트랙트로 안전하게 가져오기 위한 표준적인 방법입니다.
  - `submitTrackingInfo` 함수에서 `COORDINATOR.requestData`를 호출하여 오라클에 데이터(배송 상태)를 요청합니다.
  - 오라클 노드가 작업을 처리하고, `_fulfill` 콜백 함수를 호출하여 결과를 컨트랙트에 다시 전달합니다.
- **보안 고려 (`Ownable`, `ReentrancyGuard`)**:
  - `Ownable`: `setDeliveryTrackingJobId`처럼 컨트랙트의 중요 설정을 관리자만 변경할 수 있도록 제한하는 것은 필수적입니다.
  - `ReentrancyGuard`: `withdraw` 함수에 `nonReentrant` 제어자를 사용하여, 판매자가 자금을 인출하는 동안 발생할 수 있는 재진입 공격(re-entrancy attack)을 방지합니다. 이는 사용자의 자금을 다루는 컨트랙트에서 매우 중요한 보안 패턴입니다.
- **데이터 프라이버시 (`deliveryAddressHash`)**: 구매자의 실제 주소 대신 해시값을 저장하여, 블록체인 상에 개인정보가 그대로 노출되는 것을 방지했습니다. 이는 프라이버시를 고려한 좋은 설계입니다.

## 2. 기능 명세서 (Functional Specifications)

이 컨트랙트는 분산형 거래 에스크로 시스템을 구현하며, 다음과 같은 핵심 기능과 사용자 흐름을 지원합니다.

### 컨트랙트 핵심 기능

-   **토큰 지원**: 컨트랙트 생성 시 지정된 StableKRW (ERC20) 토큰만을 사용하여 거래를 처리합니다.
-   **거래 상태 관리**: 거래는 다음 `enum` 상태를 통해 생명주기를 관리합니다: `생성 (Created)` → `거래대금 입금 (Deposited)` → `송장번호 입력 (Tracking Info Submitted)` → `배송완료 (Delivered)` → `정산 완료 (Settlement Completed)`. 각 단계에 따라 상태가 변경됩니다.

### 컨트랙트 기능 흐름 (사용자 관점)

1.  **구매자: 거래 시작 및 대금 예치**
    *   구매자는 컨트랙트를 통해 새로운 거래를 생성하고, 수령 주소의 해시값을 등록합니다. (거래 상태: `Created`)
    *   생성된 거래에 대해 구매 대금(StableKRW/ERC20)을 컨트랙트에 예치(deposit)합니다. (거래 상태: `Deposited`로 변경)

2.  **판매자: 대금 예치 확인**
    *   판매자는 거래 ID를 통해 컨트랙트에 대금이 성공적으로 예치되었는지 조회하여 확인합니다.

3.  **판매자: 송장 번호 제출**
    *   대금 예치 확인 후 48시간 이내에 판매자는 상품을 발송하고, 해당 송장 번호를 컨트랙트에 입력합니다.
    *   입력된 송장 번호는 내부 오라클 서비스(Kaia Orakl)를 통해 택배사 API(`https://info.sweettracker.co.kr/apidoc/`)를 호출하여 배송 정보를 확인하고, 거래 상태를 업데이트합니다. (거래 상태: `Shipping`으로 변경)

4.  **배송 완료 및 자동 정산**
    *   기본 배송 기간은 7일입니다. 구매자가 7일 이내에 물품을 정상적으로 수령하고 별도의 조치를 취하지 않으면, 거래는 자동으로 완료됩니다.
    *   거래 최종 상태는 `Delivered`로 변경됩니다.
    *   컨트랙트는 구매자가 예치했던 StableKRW (ERC20) 토큰을 판매자의 지갑으로 인출할 수 있도록 허용합니다. (거래 상태: `Completed`로 변경)

## 3. 개발 환경 설정 및 컨트랙트 배포/테스트

### 3.1. 환경 변수 설정

`.env.sample` 파일을 `.env`로 복사하고 필요한 환경 변수를 설정합니다.

```bash
cp .env.sample .env
```

`.env` 파일에는 다음과 같은 변수들이 설정되어야 합니다:

- `RPC_URL`: Kaia 네트워크의 RPC URL (예: `https://public-en-kairos.node.kaia.io`)
- `ORAKL_COORDINATOR_ADDRESS`: Orakl Coordinator 컨트랙트 주소
- `TRACKING_API_KEY`: 택배 조회 API 키 (SweetTracker 등)
- `ORAKL_ACC_ID`: Orakl Access ID
- `TRADE_ID`: (스크립트 사용 시) 특정 거래 ID
- `TRACKING_NUMBER`: (스크립트 사용 시) 택배 송장 번호
- `OWNER_ADDRESS`: 컨트랙트 소유자 주소
- `OWNER_PRIVATE_KEY`: 컨트랙트 소유자 개인 키
- `BUYER_ADDRESS`: 구매자 주소
- `BUYER_PRIVATE_KEY`: 구매자 개인 키
- `SELLER_ADDRESS`: 판매자 주소
- `SELLER_PRIVATE_KEY`: 판매자 개인 키

### 3.2. 컨트랙트 빌드 및 테스트

컨트랙트를 빌드하고 테스트를 실행하려면 다음 명령어를 사용합니다:

```bash
forge build
forge test
```

### 3.3. 컨트랙트 배포

`DecentralizedTradeEscrow` 컨트랙트를 배포하려면 다음 명령어를 사용합니다:

```bash
make deploy-escrow
```

**참고**: `OWNER_PRIVATE_KEY`, `ORAKL_COORDINATOR_ADDRESS`, `OWNER_ADDRESS`, `BUYER_ADDRESS`, `SELLER_ADDRESS` 환경 변수가 `.env` 파일에 설정되어 있어야 합니다.

### 3.4. 컨트랙트 인터랙션 스크립트

배포된 컨트랙트와 상호작용하기 위한 스크립트들은 `script/` 디렉토리에 있으며, `Makefile`을 통해 편리하게 실행할 수 있습니다.

-   **거래 생성 및 토큰 입금**:
    ```bash
    make create-trade-and-deposit-token
    ```
-   **송장 정보 제출**:
    ```bash
    make submit-tracking-info
    ```
-   **배송 확인**:
    ```bash
    make confirm-delivery
    ```
-   **자금 인출**:
    ```bash
    make withdraw
    ```
-   **잔액 확인**:
    ```bash
    make check-balance
    ```
-   **거래 상태 확인**:
    ```bash
    make check-trades
    ```