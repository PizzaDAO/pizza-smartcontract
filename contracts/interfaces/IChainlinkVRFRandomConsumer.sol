// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * Public interface for interacting with the VRF Random Consumer Contract
 */
interface IChainlinkVRFRandomConsumer {
    /**
     * Get a random number from the VRF
     */
    function getRandomNumber() external returns (bytes32 requestId);
}
