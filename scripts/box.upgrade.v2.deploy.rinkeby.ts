import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// This script deploys the upgrade contract to rinkeby
// This only works if you are the owner of the proxy
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getProxyAddress(config)
  const proxyOwner = deployer.address

  console.log('Preparing upgrade contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  console.log('Proxy Address:', proxy)
  console.log('Owner Address:', proxyOwner)

  // We get the upgrade contract to deploy
  const UpgradeV2 = await ethers.getContractFactory('RarePizzasBoxV2')
  const upgradeV2Address = await upgrades.upgradeProxy(proxy, UpgradeV2)
  console.log('Upgrade Successful.  You must now update the proxy contract.')
  console.log('The V2 implementation is at:', upgradeV2Address)

  // we get the chgainlink VRF to deploy
  const RandomConsumer = await ethers.getContractFactory('RandomConsumer')
  const randomConsumer = await RandomConsumer.deploy(
    utils.getChainlinkVRFCoordinator(config),
    utils.getChainlinkToken(config),
    utils.getChainlinkVRFKeyHash(config),
    utils.getChainlinkVRFFee(config),
    proxy)

  console.log('Random Consumer:', randomConsumer)

  utils.publishUpgradeData('RarePizzasBoxV2', proxy, upgradeV2Address.address, randomConsumer)
  utils.publishBoxWeb3V2AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
