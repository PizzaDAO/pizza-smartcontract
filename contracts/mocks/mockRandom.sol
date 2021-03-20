pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

interface IPizza{
    function MintWithArtwork(bytes32 id,uint random) external;
}

contract mockRandom {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    address public pizzas;
    uint256 public randomResult;
    bytes32 public testHash=0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     
     */
    constructor(address p) public      
    {
    
        fee = 0.1 * 10 ** 18; // 0.1 LINK (varies by network)
        pizzas=p;
    }
    
    /** 
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber() public returns (bytes32) {
        require(msg.sender==pizzas,"Sender must be the pizza box contract");             
        return testHash;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) public  {
        
        IPizza(pizzas).MintWithArtwork(requestId,randomness);
    }
    
}
