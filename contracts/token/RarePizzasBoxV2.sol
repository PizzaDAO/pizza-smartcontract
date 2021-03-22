// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBox.sol';

import '../interfaces/IChainlinkVRFRandomConsumer.sol';
import '../interfaces/IRarePizzasBoxV2Admin.sol';

/**
 * Public interface for interacting with rare pizzas box V2
 */
interface IChainlinkVRFCallback {
    /**
     * Callback function called by the VRF consumer with random response
     */
    function fulfillRandomness(bytes32 request, uint256 random) external;
}

contract RarePizzasBoxV2 is RarePizzasBox, IChainlinkVRFCallback, IRarePizzasBoxV2Admin {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    // V2 Variables (do not modify this section when upgrading)

    event VRFConsumerUpdated(address oldConsumer, address newConsumer);
    event InternalArtworkAssigned(uint256 tokenId, uint256 artworkURI);

    address internal _chainlinkVRFConsumer;
    mapping(bytes32 => address) internal _purchaseID;

    // END V2 Variables

    // IChainlinkVRFCallback

    function fulfillRandomness(bytes32 request, uint256 random) external override {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
        address to = _purchaseID[request];

        require(to != address(0), 'purchase must exist');

        uint256 id = _getNextPizzaTokenId();
        _safeMint(to, id);
        _assignBoxArtwork(id, random);
    }

    // IRarePizzasBox V1 Overrides

    function purchase() public payable virtual override {
        require(
            block.timestamp >= publicSaleStart_timestampInS ||
                (_presalePurchaseCount[msg.sender] < _presaleAllowed[msg.sender]),
            "sale hasn't started"
        );
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'exceeds supply.');

        uint256 price = getPrice();
        require(msg.value >= price, 'price too low');
        payable(msg.sender).transfer(msg.value - price);

        // Presale addresses can purchase up to X total
        _presalePurchaseCount[msg.sender] += 1;
        _purchased_pizza_count.increment();
        _externalMintWithArtwork(msg.sender); // V2: mint using external randomness

        // BUY ONE GET ONE FREE!
        if (_purchased_pizza_count.current().add(1) == MAX_PURCHASABLE_SUPPLY) {
            _presalePurchaseCount[msg.sender] += 1;
            _purchased_pizza_count.increment();
            _externalMintWithArtwork(msg.sender); // V2: mint using external randomness
        }
    }

    // IRarePizzasBoxV2Admin

    function setVRFConsumer(address consumer) public virtual override onlyOwner {
        address old = _chainlinkVRFConsumer;
        _chainlinkVRFConsumer = consumer;
        emit VRFConsumerUpdated(old, _chainlinkVRFConsumer);
    }

    // Internal Stuff

    function _assignBoxArtwork(uint256 tokenId, uint256 random) internal virtual {
        uint256 pseudoRandom = random % BOX_LENGTH;
        _tokenBoxArtworkURIs[tokenId] = pseudoRandom;
    }

    /**
     * override replaces the previous block hash with the difficulty
     */
    function _assignBoxArtwork(uint256 tokenId) internal override {
        uint256 pseudoRandom =
            uint256(keccak256(abi.encodePacked(blockhash(block.difficulty - 1), tokenId, msg.sender))) % BOX_LENGTH;
        _tokenBoxArtworkURIs[tokenId] = pseudoRandom;
        // this function should only be called from owner or as a fallback
        // so emit an event whenever it is called
        emit InternalArtworkAssigned(tokenId, pseudoRandom);
    }

    function _externalMintWithArtwork(address to) internal virtual {
        if (_chainlinkVRFConsumer != address(0)) {
            try IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber() returns (bytes32 requestId) {
                _purchaseID[requestId] = to;
                // pizza box is out for delivery
                return;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // contract doesnt implement interface, use fallback
                } else {
                    //we got an error and dont care, use fallback
                }
            }
        }

        // fallback to the block-based implementation
        _internalMintWithArtwork(to);
    }
}
