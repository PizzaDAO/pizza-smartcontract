// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRarePizzasAdmin {
    /**
     * set the contract URI that opensea uses for collections
     */
    function setContractURI(string memory URI) external;

    /**
     * Set the contract for the order api client
     */
    function setOrderAPIClient(address orderAPIClient) external;

    /**
     * Set the contract for boxes
     */
    function setRarePizzasBoxContract(address boxContract) external;

    /**
     * Set the artwork for a specific tokenid (emergencies only)
     */
    function setPizzaArtworkURI(uint256 tokenId, bytes32 uri) external;

    function toggleSaleIsActive() external;

    /**
     * Withdraw ether from this contract (Callable by owner)
     */
    function withdraw() external;
}
