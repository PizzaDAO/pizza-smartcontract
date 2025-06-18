import { BigNumber, Contract, Signer, Wallet } from 'ethers';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { randomNumber } from '@ethersproject/testcases'
import config, { NetworkConfig } from '../config';

type TestContext = {
  box: Contract;
  boxV5: Contract;
  random: Contract;
  deployer: SignerWithAddress;
  user: SignerWithAddress;
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
  const [deployer, user]: SignerWithAddress[] = await ethers.getSigners()
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
    deployer,
    user,
  }
}

describe('Box V5 tests', () => {
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let boxV5: Contract;
  let random: Contract;

  beforeEach(async () => {
    testContext = await setup();
    deployer = testContext.deployer;
    user = testContext.user;
    boxV5 = testContext.boxV5;
    random = testContext.random;
  });

  describe('Existing tests - updated', () => {
    describe('setBatchMintStatus', () => {
      it('Should return the correct status for a batch mint', async () => {
        let status = await boxV5.status()
        expect(status).to.equal(0)

        await boxV5.connect(deployer).setBatchMintStatus(1);
        status = await boxV5.status()
        expect(status).to.equal(1)
      });

      it('Should allow the admin address to set the batchMintStatus', async () => {
        let initialStatus = await boxV5.status()
        expect(initialStatus).to.equal(0)

        await boxV5.connect(deployer).setBatchMintStatus(1)

        const status = await boxV5.status()
        expect(status).to.equal(1)
      });

      it('Should disallow a non-admin address from setting the batchMintStatus', async () => {
        await expect(
          boxV5.connect(user).setBatchMintStatus(1)
        ).to.be.revertedWith('Ownable: caller is not the owner');

        const status = await boxV5.status();
        expect(status).to.equal(0);
      });
    });

    describe('manualAdminFulfillRandomWords', () => {
      it('Should allow admin to manually resubmit fulfillRandomWords for the currently set batchMintRequest',
        async () => {
          // Start batch mint
          const quantity = 10
          await boxV5.startBatchMint(accountList, quantity)

          // Get the actual request ID from the contract
          const requestIdBytes32 = await boxV5.getBatchMintRequest();
          const requestId = ethers.BigNumber.from(requestIdBytes32);

          let rv = randomNumber('31', 256, 512)

          await boxV5.manualAdminFulfillRandomWords(
            requestId,
            [rv],
            '0xf72e3c66b80dbb40ff430da97aca347109574cd5657be6c9dbd997671bef5877'
          )

          // Verify mints completed (manual fulfill includes the minting logic)
          for (let i = 0; i < accountList.length; i++) {
            expect(await boxV5.balanceOf(accountList[i])).to.be.equal(quantity)
          }

          // Verify status is back to OPEN
          expect(await boxV5.status()).to.equal(0)
        });

      it('Should disallow method being called with mismatched batchMintRequest', async () => {
        const quantity = 10
        await boxV5.startBatchMint(accountList, quantity)

        // Get the actual request ID
        const requestIdBytes32 = await boxV5.getBatchMintRequest();
        const correctRequestId = ethers.BigNumber.from(requestIdBytes32);
        const wrongRequestId = correctRequestId.add(1); // Wrong ID

        let rv = randomNumber('31', 256, 512)
        await expect(
          boxV5.manualAdminFulfillRandomWords(wrongRequestId, [rv], '0xf72e3c66b80dbb40ff430da97aca347109574cd5657be6c9dbd997671bef5877')
        ).to.be.revertedWith('Invalid Request ID')
      });

      it('Should disallow method being used by non-owner address', async () => {
        const quantity = 10
        await boxV5.startBatchMint(accountList, quantity)

        const requestIdBytes32 = await boxV5.getBatchMintRequest();
        const requestId = ethers.BigNumber.from(requestIdBytes32);

        let rv = randomNumber('31', 256, 512)
        await expect(
          boxV5.connect(user).manualAdminFulfillRandomWords(requestId, [rv], '0xf72e3c66b80dbb40ff430da97aca347109574cd5657be6c9dbd997671bef5877')
        ).to.be.revertedWith('Ownable: caller is not the owner')
      });
    });
  });

  describe('Additional V5 tests', () => {
    describe('setBatchMintStatus edge cases', () => {
      it('Should handle all status enum values correctly', async () => {
        // Test all enum values (0=OPEN, 1=QUEUED, 2=FETCHED)
        for (let status = 0; status <= 2; status++) {
          await boxV5.connect(deployer).setBatchMintStatus(status);
          expect(await boxV5.status()).to.equal(status);
        }
      });

      it('Should allow resetting stuck QUEUED status to OPEN', async () => {
        // Simulate stuck state
        await boxV5.connect(deployer).setBatchMintStatus(1); // QUEUED
        expect(await boxV5.status()).to.equal(1);

        // Reset to OPEN
        await boxV5.connect(deployer).setBatchMintStatus(0); // OPEN
        expect(await boxV5.status()).to.equal(0);

        // Verify can start new batch mint
        await expect(boxV5.startBatchMint([accountList[0]], 1)).to.not.be.reverted;
      });
    });

    describe('manualAdminFulfillRandomWords comprehensive tests', () => {
      it('Should emit event with exact parameters provided', async () => {
        await boxV5.startBatchMint([accountList[0]], 1);
        const requestIdBytes32 = await boxV5.getBatchMintRequest();
        const requestId = ethers.BigNumber.from(requestIdBytes32);

        const randomValue = randomNumber('99', 256, 512);
        const txHash = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';

        await expect(
          boxV5.manualAdminFulfillRandomWords(requestId, [randomValue], txHash)
        ).to.emit(boxV5, 'adminManuallyFulfilledRandomWords')
          .withArgs(requestId, [randomValue], txHash);
      });

      it('Should handle multiple random values array correctly', async () => {
        await boxV5.startBatchMint([accountList[0]], 1);
        const requestIdBytes32 = await boxV5.getBatchMintRequest();
        const requestId = ethers.BigNumber.from(requestIdBytes32);

        // Test with multiple random values (only first should be used)
        const randomValues = [
          randomNumber('100', 256, 512),
          randomNumber('200', 256, 512),
          randomNumber('300', 256, 512)
        ];

        await boxV5.manualAdminFulfillRandomWords(
          requestId,
          randomValues,
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        );

        expect(await boxV5.balanceOf(accountList[0])).to.equal(1);
      });

      it('Should not allow manual fulfill when status is OPEN without pending request', async () => {
        // Status is OPEN by default
        expect(await boxV5.status()).to.equal(0);

        // Try to manually fulfill without a pending request
        // The request ID would be 0x0 initially
        const emptyRequestId = ethers.BigNumber.from(0);

        await expect(
          boxV5.manualAdminFulfillRandomWords(
            123456, // Some random request ID
            [randomNumber('50', 256, 512)],
            '0x0000000000000000000000000000000000000000000000000000000000000000'
          )
        ).to.be.revertedWith('Invalid Request ID');
      });
    });

    describe('Integration test: Full stuck recovery flow', () => {
      it('Should recover from stuck state and process new batch mints', async () => {
        // 1. Start initial batch mint
        const firstBatch = accountList.slice(0, 3);
        await boxV5.startBatchMint(firstBatch, 2);
        expect(await boxV5.status()).to.equal(1); // QUEUED

        // 2. Simulate stuck state (VRF never responds)
        // In real scenario, this is where Chainlink VRF would fail

        // 3. Attempt another batch mint (should fail)
        await expect(
          boxV5.startBatchMint([accountList[5]], 1)
        ).to.be.revertedWith('minting has been queued');

        // 4. Admin recovery: Get request ID and manually fulfill
        const stuckRequestIdBytes32 = await boxV5.getBatchMintRequest();
        const stuckRequestId = ethers.BigNumber.from(stuckRequestIdBytes32);
        const recoveryRandom = randomNumber('777', 256, 512);
        const failedTxHash = '0xfa11ed0000000000000000000000000000000000000000000000000000000000';

        await boxV5.manualAdminFulfillRandomWords(
          stuckRequestId,
          [recoveryRandom],
          failedTxHash
        );

        // 5. Verify recovery successful
        expect(await boxV5.status()).to.equal(0); // OPEN
        for (let i = 0; i < firstBatch.length; i++) {
          expect(await boxV5.balanceOf(firstBatch[i])).to.equal(2);
        }

        // 6. Verify can process new batch mints
        const secondBatch = accountList.slice(5, 8);
        await boxV5.startBatchMint(secondBatch, 3);
        expect(await boxV5.status()).to.equal(1); // QUEUED
      });

      it('Should handle gas-intensive large batch recovery', async () => {
        // Create a large batch that might fail with default gas
        const largeBatch = accountList.slice(0, 10);
        const quantityPerUser = 20; // 200 total mints

        // Start large batch mint
        await boxV5.startBatchMint(largeBatch, quantityPerUser);

        // Manual fulfill with high gas limit
        const requestIdBytes32 = await boxV5.getBatchMintRequest();
        const requestId = ethers.BigNumber.from(requestIdBytes32);
        const randomValue = ethers.BigNumber.from('99999999999999999999');

        // This should work with high gas limit
        await boxV5.manualAdminFulfillRandomWords(
          requestId,
          [randomValue],
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          { gasLimit: 30_000_000 }
        );

        // Verify all mints completed
        for (let i = 0; i < largeBatch.length; i++) {
          expect(await boxV5.balanceOf(largeBatch[i])).to.equal(quantityPerUser);
        }

        // Verify status is back to OPEN
        expect(await boxV5.status()).to.equal(0);
      });
    });

    describe('getBatchMintRequest functionality', () => {
      it('Should return correct request ID after startBatchMint', async () => {
        // Initially should be 0x0
        const initialRequest = await boxV5.getBatchMintRequest();
        expect(initialRequest).to.equal('0x' + '0'.repeat(64));

        // Start batch mint
        await boxV5.startBatchMint([accountList[0]], 1);

        // Should now have a non-zero request ID
        const requestId = await boxV5.getBatchMintRequest();
        expect(requestId).to.not.equal('0x' + '0'.repeat(64));
      });

      it('Should maintain request ID across multiple calls', async () => {
        await boxV5.startBatchMint([accountList[0]], 1);

        const requestId1 = await boxV5.getBatchMintRequest();
        const requestId2 = await boxV5.getBatchMintRequest();

        expect(requestId1).to.equal(requestId2);
      });
    });
  });
});
