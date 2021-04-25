// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * Public interface for interacting with rare pizzas seed storage as an administrator
 * All methods should be implemented as onlyOwner
 */
interface IRarePizzasSeedStorageAdmin {
    /**
     * Allows owner to set the authorized requestor address
     */
    function setAuthorizedRequestor(address requestor) external;

    /**
     * Allows owner to set the VRF consumer address
     */
    function setVRFConsumer(address consumer) external;
}
