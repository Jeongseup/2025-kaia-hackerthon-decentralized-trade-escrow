// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// ref; https://github.com/Bisonai/request-response-consumer
import {RequestResponseConsumerFulfillUint128} from "orakl-contracts/v0.1/src/RequestResponseConsumerFulfill.sol";
import {RequestResponseConsumerBase} from "orakl-contracts/v0.1/src/RequestResponseConsumerBase.sol";
import {CoordinatorBase} from "orakl-contracts/v0.1/src/CoordinatorBase.sol";

import {Orakl} from "orakl-contracts/v0.1/src/libraries/Orakl.sol";

contract RequestResponseConsumer is RequestResponseConsumerFulfillUint128 {
    using Orakl for Orakl.Request;
    uint128 public sResponse;

    // address private sOwner;

    constructor(address coordinator) RequestResponseConsumerBase(coordinator) {}

    receive() external payable {}

    function requestData(
        uint64 accId,
        uint32 callbackGasLimit
    ) public returns (uint256 requestId) {
        bytes32 jobId = keccak256(abi.encodePacked("uint128"));
        uint8 numSubmission = 1;
        Orakl.Request memory req = buildRequest(jobId);
        req.add(
            "get",
            "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD"
        );
        req.add("path", "RAW,ETH,USD,PRICE");
        req.add("pow10", "8");

        requestId = COORDINATOR.requestData(
            req,
            callbackGasLimit,
            accId,
            numSubmission
        );
    }

    function requestDataDirectPayment(
        uint32 callbackGasLimit
    ) public payable returns (uint256 requestId) {
        bytes32 jobId = keccak256(abi.encodePacked("uint128"));
        uint8 numSubmission = 1;

        Orakl.Request memory req = buildRequest(jobId);
        req.add(
            "get",
            "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
        );
        req.add("path", "data,rates,USDT");
        req.add("pow10", "8");

        requestId = COORDINATOR.requestData{value: msg.value}(
            req,
            callbackGasLimit,
            numSubmission,
            address(this)
        );
    }

    function fulfillDataRequest(
        uint256 /*requestId*/,
        uint128 response
    ) internal override {
        sResponse = response;
    }
}
