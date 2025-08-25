// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {RequestResponseConsumerBase} from "@bisonai/orakl-contracts/src/v0.1/RequestResponseConsumerBase.sol";
import {Orakl} from "@bisonai/orakl-contracts/src/v0.1/libraries/Orakl.sol";

/**
 * @title DecentralizedTradeEscrow
 * @dev An escrow contract for decentralized trade using an oracle for delivery verification.
 * @notice This contract manages a trade flow from creation to completion.
 */
contract DecentralizedTradeEscrow is RequestResponseConsumerBase, Ownable, ReentrancyGuard {
    using Orakl for Orakl.Request;

    enum TradeStatus {
        Created,         // 0: Trade created by buyer, awaiting deposit
        Deposited,       // 1: Buyer deposited funds
        Shipping,        // 2: Seller submitted tracking info, awaiting oracle confirmation
        Delivered,       // 3: Oracle confirmed delivery, awaiting buyer confirmation period
        Completed,       // 4: Seller has withdrawn funds or buyer was refunded
        Canceled,        // 5: Trade canceled before deposit or by seller after deposit
        Disputed         // 6: Buyer raised a dispute after delivery
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
    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount, bytes32 deliveryAddressHash);
    event TradeDeposited(uint256 indexed tradeId);
    event TrackingInfoSubmitted(uint256 indexed tradeId, uint256 indexed requestId, string trackingNumber);
    event TradeDelivered(uint256 indexed tradeId, uint256 deliveredAt);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeCanceled(uint256 indexed tradeId, address indexed canceledBy);
    event TradeDisputed(uint256 indexed tradeId);
    event DisputeResolved(uint256 indexed tradeId, address indexed resolver, bool refundedToBuyer);
    event DisputePeriodUpdated(uint256 newPeriod);


    // Modifiers
    modifier onlyBuyer(uint256 _tradeId) {
        require(msg.sender == trades[_tradeId].buyer, "DTE: Caller is not the buyer");
        _;
    }

    modifier onlySeller(uint256 _tradeId) {
        require(msg.sender == trades[_tradeId].seller, "DTE: Caller is not the seller");
        _;
    }

    /**
     * @param _stableKRWAddress The address of the StableKRW (ERC20) token contract.
     * @param _coordinator The address of the Orakl Coordinator contract.
     * @param _initialOwner The initial owner of the contract.
     */
    constructor(address _stableKRWAddress, address _coordinator, address _initialOwner) RequestResponseConsumerBase(_coordinator) Ownable(_initialOwner) {
        require(_stableKRWAddress != address(0), "DTE: StableKRW address cannot be zero");
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
    function resolveDispute(uint256 _tradeId, bool _refundToBuyer) external onlyOwner nonReentrant {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Disputed, "DTE: Trade not in Disputed state");

        if (_refundToBuyer) {
            // transfer() 호출의 반환값을 명시적으로 확인합니다.
            bool success = STABLE_KRW_ADDRESS.transfer(trade.buyer, trade.amount);
            require(success, "DTE: Failed to refund to buyer");
            
            trade.status = TradeStatus.Canceled;
            emit TradeCanceled(_tradeId, owner());
        } else {
            // transfer() 호출의 반환값을 명시적으로 확인합니다.
            bool success = STABLE_KRW_ADDRESS.transfer(trade.seller, trade.amount);
            require(success, "DTE: Failed to transfer to seller");

            trade.status = TradeStatus.Completed;
            emit TradeCompleted(_tradeId);
        }
        emit DisputeResolved(_tradeId, owner(), _refundToBuyer);
    }

    // --- Trade Lifecycle Functions ---

    function createTrade(address _seller, uint256 _amount, bytes32 _deliveryAddressHash) external returns (uint256 tradeId) {
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

        emit TradeCreated(tradeId, msg.sender, _seller, _amount, _deliveryAddressHash);
    }

    function deposit(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Created, "DTE: Trade not in Created state");

        uint256 amount = trade.amount;
        require(STABLE_KRW_ADDRESS.transferFrom(msg.sender, address(this), amount), "DTE: Token transfer failed");

        trade.status = TradeStatus.Deposited;
        emit TradeDeposited(_tradeId);
    }

    function submitTrackingInfo(uint256 _tradeId, string calldata _trackingNumber, uint64 _accId, uint32 _callbackGasLimit) external onlySeller(_tradeId) returns (uint256 requestId) {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Deposited, "DTE: Trade not in Deposited state");
        require(bytes(_trackingNumber).length > 0, "DTE: Tracking number cannot be empty");
        require(deliveryTrackingJobId != bytes32(0), "DTE: Job ID not set");

        trade.trackingNumber = _trackingNumber;

        Orakl.Request memory req = buildRequest(deliveryTrackingJobId);
        req.add("trackingNumber", _trackingNumber);

        requestId = COORDINATOR.requestData(req, _callbackGasLimit, _accId, 1);

        requestToTradeId[requestId] = _tradeId;
        trade.status = TradeStatus.Shipping;

        emit TrackingInfoSubmitted(_tradeId, requestId, _trackingNumber);
    }

    function withdraw(uint256 _tradeId) external nonReentrant onlySeller(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Delivered, "DTE: Trade not in Delivered state");
        require(block.timestamp >= trade.deliveredAt + disputePeriod, "DTE: Dispute period has not ended");

        trade.status = TradeStatus.Completed;
        uint256 amount = trade.amount;

        require(STABLE_KRW_ADDRESS.transfer(trade.seller, amount), "DTE: Token transfer failed");

        emit TradeCompleted(_tradeId);
    }

    function raiseDispute(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Delivered, "DTE: Trade not in Delivered state");
        require(block.timestamp < trade.deliveredAt + disputePeriod, "DTE: Dispute period is over");

        trade.status = TradeStatus.Disputed;
        emit TradeDisputed(_tradeId);
    }

    function cancelTradeByBuyer(uint256 _tradeId) external onlyBuyer(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Created, "DTE: Can only cancel a trade in Created state");

        trade.status = TradeStatus.Canceled;
        emit TradeCanceled(_tradeId, msg.sender);
    }

    function cancelBySellerAfterDeposit(uint256 _tradeId) external nonReentrant onlySeller(_tradeId) {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Deposited, "DTE: Can only cancel a trade in Deposited state");

        trade.status = TradeStatus.Canceled;
        uint256 amount = trade.amount;
        require(STABLE_KRW_ADDRESS.transfer(trade.buyer, amount), "DTE: Token transfer failed");

        emit TradeCanceled(_tradeId, msg.sender);
    }

    // --- View Functions ---

    function getTrade(uint256 _tradeId) external view returns (Trade memory) {
        return trades[_tradeId];
    }

    // --- Oracle Callback ---

    function fulfill(uint256 _requestId, bytes calldata _data) external {
        console.log("== DTE: Entering fulfill function ==");
        console.log("Received requestId:", _requestId);

        uint256 tradeId = requestToTradeId[_requestId];
        console.log("Found tradeId:", tradeId);

        require(tradeId != 0, "DTE: Invalid request ID");

        // Assuming the oracle job returns a uint8 status code
        // 1: Delivered, others: Not delivered
        uint8 deliveryStatus = abi.decode(_data, (uint8));

        if (deliveryStatus == 1) { // Delivered
            trades[tradeId].status = TradeStatus.Delivered;
            trades[tradeId].deliveredAt = block.timestamp;
            emit TradeDelivered(tradeId, block.timestamp);
        } else {
            // If delivery failed, revert to Deposited to allow resubmission.
            trades[tradeId].status = TradeStatus.Deposited;
        }

        delete requestToTradeId[_requestId];
    }
}