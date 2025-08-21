// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {Script, console} from "forge-std/Script.sol";
import {VRFConsumer} from "../src/VRFConsumer.sol";

contract DeployVRFConsumer is Script {
    function run() external returns (address) {
        // Load environment variables
        address coordinatorAddress = vm.envAddress("COORDINATOR_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        VRFConsumer consumer = new VRFConsumer(coordinatorAddress);

        vm.stopBroadcast();

        console.log("VRFConsumer deployed at:", address(consumer));
        return address(consumer);
    }
}
