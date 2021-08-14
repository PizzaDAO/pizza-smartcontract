
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

import "hardhat/console.sol";
interface RarePizzas is IERC721Upgradeable{
    function purchase() payable external;
    function getPrice() external view returns(uint);
}

contract sliceReservations is ERC1155Upgradeable {

    address public rarePizzas;


    constructor(address pizzas) public  {
        __ERC1155_init("pizza slices");
        rarePizzas=pizzas;
    }
    function externalSliceMint(address to, uint256 id) external returns (bool){
        require(msg.sender==rarePizzas,"sender must the box address");
        console.log("INTERNAL MINTING");
        _mint(to, id, 1,"");
        return true;
    }
}
