// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {DecentralizedTradeEscrow} from "../src/DecentralizedTradeEscrow.sol";
import {Utilities} from "./utils/Utilities.s.sol";

contract CheckTrades is Script {
    function run() external {
        // Utilities.s.sol 헬퍼 컨트랙트를 사용하여 가장 최근에 배포된 컨트랙트 주소를 읽어옵니다.
        Utilities utils = new Utilities();
        (, address dteAddress) = utils.getMostRecentDeployment(
            "DeployDecentralizedTradeEscrow"
        );
        require(
            dteAddress != address(0),
            "Deployment not found. Run deployment script first."
        );

        console.log("Checking trades for DTE at address:", dteAddress);

        // 읽어온 주소를 사용하여 DecentralizedTradeEscrow 컨트랙트의 인스턴스를 생성합니다.
        DecentralizedTradeEscrow dte = DecentralizedTradeEscrow(dteAddress);

        // tradeCounter를 가져와서 전체 거래 수를 확인합니다.
        uint256 totalTrades = dte.tradeCounter();
        console.log("Total number of trades:", totalTrades);

        if (totalTrades == 0) {
            console.log("No trades found.");
            return;
        }

        console.log("--- Iterating through all trades ---");
        // tradeId는 1부터 시작하므로 1부터 totalTrades까지 반복합니다.
        for (uint256 i = 1; i <= totalTrades; i++) {
            (
                address buyer,
                address seller,
                uint256 amount,
                DecentralizedTradeEscrow.TradeStatus status,
                , // deliveryAddressHash
                string memory trackingNumber,

            ) = dte.trades(i);

            console.log("-----------------------------------");
            console.log("Trade ID:", i);
            console.log("  - Buyer:", buyer);
            console.log("  - Seller:", seller);
            console.log("  - Amount:", amount);
            console.log("  - Status:", uint(status)); // Enum을 uint로 변환하여 출력
            console.log("  - Tracking #:", trackingNumber);
        }
        console.log("-----------------------------------");
    }
}
