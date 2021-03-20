// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

/**
 * Admin interface for interacting with the VRF Random Consumer Contract
 * All methods should be implemented as onlyOwner
 */
interface IChainlinkVRFAdmin {
    /**
     * Owner can set the callback contract
     */
    function setCallbackContract(address callback) external;

    // TODO:
    // function setFee(uint256 fee) external;

    // function withdrawLink() external;

    function withdraw() external;
}
