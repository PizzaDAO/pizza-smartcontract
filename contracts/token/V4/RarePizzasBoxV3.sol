// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBoxV2.sol';
import 'hardhat/console.sol';
import '../../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../../interfaces/IRarePizzasBoxV3Admin.sol';

contract RarePizzasBoxV3Fix is RarePizzasBoxV2Fix, IRarePizzasBoxV3Admin {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;

    // V3 Variables (do not modify this section when upgrading)

    bytes32 batchMintRequest;
    uint256 public batchMintRandom;
    address[] batchMintUsers;
    batchMintStatus public status;

    uint256 public batchMintCount;

    enum batchMintStatus {
        OPEN,
        QUEUED,
        FETCHED
    }

    // END V3 Variables

    function fulfillRandomness(bytes32 request, uint256 random) external virtual override {
        /* require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
        if (request == batchMintRequest) {
            // The batch mint workflow
            batchMintRandom = random;
            status = batchMintStatus.FETCHED;
        } else {
            // the purchase workflow
            address to = _purchaseID[request];

            require(to != address(0), 'purchase must exist');

            uint256 id = _getNextPizzaTokenId();
            _safeMint(to, id);
            _assignBoxArtwork(id, random);
        }
        **/
    }

    // IRarePizzasBoxV3Admin

    function startBatchMint(address[] calldata users, uint256 count) external virtual override onlyOwner {
        require(_minted_pizza_count.current().add(users.length.mul(count)) <= MAX_MINTABLE_SUPPLY, 'would exceed mint');
        require(status == batchMintStatus.OPEN, 'minting has been queued');

        batchMintCount = count;
        batchMintUsers = users;
        _queryForBatch();
    }

    function finishBatchMint() external virtual override onlyOwner {
        /**  require(status == batchMintStatus.FETCHED, 'vrf must be fetched');

        uint256 random = batchMintRandom;

        // iterate over the addresses
        for (uint256 i = 0; i < batchMintUsers.length; i++) {
            // iterate over the count
            for (uint256 j = 0; j < batchMintCount; j++) {
                uint256 id = _getNextPizzaTokenId();
                _minted_pizza_count.increment();

                _safeMint(batchMintUsers[i], id);
                _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random + i)))) % BOX_LENGTH);
            }
        }
        batchMintCount = 0;
        status = batchMintStatus.OPEN;
        **/
    }

    function _queryForBatch() internal virtual {
        require(_chainlinkVRFConsumer != address(0), 'vrf not set');
        bytes32 requestId = IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber();
        batchMintRequest = requestId;
        status = batchMintStatus.QUEUED;
    }
}
