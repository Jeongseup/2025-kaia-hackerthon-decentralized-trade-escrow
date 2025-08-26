// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StableKRW
 * @dev A simple ERC20 token implementation representing a stablecoin (KRW).
 * The contract owner has the ability to mint new tokens.
 */
contract StableKRW is ERC20, Ownable {
    /**
     * @dev Sets the token name, symbol, and initial owner.
     */
    constructor(address initialOwner) ERC20("StableKRW", "SKRW") Ownable(initialOwner) {
        // The deployer of the contract will be the owner.
    }

    /**
     * @dev Creates `amount` new tokens and assigns them to the `to` address.
     * This function can only be called by the contract owner.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
