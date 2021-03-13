// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev a FakeRarePizzasBox is a wrapper exposing modifying contract variables for testing
 */
contract BoxArt {
    uint256 internal constant BOX_LENGTH = 100;
    uint256 internal constant MAX_BOX_INDEX = 99;

    /**
     * Get the uri for the artwork
     */
    function getUriString(uint256 index) internal pure returns (string memory) {
        string[1] memory assets = ['QmZRkwyUuQxvXbV9LN64X52aeHHBezxXjGFsh5s5eBqGPV'];
        // TODO: do not short circuit
        //require(index < assets.length, 'RAREPIZZA: requested index is out of range');

        return assets[0];
    }
}
