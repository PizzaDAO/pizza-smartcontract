import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// run the migration from the current signer account
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getBoxProxyAddress(config)
  const proxyOwner = utils.getBoxProxyAdminAddress(config)

  console.log('Preparing upgrade contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  console.log('Proxy Address:', proxy)
  console.log('Owner Address:', proxyOwner)

  // We get the upgrade contract to deploy
  const UpgradeV2 = await ethers.getContractFactory('RarePizzasBoxV2')
  const upgradeV2Address = await upgrades.prepareUpgrade(proxy, UpgradeV2)
  console.log('Upgrade Successful.  You must now update the proxy contract.')
  console.log('The V2 implementation is at:', upgradeV2Address)

  utils.publishUpgradeData('RarePizzasBoxV2', proxy, upgradeV2Address)
  utils.publishBoxWeb3V2AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
