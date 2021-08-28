import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { randomNumber } from '@ethersproject/testcases'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers, waffle } from 'hardhat'

import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

import config, { NetworkConfig } from '../config'

use(solidity)

type TestContext = {
  sliceReservations: Contract
  boxV2: Contract
  boxV3: Contract
  random: Contract
  testHash: string
  wallet: Wallet
  userWallet: Wallet
  accounts: Wallet[]
}

const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext

describe('Box V3 Purchase Tests', function () {
  beforeEach(async () => {
    const [wallet, userWallet] = new MockProvider().getWallets()
    const accounts = waffle.provider.getWallets()
    const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
    const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2')
    const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3')
    const SliceReservations = await ethers.getContractFactory('sliceReservations')
    const boxV2 = await BoxV2.deploy()
    const boxV3 = await BoxV3.deploy()

    // use KOVAN contract info for out tests so its clear whats happening
    // and add our V2 callback contract
    const random = await RandomConsumer.deploy(
      config.CHAINLINK_KOVAN_VRF_COORD,
      config.CHAINLINK_KOVAN_TOKEN,
      config.CHAINLINK_KOVAN_VRF_KEY_HASH,
      config.CHAINLINK_KOVAN_VRF_FEE,
      boxV3.address,
    )

    // Initialize to set owner, since not deployed via proxy
    await boxV2.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))
    await boxV3.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))
    // Pick a date like jan 1, 2021 so the sale is open
    await boxV2.setSaleStartTimestamp(1609459200)

    // set up the consumer to the mock contract
    await boxV2.setVRFConsumer(random.address)
    await boxV3.setSaleStartTimestamp(1609459200)

    await boxV3.setVRFConsumer(random.address)
    // just a hardcoded value
    const testHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
    const sliceReservations = await SliceReservations.deploy(boxV3.address)
    console.log('SET SLICE ADDRESS')
    console.log(sliceReservations.rarePizzas)
    await boxV3.setSliceAddress(sliceReservations.address)
    testContext = {
      sliceReservations,
      boxV2,
      boxV3,
      random,
      testHash,
      wallet,
      userWallet,
      accounts,
    }
  })

  describe('Check methods', () => {
    it('Should set the VRF query fee', async () => {
      const { random } = testContext
      const fee: BigNumber = await random.getFee()

      // it's the kovan price set in the beforeEach
      expect(fee).to.equal(BigNumber.from('100000000000000000'))
    })
  })

  describe('Purchase Slices', function () {
    describe('Happy-ish flow', () => {
      it.only('Should allow purchase of box', async () => {
        const { boxV3, random, sliceReservations, testHash, accounts } = testContext

        console.log('start')
        await boxV3.setSliceAddress(sliceReservations.address)

        let price: BigNumber = await boxV3.getPrice()

        await boxV3.purchase({ value: price })

        await random.fulfillRandomnessWrapper(testHash, randomNumber('31' + 2, 256, 512))
        price = await boxV3.getPrice()

        for (let i = 0; i < 8; i++) {
          await boxV3.connect(accounts[i]).purchaseSlice({ value: price })
          expect(await sliceReservations.balanceOf(accounts[i].address, 2)).to.equal(1)
        }

        await random.fulfillRandomnessWrapper(testHash, 17)
        expect(await boxV3.ownerOf(2)).to.equal('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')
        await boxV3.purchaseSlice({ value: price })
        expect((await boxV3.currentSliceID()).toString()).to.equal('3')
        expect((await boxV3.getSliceHolders(3)).length).to.equal(1)
      })
    })
  })
})
