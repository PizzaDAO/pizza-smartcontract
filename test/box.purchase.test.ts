import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'

use(solidity)

type TestContext = {
  box: Contract
  wallet: Wallet
  userWallet: Wallet
}

const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext

describe('Rare Pizzas Box', function () {
  beforeEach(async () => {
    const [wallet, userWallet] = new MockProvider().getWallets();
    const Box = await ethers.getContractFactory('FakeRarePizzasBox')
    const box = await Box.deploy()

    // initialize to set owner, since not deployed via proxy
    await box.initialize()

    // pick a date like jan 1, 2021
    await box.setSaleStartTimestamp(1609459200);



    testContext = {
      box, wallet, userWallet
    }
  })

  // describe('Deploying the contract', () => {})

  describe('Check methods', () => {
    it('Should get price for next Box', async () => {
      const { box } = testContext
      const price: BigNumber = await box.getPrice()
      const soldTokens = await box.totalSupply()

      expect(price).to.equal(bc.bondingCurve(soldTokens + 1))
    })

    it('Should return max supply', async () => {
      const { box } = testContext

      expect(await box.maxSupply()).to.equal(bc.MAX_CURVE_VALUE)
    })
  })

  describe('Purchase a box', () => {
    describe('Happy flow', () => {
      it('Should allow purchase of box', async () => {
        const { box } = testContext
        const boxBuyers = new Array(10)

        for (let i = 0; i < boxBuyers.length; i++) {
          const price: BigNumber = await box.getPrice()
          await box.purchase({ value: price })

          expect((await box.totalSupply()).toNumber()).to.equal(i + 1)
        }
      })

      // it('Should allow purchase for presale address', async () => {
      //   const { box, wallet } = testContext
      //   // pick a day in the future
      //   await box.setSaleStartTimestamp(3609459200);

      //   // TODO: in order for this to pass we need a public pravate keypair
      //   // that is included in the allow list
      //   const instance = box.connect('0xSomeId')

      //   const price: BigNumber = await instance.getPrice()
      //   await instance.purchase({ value: price })

      //   expect((await instance.balanceOf(wallet.address)).toNumber()).to.equal(1);
      // })

      it('Should allow owner mint to address', async () => {
        const { box, userWallet } = testContext

        const price: BigNumber = await box.getPrice()
        await box.mint(userWallet.address, 1)

        expect((await box.totalSupply()).toNumber()).to.equal(1)
        expect((await box.balanceOf(userWallet.address)).toNumber()).to.equal(1);
      })

      it('Should allow owner purchase to address', async () => {
        const { box, wallet } = testContext

        const price: BigNumber = await box.getPrice()
        await box.purchaseTo(wallet.address, { value: price })

        expect((await box.totalSupply()).toNumber()).to.equal(1)
        expect((await box.balanceOf(wallet.address)).toNumber()).to.equal(1);
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
        // pick a day in the future
        await box.setSaleStartTimestamp(3609459200);

        const price: BigNumber = await box.getPrice()
        await expect(box.purchase({ value: price })).to.be.reverted

        expect((await box.balanceOf(wallet.address)).toNumber()).to.equal(0);
      })
      it('Should reject withdrawal when 0 funds', async () => {
        const { box, wallet } = testContext

        const instance = box.connect(wallet.address)

        await expect(instance.withdraw()).to.be.reverted
      })
    })
  })
})
