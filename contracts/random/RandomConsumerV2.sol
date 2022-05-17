// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import './VRFCoordinatorV2Interface.sol';
import './VRFConsumerBaseV2.sol';

import './Ownable.sol';
import './IERC20.sol';

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

    bytes32 internal _keyHash;
    uint256 internal _fee;

    address internal _linkToken;
    address internal _callbackContract;
    uint64 internal _s_subscriptionId;
    address internal vrfCoordinator;

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        uint256 fee,
        address callbackContract,
        uint64 s_subscriptionId
    ) public VRFConsumerBaseV2(vrfCoordinator) {
        _keyHash = keyHash;
        _fee = fee;
        _linkToken = linkToken;
        _callbackContract = callbackContract;
        _s_subscriptionId = s_subscriptionId;
    }

    function requestRandomWords() external virtual returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        require(_callbackContract != address(0), 'Callback must be set');
        require(msg.sender == _callbackContract, 'Sender must be callback');
        require(IERC20(_linkToken).balanceOf(address(this)) > _fee, 'must tokens to cover fee');
        requestId = VRFCoordinatorV2Interface(vrfCoordinator).requestRandomWords(
            _keyHash,
            _s_subscriptionId,
            3,
            2500000,
            3
        );
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomness) internal virtual override {
        IChainlinkVRFCallback2(_callbackContract).fulfillRandomWords(requestId, randomness);
    }

    function getFee() public view returns (uint256) {
        return _fee;
    }

    // IChainlinkVRFAdmin

    function setCallbackContract(address callback) public onlyOwner {
        _callbackContract = callback;
        emit CallbackContractUpdated(callback);
    }

    function setFee(uint256 fee) public onlyOwner {
        uint256 oldFee = _fee;
        _fee = fee;
        emit FeeUpdated(oldFee, _fee);
    }

    function setSubscription(uint64 sub) public onlyOwner {
        _s_subscriptionId = sub;
    }

    function setKeyHash(bytes32 keyHash) public onlyOwner {
        bytes32 oldHash = _keyHash;
        _keyHash = keyHash;
        emit KeyHashUpdated(oldHash, _keyHash);
    }

    function withdrawLink() public onlyOwner {
        uint256 balance = IERC20(_linkToken).balanceOf(address(this));
        IERC20(_linkToken).transfer(msg.sender, balance);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
