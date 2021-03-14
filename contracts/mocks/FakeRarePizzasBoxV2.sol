// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../token/RarePizzasBox.sol';

/**
 * @dev a FakeRarePizzasBox is a wrapper contract used to demonstrate upgrades
 */
contract FakeRarePizzasBoxV2 is RarePizzasBox {
    uint256[16] private some_v2_storage;

    function getSomeStorage() public view returns (uint256) {
        return some_v2_storage[0];
    }
}
