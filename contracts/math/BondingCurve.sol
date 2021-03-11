// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BondingCurve {
    uint256 constant oneEth = 10**18;
    uint256 constant MAX_CURVE = 10 * 1000;

    // Approximate .001x^2+.000 000 000 000 000 000 000 000 0000999x^{8}
    function curve(uint256 n) public pure returns (uint256) {
        require(n > 0, "BondingCurve: starting position cannot be zero");
        require(n <= MAX_CURVE, "BondingCurve: cannot go past MAX_CURVE value");

        uint256 term1 = n * oneEth / 10**4;
        uint256 term2 = oneEth * n**8 * (MAX_CURVE - 1) / 10**32;

        return term1 + term2;
    }
}
