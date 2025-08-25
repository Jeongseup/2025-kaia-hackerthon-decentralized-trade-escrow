// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {console} from "forge-std/console.sol";
import {DecentralizedTradeEscrow} from "../../src/DecentralizedTradeEscrow.sol";
import {Orakl} from "@bisonai/orakl-contracts/src/v0.1/libraries/Orakl.sol";

// import {IRequestResponseCoordinator} from "@bisonai/orakl-contracts/src/v0.1/interfaces/IRequestResponseCoordinator.sol";
// import {ICoordinatorBase} from "@bisonai/orakl-contracts/src/v0.1/interfaces/ICoordinatorBase.sol";

// This mock contract now explicitly inherits from the interface
contract MockCoordinator {
    address public dteAddress;
    uint256 public constant ORACLE_REQUEST_ID = 123;

    event DataRequested(uint256 requestId);

    function setDteAddress(address _dteAddress) external {
        dteAddress = _dteAddress;
    }

    // This signature must exactly match the interface
    function requestData(
        Orakl.Request memory,
        uint32,
        uint64,
        uint8
    ) external returns (uint256 requestId) {
        requestId = ORACLE_REQUEST_ID;
        emit DataRequested(requestId);
    }

    /**
     * @notice 테스트 코드에서 오라클의 응답을 시뮬레이션하는 함수
     * @param _requestId 응답을 전달할 요청 ID
     * @param _response 전달할 데이터 (배송 상태 레벨)
     */
    function fulfillRequest(uint256 _requestId, uint128 _response) public {
        require(dteAddress != address(0), "DTE address not set");

        // 이제 DecentralizedTradeEscrow의 fulfillDataRequest는 external이므로
        // 외부에서 정상적으로 호출할 수 있습니다.
        DecentralizedTradeEscrow(dteAddress).rawFulfillDataRequest(
            _requestId,
            _response
        );
    }
}
