// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * Public interface for interacting with rare pizzas as an administrator
 * All methods should be implemented as onlyOwner
 */
interface IRarePizzasBoxAdmin {
    /**
     * allows the contract owner to mint up to a specific number of boxes
     * owner can mit to themselves
     */
    function mint(address to, uint8 count) external;

    /**
     * allows owner to purchase to a specific address
     * owner cannot purchase for themselves
     */
    function purchaseTo(address to) external payable;

    /**
     * Allows owner to set the sale start timestamp.
     * By modifying this value, the owner can pause the sale
     * by setting a timestamp arbitrarily in the future
     */
    function setSaleStartTimestamp(uint256 epochSeconds) external;

    /**
     * allows the owner to update the cached bitcoin price
     */
    function updateBitcoinPriceInWei(uint256 fallbackValue) external;

    /**
     * Withdraw ether from this contract (Callable by owner)
     */
    function withdraw() external;
}
