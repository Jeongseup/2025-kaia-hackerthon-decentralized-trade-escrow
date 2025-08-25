// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DecentralizedTradeEscrow} from "../src/DecentralizedTradeEscrow.sol";
import {StableKRW} from "../src/tokens/StableKRW.sol"; // Assuming you have a mockable StableKRW
import {MockCoordinator} from "./mocks/MockCoordinator.sol";

contract DecentralizedTradeEscrowTest is Test {
    // --- State Variables ---
    DecentralizedTradeEscrow public dte;
    StableKRW public stableKRW;
    MockCoordinator public mockCoordinator;

    // --- Actors ---
    address public owner = makeAddr("owner");
    address public buyer = makeAddr("buyer");
    address public seller = makeAddr("seller");
    address public randomGuy = makeAddr("randomGuy");

    // --- Constants ---
    bytes32 public constant DELIVERY_JOB_ID = keccak256("delivery-tracking-job");
    uint256 public constant INITIAL_MINT_AMOUNT = 1_000_000 * 1e18;
    uint256 public constant DEFAULT_TRADE_AMOUNT = 100 * 1e18;

    // --- Setup ---
    function setUp() public {
        // 1. Deploy contracts
        vm.startPrank(owner);
        // Pass the owner address to the StableKRW constructor
        stableKRW = new StableKRW(owner);
        // The DTE needs to know where to send oracle requests
        mockCoordinator = new MockCoordinator();
        dte = new DecentralizedTradeEscrow(address(stableKRW), address(mockCoordinator), owner);
        dte.setDeliveryTrackingJobId(DELIVERY_JOB_ID);
        // The mock coordinator needs to know which contract to call back (_fulfill)
        mockCoordinator.setDteAddress(address(dte));
        vm.stopPrank();

        // 2. Mint tokens for the buyer
        vm.prank(owner);
        stableKRW.mint(buyer, INITIAL_MINT_AMOUNT);
    }

    // --- Helper Functions ---

    function _createAndDepositTrade(uint256 _amount) internal returns (uint256 tradeId) {
        vm.startPrank(buyer);

        // Arrange: Create a trade
        tradeId = dte.createTrade(seller, _amount, bytes32(0));

        // Act: Buyer deposits funds
        stableKRW.approve(address(dte), _amount);
        dte.deposit(tradeId);

        vm.stopPrank();
    }

    // --- Test Cases ---

    /**
     * @notice [Happy Path] Tests the entire successful trade flow.
     * @dev Why: This is the most critical test. It ensures the core functionality of the contract
     *       (create -> deposit -> ship -> deliver -> withdraw) works as expected.
     */
    // function test_Flow_SuccessfulTrade() public {
    //     // Arrange: Create and deposit a trade
    //     uint256 tradeId = _createAndDepositTrade(DEFAULT_TRADE_AMOUNT);
    //     assertEq(uint(dte.getTrade(tradeId).status), uint(DecentralizedTradeEscrow.TradeStatus.Deposited));

    //     // Act 1: Seller submits tracking info, and mock oracle confirms delivery
    //     vm.prank(seller);
    //     uint256 requestId = dte.submitTrackingInfo(tradeId, "123456789", 0, 300000);
        
    //     // Simulate oracle callback with success (1)
    //     mockCoordinator.fulfillRequest(requestId, abi.encode(uint8(1)));

    //     // Assert 1: Trade is now in Delivered state
    //     DecentralizedTradeEscrow.Trade memory tradeAfterDelivery = dte.getTrade(tradeId);
    //     assertEq(uint(tradeAfterDelivery.status), uint(DecentralizedTradeEscrow.TradeStatus.Delivered));
    //     assertEq(tradeAfterDelivery.deliveredAt, block.timestamp);

    //     // Act 2: Fast-forward time past the dispute period and withdraw
    //     vm.warp(block.timestamp + dte.disputePeriod() + 1);
        
    //     uint256 sellerBalanceBefore = stableKRW.balanceOf(seller);
    //     vm.prank(seller);
    //     dte.withdraw(tradeId);
    //     uint256 sellerBalanceAfter = stableKRW.balanceOf(seller);

    //     // Assert 2: Trade is completed and seller received the funds
    //     assertEq(uint(dte.getTrade(tradeId).status), uint(DecentralizedTradeEscrow.TradeStatus.Completed));
    //     assertEq(sellerBalanceAfter - sellerBalanceBefore, DEFAULT_TRADE_AMOUNT);
    // }

    /**
     * @notice [Revert Case] Tests that withdrawal fails if the dispute period has not ended.
     * @dev Why: This test verifies the time-lock logic, which is crucial for giving the buyer
     *       a chance to raise a dispute.
     */
    // function test_Revert_WithdrawBeforeDisputePeriod() public {
    //     // Arrange: A trade that has been delivered
    //     uint256 tradeId = _createAndDepositTrade(DEFAULT_TRADE_AMOUNT);
    //     vm.prank(seller);
    //     uint256 requestId = dte.submitTrackingInfo(tradeId, "123456789", 0, 300000);
    //     mockCoordinator.fulfillRequest(requestId, abi.encode(uint8(1)));

    //     // Act & Assert: Attempt to withdraw immediately
    //     vm.prank(seller);
    //     vm.expectRevert("DTE: Dispute period has not ended");
    //     dte.withdraw(tradeId);
    // }

    /**
     * @notice [Edge Case] Tests the dispute flow where the owner resolves in favor of the buyer.
     * @dev Why: This verifies the entire dispute mechanism, ensuring funds can be safely returned
     *       to the buyer if a dispute is upheld.
     */
    // function test_Flow_DisputeAndResolveForBuyer() public {
    //     // Arrange: A trade that has been delivered
    //     uint256 tradeId = _createAndDepositTrade(DEFAULT_TRADE_AMOUNT);
    //     vm.prank(seller);
    //     uint256 requestId = dte.submitTrackingInfo(tradeId, "123456789", 0, 300000);
    //     mockCoordinator.fulfillRequest(requestId, abi.encode(uint8(1)));

    //     // Act 1: Buyer raises a dispute
    //     vm.prank(buyer);
    //     dte.raiseDispute(tradeId);
    //     assertEq(uint(dte.getTrade(tradeId).status), uint(DecentralizedTradeEscrow.TradeStatus.Disputed));

    //     // Act 2: Owner resolves the dispute, refunding the buyer
    //     uint256 buyerBalanceBefore = stableKRW.balanceOf(buyer);
    //     vm.prank(owner);
    //     dte.resolveDispute(tradeId, true); // true = refund to buyer
    //     uint256 buyerBalanceAfter = stableKRW.balanceOf(buyer);

    //     // Assert: Trade is canceled and buyer got their money back
    //     assertEq(uint(dte.getTrade(tradeId).status), uint(DecentralizedTradeEscrow.TradeStatus.Canceled));
    //     assertEq(buyerBalanceAfter - buyerBalanceBefore, DEFAULT_TRADE_AMOUNT);
    // }

    /**
     * @notice [Edge Case] Tests the seller's cancellation flow after a deposit.
     * @dev Why: This ensures that if the seller cannot fulfill the order, there is a
     *       mechanism to cancel the trade and refund the buyer.
     */
    function test_Flow_SellerCancelsAfterDeposit() public {
        // Arrange: A trade that has been deposited
        uint256 tradeId = _createAndDepositTrade(DEFAULT_TRADE_AMOUNT);

        // Act: Seller cancels the trade
        uint256 buyerBalanceBefore = stableKRW.balanceOf(buyer);
        vm.prank(seller);
        dte.cancelBySellerAfterDeposit(tradeId);
        uint256 buyerBalanceAfter = stableKRW.balanceOf(buyer);

        // Assert: Trade is canceled and buyer is refunded
        assertEq(uint(dte.getTrade(tradeId).status), uint(DecentralizedTradeEscrow.TradeStatus.Canceled));
        assertEq(buyerBalanceAfter - buyerBalanceBefore, DEFAULT_TRADE_AMOUNT);
    }

    /**
     * @notice [Revert Case] Verifies that only the buyer can deposit funds.
     * @dev Why: This tests the `onlyBuyer` modifier, a critical access control check.
     */
    function test_Revert_OnlyBuyerCanDeposit() public {
        // Arrange: Create a trade
        vm.prank(buyer);
        uint256 tradeId = dte.createTrade(seller, DEFAULT_TRADE_AMOUNT, bytes32(0));

        // Act & Assert: A random user tries to deposit
        vm.prank(randomGuy);
        vm.expectRevert("DTE: Caller is not the buyer");
        dte.deposit(tradeId);
    }
}