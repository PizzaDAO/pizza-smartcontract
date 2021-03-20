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

describe('Box Fake Upgrade Tests', function () {
  beforeEach(async () => {
    const [wallet, anotherWallet] = new MockProvider().getWallets()

    const Box = await ethers.getContractFactory('RarePizzasBox')
    const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])

    // pick a date like jan 1, 2021
    await box.setSaleStartTimestamp(1609459200)

    testContext = {
      box,
      wallet,
      anotherWallet,
    }
  })

  it('Should upgrade contract logic', async () => {
    const { box } = testContext

    // Call a function that changes state
    const price: BigNumber = await box.getPrice()
    await box.purchase({ value: price })

    const BoxV2 = await ethers.getContractFactory('FakeRarePizzasBoxV2')
    const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)

    expect(await boxV2.totalSupply()).to.equal(1)
  })

  // TODO: FIX-ME: interferes with other upgrade logic and needs to pull in the signers to fix it
  // it('Should not upgrade contract logic when admin changed', async () => {
  //   const { box, wallet } = testContext

  //   await upgrades.admin.transferProxyAdminOwnership(wallet.address)

  //   const BoxV2 = await ethers.getContractFactory('FakeRarePizzasBoxV2')
  //   await expect(upgrades.upgradeProxy(box.address, BoxV2)).to.be.revertedWith('caller is not the owner')
  // })
})
