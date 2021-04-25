// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRarePizzasAdmin {
    /**
     * Allow owner to redeem a box for a user
     */
    function redeemRarePizzasBoxForOwner(uint256 boxTokenId) external;

    /**
     * Set the contract for the order api client
     */
    function setOrderAPIClient(address orderAPIClient) external;

    /**
     * Set the contract for boxes
     */
    function setRarePizzasBoxContract(address boxContract) external;

    /**
     * Withdraw ether from this contract (Callable by owner)
     */
    function withdraw() external;
}
