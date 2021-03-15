// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';

/**
 * Public interface for interacting with rare pizzas
 */
interface IRarePizzasBox is IERC721EnumerableUpgradeable {
    /**
     * Get the btc eth exchange rate as set by the contract admin or
     * queried from an oracle
     */
    function getBitcoinPriceInWei() external view returns (uint256);

    /**
     * Get the current price on the bonding curve * the btc/eth exchange rate
     * may be an alias to getPriceInWei()
     */
    function getPrice() external view returns (uint256);

    /**
     * Get the current price on the bonding curve * the btc/eth exchange rate
     */
    function getPriceInWei() external view returns (uint256);

    /**
     * Get the maximum supply of tokens
     */
    function maxSupply() external view returns (uint256);

    /**
     * Try to purchase one token
     */
    function purchase() external payable;
}
