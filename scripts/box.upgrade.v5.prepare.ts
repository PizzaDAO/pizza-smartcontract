import utils from './utils'
import { ethers, upgrades } from 'hardhat'
import config from '../config'

// This script prepares the V5 upgrade (deploys implementation contract)
// Use this when you don't own the proxy admin
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getBoxProxyAddress(config)
  const proxyOwner = utils.getBoxProxyAdminAddress(config)

  console.log('Preparing upgrade contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  console.log('Proxy Address:', proxy)
  console.log('Owner Address:', proxyOwner)

  // We get the upgrade contract to deploy
  const UpgradeV5 = await ethers.getContractFactory('RarePizzasBoxV5')
  const upgradeV5Address = await upgrades.prepareUpgrade(proxy, UpgradeV5)
  console.log('Upgrade Successful.  You must now update the proxy contract.')
  console.log('The V5 implementation is at:', upgradeV5Address)

  // Save deployment data
  utils.publishUpgradeData('RarePizzasBoxV5', proxy, upgradeV5Address.toString())
  utils.publishBoxWeb3V5AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during deployment:', error)
    process.exit(1)
  })
