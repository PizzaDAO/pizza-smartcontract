// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";

interface IOpenSeaCompatible is IERC721MetadataUpgradeable {
    /**
     * Get the contract metadata
     */
    function contractURI() external view returns (string memory);
}
