// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../token/RarePizzasBox.sol';

/**
 * @dev a FakeRarePizzasBox is a wrapper exposing modifying contract variables for testing
 */
contract FakeRarePizzasBox is RarePizzasBox {
    function setSaleStartTimestamp(uint256 epochSeconds) public override {
        publicSaleStart_timestampInS = epochSeconds;
    }

    function getBoxArtworkUri(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), 'RAREPIZZA: URI query for nonexistant token');
        return _tokenBoxArtworkURIs[tokenId];
    }
}
