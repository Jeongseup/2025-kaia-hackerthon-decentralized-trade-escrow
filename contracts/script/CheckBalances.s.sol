// script/CheckBalance.s.sol

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StableKRW} from "../src/tokens/StableKRW.sol";
// 배포 로그를 읽기 위한 유틸리티 import
import {Utilities} from "./utils/Utilities.s.sol";

/**
 * @title CheckBalance
 * @dev Deployed StableKRW contract에서 buyer와 seller의 잔액을 확인하는 상호작용 스크립트입니다.
 * 이 스크립트는 상태를 변경하지 않으므로 broadcast를 사용하지 않습니다.
 */
contract CheckBalance is Script {
    function run() external {
        // .env 파일에서 주소들을 불러옵니다.
        address buyerAddress = vm.envAddress("BUYER_ADDRESS");
        address sellerAddress = vm.envAddress("SELLER_ADDRESS");

        // 가장 최근에 실행된 DeployAll.s.sol 스크립트의 배포 정보를 가져옵니다.
        // Utilities.s.sol 헬퍼 컨트랙트를 사용하여 broadcast 로그에서 컨트랙트 주소를 읽어옵니다.
        Utilities utils = new Utilities();
        (address stableKRWAddress, ) = utils.getMostRecentDeployment(
            "DeployDecentralizedTradeEscrow"
        );
        require(
            stableKRWAddress != address(0),
            "Deployment not found. Run deployment script first."
        );

        console.log("Last Deployed StableKRW Address: ", stableKRWAddress);

        // 읽어온 주소를 사용하여 StableKRW 컨트랙트의 인스턴스를 생성합니다.
        StableKRW stableKRW = StableKRW(stableKRWAddress);

        // --- 잔액 확인 ---
        uint256 buyerBalance = stableKRW.balanceOf(buyerAddress);
        uint256 sellerBalance = stableKRW.balanceOf(sellerAddress);

        console.log("--- Balance Check ---");
        console.log("Token Address: ", stableKRWAddress);
        console.log("---------------------");
        console.log("Buyer Address:  ", buyerAddress);
        console.log("Buyer Balance:  ", buyerBalance / 1e18, "SKRW");
        console.log("---------------------");
        console.log("Seller Address: ", sellerAddress);
        console.log("Seller Balance: ", sellerBalance / 1e18, "SKRW");
        console.log("---------------------");
    }
}
