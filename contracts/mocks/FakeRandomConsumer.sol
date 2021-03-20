pragma solidity ^0.6.6;

import '@chainlink/contracts/src/v0.6/VRFConsumerBase.sol';

import '../random/RandomConsumer.sol';

/**
 * Mock random consumer is a wrapper around the VRF base contract that returns random stuff
 */
contract FakeRandomConsumer is RandomConsumer {
    bytes32 public testHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        address callbackContract
    ) public RandomConsumer(vrfCoordinator, linkToken, keyHash, callbackContract) {}

    // Mock Overrides

    function getRandomNumber() public override returns (bytes32) {
        require(_callbackContract != address(0), 'Callback must be set');
        return testHash;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        IChainlinkVRFCallback(_callbackContract).fulfillRandomness(requestId, randomness);
    }

    // Test functions

    function setLinkToken(address link) public {
        _linkToken = link;
    }
}
