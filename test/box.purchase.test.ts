import { expect, use } from 'chai'
import { BigNumber, Contract, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'

use(solidity)

type TestContext = {
  box: Contract
}

const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext

describe('Rare Pizzas Box', function () {
  beforeEach(async () => {
    const Box = await ethers.getContractFactory('FakeRarePizzasBox')
    const box = await Box.deploy()
    // pick a date like jan 1, 2021
    await box.setSaleStartTimestamp(1609459200);

    testContext = {
      box,
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
      // TODO: Implement withdrawal by owner
      // it('Should withdraw funds', async () => {})
    })

    describe('Revert', () => {
      it('Should reject withdrawal when 0 funds', async () => {
        const { box } = testContext

        await expect(box.withdraw()).to.be.reverted
      })
    })
  })
})
