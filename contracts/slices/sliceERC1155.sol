
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";


interface RarePizzas is IERC721Upgradeable{
    function purchase() payable external;
    function getPrice() external view returns(uint);
}

contract slicer1155 is ERC1155Upgradeable {

    RarePizzas public rarePizzas;

    mapping(uint=>uint) public totalSlices;
    mapping(uint=>uint) public purchasePrice;
    uint public maxSlices=8;
    address public lastPurchaser;
    uint public availablePizzas;
    uint public currentPizza;
    constructor(address pizzas) public  {
        __ERC1155_init("pizza slices");
        rarePizzas=RarePizzas(pizzas);
    }
    function _generateSlice(uint pizza,address receiver) internal {
        require(rarePizzas.ownerOf(pizza)==address(this),"pizza must be deposited");
        require(totalSlices[pizza]<maxSlices,"total slices must be less than max slices");
        totalSlices[pizza]+=1;
        _mint(receiver, pizza, 1, "");
    }
     function _generateSlices(uint pizza,address[] memory receivers) internal {
        require(rarePizzas.ownerOf(pizza)==address(this),"pizza must be deposited");
        require(receivers.length+totalSlices[pizza]<=8,"total slices must be less than max slices");
        for(uint i=0;i<receivers.length;i++){
            totalSlices[pizza]+=1;
            _mint(receivers[i], pizza, 1, "");
        }
        
        
    }
      function _generateSlices(uint pizza,address receiver) internal {
        require(rarePizzas.ownerOf(pizza)==address(this),"pizza must be deposited");
        //require(1+totalSlices[pizza]<=8,"total slices must be less than max slices");
        
        for(uint i=0;i<maxSlices-totalSlices[pizza];i++){
            totalSlices[pizza]+=1;
            _mint(receiver, pizza, 1,"");
        }
        
        
    }
    function sliceFromDeposit(uint pizza) public {

         rarePizzas.safeTransferFrom(msg.sender,address(this),pizza);
        _generateSlices(pizza,msg.sender);

    }
    function purchaseSlice() public payable{
        // require(rarePizzas.owneOf(pizza)==address(this),"pizza must be deposited");
         bool purchased=availablePizzas>0;
         if(purchased){
             uint price=purchasePrice[currentPizza];
             require(msg.value>(price/8),"");
             _generateSlice(currentPizza,msg.sender);
         }else{
             uint p=rarePizzas.getPrice();
             require(msg.value>=p/8,"");
             uint256 startGas = gasleft();
             uint purchasePrice=purchaseFromCurve();
             lastPurchaser=msg.sender;
         }
        
    }
    function purchaseFromCurve() public returns(uint){
        uint p= rarePizzas.getPrice();
        rarePizzas.purchase{value:p}();

    } 
    function burnFromDeposit(uint pizza) public{
         safeTransferFrom(
        msg.sender,
        address(this),
        pizza,
        8,
        ""
        );
        _burnSlices(pizza);
        rarePizzas.safeTransferFrom(address(this),msg.sender,pizza);
    }
   

    function _burnSlices(uint pizza) internal{
        _burn(address(this), pizza, 8);
        totalSlices[pizza]=0;
    }
    
     function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4){
         if( from==address(0)&& lastPurchaser!=address(0) ){
              _generateSlice(tokenId,lastPurchaser);
              lastPurchaser=address(0);
              currentPizza=tokenId;
              availablePizzas=7;
         }
        return 0x150b7a02;
     }
}