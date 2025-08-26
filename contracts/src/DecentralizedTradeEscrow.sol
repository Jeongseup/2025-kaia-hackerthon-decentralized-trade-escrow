// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RequestResponseConsumerBase} from "@bisonai/orakl-contracts/src/v0.1/RequestResponseConsumerBase.sol";
import {RequestResponseConsumerFulfillUint128} from "@bisonai/orakl-contracts/src/v0.1/RequestResponseConsumerFulfill.sol";
import {Orakl} from "@bisonai/orakl-contracts/src/v0.1/libraries/Orakl.sol";

/**
 * @title DecentralizedTradeEscrow
 * @dev An escrow contract for decentralized trade using an oracle for delivery verification.
 * @notice This contract manages a trade flow from creation to completion.
 */
contract DecentralizedTradeEscrow is
    RequestResponseConsumerFulfillUint128,
    Ownable,
    ReentrancyGuard
{
    using Orakl for Orakl.Request;

    enum TradeStatus {
        Created, // 0: 거래 생성됨. 구매자의 입금 대기.
        Deposited, // 1: 구매자가 입금 완료. 판매자의 송장 입력 대기.
        Shipping, // 2: 판매자가 송장 입력. 오라클의 배송 완료 확인 대기.
        Delivered, // 3: 오라클이 배송 완료 확인. 구매자의 '수령 확인' 또는 '분쟁 제기' 대기.
        Completed, // 4: 구매자가 '수령 확인' 완료. 판매자의 즉시 인출 대기.
        Withdrawn, // 5: 판매자가 정산 완료. (거래 최종 성공)
        Canceled, // 6: 거래가 취소됨 (환불).
        Disputed // 7: 구매자가 분쟁을 제기하여 관리자의 개입 대기.
    }

    struct Trade {
        address buyer;
        address seller;
        uint256 amount;
        TradeStatus status;
        bytes32 deliveryAddressHash;
        string trackingNumber;
        uint256 deliveredAt; // Timestamp when oracle confirms delivery
    }

    IERC20 public immutable STABLE_KRW_ADDRESS;
    bytes32 public deliveryTrackingJobId;

    uint256 public tradeCounter;
    mapping(uint256 => Trade) public trades;
    mapping(uint256 => uint256) public requestToTradeId; // Oracle requestId to tradeId

    uint256 public disputePeriod;

    // Events
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        bytes32 deliveryAddressHash
    );
    event TradeDeposited(uint256 indexed tradeId);
    event TrackingInfoSubmitted(
        uint256 indexed tradeId,
        uint256 indexed requestId,
        string trackingNumber
    );
    event TradeDelivered(uint256 indexed tradeId, uint256 timestamp);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeWithdrawn(uint256 indexed tradeId);
    event TradeCanceled(uint256 indexed tradeId, address indexed canceledBy);
    event TradeDisputed(uint256 indexed tradeId);
    event DisputeResolved(
        uint256 indexed tradeId,
        address indexed resolver,
        bool refundedToBuyer
    );
    event DisputePeriodUpdated(uint256 newPeriod);

    // Modifiers
    modifier onlyBuyer(uint256 _tradeId) {
        require(
            msg.sender == trades[_tradeId].buyer,
            "DTE: Caller is not the buyer"
        );
        _;
    }

    modifier onlySeller(uint256 _tradeId) {
        require(
            msg.sender == trades[_tradeId].seller,
            "DTE: Caller is not the seller"
        );
        _;
    }

    /**
     * @param _stableKRWAddress The address of the StableKRW (ERC20) token contract.
     * @param _coordinator The address of the Orakl Coordinator contract.
     * @param _initialOwner The initial owner of the contract.
     */
    constructor(
        address _stableKRWAddress,
        address _coordinator,
        address _initialOwner
    ) RequestResponseConsumerBase(_coordinator) Ownable(_initialOwner) {
        require(
            _stableKRWAddress != address(0),
            "DTE: StableKRW address cannot be zero"
        );
        STABLE_KRW_ADDRESS = IERC20(_stableKRWAddress);
        disputePeriod = 7 days;
    }

    // --- Owner Functions ---

    function setDeliveryTrackingJobId(bytes32 _jobId) external onlyOwner {
        deliveryTrackingJobId = _jobId;
    }

    function setDisputePeriod(uint256 _newPeriod) external onlyOwner {
        disputePeriod = _newPeriod;
        emit DisputePeriodUpdated(_newPeriod);
    }

    /**
     * @notice Resolves a dispute. Can only be called by the owner.
     * @param _tradeId The ID of the trade in dispute.
     * @param _refundToBuyer True to refund the buyer, false to pay the seller.
     */
    function resolveDispute(
        uint256 _tradeId,
        bool _refundToBuyer
    ) external onlyOwner nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(
            trade.status == TradeStatus.Disputed,
            "DTE: Trade not in Disputed state"
        );

        if (_refundToBuyer) {
            // transfer() 호출의 반환값을 명시적으로 확인합니다.
            bool success = STABLE_KRW_ADDRESS.transfer(
                trade.buyer,
                trade.amount
            );
            require(success, "DTE: Failed to refund to buyer");

            trade.status = TradeStatus.Canceled;
            emit TradeCanceled(_tradeId, owner());
        } else {
            // transfer() 호출의 반환값을 명시적으로 확인합니다.
            bool success = STABLE_KRW_ADDRESS.transfer(
                trade.seller,
                trade.amount
            );
            require(success, "DTE: Failed to transfer to seller");

            trade.status = TradeStatus.Completed;
            emit TradeCompleted(_tradeId);
        }
        emit DisputeResolved(_tradeId, owner(), _refundToBuyer);
    }

    // --- Trade Lifecycle Functions ---

    function createTrade(
        address _seller,
        uint256 _amount,
        bytes32 _deliveryAddressHash
    ) external returns (uint256 tradeId) {
        require(_seller != address(0), "DTE: Seller address cannot be zero");
        require(_amount > 0, "DTE: Amount must be greater than zero");

        tradeCounter++;
        tradeId = tradeCounter;

        trades[tradeId] = Trade({
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            status: TradeStatus.Created,
            deliveryAddressHash: _deliveryAddressHash,
            trackingNumber: "",
            deliveredAt: 0
        });

        emit TradeCreated(
            tradeId,
            msg.sender,
            _seller,
            _amount,
            _deliveryAddressHash
        );
    }

    function deposit(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(
            trade.status == TradeStatus.Created,
            "DTE: Trade not in Created state"
        );

        uint256 amount = trade.amount;
        require(
            STABLE_KRW_ADDRESS.transferFrom(msg.sender, address(this), amount),
            "DTE: Token transfer failed"
        );

        trade.status = TradeStatus.Deposited;
        emit TradeDeposited(_tradeId);
    }

    function submitTrackingInfo(
        uint256 _tradeId,
        string calldata _trackingNumber,
        uint64 _accId,
        uint32 _callbackGasLimit
    ) external onlySeller(_tradeId) returns (uint256 requestId) {
        Trade storage trade = trades[_tradeId];
        require(
            trade.status == TradeStatus.Deposited,
            "DTE: Trade not in Deposited state"
        );
        require(
            bytes(_trackingNumber).length > 0,
            "DTE: Tracking number cannot be empty"
        );
        require(deliveryTrackingJobId != bytes32(0), "DTE: Job ID not set");

        // TODO: 송장번호를 number로 할지, 아니면 hash값으로 할지?
        // TODO: 송장번호랑 함께 택배사 코드도 같이 전달해야할지?
        trade.trackingNumber = _trackingNumber;

        // TODO: 실제 택배 API 에 맞춰서 변경해야함.
        Orakl.Request memory req = buildRequest(deliveryTrackingJobId);
        req.add(
            "get",
            "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
        );
        req.add("path", "data,rates,USDT");
        req.add("pow10", "8");

        requestId = COORDINATOR.requestData(req, _callbackGasLimit, _accId, 1);

        requestToTradeId[requestId] = _tradeId;
        trade.status = TradeStatus.Shipping;

        emit TrackingInfoSubmitted(_tradeId, requestId, _trackingNumber);
    }

    /**
     * @notice 구매자가 상품을 정상적으로 수령했음을 확인하는 함수입니다.
     * @dev 이 함수가 호출되면, 판매자는 분쟁 제기 기간을 기다릴 필요 없이 즉시 자금을 인출할 수 있습니다.
     * @param _tradeId 수령을 확인할 거래의 ID입니다.
     */
    function confirmDelivery(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        // 오라클에 의해 '배송 완료' 상태일 때만 호출 가능합니다.
        require(
            trade.status == TradeStatus.Delivered,
            "DTE: Trade not in Delivered state"
        );

        // 거래 상태를 'Completed'로 변경합니다.
        trade.status = TradeStatus.Completed;
        emit TradeCompleted(_tradeId);
    }

    /**
     * @notice 판매자가 에스크로된 자금을 인출합니다.
     * @dev 아래 두 가지 조건 중 하나를 만족하면 인출이 가능합니다:
     * 1. 구매자가 수령 확인을 하여 거래 상태가 'Completed'가 된 경우 (즉시 인출 가능)
     * 2. 거래 상태가 'Delivered'이고, 분쟁 제기 기간이 만료된 경우 (구매자 무응답 시)
     * @param _tradeId 인출할 거래의 ID입니다.
     */
    function withdraw(
        uint256 _tradeId
    ) external nonReentrant onlySeller(_tradeId) {
        Trade storage trade = trades[_tradeId];

        // [핵심 로직]
        // 조건 1: 구매자가 수령 확인을 했는가? (빠른 경로)
        bool isCompletedByBuyer = trade.status == TradeStatus.Completed;
        // 조건 2: 구매자가 응답이 없고, 분쟁 기간이 지났는가? (안전 경로)
        bool isTimeout = (trade.status == TradeStatus.Delivered &&
            block.timestamp >= trade.deliveredAt + disputePeriod);

        require(
            isCompletedByBuyer || isTimeout,
            "DTE: Withdrawal conditions not met"
        );

        // 상태를 먼저 변경 (Checks-Effects-Interactions 패턴)
        trade.status = TradeStatus.Withdrawn;

        require(
            STABLE_KRW_ADDRESS.transfer(trade.seller, trade.amount),
            "DTE: Token transfer failed"
        );

        emit TradeWithdrawn(_tradeId);
    }

    function raiseDispute(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        // 'Delivered' 상태일 때만 분쟁 제기가 가능합니다.
        require(
            trade.status == TradeStatus.Delivered,
            "DTE: Can only dispute in Delivered state"
        );
        // 분쟁 제기 기간이 지나면 분쟁을 제기할 수 없습니다.
        require(
            block.timestamp < trade.deliveredAt + disputePeriod,
            "DTE: Dispute period is over"
        );

        trade.status = TradeStatus.Disputed;
        emit TradeDisputed(_tradeId);
    }

    function cancelTradeByBuyer(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(
            trade.status == TradeStatus.Created,
            "DTE: Can only cancel a trade in Created state"
        );

        trade.status = TradeStatus.Canceled;
        emit TradeCanceled(_tradeId, msg.sender);
    }

    function cancelBySellerAfterDeposit(
        uint256 _tradeId
    ) external nonReentrant onlySeller(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(
            trade.status == TradeStatus.Deposited,
            "DTE: Can only cancel a trade in Deposited state"
        );

        trade.status = TradeStatus.Canceled;
        uint256 amount = trade.amount;
        require(
            STABLE_KRW_ADDRESS.transfer(trade.buyer, amount),
            "DTE: Token transfer failed"
        );

        emit TradeCanceled(_tradeId, msg.sender);
    }

    // --- View Functions ---

    function getTrade(uint256 _tradeId) external view returns (Trade memory) {
        return trades[_tradeId];
    }

    // --- Oracle Callback ---

    function fulfillDataRequest(
        uint256 _requestId,
        uint128 _deliveryStatus
    ) internal override {
        uint256 tradeId = requestToTradeId[_requestId];
        // 유효하지 않거나 이미 처리된 요청은 무시합니다.
        if (tradeId == 0) {
            return;
        }

        // [요청사항 반영] deliveryStatus가 3보다 크면 (예: 배달준비, 배달완료)
        if (_deliveryStatus >= 3) {
            // 거래 상태를 'Delivered'로 변경합니다.
            trades[tradeId].status = TradeStatus.Delivered;

            // [요청사항 반영] "오라클이 온체인에 배송 완료를 보고한 시점"을 블록 타임스탬프로 기록합니다.
            // 이 타임스탬프가 분쟁 제기 기간과 인출 대기 시간의 기준이 됩니다.
            trades[tradeId].deliveredAt = block.timestamp;

            // TradeDelivered 이벤트를 발생시켜 외부에 알립니다.
            emit TradeDelivered(tradeId, block.timestamp);

            // 처리가 완료된 요청 ID는 매핑에서 삭제하여 재사용을 방지합니다.
            delete requestToTradeId[_requestId];
        }
    }
}
