// julie wuz hereeee

import { expect } from 'chai'
import { BigNumber, Contract, Signer, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider } from 'ethereum-waffle'

import config, { NetworkConfig } from '../config'

type TestContext = {
    box: Contract
    wallet: SignerWithAddress
    signer: SignerWithAddress
}

let testContext: TestContext

let getKovanRandomConsumer = async (box: Contract) => {
    const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
    return await RandomConsumer.deploy(
        config.CHAINLINK_KOVAN_VRF_COORD,
        config.CHAINLINK_KOVAN_TOKEN,
        config.CHAINLINK_KOVAN_VRF_KEY_HASH,
        config.CHAINLINK_KOVAN_VRF_FEE,
        box.address)
}

describe('Box V3 Real Upgrade Tests', function () {
    beforeEach(async () => {

        // Deploy the original contract
        const [signer, wallet] = await ethers.getSigners()
        const Box = await ethers.getContractFactory('RarePizzasBox')
        const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])

        // pick a date like jan 1, 2021
        await box.setSaleStartTimestamp(1609459200)

        // Call a function that changes state
        const price: BigNumber = await box.getPrice()
        await box.purchase({ value: price })

        expect(await box.totalSupply()).to.equal(1)

        testContext = {
            box: box,
            wallet,
            signer
        }
    })

    it('Should upgrade contract logic', async () => {
        const { box } = testContext

        // deploy the upgraded contracts
        const random = await getKovanRandomConsumer(box)

        // run the upgrade
        const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3')
        const boxV3 = await upgrades.upgradeProxy(box.address, BoxV3)
        console.log(boxV3.address)

        // set up the random consumer
        await boxV3.setVRFConsumer(random.address)

        expect(await boxV3.totalSupply()).to.equal(1)
    })

    it('Should not modify ownable when upgrading', async () => {
        const { box, wallet, signer } = testContext

        expect(await box.owner()).to.equal(signer.address);

        // transfer ownership of the proxy
        await upgrades.admin.transferProxyAdminOwnership(wallet.address)
        expect(await box.owner()).to.equal(signer.address); // the signer is still the owner

        // transfer ownership of the contract logic to another wallet
        await box.connect(signer).transferOwnership(wallet.address)
        expect(await box.owner()).to.equal(wallet.address)

        // run the upgrade (using the new owner)
        const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3', wallet)
        const BoxV3Address = await upgrades.prepareUpgrade(box.address, BoxV3)
        await upgrades.upgradeProxy(box.address, BoxV3)

        // validate the owner is not changed
        expect(await box.owner()).to.equal(wallet.address)
    })
})
