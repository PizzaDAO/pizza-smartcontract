// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BondingCurve {
    uint256 constant oneEth = 10**18;
    uint256 constant oneGwei = 10**4;
    uint256 constant MAX_CURVE = 8750;
    uint256 constant TIER0 = (oneEth / oneGwei);
    uint256 constant TIER1 = ((126 * oneEth) / oneGwei);
    uint256 constant TIER2 = ((376 * oneEth) / oneGwei);
    uint256 constant TIER3 = ((1626 * oneEth) / oneGwei);
    uint256 constant TIER4 = ((2126 * oneEth) / oneGwei);

    function curve(uint256 n) public pure returns (uint256 price) {
        require(n > 0, 'BondingCurve: starting position cannot be zero');
        require(n <= MAX_CURVE, 'BondingCurve: cannot go past MAX_CURVE value');
        uint256 nInEth = (n * oneEth);
        if (n <= 2500) {
            return TIER0 + (nInEth / (2 * 10**5));
        }
        if (n > 2500 && n <= 5000) {
            return TIER1 + (nInEth / (10**5));
        }
        if (n > 5000 && n <= 7500) {
            return TIER2 + ((5 * nInEth) / (10**5));
        }
        if (n > 7500 && n <= 8000) {
            return TIER3 + (nInEth / (10**4));
        }
        if (n > 8000) {
            return TIER4 + ((2 * nInEth) / (10**4));
        }
    }
}
