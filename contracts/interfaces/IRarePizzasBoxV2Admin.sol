// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './IRarePizzasBoxAdmin.sol';

/**
 * Public interface for interacting with rare pizzas box V2 as an administrator
 * All methods should be implemented as onlyOwner
 */
interface IRarePizzasBoxV2Admin is IRarePizzasBoxAdmin {
    /**
     * Allows owner to set the VRF consumer address
     */
    function setVRFConsumer(address consumer) external;
}
