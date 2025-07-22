// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../random/RandomConsumerV2.sol';

contract FakeRandomV2Sequential is RandomConsumerV2 {
  bytes32 public testHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
  uint256 public nextRequestId = 1; // Sequential counter starting at 1

  constructor(
    address vrfCoordinator,
    bytes32 keyHash,
    address callbackContract
  ) public RandomConsumerV2(vrfCoordinator, keyHash, callbackContract, 88) {}

  // Mock Override - returns sequential IDs instead of hardcoded 7777
  function requestRandomWords() public override returns (uint256 requestId) {
    require(_callbackContract != address(0), 'Callback must be set');
    requestId = nextRequestId;
    nextRequestId++; // Increment for next request
  }

  // Testing function - same as original
  function fulfillRandomWordsWrapper(uint256 requestId, uint256[] memory randomness) public {
    super.fulfillRandomWords(requestId, randomness);
  }
}
