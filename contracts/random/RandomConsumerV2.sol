// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import './VRFCoordinatorV2Interface.sol';
import './VRFConsumerBaseV2.sol';

import './Ownable.sol';

/**
 * Random Consumer contract interacts with chainlink VRF.
 * This contract is not upgradeable.
 * If new implementations are needed
 * Then a new instance should be deployed.
 */
interface IChainlinkVRFCallback2 {
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomness) external;
}

contract RandomConsumerV2 is VRFConsumerBaseV2, Ownable {
    event CallbackContractUpdated(address callback);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event KeyHashUpdated(bytes32 oldKeyHash, bytes32 newKeyHash);
    VRFCoordinatorV2Interface COORDINATOR;
    bytes32 public _keyHash;

    address internal _callbackContract;
    address public vrfCoordinator;
    uint64 public _s_subscriptionId;

    uint32 public callbackGasLimit = 2500000;

    // The default is 3, but you can set this higher.
    uint16 public requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 public numWords = 2;

    constructor(
        address vrfCoordinator,
        bytes32 keyHash,
        address callbackContract,
        uint64 s_subscriptionId
    ) public VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        _keyHash = keyHash;

        _callbackContract = callbackContract;
        _s_subscriptionId = s_subscriptionId;
    }

    function requestRandomWords() external virtual returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        require(_callbackContract != address(0), 'Callback must be set');
        require(msg.sender == _callbackContract, 'Sender must be callback');

        requestId = COORDINATOR.requestRandomWords(
            _keyHash,
            _s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomness) internal virtual override {
        IChainlinkVRFCallback2(_callbackContract).fulfillRandomWords(requestId, randomness);
    }

    // IChainlinkVRFAdmin
    function setNumWords(uint16 n) public onlyOwner {
        numWords = 2;
    }

    function setRequestConfirmation(uint16 r) public onlyOwner {
        requestConfirmations = r;
    }

    function setCallbackGasLimit(uint32 l) public onlyOwner {
        callbackGasLimit = l;
    }

    function setCallbackContract(address callback) public onlyOwner {
        _callbackContract = callback;
        emit CallbackContractUpdated(callback);
    }

    function setSubscription(uint64 sub) public onlyOwner {
        _s_subscriptionId = sub;
    }

    function setKeyHash(bytes32 keyHash) public onlyOwner {
        bytes32 oldHash = _keyHash;
        _keyHash = keyHash;
        emit KeyHashUpdated(oldHash, _keyHash);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
