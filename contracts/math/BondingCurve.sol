// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BondingCurve {
    uint256 constant one = 10**18;
    uint256 constant MAX_CURVE = 9999;

    // Approximate .001x^2+.000 000 000 000 000 000 000 000 0000999x^{8}
    function curve(uint256 n) public view returns (uint256) {
        uint256 term1 = ((n * one) / 10**4);
        uint256 term2 = ((one * n**8 * MAX_CURVE) / 10**32);
        return term1 + term2;
    }
}
