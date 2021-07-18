// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@chainlink/contracts/src/v0.6/ChainlinkClient.sol';

interface IOrderAPIConsumer {
    /**
     * Call the rendering API
     */
    function executeRequest(address requestor) external returns (bytes32 requestId);
}

interface IOrderAPICallback {
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
    function setJobId(bytes32 jobId) external;

    /**
     * Set the fee for executing the job
     */
    function setFee(uint256 fee) external;
}

contract OrderAPIConsumer is Ownable, ChainlinkClient, IOrderAPIConsumer, IOrderAPIConsumerAdmin {
    IOrderAPICallback private _callback;
    bytes32 private _jobId;
    uint256 private _fee;

    event CallbackUpdated(address previous, address current);
    event JobIdUpdated(bytes32 previous, bytes32 current);
    event FeeUpdated(uint256 previous, uint256 current);

    event FulfillResponse(bytes32 requestId, bytes32 result);

    /**
     * Network: Kovan
     * Oracle: 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e
     * Job ID: 29fa9aa13bf1468788b7cc4a500a45b8
     * Fee: 0.1 * 10**18; // 0.1 LINK
     */
    constructor(
        address link,
        address oracle,
        address callback,
        bytes32 jobId,
        uint256 fee
    ) public Ownable() {
        setChainlinkToken(link);
        setChainlinkOracle(oracle);

        _callback = IOrderAPICallback(callback);
        _jobId = jobId;
        _fee = fee;
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
        if (address(_callback) != address(0)) {
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

    function setJobId(bytes32 jobId) public override onlyOwner {
        bytes32 previous = _jobId;
        _jobId = jobId;
        emit JobIdUpdated(previous, _jobId);
    }

    function setFee(uint256 fee) public override onlyOwner {
        uint256 previous = _fee;
        _fee = fee;
        emit FeeUpdated(previous, _fee);
    }
}
