// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import './RarePizzasBoxV2.sol';
import 'hardhat/console.sol';
import '../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../interfaces/IRarePizzasBoxV2Admin.sol';

contract RarePizzasBoxV3 is RarePizzasBoxV2 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    bytes32 batchMintRequest;
    uint256 public batchMintRandom;
    address[] batchMintUsers;
    batchMintStatus public status;
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

    // 2280506
    // 2269231
    function finishBatchMint() external onlyOwner {
        require(status == batchMintStatus.FETCHED, 'random number must be fetched');
        uint256 random = batchMintRandom;
        for (uint256 i = 0; i < batchMintUsers.length; i++) {
            //console.log((random**i) % 100, 'the box id');
            uint256 id = _getNextPizzaTokenId();
            _safeMint(batchMintUsers[i], id);
            _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random + i)))) % 100);
            // _assignBoxArtwork(id, random**(i + 1) % 100);
            // _safeMint(batchMintUsers[i], (uint256(keccak256(abi.encode(random + i)))) % 100);
            // _safeMint(batchMintUsers[i], random**(i + 1) % 100);
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
