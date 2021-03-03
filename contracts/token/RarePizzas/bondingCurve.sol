pragma solidity ^0.8.0;
import './RarePizzas.sol';
import './IERC721.sol';
contract bondingCurve is RarePizzas{
    IERC721 token;
    uint one=10**18;         
  // Approximate .001x^2+.000 000 000 000 000 000 000 000 0000999x^{8}
    function curve(uint n) public view returns(uint){
        uint term1=((n*one)/10**4);
        uint term2=((one*n*n*n*n*n*n*n*n*9999)/10**32);
        return term1+term2;
        
    }

    function calculatePrice() public view returns(uint){
        return curve(totalSupply);
    }
    function purchase() public payable{
        totalSupply+=1;
        uint price=curve(totalSupply);
        require(price==msg.value,"price must be on the curve")
        _mint(_to,totalSupply);
    }
}