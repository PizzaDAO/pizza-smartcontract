// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";

contract BondingCurve {
    uint256 constant one = 10**18;

    // Approximate .001x^2+.000 000 000 000 000 000 000 000 0000999x^{8}
    function curve(uint256 n) public view returns (uint256) {
        uint256 term1 = ((n * one) / 10**4);
        uint256 term2 = ((one * n * n * n * n * n * n * n * n * 9999) / 10**32);
        return term1 + term2;
    }
}
