// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBoxV2.sol';

import '../interfaces/IChainlinkVRFRandomConsumer.sol';
import '../interfaces/IRarePizzasBoxV2Admin.sol';

contract RarePizzasBoxV3 is RarePizzasBoxV2 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    bytes32 batchMintRequest;
    uint256 public batchMintRandom;
    address[] batchMintUsers;
    batchMintStatus status;
    enum batchMintStatus {
        OPEN,
        QUEUED,
        FETCHED
    }

    function fulfillRandomness(bytes32 request, uint256 random) external virtual override {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
        if (request == batchMintRequest) {
            batchMintRandom = random;
            status = batchMintStatus.FETCHED;
        } else {
            address to = _purchaseID[request];

            require(to != address(0), 'purchase must exist');

            uint256 id = _getNextPizzaTokenId();
            _safeMint(to, id);
            _assignBoxArtwork(id, random);
        }
    }

    // V2 Variables (do not modify this section when upgrading)
    function startBatchMint(address[] calldata users) external onlyOwner {
        require(status == batchMintStatus.OPEN, 'minting has been queued');

        batchMintUsers = users;
        _queryForBatch();
    }

    function finishBatchMint() external onlyOwner {
        require(status == batchMintStatus.FETCHED, 'minting has been queued');
        uint256 random = batchMintRandom;
        for (uint256 i = 0; i < batchMintUsers.length; i++) {
            _safeMint(batchMintUsers[i], (random**i) % 100);
        }
        status = batchMintStatus.OPEN;
    }

    function _queryForBatch() internal virtual {
        require(_chainlinkVRFConsumer != address(0));
        bytes32 requestId = IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber();
        batchMintRequest = requestId;
        status = batchMintStatus.QUEUED;
    }
}
