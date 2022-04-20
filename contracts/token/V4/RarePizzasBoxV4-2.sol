// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import { RarePizzasBoxV3Fix } from './RarePizzasBoxV3.sol';
import 'hardhat/console.sol';

contract RarePizzasBoxV42 is RarePizzasBoxV3Fix {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    //address minter;
    mapping(address => bool) public isMinter;

    function mint(address to, uint256 random) external virtual {
        require(isMinter[msg.sender] == true, 'only can be called minted by authorized contract');
        uint256 id = _getNextPizzaTokenId();
        _safeMint(to, id);
        _assignBoxArtwork(id, random);
    }

    function toggleMinter(address a) public onlyOwner {
        isMinter[a] = !isMinter[a];
    }
}
