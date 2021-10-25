// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

interface IOracleAdmin {
    /**
     * Withdraw ether from this contract (Callable by owner)
     */
    function withdraw() external;
}
