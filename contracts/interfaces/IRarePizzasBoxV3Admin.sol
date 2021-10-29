// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './IRarePizzasBoxV2Admin.sol';

/**
 * Public interface for interacting with rare pizzas box V3 as an administrator
 * All methods should be implemented as onlyOwner
 */
interface IRarePizzasBoxV3Admin is IRarePizzasBoxV2Admin {
    /**
     * Allows owner to start a batch mint process
     */
    function startBatchMint(address[] calldata users, uint256 count) external;

    /**
     * Finish the batch mint process after VRF has returned
     */
    function finishBatchMint() external;
}
