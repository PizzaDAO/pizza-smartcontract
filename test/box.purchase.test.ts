import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

use(solidity)

type TestContext = {
  box: Contract
  wallet: Wallet
  userWallet: Wallet
  random:Contract
}
const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext
let hash='0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4';
describe('Box Purchase Tests', function () {
  beforeEach(async () => {
    const [wallet, userWallet] = new MockProvider().getWallets()
    const Random= await ethers.getContractFactory('mockRandom')
    const Box = await ethers.getContractFactory('RarePizzasBox')
    const box = await Box.deploy()
    const random = await Random.deploy(box.address)
   
    //console.log(wallet)
    //console.log(userWallet)
   

    // initialize to set owner, since not deployed via proxy
    await box.initialize(wallet.address)
    console.log(await box.owner() )
    await box.setRandomOracle(random.address)
    // pick a date like jan 1, 2021
    await box.setSaleStartTimestamp(1609459200)

    testContext = {
      box,
      wallet,
      userWallet,
      random
    }
  })

  describe('Check methods', () => {
    it('Should get price for next Box', async () => {
      const { box } = testContext
      const price: BigNumber = await box.getPrice()
      const soldTokens = await box.totalSupply()
      const btcPriceInWei = await box.getBitcoinPriceInWei()

      expect(utils.formatUnits(price, 'wei')).to.equal(
        utils.formatEther(bc.bondingCurve(soldTokens + 1).mul(btcPriceInWei)),
      )
    })

    it('Should return max supply', async () => {
      const { box } = testContext
      expect(await box.maxSupply()).to.equal(10000)
    })
  })

  describe('Purchase a box', () => {
    describe('Happy flow', () => {
      it('Should allow purchase of box', async () => {
        const { box } = testContext
        const boxBuyers = 10

        for (let i = 0; i < boxBuyers; i++) {
          const price: BigNumber = await box.getPrice()
          await box.purchase({ value: price })

         // expect(await box.totalSupply()).to.equal(i + 1)
        }
      })

      it('Should allow purchase for presale address', async () => {
        const { box, wallet, userWallet,random } = testContext
        // pick a day in the future
        await box.setSaleStartTimestamp(3609459200)
        await box.setPresaleAllowed(10, [box.signer.getAddress()])

        // executer again with more addresses
        await box.setPresaleAllowed(10, [wallet.address, userWallet.address])

        const price: BigNumber = await box.getPrice()

        await box.purchase({ value: price })
        await random.fulfillRandomness(hash, 68)
        console.log(await box.balanceOf(box.signer.getAddress()))
        expect((await box.balanceOf(box.signer.getAddress())).toNumber()).to.equal(1)
      })

      it('Should allow owner mint to address', async () => {
        const { box, userWallet } = testContext

        await box.mint(userWallet.address, 1)

        expect(await box.totalSupply()).to.equal(1)
        expect(await box.balanceOf(userWallet.address)).to.equal(1)
      })

      it('Should allow owner to mint different quantities', async () => {
        const { box, userWallet } = testContext

        // can go up to 255
        await box.mint(userWallet.address, 5)
        await box.mint(userWallet.address, 10)

        expect(await box.totalSupply()).to.equal(15)
        expect(await box.balanceOf(userWallet.address)).to.equal(15)
      })

      it('Should allow owner purchase to address', async () => {
        const { box, wallet } = testContext
        const price: BigNumber = await box.getPrice()

        await box.purchaseTo(wallet.address, { value: price })

       // expect(await box.totalSupply()).to.equal(1)
        //expect(await box.balanceOf(wallet.address)).to.equal(1)
      })
    })

    describe('Revert', () => {
      it('Should reject purchase of box for free', async () => {
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
      it('Should not allow purchase for non-presale address', async () => {
        const { box, wallet } = testContext
        const twentyFourHoursMilliseconds = 24 * 60 * 60 * 1000

        // Make sure balance is 0 before
        expect(await box.balanceOf(wallet.address)).to.equal(0)

        // Pick a day in the future
        await box.setSaleStartTimestamp(Date.now() + twentyFourHoursMilliseconds)

        const price: BigNumber = await box.getPrice()

        await expect(box.purchase({ value: price })).to.be.reverted

        // Check that balance is still 0
        expect(await box.balanceOf(wallet.address)).to.equal(0)
      })

      it('Should reject withdrawal when 0 funds', async () => {
        const { box, wallet } = testContext

        const instance = box.connect(wallet.address)

        await expect(instance.withdraw()).to.be.reverted
      })
    })
  })
})