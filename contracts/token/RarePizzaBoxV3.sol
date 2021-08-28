// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBoxV2.sol';
import 'hardhat/console.sol';
import '../interfaces/IChainlinkVRFRandomConsumer.sol';
import '../interfaces/IRarePizzasBoxV2Admin.sol';

interface ISlice {
    function externalSliceMint(address to, uint256 id) external returns (bool);
}

contract RarePizzasBoxV3 is RarePizzasBoxV2 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    // V3 Variables (do not modify this section when upgrading)

    mapping(bytes32 => bool) public isSliceQuery;
    //mapping(uint256 => uint256) public sliceType;
    uint256 public availableSlices;
    uint256[] public slicedBoxes;
    address public sliceAddress;
    bool public isBoxMinting;
    // END V3 Variables
    mapping(uint256 => address[]) public sliceHolders;
    uint256 public slicePrice;
    uint256 public currentSliceID;

    // IChainlinkVRFCallback
    function getSliceHolders(uint256 s) public view returns (address[] memory) {
        return sliceHolders[s];
    }

    function fulfillRandomness(bytes32 request, uint256 random) external override {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');

        if (isSliceQuery[request]) {
            //uint winner=random % 8;
            address to = sliceHolders[_purchased_pizza_count.current()][random % 8];
            _safeMint(to, currentSliceID);
            _assignBoxArtwork(currentSliceID, random);
        } else {
            address to = _purchaseID[request];

            require(to != address(0), 'purchase must exist');
            uint256 id = _getNextPizzaTokenId();
            _safeMint(to, id);
            _assignBoxArtwork(id, random);
        }
        isBoxMinting = false;
    }

    function overrideSliceMinting() public onlyOwner {
        isBoxMinting = false;
    }

    function setSliceAddress(address a) public onlyOwner {
        sliceAddress = a;
    }

    function _mintNewSlice(
        address to,
        uint256 id,
        uint256 random
    ) internal {
        //uint256 pseudoRandom = random % BOX_LENGTH;

        //sliceType[id] = pseudoRandom;

        //currentSliceID=((slicedBoxes.length+1)*1000)+pseudoRandom;
        //slicedBoxes.push(currentSliceID);
        //availableSlices=7;
        bool result = ISlice(sliceAddress).externalSliceMint(to, _purchased_pizza_count.current());
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
        // require(sliceQueried==false,"a slice is currently queried");
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY - 1, 'exceeds supply.');
        if (availableSlices == 0) {
            slicePrice = getPrice() / 8;
            require(msg.value >= slicePrice, 'price too low');
            payable(msg.sender).transfer(msg.value - slicePrice);

            availableSlices = 8;
            _purchased_pizza_count.increment();
            currentSliceID = _purchased_pizza_count.current();
            sliceHolders[currentSliceID].push(msg.sender);
            _mintSlice(msg.sender, currentSliceID);
        } else {
            uint256 price = slicePrice / 8;
            require(msg.value >= price, 'price too low');
            payable(msg.sender).transfer(msg.value - price);
            sliceHolders[currentSliceID].push(msg.sender);
            if (availableSlices == 1) {
                _externalSliceQuery();
            }
            _mintSlice(msg.sender, currentSliceID);
        }

        // Presale addresses can purchase up to X total
    }

    /**
     * override replaces the previous block hash with the difficulty
     */

    function _externalSliceQuery() internal virtual {
        if (_chainlinkVRFConsumer != address(0)) {
            try IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber() returns (bytes32 requestId) {
                //_purchaseID[requestId] = to;
                isSliceQuery[requestId] = true;
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
        // _internalMintWithArtwork(to);
    }
}
