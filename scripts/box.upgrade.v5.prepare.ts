import utils from './utils'
import { ethers, upgrades } from 'hardhat'
import config from '../config'

// This script prepares the V5 upgrade (deploys implementation contract)
// Use this when you don't own the proxy admin
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getBoxProxyAddress(config)
  const proxyOwner = utils.getBoxProxyAdminAddress(config)

  console.log('========================================')
  console.log('RarePizzasBox V5 Upgrade Preparation')
  console.log('========================================')
  console.log('Network:', config.NETWORK)
  console.log('Preparing upgrade with account:', deployer.address)
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'ETH')
  console.log('Proxy Address:', proxy)
  console.log('Proxy Admin Owner:', proxyOwner)
  console.log('')

  // Verify we're on the right network
  if (config.NETWORK === 'mainnet') {
    console.log('⚠️  WARNING: You are about to deploy on MAINNET')
    console.log('Press Ctrl+C within 10 seconds to cancel...')
    await new Promise(resolve => setTimeout(resolve, 10000))
  }

  // Get the V5 contract factory
  console.log('Compiling RarePizzasBoxV5...')
  const UpgradeV5 = await ethers.getContractFactory('RarePizzasBoxV5')

  // Prepare the upgrade (deploys implementation only)
  console.log('Preparing upgrade...')
  const upgradeV5Address = await upgrades.prepareUpgrade(proxy, UpgradeV5)

  console.log('')
  console.log('✅ Upgrade Preparation Successful!')
  console.log('========================================')
  console.log('V5 Implementation deployed at:', upgradeV5Address)
  console.log('')
  console.log('Next steps:')
  console.log('1. Verify the implementation contract on Etherscan')
  console.log('2. Have the proxy admin execute the upgrade to this implementation')
  console.log('3. Run the recovery script if needed for stuck batch mints')
  console.log('')

  // Save deployment data
  utils.publishUpgradeData('RarePizzasBoxV5', proxy, upgradeV5Address.toString())

  // Note: You may need to add publishBoxWeb3V5AdminAbi to utils.ts
  // utils.publishBoxWeb3V5AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during deployment:', error)
    process.exit(1)
  })
