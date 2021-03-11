import { utils, BigNumber, Contract } from 'ethers'
import { MockProvider } from 'ethereum-waffle'
import { ethers } from 'hardhat'

type TestContext = {
  box: Contract
}

const [wallet] = new MockProvider().getWallets()

let testContext: TestContext

describe('Rare Pizzas Box', function () {
  beforeEach(async () => {
    const Box = await ethers.getContractFactory('RarePizzasBox')
    const box = await Box.deploy()

    testContext = {
      box,
    }
  })

  it.each([1, 10, 100, 1000, 5000, 6000, 7000, 10000])(
    'Should return prices for the bonding curve',
    async (tokenId) => {
      const { box } = testContext
      const r: BigNumber = await box.curve(tokenId)

      console.log(utils.formatEther(r))
    },
  )

  it('Should allow payments to the payable contract', async () => {
    const { box } = testContext
    const price: BigNumber = await box.getPrice()

    expect(price.toNumber()).toBe(0)

    await wallet.sendTransaction({ to: box.address, value: price.toNumber() })

    // TODO: expect
  })
})
