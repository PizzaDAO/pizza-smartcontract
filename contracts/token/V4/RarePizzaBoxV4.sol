// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '../../libraries/MerkleProof.sol';
import { RarePizzasBoxV3Fix } from './RarePizzasBoxV3.sol';

import '../../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../../interfaces/IRarePizzasBoxV3Admin.sol';

interface randomV2 {
    function requestRandomWords() external returns (uint256 requestId);
}

contract RarePizzasBoxV4 is RarePizzasBoxV3Fix {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    using MerkleProof for bytes32;
    uint256 public constant price = 0.08 ether;

    uint256 public maxNewPurchases;
    uint256 public totalNewPurchases;
    bytes32 public preSaleWhitelist;
    bytes32 public claimWhiteList;
    uint256 public multiPurchaseLimit;
    mapping(address => bool) public claimed;
    mapping(uint256 => Claim) public claims;

    struct Claim {
        address to;
        uint256 amount;
    }
    event claimStarted(uint256 id, address to, uint256 amount);
    event claimCompleted(uint256 id, address to, uint256 amount);
    event Gift(address a, uint256 n);

    //fulfillRandomWords
    function fulfillRandomWords(uint256 request, uint256[] memory random) external {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
        if (bytes32(request) == batchMintRequest) {
            for (uint256 i = 0; i < batchMintUsers.length; i++) {
                // iterate over the count
                for (uint256 j = 0; j < batchMintCount; j++) {
                    uint256 id = _getNextPizzaTokenId();
                    _minted_pizza_count.increment();

                    _safeMint(batchMintUsers[i], id);
                    _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0], i)))) % BOX_LENGTH);
                }
            }
            batchMintCount = 0;
            status = batchMintStatus.OPEN;
        } else {
            address to = claims[request].to;
            uint256 amount = claims[request].amount;
            require(to != address(0), 'purchase must exist');

            for (uint256 i = 0; i < amount; i++) {
                // iterate over the count

                uint256 id = _getNextPizzaTokenId();
                _minted_pizza_count.increment();

                _safeMint(to, id);
                _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0], i)))) % BOX_LENGTH);
            }
            claims[request].amount = 0;
            claims[request].to = address(0);
            emit claimCompleted(request, to, amount);
        }
    }

    function gift(address toPizzaiolo, uint256 count) public onlyOwner {
        require(toPizzaiolo != address(0), 'dont be silly');
        require(count > 0, 'need a number');
        require(totalSupply().add(count) <= maxSupply(), 'would exceed supply.');
        require(_minted_pizza_count.current().add(count) <= MAX_MINTABLE_SUPPLY, 'would exceed mint');

        for (uint256 i = 0; i < count; i++) {
            _minted_pizza_count.increment();
            _internalMintWithArtwork(toPizzaiolo);
        }

        emit Gift(toPizzaiolo, count);
    }

    function setmultiPurchaseLimit(uint256 n) public onlyOwner {
        multiPurchaseLimit = n;
    }

    function setSaleWhitelist(bytes32 b) public onlyOwner {
        preSaleWhitelist = b;
    }

    function setclaimWhiteList(bytes32 b) public onlyOwner {
        claimWhiteList = b;
    }

    function setMaxNewPurchases(uint256 n) public onlyOwner {
        maxNewPurchases = n;
    }

    function getPrice() public view virtual override returns (uint256) {
        return price;
    }

    function multiPurchase(uint256 n) public payable virtual {
        require(
            block.timestamp >= publicSaleStart_timestampInS ||
                (_presalePurchaseCount[msg.sender] < _presaleAllowed[msg.sender]),
            "sale hasn't started"
        );
        require(n <= multiPurchaseLimit && n >= 1, 'max purchase of 15 boxes');
        require(msg.value >= n.mul(price), 'price too low');
        if (msg.value > (n * price)) {
            payable(msg.sender).transfer(msg.value - (n * price));
        }

        _multiPurchase(n);
    }

    function _multiPurchase(uint256 n) internal virtual {
        require(n > 0, 'must purchase more than one box');
        require(totalNewPurchases.add(n) <= maxNewPurchases, 'new purchase must be less than max');
        require(totalSupply().add(n) <= MAX_TOKEN_SUPPLY, 'exceeds supply.');
        totalNewPurchases += n;

        // Presale addresses can purchase up to X total
        _presalePurchaseCount[msg.sender] += n;

        for (uint256 i = 0; i < n; i++) {
            _purchased_pizza_count.increment();
        }

        _queryForClaim(msg.sender, n);
    }

    function prePurchase(bytes32[] memory proof, uint256 n) public payable virtual {
        validateUser(proof, preSaleWhitelist, msg.sender);
        require(n <= multiPurchaseLimit && n >= 1, 'max purchase of 15 boxes');
        require(msg.value >= n.mul(price), 'price too low');
        if (msg.value > (n * price)) {
            payable(msg.sender).transfer(msg.value - (n * price));
        }

        _multiPurchase(n);
    }

    function claim(bytes32[] memory proof, uint256 amount) public virtual {
        validateUserAmount(proof, claimWhiteList, msg.sender, amount);
        _queryForClaim(msg.sender, amount);
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
        uint256 requestId = randomV2(_chainlinkVRFConsumer).requestRandomWords();
        claims[requestId] = Claim(a, c);
        emit claimStarted(requestId, a, c);
    }

    function _queryForBatch() internal virtual override {
        require(_chainlinkVRFConsumer != address(0), 'vrf not set');
        uint256 requestId = randomV2(_chainlinkVRFConsumer).requestRandomWords();
        batchMintRequest = bytes32(requestId);
        status = batchMintStatus.QUEUED;
    }
}
