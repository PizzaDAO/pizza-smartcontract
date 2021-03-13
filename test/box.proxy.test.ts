import { expect } from 'chai'
import { BigNumber, Contract, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider } from 'ethereum-waffle';

type TestContext = {
    box: Contract
    wallet: Wallet
    anotherWallet: Wallet
}

let testContext: TestContext

describe('Box Proxy Tests', function () {
    beforeEach(async () => {
        const [wallet, anotherWallet] = new MockProvider().getWallets();

        const Box = await ethers.getContractFactory('FakeRarePizzasBox');
        const box = await upgrades.deployProxy(Box);

        // pick a date like jan 1, 2021
        await box.setSaleStartTimestamp(1609459200);

        testContext = {
            box,
            wallet,
            anotherWallet
        }
    })

    it('Should set an admin', async () => {
        // TODO
    })

    it('Should upgrade contract logic', async () => {
        const { box } = testContext;

        // call a function that changes state
        const price: BigNumber = await box.getPrice()
        await box.purchase({ value: price })

        const BoxV2 = await ethers.getContractFactory("FakeRarePizzasBoxV2");
        const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2);

        expect((await boxV2.totalSupply()).toNumber()).to.equal(1);
    })

    it('Should emit upgraded event', async () => {
        // TODO
    })

    it('Should allow changing ownership', async () => {
        // TODO
    })
})
