// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';
import './IRarePizzasBox.sol';

/**
 * Public interface for interacting with rare pizzas.
 *
 * Since this contract is tightly coupled with the box contract,
 * most of the functions redirect to make interacting with the app easier
 */
interface IRarePizzas is IRarePizzasBox {
    function isSaleActive() external view returns (bool);

    /**
     * Verify if a specific box has already been redeemed
     */
    function isRedeemed(uint256 boxTokenId) external view returns (bool);

    /**
     * Get the address of the user that redeemed
     */
    function addressOfRedeemer(uint256 boxTokenId) external view returns (address);

    /**
     * Redeem a RarePizzasBox for a pizza
     */
    function redeemRarePizzasBox(uint256 boxTokenId, uint256 recipeId) external;

    // Box ERC-721 redirects

    /**
     * Get the total supply of boxes
     */
    function boxTotalSupply() external view returns (uint256);

    /**
     * Get a specific token id owned by a user
     */
    function boxTokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId);

    /**
     * Get the box balance of a user
     */
    function boxBalanceOf(address owner) external view returns (uint256 balance);
}
