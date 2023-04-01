pragma solidity ^0.6.6;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@chainlink/contracts/src/v0.6/ChainlinkClient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IOrderAPIConsumer {
    /**
     * Call the rendering API
     */
    function executeRequest(address requestor, uint256 tokenId, uint256 recipeId) external returns (bytes32 requestId);
}

interface IOrderAPICallback {
    /**
     * Call the callback function with the job id and the result (usually the ipfs hash)
     */
    function fulfillResponse(bytes32 requestId, bytes32 result) external;
}

interface IOrderAPIConsumerAdmin {
    function setAuthorizedRequestor(address requestor) external;

    /**
     * set the callback address used by the consumer
     */
    function setCallback(address callback) external;

    /**
     * Set the job id
     */
    function setJobId(string memory jobId) external;

    /**
     * Set the fee for executing the job
     */
    function setFee(uint256 fee) external;

    function withdrawLink() external;

    function withdraw() external;
}

contract OrderAPIConsumerV2 is Ownable, ChainlinkClient, IOrderAPIConsumer, IOrderAPIConsumerAdmin {
    using Address for address;

    address internal _authorizedRequestor;
    IOrderAPICallback private _callback;
    uint256 requestCount;
    mapping(address => bool) public fullfiller;
    event AuthorizedRequestorUpdated(address oldRequestor, address newRequestor);
    event CallbackUpdated(address previous, address current);
    event JobIdUpdated(bytes32 previous, bytes32 current);
    event FeeUpdated(uint256 previous, uint256 current);
    event RequestCreated(uint256 tokenId, uint256 recipeId);
    event ResponseFulfilled(bytes32 requestId, bytes32 result);

    constructor(address authorizedRequestor, address callback) public Ownable() {
        _authorizedRequestor = authorizedRequestor;
        _callback = callback;
    }

    modifier isFullfiller(address a) {
        require(fullfilller[a], 'sender does not havel fullfillment permissions');
        _;
    }

    // IOrderAPIConsumer
    function addFullfiller(address f) public onlyOwner {
        fullfiller[f] = true;
    }

    function removeFullfiller(address f) public onlyOwner {
        fullfiller[f] = false;
    }

    function executeRequest(
        address requestor,
        uint256 tokenId,
        uint256 recipeId
    ) public override returns (bytes32 requestId) {
        // if the callback address is set, then
        require(msg.sender == _authorizedRequestor, 'caller not callback');
        requestCount += 1;
        //bytes32 requestId = keccak256(abi.encodePacked(address(this), requestCount));
        //bytes32 JobId = keccak256(abi.encodePacked(tokenId, recipeId));
        emit RequestCreated(tokenId, recipeId, requestCount);
    }

    // IOrderAPICallback

    function fulfillResponse(bytes32 requestId, bytes32 result) public isFullfiller(msg.sender) {
        // The result returned is the CID decoded from Base58
        // and truncated to include only the 32-byte digest
        // see: https://docs.ipfs.io/concepts/content-addressing/#cid-conversion
        emit ResponseFulfilled(requestId, result);

        // only invoke the callback if it is set properly
        if (address(_callback) != address(0) && address(_callback).isContract()) {
            _callback.fulfillResponse(requestId, result);
        }
    }

    // IOrderAPIConsumerAdmin

    function setAuthorizedRequestor(address requestor) public override onlyOwner {
        address old = _authorizedRequestor;
        _authorizedRequestor = requestor;
        emit AuthorizedRequestorUpdated(old, _authorizedRequestor);
    }

    function setCallback(address callback) public override onlyOwner {}

    function setJobId(string memory jobId) public override onlyOwner {}

    function setFee(uint256 fee) public override onlyOwner {}

    function withdrawLink() public override onlyOwner {
        uint256 balance = IERC20(chainlinkTokenAddress()).balanceOf(address(this));
        IERC20(chainlinkTokenAddress()).transfer(msg.sender, balance);
    }

    function withdraw() public override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }
}
