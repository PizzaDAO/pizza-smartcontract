// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";
import "./IRarePizzasBox.sol";

/**
 * Public interface for interacting with rare pizzas
 */
interface IRarePizzas is IERC721EnumerableUpgradeable {
    /**
     * Get the maximum supply of pizzas
     */
    function maxSupply() external view returns (uint256);

    /**
     * Try to purchase one pizza
     */
    function redeem(IRarePizzasBox box) external payable;
}
