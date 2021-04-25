// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol';
import './IRarePizzasBox.sol';

/**
 * Public interface for interacting with rare pizzas
 */
interface IRarePizzas is IRarePizzasBox {
    /**
     * Verify if a specific box has already been redeemed
     */
    function isRedeemed(uint256 boxTokenId) external view returns (bool);

    /**
     * Redeem a RarePizzasBox for a pizza
     */
    function redeemRarePizzasBox(uint256 boxTokenId) external;

    /**
     * Purchase a revealed pizza
     * TODO: pass in something so we know which one, such as the matix tx hash?
     */
    // TODO: function purchaseRevealed(bytes32 jobId) external payable;
}
