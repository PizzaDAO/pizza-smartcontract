// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BondingCurve {
    uint256 constant oneEth = 10**18;
    uint256 constant oneGwei = 10**4;
    uint256 constant MAX_CURVE = 8750;
    uint256 constant TIER1 = ((501 * oneEth) / 10**4);
    uint256 constant TIER2 = TIER1 + ((250 * oneEth) / 10**3);
    uint256 constant TIER3 = TIER2 + ((250 * oneEth) / 10**3);
    uint256 constant TIER4 = TIER3 + ((250 * oneEth) / 10**3);
    uint256 constant TIER5 = TIER4 + ((500 * oneEth) / 10**3);

    function curve(uint256 n) public pure returns (uint256 price) {
        require(n > 0, 'BondingCurve: starting position cannot be zero');
        require(n <= MAX_CURVE, 'BondingCurve: cannot go past MAX_CURVE value');
        // x+.0001
        if (n <= 2500) {
            return ((2 * n * oneEth) / (10**5)) + oneEth / 10**4;
        }
        if (n > 2500 && n <= 5000) {
            return TIER1 + ((4 * n * oneEth) / (10**5));
        }
        if (n > 5000 && n <= 7500) {
            return TIER2 + ((n * oneEth) / (10**4));
        }
        if (n > 7500 && n <= 8000) {
            return TIER3 + ((5 * n * oneEth) / (10**4));
        }
        if (n > 8000 && n <= 8500) {
            return TIER4 + ((n * oneEth) / (10**3));
        }
        if (n > 8500 && n <= 8750) {
            return TIER5 + ((3 * n * oneEth) / (10**3));
        }
    }
}
