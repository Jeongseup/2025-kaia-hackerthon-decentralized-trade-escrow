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
    bytes32 public constant DELIVERY_JOB_ID =
        keccak256("delivery-tracking-job");
    bytes32 public constant BUYER_DELIVERY_ADDRESS =
        keccak256("buyer-delivery-address");
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
        dte = new DecentralizedTradeEscrow(
            address(stableKRW),
            address(mockCoordinator),
            owner
        );
        dte.setDeliveryTrackingJobId(DELIVERY_JOB_ID);
        // The mock coordinator needs to know which contract to call back (_fulfill)
        mockCoordinator.setDteAddress(address(dte));
        vm.stopPrank();

        // 2. Mint and distribute tokens for testing
        vm.startPrank(owner);
        // Mint enough tokens for buyer
        stableKRW.mint(owner, INITIAL_MINT_AMOUNT);
        stableKRW.transfer(buyer, DEFAULT_TRADE_AMOUNT);
        vm.stopPrank();
    }

    // --- Helper Functions ---

    function _createAndDepositTrade(
        uint256 _amount
    ) internal returns (uint256 tradeId) {
        vm.startPrank(buyer);

        // Arrange: Create a trade
        tradeId = dte.createTrade(seller, _amount, BUYER_DELIVERY_ADDRESS);

        // Act: Buyer deposits funds
        stableKRW.approve(address(dte), _amount);
        dte.deposit(tradeId);

        vm.stopPrank();
    }

    // --- Test Cases ---

    /**
     * @notice Tests that the initial balances are set up correctly.
     * @dev This test verifies that the `setUp` function correctly distributes
     *      tokens to the buyer and seller.
     */
    function test_InitialState_Balances() public view {
        assertEq(
            stableKRW.balanceOf(buyer),
            DEFAULT_TRADE_AMOUNT,
            "Buyer should have the initial mint amount"
        );
        assertEq(
            stableKRW.balanceOf(seller),
            0,
            "Seller should have the initial mint amount"
        );
        assertEq(
            stableKRW.balanceOf(owner),
            INITIAL_MINT_AMOUNT - DEFAULT_TRADE_AMOUNT,
            "Owner should have transferred all minted tokens"
        );
        assertEq(
            stableKRW.balanceOf(address(dte)),
            0,
            "DTE contract should have no tokens initially"
        );
    }

    /**
     * @notice [Happy Path] Tests that a buyer can create a trade and immediately deposit funds.
     * @dev This test reflects the core requirement that a buyer initiates a trade by creating it
     *      and depositing the required amount. It verifies the state change to 'Deposited'
     *      and the corresponding fund transfer.
     */
    function test_Success_CreateAndDeposit() public {
        // Arrange: We are acting as the buyer.
        // The initial state is configured in setUp().

        // Act: Create the trade and deposit the funds.
        // We can use the internal helper function for this common pattern.
        uint256 tradeId = _createAndDepositTrade(DEFAULT_TRADE_AMOUNT);

        // Assert: Verify the final state after deposit.
        (
            address _buyer, 
            address _seller,
            uint256 _amount,
            DecentralizedTradeEscrow.TradeStatus _status,
            ,
            ,
        ) = dte.trades(tradeId);

        // 1. Verify trade properties
        assertEq(_buyer, buyer, "Trade buyer should be the correct address");
        assertEq(_seller, seller, "Trade seller should be the correct address");
        assertEq(_amount, DEFAULT_TRADE_AMOUNT, "Trade amount should be correct");
        assertEq(
            uint256(_status),
            uint256(DecentralizedTradeEscrow.TradeStatus.Deposited),
            "Trade status should be Deposited"
        );

        // 2. Verify fund transfer
        assertEq(
            stableKRW.balanceOf(buyer),
            0,
            "Buyer's balance should decrease by the trade amount"
        );
        assertEq(
            stableKRW.balanceOf(address(dte)),
            DEFAULT_TRADE_AMOUNT,
            "DTE contract's balance should increase by the trade amount"
        );
    }
}
