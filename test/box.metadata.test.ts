import { expect } from 'chai'
import { BigNumber, Contract, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider } from 'ethereum-waffle'

type TestContext = {
  box: Contract
  wallet: Wallet
  anotherWallet: Wallet
}

let testContext: TestContext

describe('Box Metadata Tests', function () {
  beforeEach(async () => {
    const [wallet, anotherWallet] = new MockProvider().getWallets()

    const Box = await ethers.getContractFactory('FakeRarePizzasBox')
    const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])

    // pick a date like jan 1, 2021
    await box.setSaleStartTimestamp(1609459200)

    testContext = {
      box,
      wallet,
      anotherWallet,
    }
  })

  // scale this up to test the distribution below
  const scaling = 50 // 8750 will fill the whole set (if you have enough eth in your wallet)
  const mint_block = 5 // 50 will fill the whole set

  it('Should return a valid token uri', async () => {
    const { box, wallet, anotherWallet } = testContext

    const price: BigNumber = await box.getPrice()
    await box.purchase({ value: price })

    expect(await box.tokenURI(0)).is.not.null
  })

  it('Should hydrate the dataset', async () => {
    const { box, wallet, anotherWallet } = testContext

    const signer = await box.signer.getAddress()

    // seed the entire collection
    console.log('minting')
    for (let i = 0; i < 25; i++) {
      await box.mint(signer, mint_block)
    }
    console.log('purchasing')
    for (let i = 0; i < scaling; i++) {
      const price = await box.getPrice()
      await box.purchase({ value: price })

      if (i % 100 === 0) {
        const purchasePrice = price.toString() / 10 ** 18
        console.log(
          `purchased: ${i} BTC: ${purchasePrice / 0.03} ETH: ${purchasePrice} USD: ${
            purchasePrice * 2000
          } at block: ${await ethers.provider.getBlockNumber()}`,
        )
      }
    }

    // build a result set so we can see the distribution
    let results_map = new Map()
    for (let i = 0; i < 100; i++) {
      results_map.set(i, 0)
    }

    // pull out the data
    console.log('analyzing')
    for (let i = 0; i < scaling; i++) {
      let art_index: BigNumber = await box.getBoxArtworkUri(i)
      let current = results_map.get(art_index.toNumber())
      results_map.set(art_index.toNumber(), current + 1)
      if (i % 100 === 0) {
        console.log(`parsed: ${i}`)
      }
    }

    // print the results
    console.log('---------- BOX DATA DISTRO -----------')
    for (let [key, value] of results_map.entries()) {
      if (value > 100) {
        console.log(`art index: ${key} count: ${value} - EXCEEDED!`)
      } else {
        console.log(`art index: ${key} count: ${value}`)
      }
    }
  }).timeout(600000)
})
