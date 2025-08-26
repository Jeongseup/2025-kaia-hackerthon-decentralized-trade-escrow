// script/utils/Utilities.s.sol

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";

contract Utilities is Script {
    // string 타입에 stdJson 라이브러리의 함수들을 사용할 수 있도록 연결합니다.
    using stdJson for string;

    // 가장 최근의 배포 로그 파일 경로를 반환하는 내부 함수
    function _getMostRecentLogPath(
        string memory contractName
    ) internal view returns (string memory) {
        string memory broadcastPath = vm.projectRoot();
        return
            string.concat(
                broadcastPath,
                "/broadcast/",
                contractName,
                ".s.sol/",
                vm.toString(block.chainid),
                "/run-latest.json"
            );
    }

    /**
     * @notice 가장 최근의 배포 로그에서 두 컨트랙트의 주소를 읽어옵니다.
     * @dev stdJson의 readAddress 함수를 사용하여 타입에 안전하게 주소를 파싱합니다.
     */
    function getMostRecentDeployment(
        string memory contractName
    ) public view returns (address stableKRWAddress, address escrowAddress) {
        string memory logPath = _getMostRecentLogPath(contractName);
        string memory json = vm.readFile(logPath);

        // [핵심 수정 부분]
        // parseRaw 대신, address 타입 전용 파서인 readAddress를 사용합니다.
        // 코드가 더 간결해지고, 타입 변환 과정의 실수를 방지할 수 있습니다.
        stableKRWAddress = json.readAddress(".transactions[0].contractAddress");
        escrowAddress = json.readAddress(".transactions[1].contractAddress");
    }
}
