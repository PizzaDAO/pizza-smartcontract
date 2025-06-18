import utils from './utils'
import { ethers, upgrades } from 'hardhat'
import config from '../config'

// This script executes the V5 upgrade directly
// Only works if you are the owner of the proxy admin
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getBoxProxyAddress(config)

  console.log('========================================')
  console.log('RarePizzasBox V5 Direct Upgrade')
  console.log('========================================')
  console.log('Network:', config.NETWORK)
  console.log('Upgrading with account:', deployer.address)
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'ETH')
  console.log('Proxy Address:', proxy)
  console.log('')

  // Verify we're on the right network
  if (config.NETWORK === 'mainnet') {
    console.log('⚠️  WARNING: You are about to upgrade on MAINNET')
    console.log('Press Ctrl+C within 10 seconds to cancel...')
    await new Promise(resolve => setTimeout(resolve, 10000))
  }

  // Get current contract to check state
  const currentBox = await ethers.getContractAt('RarePizzasBoxV4', proxy)

  try {
    const currentStatus = await currentBox.status()
    console.log('Current batch mint status:', currentStatus)
    if (currentStatus === 1) {
      console.log('⚠️  WARNING: Batch mint is currently QUEUED - this may be the stuck state!')
    }
  } catch (e) {
    console.log('Could not read current status (this is normal for older versions)')
  }

  // Get the V5 contract factory
  console.log('Compiling RarePizzasBoxV5...')
  const UpgradeV5 = await ethers.getContractFactory('RarePizzasBoxV5')

  // Execute the upgrade
  console.log('Executing upgrade...')
  const upgradeV5 = await upgrades.upgradeProxy(proxy, UpgradeV5)
  await upgradeV5.deployed()

  console.log('')
  console.log('✅ Upgrade Successful!')
  console.log('========================================')
  console.log('Proxy remains at:', upgradeV5.address)
  console.log('New implementation:', await upgrades.erc1967.getImplementationAddress(upgradeV5.address))
  console.log('')

  // Verify the upgrade
  console.log('Verifying upgrade...')
  const boxV5 = await ethers.getContractAt('RarePizzasBoxV5', proxy)

  // Test new functions exist
  try {
    const batchMintRequest = await boxV5.getBatchMintRequest()
    console.log('✓ getBatchMintRequest() works:', batchMintRequest)

    const status = await boxV5.status()
    console.log('✓ Current status:', status)
  } catch (e) {
    console.error('❌ Error verifying new functions:', e)
  }

  console.log('')
  console.log('Next steps:')
  console.log('1. Verify the new implementation on Etherscan')
  console.log('2. If batch mint is stuck, run the recovery script')
  console.log('3. Monitor the contract for normal operation')
  console.log('')

  // Save deployment data
  utils.publishUpgradeData('RarePizzasBoxV5', proxy, await upgrades.erc1967.getImplementationAddress(proxy))

  // Note: You may need to add publishBoxWeb3V5AdminAbi to utils.ts
  // utils.publishBoxWeb3V5AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during upgrade:', error)
    process.exit(1)
  })
