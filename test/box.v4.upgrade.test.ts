import { expect } from 'chai'
import { BigNumber, Contract, Signer, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import config, { NetworkConfig } from '../config'

type TestContext = {
  box: Contract
  boxV3: Contract
  wallet: SignerWithAddress
  signer: SignerWithAddress
}

let testContext: TestContext

let getRinkebyRandomConsumer = async (box: Contract) => {
  const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
  return await RandomConsumer.deploy(
    config.CHAINLINK_RINKEBY_VRF_COORD,
    config.CHAINLINK_RINKEBY_TOKEN,
    '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
    config.CHAINLINK_RINKEBY_VRF_FEE,
    box.address,
  )
}

const setup = async () => {
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
  const random = await getRinkebyRandomConsumer(box)

  // run the upgrade
  const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2')
  const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3')
  const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)
  const boxV3 = await upgrades.upgradeProxy(box.address, BoxV3)
  console.log(boxV2.address)

  // set up the random consumer
  await boxV2.setVRFConsumer(random.address)
  return {
    box: box,
    boxV3: boxV3,
    wallet,
    signer,
  }
}

describe('Box V4 Real Upgrade Tests', function () {
  context('prepare the V3 state', async () => {
    testContext = await setup()
    it('Should upgrade contract logic to v4', async () => {
      const { box, boxV3 } = testContext
      const BoxV4 = await ethers.getContractFactory('RarePizzasBoxV4')
      const boxV4 = await upgrades.upgradeProxy(box.address, BoxV4)
      expect(await boxV4.totalSupply()).to.equal(1)
      // deploy the upgraded contracts
    })
  })
})
