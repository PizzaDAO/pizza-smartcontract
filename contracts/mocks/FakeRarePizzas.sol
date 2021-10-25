// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../token/RarePizzas.sol';

/**
 * @dev a FakeRarePizzasBox is a wrapper contract used to demonstrate upgrades
 */
contract FakeRarePizzas is RarePizzas {
    function base58EncodeAsString(bytes32 source) public pure returns (string memory) {
        return string(abi.encodePacked(_uriBase, _base58Encode(source)));
    }

    function base58Encode(bytes32 source) public pure returns (bytes memory) {
        return _base58Encode(source);
    }
}
