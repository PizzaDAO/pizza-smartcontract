
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "hardhat/console.sol";


contract sliceReservations is ERC1155 {

    address public rarePizzas;

    constructor(address pizzas) public ERC1155("")  {
        rarePizzas=pizzas;
    }

    function externalSliceMint(address to, uint256 id) external returns (bool){
        require(msg.sender==rarePizzas,"sender must the box address");
        console.log("INTERNAL MINTING");
        _mint(to, id, 1,"");
        return true;
    }
}
