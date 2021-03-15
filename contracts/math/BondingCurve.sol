pragma solidity ^0.8.0;

contract BondingCurve {
    uint256 constant oneEth = 10**18;
    uint256 constant MAX_CURVE = 10 * 1000;
    uint256 constant TIER1=(501*oneEth/10**4);
    uint256 constant TIER2=TIER1+(250*oneEth/10**3);
    uint256 constant TIER3=TIER2+(250*oneEth/10**3);
    uint256 constant TIER4=TIER3+(250*oneEth/10**3);
    uint256 constant TIER5=TIER4+(500*oneEth/10**3);

    uint[] approxvalues=[366,450,650,900,1000,1200,1400,1500,1600,1700,1800,1900,2000,2400,3000,4000,4400,6000,12000,24000,50000,100000,240000,333300,1000000];
    // Approximate .001x^2+.000 000 000 000 000 000 000 000 0000999x^{8}
    function curve(uint256 n) public pure returns (uint256) {
        require(n > 0, "BondingCurve: starting position cannot be zero");
        require(n <= MAX_CURVE, "BondingCurve: cannot go past MAX_CURVE value");

        uint256 term1 = n * oneEth / 10**4;
        uint256 term2 = oneEth * n**8 * (MAX_CURVE - 1) / 10**32;

        return term1 + term2;
    }
    function approx(uint256 n) public view returns (uint256) {
        require(n > 0, "BondingCurve: starting position cannot be zero");
        require(n <= MAX_CURVE, "BondingCurve: cannot go past MAX_CURVE value");
       
            if(n<=2500){
            return (2*n*oneEth/(10**5))+oneEth/10**4;
            }
            if(n>2500&&n<=5000){
                return TIER1+(4*n*oneEth/(10**5));
            }
            if(n>5000&&n<=7500){
                return TIER2+(n*oneEth/(10**4));
            }
            if(n>7500 &&n<=8000){
                return TIER3+(5*n*oneEth/(10**4));
            }
            if(n>8000&&n<=8500){
                return TIER4+(n*oneEth/(10**3));
            }if(n>8500&&n<=8724){
                return TIER5+(3*n*oneEth/(10**3));
            }
            if(n==8749||n==8748||n==8747||n==8746||n==8745||n==8744||n==8743||n==8742||n==8741||n==8740||n==8739||n==8738||n==8737||n==8736||n==8735||n==8734||n==8733||n==8732||n==8731||n==8730||n==8729||n==8728||n==8727||n==8726||n==8725){
               return approxvalues[n-8725]*10**16;
             }
        }
        
        
    
}
