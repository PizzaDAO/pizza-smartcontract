// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

/**
 * Public interface for interacting with the random consumer
 */
interface IChainlinkVRFCallback {
    /**
     * Callback function called by the VRF consumer with random response
     */
    function fulfillRandomness(bytes32 request, uint256 random) external;
}
