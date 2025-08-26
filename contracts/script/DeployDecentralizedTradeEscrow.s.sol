// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StableKRW} from "../src/tokens/StableKRW.sol";
import {DecentralizedTradeEscrow} from "../src/DecentralizedTradeEscrow.sol";

/**
 * @title DeployAll
 * @dev Deploys StableKRW and then DecentralizedTradeEscrow, linking them together.
 *      It also mints initial tokens for the buyer for testing purposes.
 */
contract DeployAll is Script {
    function run() external returns (address, address) {
        // Load environment variables
        address coordinatorAddress = vm.envAddress("ORAKL_COORDINATOR_ADDRESS");
        address initialOwner = vm.envAddress("OWNER_ADDRESS");
        address buyerAddress = vm.envAddress("BUYER_ADDRESS");
        address sellerAddress = vm.envAddress("SELLER_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        string memory trackingApiKey = vm.envString("TRACKING_API_KEY");
        uint256 mintAmount = 1_000_000_000 * 1e18; // Mint 1,000,000 SKRW
        uint256 tradeAmount = 1_000_000_000 * 1e18; // Trading 10,000 SKRW

        // Input validation
        require(
            coordinatorAddress != address(0),
            "ORAKL_COORDINATOR_ADDRESS must be set"
        );
        require(initialOwner != address(0), "OWNER_ADDRESS must be set");
        require(buyerAddress != address(0), "BUYER_ADDRESS must be set");
        require(sellerAddress != address(0), "SELLER_ADDRESS must be set");
        require(deployerPrivateKey != 0, "OWNER_PRIVATE_KEY must be set");
        require(
            bytes(trackingApiKey).length > 0,
            "TRACKING_API_KEY must be set"
        );

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy StableKRW
        console.log("Deploying StableKRW...");
        // The 'initialOwner' will be the owner of StableKRW
        StableKRW stableKRW = new StableKRW(initialOwner);
        console.log("StableKRW deployed at:", address(stableKRW));

        // 2. Deploy DecentralizedTradeEscrow
        console.log("Deploying DecentralizedTradeEscrow...");
        DecentralizedTradeEscrow decentralizedTradeEscrow = new DecentralizedTradeEscrow(
                address(stableKRW),
                coordinatorAddress,
                initialOwner,
                trackingApiKey
            );
        console.log(
            "DecentralizedTradeEscrow deployed at:",
            address(decentralizedTradeEscrow)
        );

        // 3. Mint initial tokens for the owner and transfer a portion to the buyer.
        // The vm.startBroadcast ensures the 'initialOwner' is the sender for these calls.
        console.log(
            "Minting",
            mintAmount / 1e18,
            "SKRW for the owner:",
            initialOwner
        );
        stableKRW.mint(initialOwner, mintAmount);

        console.log(
            "Transferring",
            tradeAmount / 1e18,
            "SKRW from owner to buyer:",
            buyerAddress
        );
        stableKRW.transfer(buyerAddress, tradeAmount);

        vm.stopBroadcast();

        // --- Post-deployment checks ---
        uint256 buyerBalance = stableKRW.balanceOf(buyerAddress);
        uint256 sellerBalance = stableKRW.balanceOf(sellerAddress);

        console.log("--- Balance Check ---");
        console.log("Buyer Balance:", buyerBalance);
        console.log("Seller Balance:", sellerBalance);
        console.log("---------------------");

        return (address(stableKRW), address(decentralizedTradeEscrow));
    }
}
