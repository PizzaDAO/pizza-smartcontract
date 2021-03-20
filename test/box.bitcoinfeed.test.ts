import { expect } from 'chai'
import { BigNumber, Contract, Wallet, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle'

import aggregatorV3 from '../artifacts/@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json'
import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json'

type TestContext = {
  box: Contract
  priceFeed: MockContract
  signer: Wallet
}

let testContext: TestContext

describe('Bitcoin Feed Tests', function () {
  beforeEach(async () => {
    const [signer] = new MockProvider().getWallets()
    const priceFeed = await deployMockContract(signer, aggregatorV3.abi)
    const factory = new ContractFactory(boxContract.abi, boxContract.bytecode, signer)
    const box = await factory.deploy()

    testContext = {
      box,
      priceFeed,
      signer,
    }
  })

  it('Should set fallback price when interface not set', async () => {
    const { box } = testContext

    await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

    await box.updateBitcoinPriceInWei(10)

    expect(await box.getBitcoinPriceInWei()).to.equal(10)
  })

  it('Should not set fallback price when caller uses 0', async () => {
    const { box } = testContext

    await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

    await box.updateBitcoinPriceInWei(0)

    expect(await box.getBitcoinPriceInWei()).to.equal(BigNumber.from('31000000000000000000'))
  })

  // TODO
  // it('Should set interface price when interface returns', async () => {
  //     const { box, priceFeed, signer } = testContext;
  //     await box.initialize(priceFeed.address)
  //     const hotmess = 1000
  //     priceFeed.mock.latestRoundData.returns('123', `${hotmess}`, '123', '123', '12')

  //     const instance = box.connect(signer)
  //     await instance.updateBitcoinPriceInWei(1)

  //     // expect(await box.getBitcoinPriceInWei()).to.equal(1000)

  // })

  it('Should set fallback price when interface fails', async () => {
    const { box, priceFeed } = testContext
    await box.initialize(priceFeed.address)

    await box.updateBitcoinPriceInWei(1)

    expect(await box.getBitcoinPriceInWei()).to.equal(1)
  })
})
