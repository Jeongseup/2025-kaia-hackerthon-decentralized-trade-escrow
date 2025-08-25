// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {DecentralizedTradeEscrow} from "../../src/DecentralizedTradeEscrow.sol";
// Import Orakl library to use the Orakl.Request struct
import {Orakl} from "orakl-contracts/v0.1/src/libraries/Orakl.sol";

/**
 * @title MockCoordinator
 * @dev This mock contract simulates the behavior of the Orakl Coordinator.
 */
contract MockCoordinator {
    address public dteAddress;

    event DataRequested(uint256 requestId);

    function setDteAddress(address _dteAddress) external {
        dteAddress = _dteAddress;
    }

    // Mimics the Coordinator's requestData function, returning a uint256 requestId.
    // The signature now matches what RequestResponseConsumerBase expects.
    function requestData(
        Orakl.Request memory /* req */,
        uint32 /* _callbackGasLimit */,
        uint64 /* _accId */,
        uint16 /* _numSubmission */
    ) external returns (uint256 requestId) {
        requestId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        emit DataRequested(requestId);
    }

    // Helper function for tests to simulate the oracle calling back the DTE contract.
    function fulfillRequest(uint256 _requestId, bytes memory _data) public {
        // Calls the public `fulfill` function on the DTE contract.
        DecentralizedTradeEscrow(dteAddress).fulfill(_requestId, _data);
    }
}
