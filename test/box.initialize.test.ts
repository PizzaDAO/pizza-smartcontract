import { expect } from 'chai'
import { BigNumber, Contract, utils, Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { MockProvider } from 'ethereum-waffle';

type TestContext = {
    box: Contract
    wallet: Wallet
}

let testContext: TestContext

describe('Box Initialize Tests', function () {
    beforeEach(async () => {
        const Box = await ethers.getContractFactory('RarePizzasBox');
        const box = await Box.deploy();

        const [wallet] = new MockProvider().getWallets();

        testContext = {
            box,
            wallet
        }
    })

    it('Should mint specified nubmer of tokens to address', async () => {
        const { box, wallet } = testContext;
        await box.initialize(wallet.address, 10);

        expect((await box.totalSupply()).toNumber()).to.equal(10);
        expect((await box.balanceOf(wallet.address)).toNumber()).to.equal(10);
    })
})
