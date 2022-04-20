// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import { RarePizzasBoxV3 } from './RarePizzasBoxV3.sol';
import 'hardhat/console.sol';

contract RarePizzasBoxV4 is RarePizzasBoxV3 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    address minter;

    function mint(address to, uint256 random) external virtual {
        require(msg.sender == minter, 'only can be called minted by authorized contract');
        uint256 id = _getNextPizzaTokenId();
        _safeMint(to, id);
        _assignBoxArtwork(id, random);
    }
}
