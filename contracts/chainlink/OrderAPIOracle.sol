// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

import '@chainlink/contracts/src/v0.6/Oracle.sol';

import '../interfaces/IOracleAdmin.sol';

/**
 * extension of the Chainlink Oracle contract
 */
contract OrderAPIOracle is Oracle, IOracleAdmin {
    /**
     * @notice Deploy with the address of the LINK token
     * @dev Sets the LinkToken address for the imported LinkTokenInterface
     * @param linkTokenAddress The address of the LINK token
     */
    constructor(address linkTokenAddress) public Oracle(linkTokenAddress) {}

    // IOracleAdmin
    /**
     * Allow withdrawing any ETH that makes it into this contract
     */
    function withdraw() public override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
