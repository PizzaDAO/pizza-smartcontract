// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBox.sol';

import '../interfaces/IChainlinkVRFCallbackv8.sol';
import '../interfaces/IChainlinkVRFRandomConsumer.sol';
import '../interfaces/IRarePizzasBoxV2Admin.sol';

contract RarePizzasBoxV2 is RarePizzasBox, IChainlinkVRFCallback, IRarePizzasBoxV2Admin {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    // V2 Variables (do not modify this section when upgrading)

    address internal _chainlinkVRFConsumer;
    mapping(bytes32 => address) internal _purchaseID;

    // END V2 Variables

    // IChainlinkVRFCallback

    function fulfillRandomness(bytes32 request, uint256 random) external override {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
        address to = _purchaseID[request];
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
            _externalMintWithArtwork(msg.sender);
        }
    }

    // IRarePizzasBoxV2Admin

    function setVRFConsumer(address consumer) public virtual override onlyOwner {
        _chainlinkVRFConsumer = consumer;
    }

    // Internal Stuff

    function _assignBoxArtwork(uint256 tokenId, uint256 random) internal virtual {
        uint256 pseudoRandom = random % MAX_BOX_INDEX;
        _tokenBoxArtworkURIs[tokenId] = pseudoRandom;
    }

    /**
     * override replaces the previous block hash with the difficulty
     */
    function _assignBoxArtwork(uint256 tokenId) internal override {
        uint256 pseudoRandom =
            uint256(keccak256(abi.encodePacked(blockhash(block.difficulty - 1), tokenId, msg.sender))) % MAX_BOX_INDEX;
        _tokenBoxArtworkURIs[tokenId] = pseudoRandom;
    }

    function _externalMintWithArtwork(address to) internal virtual {
        if (_chainlinkVRFConsumer != address(0)) {
            // TODO: try/catch
            bytes32 queryID = IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber();
            _purchaseID[queryID] = to;
        } else {
            // fallback to the block-based implementation
            _internalMintWithArtwork(to);
        }
    }
}
