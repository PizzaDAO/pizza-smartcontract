const { expect } = require("chai");
//
 describe("test curve", function() {
 it("Should return the new greeting once it's changed", async function() {
   const bondingCurve = await ethers.getContractFactory("bondingCurve");
     const curve = await  bondingCurve.deploy();
     let r=await curve.curve(1)
     console.log(r.toString()/10**18)
     r=await curve.curve(10)
     console.log(r.toString()/10**18)
     r=await curve.curve(100)
     console.log(r.toString()/10**18)
     r=await curve.curve(1000)
     console.log(r.toString()/10**18)
     r=await curve.curve(5000)
     console.log(r.toString()/10**18)
     r=await curve.curve(6000)
     console.log(r.toString()/10**18)
     r=await curve.curve(7000)
     console.log(r.toString()/10**18)
     r=await curve.curve(10000)
    
     console.log(r.toString()/10**18)
   });
 });
