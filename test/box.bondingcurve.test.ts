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

describe.skip('Bonding Curve', () => {
  beforeEach('', async () => {
    const BondingCurve = await ethers.getContractFactory('BondingCurve')
    const bondingCurve = await BondingCurve.deploy()

    testContext = {
      bondingCurve,
    }
  })

  describe.skip('Happy flow', () => {
    it('Should return value on bonding curve', async () => {
      const { bondingCurve } = testContext

      for (const value of [1, 10, 100, 1000, 2 * 1000, 5 * 1000, 6 * 1000, 7 * 1000, 8 * 1000, 8750]) {
        expect(await bondingCurve.curve(value)).to.equal(bc.bondingCurve(value))
      }
    })

    // Just prints out the new curve
    it('Should return prices for the bonding curve', async () => {
      const { bondingCurve } = testContext
      let sum = 0
      let realSum = BigInt(0)
      for (let i = 1; i <= 8750; i++) {
        const j = i
        const r = await bondingCurve.curve(j)
        const value = r / 10 ** 18

        sum += value
        realSum = realSum + BigInt(r)

        // console.log(`r = ${r} value = ${value} sum = ${sum} realSum = ${realSum.toString()}`)
        if (i === 8724) {
          console.log('FIRST LOG')
          console.log(`total BTC: ${sum} - realSum: ${realSum.toString()}`)
        }
        if (i < 100 || i > 8724) {
          console.log(
            `index: ${j} btc: ${value.toFixed(4)}  eth: ${(value / 0.03).toFixed(4)} usd: ${(value * 50000).toFixed(
              4,
            )} running real sum: ${realSum.toString()}`,
          )
        }
        if (i % 100 === 0) {
          console.log(
            `index: ${j} btc: ${value.toFixed(4)} eth: ${(value / 0.03).toFixed(4)} usd: ${(value * 50000).toFixed(
              4,
            )} running real sum: ${realSum.toString()}`,
          )
        }
      }

      console.log(`total BTC: ${sum} - realSum: ${realSum.toString()}`)
    }).timeout(240000)
  })

  describe('Revert', () => {
    it('Should revert when called with 0', async () => {
      const { bondingCurve } = testContext

      await expect(bondingCurve.curve(0)).to.be.revertedWith('position cannot be zero')
    })

    it('Should revert when called with value over MAX_VALUE', async () => {
      const { bondingCurve } = testContext

      await expect(bondingCurve.curve(MAX_VALUE + 1)).to.be.revertedWith('cannot pass MAX_CURVE')
      await expect(bondingCurve.curve(MAX_VALUE + 1000)).to.be.revertedWith('cannot pass MAX_CURVE')
    })
  })
})
