import { expect } from 'chai'
import { BigNumber, Contract, Signer, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider } from 'ethereum-waffle'

import config, { NetworkConfig } from '../config'

type TestContext = {
  box: Contract
  wallet: SignerWithAddress
  signer: SignerWithAddress
}

let testContext: TestContext

let getRinkebyRandomConsumer = async (box: Contract) => {
  const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
  return await RandomConsumer.deploy(
    config.CHAINLINK_RINKEBY_VRF_COORD,
    config.CHAINLINK_RINKEBY_TOKEN,
    config.CHAINLINK_RINKEBY_VRF_KEY_HASH,
    config.CHAINLINK_RINKEBY_VRF_FEE,
    box.address,
  )
}

let setup = async () => {
  // Deploy the original contract
  const [signer, wallet] = await ethers.getSigners()
  const Box = await ethers.getContractFactory('RarePizzasBox')
  const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])

  // pick a date like jan 1, 2021
  await box.setSaleStartTimestamp(1609459200)

  // Call a function that changes state
  const price: BigNumber = await box.getPrice()
  await box.purchase({ value: price })

  expect(await box.totalSupply()).to.equal(1)

  return {
    box: box,
    wallet,
    signer,
  }
}

describe('Box V2 Real Upgrade Tests', function () {
  context('prepare the V1 state', async () => {
    testContext = await setup()
    it('Should upgrade contract logic to V2', async () => {
      const { box } = testContext

      // deploy the upgraded contracts
      const random = await getRinkebyRandomConsumer(box)

      // run the upgrade
      const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2')
      const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)
      console.log(boxV2.address)

      // set up the random consumer
      await boxV2.setVRFConsumer(random.address)

      expect(await boxV2.totalSupply()).to.equal(1)
    })

    it('Should not modify ownable when upgrading', async () => {
      const { box, wallet, signer } = testContext

      expect(await box.owner()).to.equal(signer.address)

      // transfer ownership of the proxy
      await upgrades.admin.transferProxyAdminOwnership(wallet.address)
      expect(await box.owner()).to.equal(signer.address) // the signer is still the owner

      // transfer ownership of the contract logic to another wallet
      await box.connect(signer).transferOwnership(wallet.address)
      expect(await box.owner()).to.equal(wallet.address)

      // run the upgrade (using the new owner)
      const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2', wallet)
      const BoxV2Address = await upgrades.prepareUpgrade(box.address, BoxV2)
      await upgrades.upgradeProxy(box.address, BoxV2)

      // validate the owner is not changed
      expect(await box.owner()).to.equal(wallet.address)
    })
  })
})
