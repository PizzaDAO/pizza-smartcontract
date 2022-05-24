// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';

import { RarePizzasBoxV4 } from './RarePizzasBoxV4.sol';
import 'hardhat/console.sol';

contract RarePizzasBoxV42 is RarePizzasBoxV4 {
    using AddressUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeMathUpgradeable for uint256;
    //address minter;
    mapping(uint256 => bool) public claimed;
    function claim(uint256 id) public virtual {
        require(ownerOf(id)==msg.sender,'sender must own for a box');
        require(claimed[id]==false,'id has been claimed');
        require(id<1560,'invalid box for claim');
        claimed[id]=true;
        _queryForClaim(msg.sender, 1);

    }
}
