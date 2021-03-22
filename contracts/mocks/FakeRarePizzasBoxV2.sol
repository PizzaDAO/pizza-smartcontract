// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../token/RarePizzasBoxV2.sol';

/**
 * @dev a FakeRarePizzasBox is a wrapper contract used to demonstrate upgrades
 */
contract FakeRarePizzasBoxV2 is RarePizzasBoxV2 {
    uint256[16] private some_v2_storage;

    function getSomeStorage() public view returns (uint256) {
        return some_v2_storage[0];
    }

    // Allow to call setSaleStartTimestamp with any address (not just Owner)
    function setSaleStartTimestamp(uint256 epochSeconds) public override {
        publicSaleStart_timestampInS = epochSeconds;
    }

    // Public function for testing internal function's functionality
    function getBoxArtworkUri(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), 'RAREPIZZA: URI query for nonexistant token');

        return _tokenBoxArtworkURIs[tokenId];
    }
}
