import { expect, use } from "chai";
import { BigNumber, Contract } from 'ethers';
import { MockProvider, solidity } from 'ethereum-waffle';

const { ethers, upgrades } = require("hardhat");

use(solidity);

describe("test Rare Pizzas Box", function () {
    let instance: Contract;

    const [wallet] = new MockProvider().getWallets();

    beforeEach(async () => {
        const Box = await ethers.getContractFactory("RarePizzasBox");
        instance = await Box.deploy();
    });

    it("Should return prices for the bonding curve", async () => {

        let r = await instance.curve(1)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(10)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(100)
        console.log(r.toString() / 10 ** 18)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(10000)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(5000)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(6000)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(7000)
        console.log(r.toString() / 10 ** 18)
        r = await instance.curve(10000)
        console.log(r.toString() / 10 ** 18)
    });

    it("Should allow payments to the payable contract", async () => {

        let price: BigNumber = await instance.getPrice();
        expect(price.toNumber()).to.equal(0);

        await wallet.sendTransaction({ to: instance.address, value: price.toNumber() });

        // TODO: expect
    });
});
