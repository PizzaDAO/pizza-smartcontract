// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";

/**
 * Public interface for interacting with rare pizzas
 */
interface IRarePizzasBox is IERC721EnumerableUpgradeable {
    /**
     * Get the curent price on the bonding curve
     */
    function getPrice() external view returns (uint256);

    /**
     * Get the maximum supply of pizzas
     */
    function maxSupply() external view returns (uint256);

    /**
     * try to purchase one pizza
     */
    function purchase() external payable;
}
