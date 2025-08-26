// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DecentralizedTradeEscrow} from "../src/DecentralizedTradeEscrow.sol";
import {StableKRW} from "../src/tokens/StableKRW.sol";
import {MockCoordinator} from "../test/mocks/MockCoordinator.sol";
import {Utilities} from "./utils/Utilities.s.sol";

contract CreateTradeAndDepositTokenScript is Script {
    // --- Constants ---
    bytes32 public constant BUYER_DELIVERY_ADDRESS =
        keccak256("buyer-delivery-address");
    uint256 public constant DEFAULT_TRADE_AMOUNT = 100 * 1e18;

    function run() public {
        // setup
        address sellerAddress = vm.envAddress("SELLER_ADDRESS");
        uint256 buyerPrivateKey = vm.envUint("BUYER_PRIVATE_KEY");
        Utilities utils = new Utilities();
        (address stableKRWAddress, address dteAddress) = utils
            .getMostRecentDeployment("DeployDecentralizedTradeEscrow");
        DecentralizedTradeEscrow dte = DecentralizedTradeEscrow(dteAddress);
        StableKRW stableKRW = StableKRW(stableKRWAddress);

        // Create and Deposit Trade
        vm.startBroadcast(buyerPrivateKey);
        uint256 tradeId = dte.createTrade(
            sellerAddress,
            DEFAULT_TRADE_AMOUNT,
            BUYER_DELIVERY_ADDRESS
        );
        stableKRW.approve(address(dte), DEFAULT_TRADE_AMOUNT);
        dte.deposit(tradeId);

        console.log("Trade created and deposited with ID:", tradeId);
        console.log("DTE Address:", address(dte));
        console.log(
            "Deposited Token Amount:",
            stableKRW.balanceOf(address(dte))
        );

        vm.stopBroadcast();
    }
}
