// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@chainlink/contracts/src/v0.6/ChainlinkClient.sol';

interface IOrderAPIConsumer {
    /**
     * Call the rendering API with the address of the requestor
     */
    function executeRequest(address requestor) external returns (bytes32 requestId);
}

interface IOrderAPICallback {
    /**
     * Call the callback function with the job id and the result (usually the ipfs hash)
     */
    function fulfillResponse(bytes32 requestId, bytes32 result) external;
}

interface IOrderAPIConsumerAdmin {
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
}

contract OrderAPIConsumer is Ownable, ChainlinkClient, IOrderAPIConsumer, IOrderAPIConsumerAdmin {
    using Address for address;

    IOrderAPICallback private _callback;
    bytes32 private _jobId;
    uint256 private _fee;

    event CallbackUpdated(address previous, address current);
    event JobIdUpdated(bytes32 previous, bytes32 current);
    event FeeUpdated(uint256 previous, uint256 current);

    event FulfillResponse(bytes32 requestId, bytes32 result);

    constructor(
        address link,
        address oracle,
        address callback,
        string memory jobId,
        uint256 fee
    ) public Ownable() {
        setChainlinkToken(link);
        setChainlinkOracle(oracle);

        if (callback != address(0)) {
            _callback = IOrderAPICallback(callback);
        }
        setJobId(jobId);
        _fee = fee; //0.1 * 10**18; // 0.1 LINK
    }

    // IOrderAPIConsumer

    function executeRequest(address requestor) public override returns (bytes32 requestId) {
        // TODO: prevent other folks from calling this besides our contract
        // possibly: set the fee arbitrarily high
        // possibly, verify the calling contract is the callback?

        Chainlink.Request memory request = buildChainlinkRequest(_jobId, address(this), this.fulfillResponse.selector);
        request.addBytes('address', abi.encodePacked(requestor));
        requestId = sendChainlinkRequestTo(chainlinkOracleAddress(), request, _fee);
    }

    // IOrderAPICallback

    function fulfillResponse(bytes32 requestId, bytes32 result) public recordChainlinkFulfillment(requestId) {
        // only invoke the callback if it is set properly
        if (address(_callback) != address(0) && isContract(_callback)) {
            _callback.fulfillResponse(requestId, result);
        }
        emit FulfillResponse(requestId, result);
    }

    // IOrderAPIConsumerAdmin

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

    function _stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory _b = bytes(source);
        if (_b.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
