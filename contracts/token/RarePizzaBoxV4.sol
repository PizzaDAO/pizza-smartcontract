// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '../libraries/MerkleProof.sol';
import { RarePizzasBoxV3 } from './RarePizzasBoxV3.sol';

import '../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../interfaces/IRarePizzasBoxV3Admin.sol';

contract RarePizzasBoxV4 is RarePizzasBoxV3 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    using MerkleProof for bytes32;
    uint256 public constant price = 0.0125 ether;
    uint256 public constant presalePrice = 0.08 ether;
    bytes32 public preSaleWhitelist;
    bytes32 public claimWhiteList;

    mapping(address => bool) public claimed;
    mapping(bytes32 => Claim) public claims;
    enum claimStatus {
        UNINITIALIZED,
        QUEUED,
        FETCHED,
        COMPLETED
    }
    struct Claim {
        address to;
        uint256 amount;
        uint256 random;
        claimStatus status;
    }
    event claimStarted(bytes32 id, address to, uint256 amount);

    function fulfillRandomness(bytes32 request, uint256 random) external virtual override {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');

        if (request == batchMintRequest) {
            // The batch mint workflow
            batchMintRandom = random;
            status = batchMintStatus.FETCHED;
        } else {
            if (claims[request].status == claimStatus.QUEUED && claims[request].amount > 0) {
                claims[request].random = random;
                claims[request].status = claimStatus.FETCHED;
            } else {
                address to = _purchaseID[request];

                require(to != address(0), 'purchase must exist');

                uint256 id = _getNextPizzaTokenId();
                _safeMint(to, id);
                _assignBoxArtwork(id, random);
            }
        }
    }

    function purchase() public payable virtual override {
        require(
            block.timestamp >= publicSaleStart_timestampInS ||
                (_presalePurchaseCount[msg.sender] < _presaleAllowed[msg.sender]),
            "sale hasn't started"
        );
        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'exceeds supply.');

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

    function prePurchase(bytes32[] memory proof) public payable virtual {
        validateUser(proof, preSaleWhitelist, msg.sender);

        require(totalSupply().add(1) <= MAX_TOKEN_SUPPLY, 'exceeds supply.');

        require(msg.value >= presalePrice, 'price too low');
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

    function claim(bytes32[] memory proof, uint256 amount) public virtual {
        validateUserAmount(proof, claimWhiteList, msg.sender, amount);
        _queryForClaim(msg.sender, amount);
    }

    function completeClaim(bytes32 _id) external virtual {
        require(claims[_id].status == claimStatus.FETCHED, 'random must be fetched');
        claims[_id].status = claimStatus.COMPLETED;
        for (uint256 i = 0; i < claims[_id].amount; i++) {
            // iterate over the count

            uint256 id = _getNextPizzaTokenId();
            _minted_pizza_count.increment();

            _safeMint(claims[_id].to, id);
            _assignBoxArtwork(id, (uint256(keccak256(abi.encode(claims[_id].random + i)))) % BOX_LENGTH);
        }
    }

    function validateUserAmount(
        bytes32[] memory merkleProof,
        bytes32 root,
        address a,
        uint256 amount
    ) internal {
        require(
            MerkleProof.verify(merkleProof, root, keccak256(abi.encodePacked(a, amount))),
            'Address does not exist in list'
        );
        require(claimed[a] == false, 'user cannot claim twice');
        claimed[a] = true;
    }

    function validateUser(
        bytes32[] memory merkleProof,
        bytes32 root,
        address a
    ) internal {
        require(
            MerkleProof.verify(merkleProof, root, keccak256(abi.encodePacked(a))),
            'Address does not exist in list'
        );
    }

    function _queryForClaim(address a, uint256 c) internal virtual {
        require(_chainlinkVRFConsumer != address(0), 'vrf not set');
        bytes32 requestId = IChainlinkVRFRandomConsumer(_chainlinkVRFConsumer).getRandomNumber();
        claims[requestId] = Claim(a, c, 0, claimStatus.QUEUED);
    }
}
