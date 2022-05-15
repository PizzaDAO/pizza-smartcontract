import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// This script deploys the upgrade contract to rinkeby
// This only works if you are the owner of the proxy
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = '0x50Bb9DE3467977BF406FFD526d95Cb70408CF171'
  const proxyOwner = deployer.address

  console.log('Preparing upgrade contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  console.log('Proxy Address:', proxy)
  console.log('Owner Address:', proxyOwner)

  // We get the upgrade contract to deploy
  const UpgradeV4 = await ethers.getContractFactory('RarePizzasBoxV4')
  const upgradeV4Address = await upgrades.upgradeProxy(proxy, UpgradeV4)
  console.log('Upgrade Successful.  You must now update the proxy contract.')
  console.log('The V3 implementation is at:', upgradeV4Address)

  //utils.publishUpgradeData('RarePizzasBoxV2', proxy, upgradeV3Address.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
