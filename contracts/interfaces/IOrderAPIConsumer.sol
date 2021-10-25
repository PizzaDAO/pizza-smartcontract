// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

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
     * handle the return result from the order api
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
