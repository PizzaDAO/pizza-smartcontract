import { expect } from 'chai'
import { BigNumber, Contract, Signer, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider } from 'ethereum-waffle'
import { merkleTree as utils } from './helpers'

import config, { NetworkConfig } from '../config'

type TestContext = {
  box: Contract
  boxV4: Contract
  random: Contract
  accounts: SignerWithAddress[]
}

let testContext: TestContext

let getRinkebyRandomConsumer = async (box: Contract) => {
  const RandomConsumer = await ethers.getContractFactory('FakeRandomV2')
  return await RandomConsumer.deploy(
    config.CHAINLINK_RINKEBY_VRF_COORD,
    '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
    box.address,
  )
}
const accountList = [
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
  '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
  '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
  '0x976ea74026e726554db657fa54763abd0c3a0aa9',
  '0x14dc79964da2c08b23698b3d3cc7ca32193d9955',
  '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
  '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
  '0xbcd4042de499d14e55001ccbb24a551f3b954096',
  '0x71be63f3384f5fb98995898a86b02fb2426c5788',
  '0xfabb0ac9d68b0b445fb7357272ff202c5651694a',
  '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
]

const setup = async () => {
  // Deploy the original contract
  const accounts = await ethers.getSigners()

  const Box = await ethers.getContractFactory('RarePizzasBox')
  const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])
  console.log(upgrades)
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
  const BoxV4 = await ethers.getContractFactory('RarePizzasBoxV4')
  const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)
  const boxV3 = await upgrades.upgradeProxy(boxV2.address, BoxV3)
  const boxV4 = await upgrades.upgradeProxy(boxV3.address, BoxV4)
  await boxV4.setmultiPurchaseLimit(15)
  // set up the random consumer
  await boxV4.setVRFConsumer(random.address)
  return {
    box: box,
    boxV4: boxV4,
    random: random,
    accounts,
  }
}

describe('Box V4  Tests', async () => {
  testContext = await setup()
  context('merkle root tests', async () => {
    it('can set merkle roots and make a claim', async () => {
      const { boxV4, accounts, random } = testContext
      let Tree = utils.merkleTree

      await boxV4.setSaleWhitelist(Tree.root)
      await boxV4.setclaimWhiteList(Tree.root2)

      let proof = Tree.tree2.getProof(Tree.elements2[1])
      proof = proof.map((item: any) => '0x' + item.data.toString('hex'))

      await boxV4.connect(accounts[1]).claim(proof, Tree.claimableAmount)

      await random.fulfillRandomWordsWrapper(7777, [234324])

      expect(await boxV4.balanceOf(accounts[1].address)).to.equal(5)
    })

    it('can set merkle roots and make a multiprepurchase', async () => {
      const { boxV4, accounts, random } = testContext
      let Tree = utils.merkleTree
      await boxV4.setMaxNewPurchases(20)
      await boxV4.setSaleWhitelist(Tree.root)
      await boxV4.setclaimWhiteList(Tree.root2)
      let proof = Tree.tree.getProof(Tree.elements[1])
      proof = proof.map((item: any) => '0x' + item.data.toString('hex'))
      await boxV4.connect(accounts[1]).prePurchase(proof, 10, { value: ethers.utils.parseEther('0.80') })

      await random.fulfillRandomWordsWrapper(7777, [234324])
      expect(await boxV4.balanceOf(accounts[1].address)).to.equal(10)
    })

    it('user can multi purchase for new flat price', async () => {
      const { boxV4, accounts, random } = testContext
      await boxV4.setMaxNewPurchases(11)

      expect(await boxV4.maxNewPurchases()).to.equal(11)
      await expect(
        boxV4.connect(accounts[1]).multiPurchase(12, { value: ethers.utils.parseEther('1.2') }),
      ).to.be.revertedWith('new purchase must be less than max')
      await boxV4.setMaxNewPurchases(25)
      await expect(
        boxV4.connect(accounts[1]).multiPurchase(14, { value: ethers.utils.parseEther('.71') }),
      ).to.be.revertedWith('price too low')
      //claimStarted(bytes32 id, address to, uint256 amount);
      await expect(boxV4.connect(accounts[1]).multiPurchase(15, { value: ethers.utils.parseEther('1.6') }))
        .to.emit(boxV4, 'claimStarted')
        .withArgs(7777, accounts[1].address, 15)
      let claim = await boxV4.claims(7777)

      await random.fulfillRandomWordsWrapper(7777, [234324])
      expect(claim.amount).to.equal(15)
      expect(claim.to).to.equal(accounts[1].address)

      expect(await boxV4.totalNewPurchases()).to.equal(15)
      expect(await boxV4.balanceOf(accounts[1].address)).to.equal(15)

      /*await expect(boxV4.connect(accounts[0]).purchase({ value: ethers.utils.parseEther('.08') })).to.be.revertedWith(
        'new purchase must be less than max',
      )
      */
    })
    it('can still batch mint', async () => {
      const { boxV4, accounts, random } = testContext
      await boxV4.startBatchMint(accountList, 1)
      await random.fulfillRandomWordsWrapper(7777, [234324])
      for (let i = 1; i < accountList.length; i++) {
        expect(await boxV4.balanceOf(accountList[i])).to.equal(1)
      }
    })
    it('can gift', async () => {
      const { boxV4, accounts, random } = testContext
      await expect(boxV4.gift(accounts[4].address, 5)).to.emit(boxV4, 'Gift').withArgs(accounts[4].address, 5)
      expect(await boxV4.balanceOf(accounts[4].address)).to.equal(5)
    })
  })
})
