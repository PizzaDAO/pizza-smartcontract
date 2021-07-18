// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';

import '../interfaces/IChainlinkVRFCallback.0.8.0.sol';
import '../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../interfaces/IRarePizzasSeedStorageAdmin.sol';

/**
 * Contract requests random numbers from VRF and then emits them as events
 */
contract RarePizzasSeedStorage is OwnableUpgradeable, IChainlinkVRFCallback, IRarePizzasSeedStorageAdmin {
    IChainlinkVRFRandomConsumer internal _chainlinkVRFConsumer;
    address internal _authorizedRequestor;

    uint256 private _fallbackRandomSeed;

    mapping(bytes32 => uint256) public pizzaSeeds;
    mapping(bytes32 => bytes32) internal _randomRequestsForJobs;

    event VRFConsumerUpdated(address oldConsumer, address newConsumer);
    event AuthorizedRequestorUpdated(address oldRequestor, address newRequestor);
    event PizzaRandomSeedCreated(bytes32 jobId, uint256 randomSeed);

    function initialize(address authorizedRequestor) public initializer {
        __Ownable_init();

        // set the address of the authorized requestor
        if (authorizedRequestor != address(0)) {
            _authorizedRequestor = authorizedRequestor;
        }
    }

    // IChainlinkVRFCallback

    function fulfillRandomness(bytes32 request, uint256 random) external virtual override {
        require(msg.sender == address(_chainlinkVRFConsumer), 'caller not VRF');
        bytes32 jobId = _randomRequestsForJobs[request];
        require(jobId != 0, 'request must exist');
        _setSeed(jobId, random);
    }

    // Pizza Random Seed

    function getPizzaSeed(bytes32 jobId) external view returns (uint256) {
        return pizzaSeeds[jobId];
    }

    // TODO: add to an interface

    function getRandomNumber(bytes32 jobId) external virtual {
        require(msg.sender == _authorizedRequestor, 'caller not authorized');

        if (address(_chainlinkVRFConsumer) != address(0)) {
            try _chainlinkVRFConsumer.getRandomNumber() returns (bytes32 requestId) {
                _randomRequestsForJobs[requestId] = jobId;
                // request it out
                return;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // contract doesnt implement interface, use fallback
                } else {
                    //we got an error and dont care, use fallback
                }
            }
        }

        uint256 pseudoRandom = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    blockhash(block.difficulty - 1),
                    block.number,
                    jobId,
                    _fallbackRandomSeed,
                    msg.sender
                )
            )
        );
        _fallbackRandomSeed = pseudoRandom;
        _setSeed(jobId, pseudoRandom);
    }

    // Admin functions

    function setAuthorizedRequestor(address requestor) public virtual override onlyOwner {
        address old = _authorizedRequestor;
        _authorizedRequestor = requestor;
        emit AuthorizedRequestorUpdated(old, _authorizedRequestor);
    }

    function setVRFConsumer(address consumer) public virtual override onlyOwner {
        address old = address(_chainlinkVRFConsumer);
        _chainlinkVRFConsumer = IChainlinkVRFRandomConsumer(consumer);
        emit VRFConsumerUpdated(old, address(_chainlinkVRFConsumer));
    }

    function setFallbackRandomSeed(uint256 fallbackRandomSeed) public virtual override onlyOwner {
        _fallbackRandomSeed = fallbackRandomSeed;
    }

    // Internal Stuff

    function _setSeed(bytes32 jobId, uint256 random) internal virtual {
        pizzaSeeds[jobId] = random;
        emit PizzaRandomSeedCreated(jobId, random);
    }
}
