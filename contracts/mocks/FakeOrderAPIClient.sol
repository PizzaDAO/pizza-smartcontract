// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import '../chainlink/OrderAPIConsumer.sol';

/**
 * @dev a FakeOrderAPIConsumer is a wrapper contract used to demonstrate function calls
 */
contract FakeOrderAPIConsumer is IOrderAPIConsumer, IOrderAPICallback {
    IOrderAPICallback private _callback;
    uint256 private requestCount = 1;

    mapping(uint256 => bytes32) tokenId_requestIds;

    constructor(address callback) public {
        _callback = IOrderAPICallback(callback);
    }

    function executeRequest(
        address requestor,
        uint256 tokenId,
        uint256 recipeId
    ) public override returns (bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(this, requestCount));
        requestCount += 1;

        tokenId_requestIds[tokenId] = requestId;
        return requestId;
    }

    function getRequestId(uint256 tokenId) public view returns (bytes32) {
        return tokenId_requestIds[tokenId];
    }

    function fulfillResponse(bytes32 requestId, bytes32 result) public override {
        _callback.fulfillResponse(requestId, result);
    }
}
