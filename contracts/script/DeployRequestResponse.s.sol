// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {Script, console} from "forge-std/Script.sol";
import {RequestResponseConsumer} from "../src/RequestAndResponse.sol";

contract DeployRequestResponse is Script {
    function run() public returns (address) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address coordinator = vm.envAddress("RR_COORDINATOR_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Consumer
        RequestResponseConsumer consumer = new RequestResponseConsumer(
            coordinator
        );
        console.log("RequestResponseConsumer deployed at:", address(consumer));

        vm.stopBroadcast();
        return address(consumer);
    }
}