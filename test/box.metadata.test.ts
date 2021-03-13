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
    const box = await upgrades.deployProxy(Box)

    // Pick a date. 1609459200 = Friday, 1 January 2021 00:00:00
    await box.setSaleStartTimestamp(1609459200)

    testContext = {
      box,
      wallet,
      anotherWallet,
    }
  })

  // Scale this up to test the distribution below
  const scaling = 50
  const mint_block = 50

  it('Should return a valid token uri', async () => {
    const { box } = testContext

    const price: BigNumber = await box.getPrice()
    await box.purchase({ value: price })

    expect(await box.tokenURI(0)).is.not.null
  })

  it('Should hydrate the dataset', async () => {
    const { box, wallet, anotherWallet } = testContext

    const signer = await box.signer.getAddress()

    // Seed the entire collection
    console.log('minting')
    for (let i = 0; i < 25; i++) {
      await box.mint(signer, mint_block)
    }

    console.log('purchasing')
    for (let i = 0; i < scaling; i++) {
      const price: BigNumber = await box.getPrice()
      await box.purchase({ value: price })
      if (i % 100 === 0) {
        console.log(`purchased: ${i} block: ${await ethers.provider.getBlockNumber()}`)
      }

      await wallet.sendTransaction({ to: signer, value: 1000000000 })
      await anotherWallet.sendTransaction({ to: signer, value: 1000000000 })
    }

    // build a result set so we can see the distribution
    const results_map = new Map()
    for (let i = 0; i < 100; i++) {
      results_map.set(i, 0)
    }

    // pull out the data
    console.log('analyzing')
    for (let i = 0; i < scaling; i++) {
      const art_index: BigNumber = await box.getBoxArtworkUri(i)
      const current = results_map.get(art_index.toNumber())

      results_map.set(art_index.toNumber(), current + 1)
    }

    // print the results
    console.log('---------- DATA DISTRO -----------')
    for (const [key, value] of results_map.entries()) {
      if (value > 100) {
        console.log(`art index: ${key} count: ${value} - EXCEEDED!`)
      } else {
        console.log(`art index: ${key} count: ${value}`)
      }
    }
  }).timeout(600000)
})
