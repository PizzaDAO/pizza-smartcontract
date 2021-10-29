// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';

/**
 * Public interface for interacting with rare pizzas.
 *
 */
interface IRarePizzas {
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
}
