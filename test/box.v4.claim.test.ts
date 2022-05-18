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

describe('Box V4  Tests', function () {
  beforeEach(async () => {
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

    // set up the random consumer
    await boxV4.setVRFConsumer(random.address)
    testContext = {
      box: box,
      boxV4: boxV4,
      random: random,
      accounts,
    }
  })

  it.only('can set merkle roots and make a claim', async () => {
    const { boxV4, accounts, random } = testContext
    let Tree = utils.merkleTree
    await boxV4.setSaleWhitelist(Tree.root)
    await boxV4.setclaimWhiteList(Tree.root2)
    let proof = Tree.tree2.getProof(Tree.elements2[1])
    proof = proof.map((item: any) => '0x' + item.data.toString('hex'))
    await boxV4.connect(accounts[1]).claim(proof, 5)

    await random.fulfillRandomWordsWrapper(7777, [234324])
    expect(await boxV4.balanceOf(accounts[1].address)).to.equal(5)
  })

  it.only('can set merkle roots and make a multiprepurchase', async () => {
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

  it.only('user can multi purchase for new flat price', async () => {
    const { boxV4, accounts, random } = testContext
    await boxV4.setMaxNewPurchases(11)

    expect(await boxV4.maxNewPurchases()).to.equal(11)
    await expect(
      boxV4.connect(accounts[1]).multiPurchase(12, { value: ethers.utils.parseEther('1.2') }),
    ).to.be.revertedWith('new purchase must be less than max')
    await boxV4.setMaxNewPurchases(20)
    await expect(
      boxV4.connect(accounts[1]).multiPurchase(14, { value: ethers.utils.parseEther('.71') }),
    ).to.be.revertedWith('price too low')
    //claimStarted(bytes32 id, address to, uint256 amount);
    await expect(boxV4.connect(accounts[1]).multiPurchase(15, { value: ethers.utils.parseEther('1.2') }))
      .to.emit(boxV4, 'claimStarted')
      .withArgs(7777, accounts[1].address, 15)
    let claim = await boxV4.claims(7777)
    expect(claim.amount).to.equal(15)
    expect(claim.to).to.equal(accounts[1].address)

    await random.fulfillRandomWordsWrapper(7777, [234324])

    expect(await boxV4.totalNewPurchases()).to.equal(15)
    expect(await boxV4.balanceOf(accounts[1].address)).to.equal(15)
    // expect(await boxV4.totalNewPurchases()).to.equal(10)
    /*await expect(boxV4.connect(accounts[0]).purchase({ value: ethers.utils.parseEther('.08') })).to.be.revertedWith(
      'new purchase must be less than max',
    )
    */
  })
  /**  it('Should not modify ownable when upgrading', async () => {
            const { box, wallet, signer } = testContext
    
            expect(await box.owner()).to.equal(signer.address);
    
            // transfer ownership of the proxy
            await upgrades.admin.transferProxyAdminOwnership(wallet.address)
            expect(await box.owner()).to.equal(signer.address); // the signer is still the owner
    
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
        **/
})
