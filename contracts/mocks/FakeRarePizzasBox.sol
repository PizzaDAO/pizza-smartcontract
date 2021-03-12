// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../token/RarePizzasBox.sol";

/**
 * @dev a FakeRarePizzasBox is a wrapper exposing modifying contract variables for testing
 */
contract FakeRarePizzasBox is RarePizzasBox {
    function setSaleStartTimestamp(uint256 epochSeconds) public {
        _public_sale_start_timestamp = epochSeconds;
    }
}
