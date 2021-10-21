import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { randomNumber } from '@ethersproject/testcases'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

import config, { NetworkConfig } from '../config'

use(solidity)

type TestContext = {
    box: Contract
    random: Contract
    testHash: string,
    wallet: Wallet
    userWallet: Wallet
}

const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext
const accountList =
    ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",

        "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",


        "0x90f79bf6eb2c4f870365e785982e1f101e93b906",


        "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",


        "0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",


        "0x976ea74026e726554db657fa54763abd0c3a0aa9",

        "0x14dc79964da2c08b23698b3d3cc7ca32193d9955",
        "0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f",

        "0xa0ee7a142d267c1f36714e4a8f75612f20a79720",


        "0xbcd4042de499d14e55001ccbb24a551f3b954096",


        "0x71be63f3384f5fb98995898a86b02fb2426c5788",


        "0xfabb0ac9d68b0b445fb7357272ff202c5651694a",


        "0x1cbd3b2770909d4e10f157cabc84c7264073c9ec",


        "0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097",


        "0xcd3b766ccdd6ae721141f452c550ca635964ce71",


        "0x2546bcd3c84621e976d8185a91a922ae77ecec30",


        "0xbda5747bfd65f08deb54cb465eb87d40e51b197e",


        "0xdd2fd4581271e230360230f9337d5c0430bf44c0",


        "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199"]
describe('Box V2 Purchase Tests', function () {
    beforeEach(async () => {
        const [wallet, userWallet] = new MockProvider().getWallets()
        const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
        const Box = await ethers.getContractFactory('RarePizzasBoxV3')
        const box = await Box.deploy()

        // use KOVAN contract info for out tests so its clear whats happening
        // and add our V2 callback contract
        const random = await RandomConsumer.deploy(
            config.CHAINLINK_KOVAN_VRF_COORD,
            config.CHAINLINK_KOVAN_TOKEN,
            '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
            config.CHAINLINK_KOVAN_VRF_FEE,
            box.address)

        // Initialize to set owner, since not deployed via proxy
        await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

        // Pick a date like jan 1, 2021 so the sale is open
        await box.setSaleStartTimestamp(1609459200)

        // set up the consumer to the mock contract
        await box.setVRFConsumer(random.address)

        // just a hardcoded value
        const testHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'

        testContext = {
            box,
            random,
            testHash,
            wallet,
            userWallet,
        }
    })



    describe('Purchase a box', () => {
        describe('Happy flow', () => {
            it('Should allow purchase of box', async () => {
                const { box, random, testHash } = testContext
                const boxBuyers = 10

                for (let i = 0; i < boxBuyers; i++) {
                    const price: BigNumber = await box.getPrice()
                    await box.purchase({ value: price })
                    await random.fulfillRandomnessWrapper(testHash, randomNumber('31' + i, 256, 512))

                    expect(await box.totalSupply()).to.equal(i + 1)
                }
            })

            it('Should allow purchase of box when VRF unset', async () => {
                const { box, random, testHash } = testContext
                const boxBuyers = 10

                // set up the consumer to the 0 address
                await box.setVRFConsumer('0x0000000000000000000000000000000000000000')

                for (let i = 0; i < boxBuyers; i++) {
                    const price: BigNumber = await box.getPrice()
                    await box.purchase({ value: price })

                    // since VRF is unset, should complete mint in the same tx
                    // DISABLED: await random.fulfillRandomnessWrapper(testHash, 31)

                    expect(await box.totalSupply()).to.equal(i + 1)
                }
            })

            it('Should allow purchase of box when VRF is wrong', async () => {
                const { box, random, testHash, wallet } = testContext
                const boxBuyers = 10

                // set up the consumer to an invalid contract address
                await box.setVRFConsumer(box.address)

                for (let i = 0; i < boxBuyers; i++) {
                    const price: BigNumber = await box.getPrice()
                    await box.purchase({ value: price })

                    // fulfilling randomness should fail 
                    // since the random contract is 
                    // no longer the VRF consumer address
                    // note in the actual implementation this doesnt get called
                    // since the purchase function will have already
                    // fallen through to the old implementation
                    await expect(random.fulfillRandomnessWrapper(testHash, 31)).to.be.revertedWith('caller not VRF');

                    expect(await box.totalSupply()).to.equal(i + 1)
                }
            })

            it('Should still allow owner mint to address using old method', async () => {
                const { box, wallet } = testContext

                // Make sure balance is 0 before
                expect(await box.balanceOf(wallet.address)).to.equal(0)

                await box.mint(wallet.address, 1)

                expect(await box.totalSupply()).to.equal(1)
                expect(await box.balanceOf(wallet.address)).to.equal(1)
            })

            it('Should still allow owner purchase to address using old method', async () => {
                const { box, wallet } = testContext
                const price: BigNumber = await box.getPrice()

                // Make sure balance is 0 before
                expect(await box.balanceOf(wallet.address)).to.equal(0)

                await box.purchaseTo(wallet.address, { value: price })

                expect(await box.totalSupply()).to.equal(1)
                expect(await box.balanceOf(wallet.address)).to.equal(1)
            })
        })

        describe('Revert', () => {
            it('Should still reject purchase of box for free', async () => {
                const { box } = testContext

                await expect(box.purchase({ value: 0 })).to.be.reverted
            })

            // TODO: Implement this with mock contract functions
            // it('Should reject purchase of box over MAX_NUMBER_OF_BOXES', async (done) => {})
        })
    })
    describe('Batch Mint a box', () => {
        describe('Meh flow', () => {
            it.only('Can batchmint a box', async () => {
                const { box, random, testHash } = testContext
                await box.startBatchMint(accountList)
                await expect(box.startBatchMint(accountList)).to.be.revertedWith('minting has been queued')
                await expect(box.finishBatchMint()).to.be.revertedWith('random number must be fetched')
                await random.fulfillRandomnessWrapper(testHash, randomNumber('31', 256, 512))

                await box.finishBatchMint()
                for (let i = 0; i < accountList.length; i++) {
                    expect(await box.balanceOf(accountList[i])).to.be.equal(1)
                }
                expect(await box.status()).to.be.equal(0)
                await box.startBatchMint(accountList)
                await random.fulfillRandomnessWrapper(testHash, randomNumber('33', 256, 512))
                await box.finishBatchMint()
                await box.startBatchMint(accountList)
                await random.fulfillRandomnessWrapper(testHash, randomNumber('34', 256, 512))
                await box.finishBatchMint()
                for (let i = 0; i < accountList.length; i++) {
                    expect(await box.balanceOf(accountList[i])).to.be.equal(3)
                }
            })

        })
    })

    describe('Withdraw funds', () => {
        describe('Happy flow', () => {
            it('Should withdraw from owner', async () => {
                const { box } = testContext

                await expect(box.withdraw()).to.not.be.reverted
            })
        })

        describe('Revert', () => {
            it('Should still not allow purchase for non-presale address', async () => {
                const { box, wallet } = testContext

                // Make sure balance is 0 before
                expect(await box.balanceOf(wallet.address)).to.equal(0)

                // Pick a day in the future
                await box.setSaleStartTimestamp(Date.now() + 24 * 60 * 60 * 1000)

                const price: BigNumber = await box.getPrice()

                await expect(box.purchase({ value: price })).to.be.reverted

                // Check that balance is still 0
                expect(await box.balanceOf(wallet.address)).to.equal(0)
            })
        })
    })
})
