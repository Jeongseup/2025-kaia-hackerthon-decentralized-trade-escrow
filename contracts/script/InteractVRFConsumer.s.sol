// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {VRFConsumer} from "../src/VRFConsumer.sol";

contract InteractVRFConsumer is Script {
    // Kairos Testnet keyHash
    bytes32 keyHash =
        0xd9af33106d664a53cb9946df5cd81a30695f5b72224ee64e798b278af812779c;
    uint32 callbackGasLimit = 500000;
    uint32 numWords = 1;

    // This should be your deployed VRFConsumer contract address
    // address vrfConsumerAddress = YOUR_DEPLOYED_CONTRACT_ADDRESS;
    address vrfConsumerAddress = vm.envAddress("VRF_CONSUMER_ADDRESS");
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        VRFConsumer vrfConsumer = VRFConsumer(vrfConsumerAddress);
        address refundRecipient = vm.envAddress("ACCOUNT_ADDRESS");

        console.log("Requesting random words...");
        vrfConsumer.requestRandomWordsDirect{value: 1 ether}(
            keyHash,
            callbackGasLimit,
            numWords,
            refundRecipient
        );
        console.log("Request sent. Waiting for fulfillment...");

        vm.stopBroadcast();
    }
}
