pragma solidity ^0.8.16;

// import {VRFConsumerBase} from "@bisonai/orakl-contracts/src/v0.1/VRFConsumerBase.sol";
// import {IVRFCoordinator} from "@bisonai/orakl-contracts/v0.1/interfaces/IVRFCoordinator.sol";
import {VRFConsumerBase} from "orakl-contracts/v0.1/src/VRFConsumerBase.sol";
import {IVRFCoordinator} from "orakl-contracts/v0.1/src/interfaces/IVRFCoordinator.sol";

contract VRFConsumer is VRFConsumerBase {
    uint256 public sRandomWord;
    address private sOwner;

    error OnlyOwner(address notOwner);
    modifier onlyOwner() {
        if (msg.sender != sOwner) {
            revert OnlyOwner(msg.sender);
        }
        _;
    }

    IVRFCoordinator COORDINATOR;

    constructor(address coordinator) VRFConsumerBase(coordinator) {
        COORDINATOR = IVRFCoordinator(coordinator);
        sOwner = msg.sender;
    }

    function requestRandomWordsDirect(
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint32 numWords,
        address refundRecipient
    ) public payable onlyOwner returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords{value: msg.value}(
            keyHash,
            callbackGasLimit,
            numWords,
            refundRecipient
        );
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        // requestId should be checked if it matches the expected request
        // Generate random value between 1 and 50.
        sRandomWord = (randomWords[0] % 50) + 1;
    }
}
