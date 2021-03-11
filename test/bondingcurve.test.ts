import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'

import { bondingCurve as bc } from './helpers'

use(solidity)

type TestContext = {
  bondingCurve: Contract
}

const MAX_VALUE = 10 * 1000

let testContext: TestContext

describe('Bonding Curve', () => {
  beforeEach('', async () => {
    const BondingCurve = await ethers.getContractFactory('BondingCurve')
    const bondingCurve = await BondingCurve.deploy()

    testContext = {
      bondingCurve,
    }
  })

  describe('Happy flow', () => {
    it('Should return value on bonding curve', async () => {
      const { bondingCurve } = testContext

      for (const value of [1, 10, 100, 1000, 2 * 1000, 5 * 1000, 10 * 1000]) {
        expect(await bondingCurve.curve(value)).to.equal(bc.bondingCurve(value))
      }
    })
  })

  describe('Revert', () => {
    it('Should revert when called with 0', async () => {
      const { bondingCurve } = testContext

      await expect(bondingCurve.curve(0)).to.be.revertedWith('BondingCurve: starting position cannot be zero')
    })

    it('Should revert when called with value over MAX_VALUE', async () => {
      const { bondingCurve } = testContext

      await expect(bondingCurve.curve(MAX_VALUE + 1)).to.be.revertedWith('BondingCurve: cannot go past MAX_CURVE value')
      await expect(bondingCurve.curve(MAX_VALUE + 1000)).to.be.revertedWith(
        'BondingCurve: cannot go past MAX_CURVE value',
      )
    })
  })
})
