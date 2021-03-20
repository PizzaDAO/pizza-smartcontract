pragma solidity ^0.6.6;

import '@chainlink/contracts/src/v0.6/VRFConsumerBase.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../interfaces/IChainlinkVRFAdmin.sol';

/**
 * Public interface for interacting with rare pizzas box V2
 */
interface IChainlinkVRFCallback {
    /**
     * Callback function called by the VRF consumer with random response
     */
    function fulfillRandomness(bytes32 request, uint256 random) external;
}

/**
 * Random Consumer contract interacts with chainlink VRF.
 * This contract is not upgradeable.
 * If new implementations are needed
 * Then a new instance should be deployed.
 */
contract RandomConsumer is VRFConsumerBase, Ownable, IChainlinkVRFAdmin {
    event CallbackContractSet(address callback);

    bytes32 internal _keyHash;
    uint256 internal _fee;

    address internal _linkToken;
    address internal _callbackContract;

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
        _keyHash = keyHash;
        _fee = 0.1 * 10**18; // 0.1 LINK (varies by network)
        _linkToken = linkToken;
        _callbackContract = callbackContract;
    }

    // VRFConsumerBase

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber() public virtual returns (bytes32 requestId) {
        require(_callbackContract != address(0), 'Callback must be set');
        require(msg.sender == _callbackContract, 'Sender must be callback');
        require(LINK.balanceOf(address(this)) >= _fee, 'Not enough LINK');
        return requestRandomness(_keyHash, _fee, 0);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal virtual override {
        IChainlinkVRFCallback(_callbackContract).fulfillRandomness(requestId, randomness);
    }

    // IChainlinkVRFAdmin

    function setCallbackContract(address callback) public override onlyOwner {
        _callbackContract = callback;
        CallbackContractSet(callback);
    }

    function setFee(uint256 fee) public override onlyOwner {
        _fee = fee;
    }

    function withdrawLink() public override onlyOwner {
        uint256 balance = IERC20(_linkToken).balanceOf(address(this));
        IERC20(_linkToken).transfer(msg.sender, balance);
    }

    function withdraw() public override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
