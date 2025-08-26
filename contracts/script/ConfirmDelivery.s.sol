// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DecentralizedTradeEscrow} from "../src/DecentralizedTradeEscrow.sol";
import {StableKRW} from "../src/tokens/StableKRW.sol";
import {MockCoordinator} from "../test/mocks/MockCoordinator.sol";
import {Utilities} from "./utils/Utilities.s.sol";

contract ConfirmDeliveryScript is Script {
    // --- Constants ---
    bytes32 public constant BUYER_DELIVERY_ADDRESS =
        keccak256("buyer-delivery-address");
    uint256 public constant DEFAULT_TRADE_AMOUNT = 100 * 1e18;

    function run() public {
        // setup
        uint256 buyerPrivateKey = vm.envUint("BUYER_PRIVATE_KEY");
        Utilities utils = new Utilities();
        (, address dteAddress) = utils.getMostRecentDeployment(
            "DeployDecentralizedTradeEscrow"
        );
        DecentralizedTradeEscrow dte = DecentralizedTradeEscrow(dteAddress);
        uint256 tradeId = vm.envUint("TRADE_ID");

        // Create and Deposit Trade
        vm.startBroadcast(buyerPrivateKey);
        dte.confirmDelivery(tradeId);
        vm.stopBroadcast();

        console.log(
            "Buyer confirmed the delivery. Now, Seller can withdraw the token:",
            tradeId
        );
    }
}
