
pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts/token/IERC721.sol";

contract slicer1155 is ERC1155Upgradeable {
    IERC721 public rarePizzas;
    mapping(uint=>uint) public totalSlices;
    uint public maxSlices=8;
    constructor(address pizzas) public  {
         __ERC1155_init("pizza slices");
        rarePizzas(pizzas);
    }
    function _generateSlice(uint pizza,address receiver) internal {
        require(rarePizzas.owneOf(pizza)==address(this),"pizza must be deposited");
        require(totalSlices[pizza]<maxSlices,"total slices must be less than max slices");
        totalSlices[pizza]+=1;
        _mint(receiver, pizza, 1, "");
    }
     function _generateSlices(uint pizza,address[] memory receivers) internal {
        require(rarePizzas.owneOf(pizza)==address(this),"pizza must be deposited");
        require(receivers.length+totalSlices[pizza]<=8,"total slices must be less than max slices");
        for(uint i=0;i<receiver.length;i++){
            totalSlices[pizza]+=1;
            _mint(receivers[i], (pizza*100+i), 1, "");
        }
        
        
    }
      function _generateSlices(uint pizza,address receiver) internal {
        require(rarePizzas.owneOf(pizza)==address(this),"pizza must be deposited");
        require(receivers.length+totalSlices[pizza]<=8,"total slices must be less than max slices");

        for(uint i=0;i<maxSlices;i++){
            totalSlices[pizza]+=1;
            _mint(receiver, pizza, 1, "");
        }
        
        
    }
    function sliceFromDeposit(uint pizza) public {
         rarePizzas.tranferFrom(msg.sender,address(this),pizza);
        _generateSlices(pizza,msg.sender);
    }

    function burnFromDeposit(uint pizza) public{
        safeTransferFrom(
        msg.sender,
        address(this),
        pizza,
        8,
        ""
        );
        
    }
    function purchaseSliceFromCurve(){

    }

    function _burnSlices(uint pizza){
        require()
    }
    
    
}