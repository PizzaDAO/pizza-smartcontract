pragma solidity ^0.6.6;

import '@chainlink/contracts/src/v0.6/VRFConsumerBase.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import '../interfaces/IChainlinkVRFCallbackv6.sol';
import '../interfaces/IChainlinkVRFAdmin.sol';

/**
 * Random Consumer contract interacts with chainlink VRF.
 * This contract is not upgradeable.
 * If new implementations are needed
 * Then a new instance should be deployed.
 */
contract RandomConsumer is VRFConsumerBase, Ownable, IChainlinkVRFAdmin {
    event CallbackContractSet(address callback);

    bytes32 internal keyHash;
    uint256 internal fee;

    address private _callbackContract;

    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 keyHash,
        address callbackContract
    )
        public
        VRFConsumerBase(
            vrfCoordinator, // VRF Coordinator
            linkToken // LINK Token
        )
    {
        keyHash = keyHash;
        // TODO: pass in fee from config
        fee = 0.1 * 10**18; // 0.1 LINK (varies by network)
        _callbackContract = callbackContract;
    }

    // VRFConsumerBase

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(_callbackContract != address(0), 'Callback must be set');
        require(msg.sender == _callbackContract, 'Sender must be callback');
        require(LINK.balanceOf(address(this)) >= fee, 'Not enough LINK');
        return requestRandomness(keyHash, fee, 0);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        IChainlinkVRFCallback(_callbackContract).fulfillRandomness(requestId, randomness);
    }

    // IChainlinkVRFAdmin

    function setCallbackContract(address callback) public override onlyOwner {
        _callbackContract = callback;
        CallbackContractSet(callback);
    }

    // TODO: other functions

    function withdraw() public override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
