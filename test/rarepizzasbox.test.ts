import { expect, use } from "chai";
import { BigNumber, Contract } from 'ethers';
import { MockProvider, solidity } from 'ethereum-waffle';

const { ethers, upgrades } = require("hardhat");

use(solidity);

describe("test Rare Pizzas Box", function () {
    let instance: Contract;
    let wei = 10 ** 18;

    const [wallet, otherWallet] = new MockProvider().getWallets();

    beforeEach(async () => {
        const Box = await ethers.getContractFactory("RarePizzasBox");
        instance = await Box.deploy();
    });

    it("Should return prices for the bonding curve", async () => {

        let r = await instance.curve(1)
        console.log(r.toString() / wei)
        r = await instance.curve(10)
        console.log(r.toString() / wei)
        r = await instance.curve(100)
        console.log(r.toString() / wei)
        r = await instance.curve(10000)
        console.log(r.toString() / wei)
        r = await instance.curve(5000)
        console.log(r.toString() / wei)
        r = await instance.curve(6000)
        console.log(r.toString() / wei)
        r = await instance.curve(7000)
        console.log(r.toString() / wei)
        r = await instance.curve(10000)
        console.log(r.toString() / wei)

        expect(r / wei).to.equal(10000);
    });

    it("Should allow payments to the payable contract", async () => {

        let price: BigNumber = await instance.getPrice();
        expect(price.toNumber() / wei).to.equal(0.0001);

        await instance.purchase({ value: price.toNumber() });

        expect((await instance.totalSupply()).toNumber()).to.equal(1);
    });

    it("Should reject payments to the payable contract", async () => {
        await expect(instance.purchase({ value: 0 })).to.be.reverted;
    });

    it("Should reject withdrawal", async () => {
        await expect(instance.withdraw()).to.be.reverted;

    });
});
