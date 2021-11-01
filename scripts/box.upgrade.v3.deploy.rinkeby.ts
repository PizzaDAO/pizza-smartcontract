import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// This script deploys the upgrade contract to rinkeby
// This only works if you are the owner of the proxy
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getBoxProxyAddress(config)
  const proxyOwner = deployer.address

  console.log('Preparing upgrade contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  console.log('Proxy Address:', proxy)
  console.log('Owner Address:', proxyOwner)

  // We get the upgrade contract to deploy
  const UpgradeV3 = await ethers.getContractFactory('RarePizzasBoxV3')
  const upgradeV3Address = await upgrades.upgradeProxy(proxy, UpgradeV3)
  console.log('Upgrade Successful.  You must now update the proxy contract.')
  console.log('The V3 implementation is at:', upgradeV3Address)

  utils.publishUpgradeData('RarePizzasBoxV2', proxy, upgradeV3Address.address)
  utils.publishBoxWeb3V3AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
