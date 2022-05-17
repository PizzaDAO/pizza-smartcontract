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
    function requestRandomWords() external returns (bytes32);
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
    }
    event claimStarted(bytes32 id, address to, uint256 amount);
    event claimCompleted(bytes32 id, address to, uint256 amount);

    function fulfillRandomWords(bytes32 request, uint256[] memory random) external {
        require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');

        address to = claims[request].to;

        require(to != address(0), 'purchase must exist');

        for (uint256 i = 0; i < claims[request].amount; i++) {
            // iterate over the count

            uint256 id = _getNextPizzaTokenId();
            _minted_pizza_count.increment();

            _safeMint(to, id);
            _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0] + i)))) % BOX_LENGTH);
        }
        emit claimCompleted(request, claims[request].to, claims[request].amount);
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
        require(n <= 15 && n >= 0, 'max purchase of 15 boxes');
        require(msg.value >= n.mul(price), 'price too low');
        payable(msg.sender).transfer(msg.value.sub(n.mul(price)));
        _multiPurchase(n);
    }

    function _multiPurchase(uint256 n) internal virtual {
        require(totalNewPurchases.add(n) < maxNewPurchases, 'new purchase must be less than max');
        require(totalSupply().add(n) <= MAX_TOKEN_SUPPLY, 'exceeds supply.');
        totalNewPurchases += n;

        // Presale addresses can purchase up to X total
        _presalePurchaseCount[msg.sender] += n;
        for (uint256 i = 0; i < n; i++) {
            _purchased_pizza_count.increment();
        }

        _queryForClaim(msg.sender, n);

        // BUY ONE GET ONE FREE!
        if (_purchased_pizza_count.current().add(n) == MAX_PURCHASABLE_SUPPLY) {
            _presalePurchaseCount[msg.sender] += 1;
            _purchased_pizza_count.increment();
            _externalMintWithArtwork(msg.sender); // V2: mint using external randomness
        }
    }

    function prePurchase(bytes32[] memory proof, uint256 n) public payable virtual {
        validateUser(proof, preSaleWhitelist, msg.sender);

        require(msg.value >= n.mul(price), 'price too low');
        payable(msg.sender).transfer(msg.value.sub(n.mul(price)));
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
        bytes32 requestId = randomV2(_chainlinkVRFConsumer).requestRandomWords();
        claims[requestId] = Claim(a, c);
        emit claimStarted(requestId, a, c);
    }
}
