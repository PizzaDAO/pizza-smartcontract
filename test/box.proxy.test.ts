import { expect } from 'chai'
import { Contract, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider } from 'ethereum-waffle';
import { getManifestAdmin } from '@openzeppelin/hardhat-upgrades/dist/admin';

type TestContext = {
    box: Contract
    wallet: Wallet
    anotherWallet: Wallet
}

let testContext: TestContext

const initialBoxes: number = 1;

describe('Box Proxy Tests', function () {
    beforeEach(async () => {
        const [wallet, anotherWallet] = new MockProvider().getWallets();

        const Box = await ethers.getContractFactory('FakeRarePizzasBox');
        const box = await upgrades.deployProxy(Box, [wallet.address, initialBoxes]);

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

        const BoxV2 = await ethers.getContractFactory("FakeRarePizzasBoxV2");
        const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2);

        expect((await boxV2.totalSupply()).toNumber()).to.equal(initialBoxes);
    })

    it('Should emit upgraded event', async () => {
        // TODO
    })

    it('Should allow changing ownership', async () => {
        // TODO
    })
})
