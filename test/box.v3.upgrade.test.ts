import { expect } from 'chai'
import { BigNumber, Contract, Signer, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider } from 'ethereum-waffle'

import config, { NetworkConfig } from '../config'

type TestContext = {
    box: Contract
    boxV2: Contract
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
        box.address)
}

describe('Box V3 Real Upgrade Tests', function () {
    beforeEach(async () => {

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
        const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)
        console.log(boxV2.address)

        // set up the random consumer
        await boxV2.setVRFConsumer(random.address)
        testContext = {
            box: box,
            boxV2: boxV2,
            wallet,
            signer
        }
    })

    it('Should upgrade contract logic to v3', async () => {
        const { boxV2 } = testContext
        const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV2')
        const boxV3 = await upgrades.upgradeProxy(boxV2.address, BoxV3)
        expect(await boxV3.totalSupply()).to.equal(1)
        // deploy the upgraded contracts



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
