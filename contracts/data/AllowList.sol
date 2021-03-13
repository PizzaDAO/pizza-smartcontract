// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev a FakeRarePizzasBox is a wrapper exposing modifying contract variables for testing
 */
library AllowList {
    function allowed(address buyer) internal returns (bool) {
        address[1] memory addresses = [0x102d3B5ca9C8675C20B2F7E2171B3ecDcbe3Fc82];

        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }
}
