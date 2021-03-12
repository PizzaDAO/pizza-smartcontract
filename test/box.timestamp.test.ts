import { expect } from 'chai'
import { BigNumber, Contract, utils } from 'ethers'
import { ethers } from 'hardhat'

type TestContext = {
    box: Contract
}

let testContext: TestContext

describe('Box Timestamp Mock Tests', function () {
    beforeEach(async () => {
        const Box = await ethers.getContractFactory('FakeRarePizzasBox');
        const box = await Box.deploy();
        // pick a date like jan 1, 2021
        await box.setSaleStartTimestamp(1609459200);

        testContext = {
            box,
        }
    })

    it('Should allow purchase with low timestamp', async () => {
        const { box } = testContext;
        const price: BigNumber = await box.getPrice();

        await box.purchase({ value: price });

        expect((await box.totalSupply()).toNumber()).to.equal(1);

    })

    it('Should not allow purchase with high timestamp', async () => {
        const { box } = testContext;
        await box.setSaleStartTimestamp(32472144000);
        const price: BigNumber = await box.getPrice();

        await expect(box.purchase({ value: price })).to.be.reverted

        expect((await box.totalSupply()).toNumber()).to.equal(0);
    })
})
