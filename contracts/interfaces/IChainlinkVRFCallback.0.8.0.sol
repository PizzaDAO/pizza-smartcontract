// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * Public interface for interacting with rare pizzas box V2
 */
interface IChainlinkVRFCallback {
    /**
     * Callback function called by the VRF consumer with random response
     */
    function fulfillRandomness(bytes32 request, uint256 random) external;
}
