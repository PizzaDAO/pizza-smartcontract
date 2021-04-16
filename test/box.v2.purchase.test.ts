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

describe('Box V2 Purchase Tests', function () {
    beforeEach(async () => {
        const [wallet, userWallet] = new MockProvider().getWallets()
        const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
        const Box = await ethers.getContractFactory('RarePizzasBoxV2')
        const box = await Box.deploy()

        // use KOVAN contract info for out tests so its clear whats happening
        // and add our V2 callback contract
        const random = await RandomConsumer.deploy(
            config.CHAINLINK_KOVAN_VRF_COORD,
            config.CHAINLINK_KOVAN_TOKEN,
            config.CHAINLINK_KOVAN_VRF_KEY_HASH,
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

    describe('Check methods', () => {
        it('Should set the VRF query fee', async () => {
            const { random } = testContext
            const fee: BigNumber = await random.getFee()

            // it's the kovan price set in the beforeEach
            expect(fee).to.equal(
                BigNumber.from('100000000000000000')
            )
        })
    })

    describe('Purchase Slices', function (){ //julie
        beforeEach(async () => {
            
        })

        describe('Happy-ish flow', () => {
            it('Should allow purchase of box', async () => {
                const { box, random, testHash } = testContext
                const boxBuyers = 10

                for (let i = 0; i < boxBuyers; i++) {
                    const price: BigNumber = await box.getPrice()
                    await box.purchaseSlice({ value: price }) // Chainlink's max cost is 200k ether.
                    let gasAmount = await random.fulfillRandomnessWrapper(testHash, randomNumber('31' + i, 256, 512))
                    console.log(`Gas to purchase a slice: ${gasAmount}`)

                    expect(await box.totalSupply()).to.equal(i + 1)
                }
            })
        })
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
