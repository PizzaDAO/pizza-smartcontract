import { expect, use } from 'chai'
import { BigNumber, Contract, utils } from 'ethers'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'

use(solidity)

type TestContext = {
  box: Contract
}

let testContext: TestContext

describe('Rare Pizzas Box', function () {
  beforeEach(async () => {
    const Box = await ethers.getContractFactory('RarePizzasBox')
    const box = await Box.deploy()

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

  it('Should allow payments to the payable contract', async () => {
    const { box } = testContext
    const price: BigNumber = await box.getPrice()

    expect(price).to.equal(utils.parseEther('0.0001'))

    await box.purchase({ value: price })

    expect((await box.totalSupply()).toNumber()).to.equal(1)
  })

  it('Should reject payments to the payable contract', async () => {
    const { box } = testContext

    await expect(box.purchase({ value: 0 })).to.be.reverted
  })

  it('Should reject withdrawal', async () => {
    const { box } = testContext

    await expect(box.withdraw()).to.be.reverted
  })
})
