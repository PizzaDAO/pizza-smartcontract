// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBoxV2.sol';

import '../interfaces/IChainlinkVRFRandomConsumer.sol';
import '../interfaces/IRarePizzasBoxV2Admin.sol';

interface ISlice {
    function externalSliceMint(address to, uint256 id) external returns (bool);
}

contract RarePizzasBoxV3 is RarePizzasBoxV2 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    // V2 Variables (do not modify this section when upgrading)

    mapping(bytes32 => bool) public sliceQuery;
    mapping(uint256 => uint256) public sliceType;
    uint256 public availableSlices;
    uint256 public currentSliceID;
    uint256[] public slicedBoxes;
    address public sliceAddress;
    bool public sliceQueried;
    // END V2 Variables

    // IChainlinkVRFCallback

    function fulfillRandomness(bytes32 request, uint256 random) external override {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
        address to = _purchaseID[request];

        require(to != address(0), 'purchase must exist');
        uint256 id = _getNextPizzaTokenId();
        if (sliceQuery[request]) {
            sliceQueried=false;
            _mintNewSlice(to, id, random);
        } else {
            _safeMint(to, id);
            _assignBoxArtwork(id, random);
        }
    }
    function setSliceAddress(address a) public {
        sliceAddress=a;
    }
    function _mintNewSlice(
        address to,
        uint256 id,
        uint256 random
    ) internal {
        uint256 pseudoRandom = random % BOX_LENGTH;
        sliceType[id] = pseudoRandom;
        slicedBoxes.push(id);
        currentSliceID=id;
        availableSlices=7;
        bool result = ISlice(sliceAddress).externalSliceMint(to, id);
        require(result, 'slice minting must work');
    }

    function _mintSlice(address to, uint256 id) internal {
        bool result = ISlice(sliceAddress).externalSliceMint(to, id);
        require(result, 'slice minting must work');
        availableSlices -= 1;
    }

    // IRarePizzasBox V1 Overrides
    function purchaseSlice() public payable virtual {
        require(
            block.timestamp >= publicSaleStart_timestampInS ||
                (_presalePurchaseCount[msg.sender] < _presaleAllowed[msg.sender]),
            "sale hasn't started"
        );
        require(sliceQueried==false,"a slice is currently queried");
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY - 1, 'exceeds supply.');

        uint256 price = getPrice() / 8;
        require(msg.value >= price, 'price too low');
        payable(msg.sender).transfer(msg.value - price);

        // Presale addresses can purchase up to X total
        if (availableSlices == 0) {
            _externalSliceQuery(msg.sender);
            sliceQueried=true;
        } else {
            _mintSlice(msg.sender, currentSliceID);
        }
    }

    /**
     * override replaces the previous block hash with the difficulty
     */

    function _externalSliceQuery(address to) internal virtual {
        if (_chainlinkVRFConsumer != address(0)) {
            try IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber() returns (bytes32 requestId) {
                _purchaseID[requestId] = to;
                sliceQuery[requestId] = true;
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
