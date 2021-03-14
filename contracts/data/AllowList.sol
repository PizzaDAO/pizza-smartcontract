// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev a FakeRarePizzasBox is a wrapper exposing modifying contract variables for testing
 */
contract AllowList {

    address allower;

    mapping(address=>uint) public allowed;

    function allow(address[] memory allowedAddresses) public {
        require(msg.sender==allower);
        for(uint i = 0;i<allowedAddresses.length;i++){
            allowed[allowedAddresses[i]] = 10;
        }
    }
}
