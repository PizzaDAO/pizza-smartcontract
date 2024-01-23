import { BigNumber, Contract, Signer, Wallet } from 'ethers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import config, { NetworkConfig } from '../config';

type TestContext = {
  box: Contract;
  boxV5: Contract;
  random: Contract;
  accounts: SignerWithAddress[];
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
  const BoxV5 = await ethers.getContractFactory('RarePizzasBoxV5')
  const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)
  const boxV3 = await upgrades.upgradeProxy(boxV2.address, BoxV3)
  const boxV4 = await upgrades.upgradeProxy(boxV3.address, BoxV4)
  const boxV5 = await upgrades.upgradeProxy(boxV4.address, BoxV5)
  await boxV5.setmultiPurchaseLimit(15)
  // set up the random consumer
  await boxV5.setVRFConsumer(random.address)
  return {
    box,
    boxV5,
    random,
    accounts,
  }
}

describe('Box V5 tests', () => {
  beforeEach(async () => {
    testContext = await setup()
  });

  describe('Happy Path', () => {
    it('Should return the correct status for a batch mint', async () => {
      const { boxV5, accounts, random } = testContext;
      const [deployer, user] = accounts;

      let status = await boxV5.connect(deployer).getBatchMintStatus()
      expect(status).to.equal(0)

      await boxV5.connect(deployer).setBatchMintStatus(1);
      status = await boxV5.connect(deployer).getBatchMintStatus()
      expect(status).to.equal(1)
    });

    it('Should allow the admin address to set the batchMintStatus', async () => {
      const { boxV5, accounts } = testContext;
      const [deployer] = accounts;
      let foo = await boxV5.connect(deployer).getBatchMintStatus()
      console.log('foo: ', foo)

      await boxV5.connect(deployer).setBatchMintStatus(1)

      const status = await boxV5.connect(deployer).getBatchMintStatus()
      console.log('status: ', status)
      expect(status).to.equal(1)
    });

    it('Should disallow a non-admin address from setting the batchMintStatus', async () => {
      const { boxV5, accounts } = testContext
      const [user] = accounts

      await expect(
        boxV5.connect(user).setBatchMintStatus(1)
      ).to.be.revertedWith('Ownable: caller is not the owner');
      
      const status = await boxV5.connect(user).getBatchMintStatus();
      expect(status).to.equal(0);
    });
  });
});