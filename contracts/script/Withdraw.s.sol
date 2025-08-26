// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/DecentralizedTradeEscrow.sol";
import {Utilities} from "./utils/Utilities.s.sol";

contract WithdrawScript is Script {
    function run() public {
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

        uint256 sellerPrivateKey = vm.envUint("SELLER_PRIVATE_KEY");
        uint256 tradeId = vm.envUint("TRADE_ID");

        DecentralizedTradeEscrow dte = DecentralizedTradeEscrow(dteAddress);

        vm.startBroadcast(sellerPrivateKey);
        dte.withdraw(tradeId);
        vm.stopBroadcast();

        console.log("Seller has withdrawn the tokens for trade ID:", tradeId);
    }
}
