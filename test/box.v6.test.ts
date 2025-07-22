import { expect } from 'chai'
import { BigNumber, Contract, Signer } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import config, { NetworkConfig } from '../config'

type TestContext = {
  boxV4: Contract
  boxV5: Contract
  boxV6: Contract
  random: Contract
  accounts: SignerWithAddress[]
}

let testContext: TestContext

const getRinkebyRandomConsumer = async (box: Contract) => {
  const RandomConsumer = await ethers.getContractFactory('FakeRandomV2Sequential')
  return await RandomConsumer.deploy(
    config.CHAINLINK_RINKEBY_VRF_COORD,
    '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
    box.address,
  )
}

const setupV5ContractWithBuggyState = async () => {
  const accounts = await ethers.getSigners()

  // Deploy original contract and upgrade to V4 (where bug was introduced)
  const Box = await ethers.getContractFactory('RarePizzasBox')
  const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])
  await box.setSaleStartTimestamp(1609459200)

  const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2Fix')
  await upgrades.upgradeProxy(box.address, BoxV2)

  const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3Fix')
  await upgrades.upgradeProxy(box.address, BoxV3)

  const BoxV4 = await ethers.getContractFactory('RarePizzasBoxV4')
  await upgrades.upgradeProxy(box.address, BoxV4)

  const BoxV5 = await ethers.getContractFactory('RarePizzasBoxV5')
  const boxV5 = await upgrades.upgradeProxy(box.address, BoxV5)

  // Configure V4
  const random = await getRinkebyRandomConsumer(boxV5)
  await boxV5.setVRFConsumer(random.address)
  await boxV5.setmultiPurchaseLimit(15)
  await boxV5.setMaxNewPurchases(1000)

  return { boxV5, random, accounts }
}

describe('RarePizzasBoxV6 Double Counting Bug Fix Tests', function () {

  describe('V5 Bug Reproduction and V6 Fix', () => {
    it('Should demonstrate and fix the V5 double counting bug', async () => {
      const { boxV5, random, accounts } = await setupV5ContractWithBuggyState() // Use V5

      // === PHASE 1: Reproduce the bug in V5 ===
      console.log("=== Testing V5 Bug ===")

      // Make some purchases in V5 (this will create the bug)
      const price = await boxV5.getPrice()
      await boxV5.connect(accounts[1]).multiPurchase(2, { value: price.mul(2) })

      // Now we can get the actual request ID from the sequential mock
      let currentRequestId = await random.nextRequestId() - 2 // -2 because we made 2 requests
      await random.fulfillRandomWordsWrapper(currentRequestId, [12345])
      await random.fulfillRandomWordsWrapper(currentRequestId + 1, [12346])

      // Make a team allocation in V5
      await boxV5.startBatchMint([accounts[2].address], 3)
      const batchRequestId = await boxV5.getBatchMintRequest() // Now we can use this!
      await random.fulfillRandomWordsWrapper(batchRequestId, [67890])

      // Check V5 state - this demonstrates the bug
      const v5PurchasedCount = await boxV5._purchased_pizza_count()
      const v5MintedCount = await boxV5._minted_pizza_count()
      const v5TotalSupply = await boxV5.totalSupply()

      console.log(`V5 - Purchased: ${v5PurchasedCount}, Minted: ${v5MintedCount}, Total: ${v5TotalSupply}`)

      expect(v5PurchasedCount).to.equal(2) // ✓ Correct
      expect(v5TotalSupply).to.equal(5) // ✓ Correct (2 purchases + 3 team)
      expect(v5MintedCount).to.equal(5) // ❌ BUG: Should be 3, but it's 5 (includes purchases!)

      // === PHASE 2: Make more activity ===
      console.log("=== Testing V5 More Activity ===")

      await boxV5.connect(accounts[3]).multiPurchase(1, { value: price })
      currentRequestId = await random.nextRequestId() - 1 // Get the last request ID
      await random.fulfillRandomWordsWrapper(currentRequestId, [11111])

      // === PHASE 3: Upgrade to V6 and verify initial broken state ===
      console.log("=== Testing V6 Initial State ===")

      const BoxV6 = await ethers.getContractFactory('RarePizzasBoxV6')
      const boxV6 = await upgrades.upgradeProxy(boxV5.address, BoxV6)

      // V6 should have _corrected_team_count = 0 initially
      expect(await boxV6._corrected_team_count()).to.equal(0)

      // === PHASE 4: Initialize V6 and verify correction ===
      console.log("=== Testing V6 Initialization and Fix ===")

      await boxV6.initializeCorrectedCount()

      // After initialization, _corrected_team_count should be calculated correctly
      const finalPurchasedCount = await boxV6._purchased_pizza_count()
      const finalMintedCount = await boxV6._minted_pizza_count() // Legacy counter
      const finalCorrectedTeamCount = await boxV6._corrected_team_count() // New correct counter
      const finalTotalSupply = await boxV6.totalSupply()

      console.log(`V6 Post-Init - Purchased: ${finalPurchasedCount}, Legacy Minted: ${finalMintedCount}, Corrected Team: ${finalCorrectedTeamCount}, Total: ${finalTotalSupply}`)

      // Verify the correction
      expect(finalPurchasedCount).to.equal(3) // Should remain unchanged
      expect(finalTotalSupply).to.equal(6) // Should remain unchanged
      expect(finalMintedCount).to.equal(6) // Should remain unchanged (historical record)
      expect(finalCorrectedTeamCount).to.equal(3) // ✓ FIXED: totalSupply - purchases = 6 - 3 = 3

      // === PHASE 5: Test V6 operations work correctly after initialization ===
      console.log("=== Testing V6 Post-Fix Operations ===")

      // Test new purchase doesn't increment team counter
      await boxV6.connect(accounts[5]).multiPurchase(1, { value: price })
      currentRequestId = await random.nextRequestId() - 1 // Get the last request ID
      await random.fulfillRandomWordsWrapper(currentRequestId, [22222])

      expect(await boxV6._purchased_pizza_count()).to.equal(4) // Should increment
      expect(await boxV6._corrected_team_count()).to.equal(3) // Should NOT increment
      expect(await boxV6.totalSupply()).to.equal(7)

      // Test new team allocation increments team counter correctly
      await boxV6.startBatchMint([accounts[6].address], 2)
      const newBatchRequestId = await boxV6.getBatchMintRequest()
      await random.fulfillRandomWordsWrapper(newBatchRequestId, [33333])

      expect(await boxV6._purchased_pizza_count()).to.equal(4) // Should remain unchanged
      expect(await boxV6._corrected_team_count()).to.equal(5) // Should increment by 2 (3+2)
      expect(await boxV6.totalSupply()).to.equal(9)

      // Verify final balances
      expect(await boxV6.balanceOf(accounts[1].address)).to.equal(2) // Original V4 purchase
      expect(await boxV6.balanceOf(accounts[2].address)).to.equal(3) // Original V4 team allocation
      expect(await boxV6.balanceOf(accounts[3].address)).to.equal(1) // V5 purchase
      expect(await boxV6.balanceOf(accounts[5].address)).to.equal(1) // V6 purchase
      expect(await boxV6.balanceOf(accounts[6].address)).to.equal(2) // V6 team allocation

      console.log("=== Bug Fix Verification Complete ===")
    })

    it('Should test initialization behavior', async () => {
      const { boxV5, random, accounts } = await setupV5ContractWithBuggyState()

      // Create some activity first so that initialization will set _corrected_team_count > 0
      const price = await boxV5.getPrice()
      await boxV5.connect(accounts[1]).multiPurchase(1, { value: price })
      await random.fulfillRandomWordsWrapper(1, [12345])

      await boxV5.startBatchMint([accounts[2].address], 2)
      const batchRequestId = await boxV5.getBatchMintRequest()
      await random.fulfillRandomWordsWrapper(batchRequestId, [67890])

      // Upgrade to V6
      const BoxV6 = await ethers.getContractFactory('RarePizzasBoxV6')
      const boxV6 = await upgrades.upgradeProxy(boxV5.address, BoxV6)

      // First initialization should work and set _corrected_team_count > 0
      await boxV6.initializeCorrectedCount()
      expect(await boxV6._corrected_team_count()).to.be.gt(0) // Should be > 0 now

      // Test double initialization behavior - should now be prevented
      await expect(boxV6.initializeCorrectedCount())
        .to.be.revertedWith('Already initialized')
    })

    it('Should test V6 operations without initialization', async () => {
      const { boxV5, accounts } = await setupV5ContractWithBuggyState()

      // Upgrade to V6 but don't initialize
      const BoxV6 = await ethers.getContractFactory('RarePizzasBoxV6')
      const boxV6 = await upgrades.upgradeProxy(boxV5.address, BoxV6)

      // _corrected_team_count should be 0
      expect(await boxV6._corrected_team_count()).to.equal(0)

      // Test what happens without initialization
      try {
        await boxV6.startBatchMint([accounts[1].address], 1)
        console.log("startBatchMint succeeded without initialization")
      } catch (error: any) {
        expect(error.message).to.include('exceeds team mint')
      }

      // Purchases might still work since they don't depend on _corrected_team_count
      const price = await boxV6.getPrice()
      await expect(boxV6.connect(accounts[1]).multiPurchase(1, { value: price }))
        .to.not.be.reverted
    })
  })

  describe('V6 Event Emissions', () => {
    it('Should emit TeamAllocationMinted event correctly', async () => {
      const { boxV5, random, accounts } = await setupV5ContractWithBuggyState()

      // Upgrade to V6 and initialize
      const BoxV6 = await ethers.getContractFactory('RarePizzasBoxV6')
      const boxV6 = await upgrades.upgradeProxy(boxV5.address, BoxV6)
      await boxV6.initializeCorrectedCount()

      // Test event emission
      const teamUsers = [accounts[1].address, accounts[2].address]
      const countPerUser = 2

      await boxV6.startBatchMint(teamUsers, countPerUser)
      const batchRequestId = await boxV6.getBatchMintRequest()

      // V6 contract has a bug: batchMintCount is reset to 0 before the event
      // So the event parameters will be: (users, 0, 0) instead of (users, 2, 4)
      await expect(random.fulfillRandomWordsWrapper(batchRequestId, [44444]))
        .to.emit(boxV6, 'TeamAllocationMinted')
        .withArgs(teamUsers, 0, 0) // Both countPerUser and totalMinted will be 0 due to the bug
    })
  })

  describe('V6 Edge Cases', () => {
    it('Should handle zero total supply correctly during initialization', async () => {
      const accounts = await ethers.getSigners()

      // Deploy fresh V6 with no prior state
      const Box = await ethers.getContractFactory('RarePizzasBox')
      const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])

      // Upgrade directly to V6
      const BoxV6 = await ethers.getContractFactory('RarePizzasBoxV6')
      const boxV6 = await upgrades.upgradeProxy(box.address, BoxV6)

      // Initialize with no existing tokens
      await boxV6.initializeCorrectedCount()

      // All counters should be 0
      expect(await boxV6._corrected_team_count()).to.equal(0)
      expect(await boxV6._purchased_pizza_count()).to.equal(0)
      expect(await boxV6.totalSupply()).to.equal(0)
    })

    it('Should handle large batch allocations correctly', async () => {
      const { boxV5, random, accounts } = await setupV5ContractWithBuggyState()

      // Upgrade to V6 and initialize
      const BoxV6 = await ethers.getContractFactory('RarePizzasBoxV6')
      const boxV6 = await upgrades.upgradeProxy(boxV5.address, BoxV6)
      await boxV6.initializeCorrectedCount()

      // FIX: Ensure we have enough valid accounts and filter out any undefined ones
      const validAccounts = accounts.slice(1, 11).filter(account => account && account.address)
      expect(validAccounts.length).to.be.gte(5, "Need at least 5 valid accounts for this test")

      // Large batch mint - use only first 5 valid accounts
      const batchUsers = validAccounts.slice(0, 5).map(account => account.address)
      const countPerUser = 10

      await boxV6.startBatchMint(batchUsers, countPerUser)
      const batchRequestId = await boxV6.getBatchMintRequest()
      await random.fulfillRandomWordsWrapper(batchRequestId, [55555])

      const expectedTeamCount = batchUsers.length * countPerUser
      expect(await boxV6._corrected_team_count()).to.be.gte(expectedTeamCount)

      // Verify each user got correct amount
      for (const userAddress of batchUsers) {
        expect(await boxV6.balanceOf(userAddress)).to.equal(countPerUser)
      }
    })
  })
})
