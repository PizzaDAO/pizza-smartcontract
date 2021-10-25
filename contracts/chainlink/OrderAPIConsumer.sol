// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@chainlink/contracts/src/v0.6/ChainlinkClient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IOrderAPIConsumer {
    /**
     * Call the rendering API
     */
    function executeRequest(
        address requestor,
        uint256 tokenId,
        uint256 recipeId
    ) external returns (bytes32 requestId);
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

contract OrderAPIConsumer is Ownable, ChainlinkClient, IOrderAPIConsumer, IOrderAPIConsumerAdmin {
    using Address for address;

    address internal _authorizedRequestor;
    IOrderAPICallback private _callback;
    bytes32 private _jobId;
    uint256 private _fee;

    event AuthorizedRequestorUpdated(address oldRequestor, address newRequestor);
    event CallbackUpdated(address previous, address current);
    event JobIdUpdated(bytes32 previous, bytes32 current);
    event FeeUpdated(uint256 previous, uint256 current);

    event ResponseFulfilled(bytes32 requestId, bytes32 result);

    constructor(
        address link,
        address oracle,
        address authorizedRequestor,
        address callback,
        string memory jobId,
        uint256 fee
    ) public Ownable() {
        setChainlinkToken(link);
        setChainlinkOracle(oracle);
        setAuthorizedRequestor(authorizedRequestor);

        if (callback != address(0)) {
            _callback = IOrderAPICallback(callback);
        }
        setJobId(jobId);
        _fee = fee; //0.1 * 10**18; // 0.1 LINK
    }

    // IOrderAPIConsumer

    function executeRequest(
        address requestor,
        uint256 tokenId,
        uint256 recipeId
    ) public override returns (bytes32 requestId) {
        // if the callback address is set, then
        require(msg.sender == _authorizedRequestor, 'caller not callback');

        Chainlink.Request memory request = buildChainlinkRequest(_jobId, address(this), this.fulfillResponse.selector);
        request.add('address', toString(uint256(uint160(address(msg.sender)))));
        request.add('requestor', toString(uint256(uint160(address(requestor)))));
        request.addUint('token_id', tokenId);
        request.addUint('recipe_id', recipeId);
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), request, _fee);
    }

    // IOrderAPICallback

    function fulfillResponse(bytes32 requestId, bytes32 result) public recordChainlinkFulfillment(requestId) {
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

    function setCallback(address callback) public override onlyOwner {
        address previous = address(_callback);
        _callback = IOrderAPICallback(callback);
        emit CallbackUpdated(previous, address(_callback));
    }

    function setJobId(string memory jobId) public override onlyOwner {
        bytes32 previous = _jobId;
        _jobId = _stringToBytes32(jobId);
        emit JobIdUpdated(previous, _jobId);
    }

    function setFee(uint256 fee) public override onlyOwner {
        uint256 previous = _fee;
        _fee = fee;
        emit FeeUpdated(previous, _fee);
    }

    function withdrawLink() public override onlyOwner {
        uint256 balance = IERC20(chainlinkTokenAddress()).balanceOf(address(this));
        IERC20(chainlinkTokenAddress()).transfer(msg.sender, balance);
    }

    function withdraw() public override onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function _stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory _b = bytes(source);
        if (_b.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function toString(uint256 value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT licence
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return '0';
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        uint256 index = digits - 1;
        temp = value;
        while (temp != 0) {
            buffer[index--] = bytes1(uint8(48 + (temp % 10)));
            temp /= 10;
        }
        return string(buffer);
    }
}
