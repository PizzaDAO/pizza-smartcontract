import { expect } from 'chai'
import { BigNumber, Contract, Signer, Wallet, utils } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

type TestContext = {
  box: Contract,
  wallet: Wallet
}

let testContext: TestContext

describe('Box Timestamp Tests', function () {
  beforeEach(async () => {
    const [wallet] = new MockProvider().getWallets()
    const Box = await ethers.getContractFactory('RarePizzasBox')
    const box = await Box.deploy()

    // Initialize to set owner, since not deployed via proxy
    await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

    // Pick a date. 1609459200 = Friday, 1 January 2021 00:00:00
    await box.setSaleStartTimestamp(1609459200)

    testContext = {
      box,
      wallet
    }
  })

  it('Should allow purchase with low timestamp', async () => {
    const { box } = testContext
    const price: BigNumber = await box.getPrice()

    await box.purchase({ value: price })

    expect(await box.totalSupply()).to.equal(1)
  })

  it('Should not allow purchase with high timestamp', async () => {
    const { box } = testContext

    const currentTime = await box.publicSaleStart_timestampInS()
    await expect(box.setSaleStartTimestamp(32472144000)).to.emit(box, 'SaleStartTimestampUpdated')
      .withArgs(currentTime, 32472144000)

    const price: BigNumber = await box.getPrice()

    await expect(box.purchase({ value: price })).to.be.reverted

    expect(await box.totalSupply()).to.equal(0)
  })

  it('Should not allow non-owner to set timestamp', async () => {
    const { box, wallet } = testContext

    const currentTime = await box.publicSaleStart_timestampInS()
    await expect(box.setSaleStartTimestamp(12345)).to.emit(box, 'SaleStartTimestampUpdated')
      .withArgs(currentTime, 12345)

    await box.transferOwnership(wallet.address)

    await expect(box.setSaleStartTimestamp(4567)).to.be.revertedWith('')

    expect(await box.publicSaleStart_timestampInS()).to.equal(12345)
  })
})
