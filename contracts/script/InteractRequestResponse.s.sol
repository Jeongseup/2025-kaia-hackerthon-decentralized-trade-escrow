// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {Script, console} from "forge-std/Script.sol";
import {RequestResponseConsumer} from "../src/RequestAndResponse.sol";

contract InteractRequestResponse is Script {
    function run() public {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address consumerAddr = vm.envAddress("RR_CONSUMER_ADDRESS");
        uint64 accId = uint64(vm.envUint("ACC_ID"));

        RequestResponseConsumer consumer = RequestResponseConsumer(payable(consumerAddr));

        vm.startBroadcast(deployerPrivateKey);

        uint32 callbackGasLimit = 500_000;
        uint256 requestId = consumer.requestData(accId, callbackGasLimit);
        console.log("Requested data with requestId:", requestId);

        vm.stopBroadcast();
    }
}
