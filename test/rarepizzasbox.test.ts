import { expect } from 'chai'
import { BigNumber, Contract, utils } from 'ethers'
import { ethers } from 'hardhat'

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

  it('Should return prices for the bonding curve', async () => {
    const { box } = testContext

    let r = await box.curve(1)
    console.log(utils.formatEther(r))

    r = await box.curve(10)
    console.log(utils.formatEther(r))

    r = await box.curve(100)
    console.log(utils.formatEther(r))

    r = await box.curve(10000)
    console.log(utils.formatEther(r))

    r = await box.curve(5000)
    console.log(utils.formatEther(r))

    r = await box.curve(6000)
    console.log(utils.formatEther(r))

    r = await box.curve(7000)
    console.log(utils.formatEther(r))

    r = await box.curve(10000)
    console.log(utils.formatEther(r))

    expect(r).to.equal(utils.parseEther('10000'))
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
