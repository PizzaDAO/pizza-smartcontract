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

    /**
     * Owner can set the fee in link
     * fee = 0.1 * 10**18; // 0.1 LINK (varies by network)
     */
    function setFee(uint256 fee) external;

    /**
     * Owner can set the key hash
     */
    function setKeyHash(bytes32 keyHash) external;

    /**
     * Owner can withdraw link from the contract
     */
    function withdrawLink() external;

    /**
     * Owner can withdraw ETH from the contract
     */
    function withdraw() external;
}
