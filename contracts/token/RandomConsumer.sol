
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";


interface IPizza{
    function MintWithArtwork(bytes32 id,uint random) external;
}
interface IERC20{
     function balanceOf(address a) external view returns (uint256);
     function transfer(address to, uint256 value) external returns (bool);
}

contract RandomConsumer is VRFConsumerBase {
    
    bytes32 internal keyHash;
    uint256 internal fee;
    address public pizzas;
    uint256 public randomResult;
    address public owner;
    
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */
    constructor(address p) 
        VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) public
    {
        owner=msg.sender;
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; // 0.1 LINK (varies by network)
        pizzas=p;
    }
    event OwnerShipTransferred(address newOwner);
    modifier onlyOwner(){
        require(msg.sender==owner,"sender must be owner");
        _;
    }
    /** 
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(msg.sender==pizzas,"Sender must be the pizza box contract");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        
        return requestRandomness(keyHash, fee, 0);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        
        IPizza(pizzas).MintWithArtwork(requestId,randomness);
    }
    function transferOwnerShip(address _newOwner) public onlyOwner{
            owner=_newOwner;
            emit OwnerShipTransferred(_newOwner);
    }
    function withDrawLink() public  onlyOwner{
        uint balance=IERC20(0xa36085F69e2889c224210F603D836748e7dC0088).balanceOf(address(this));
        IERC20(0xa36085F69e2889c224210F603D836748e7dC0088).transfer(msg.sender,balance);
    }

}
