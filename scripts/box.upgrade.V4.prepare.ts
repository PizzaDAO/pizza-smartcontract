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
  const UpgradeV4 = await ethers.getContractFactory('RarePizzasBoxV4')
  const upgradeV4Address = await upgrades.prepareUpgrade(proxy, UpgradeV4)
  console.log('Upgrade Successful.  You must now update the proxy contract.')
  console.log(
    'This implementation also upgrades the VRF consumer. You must call proxy.setVRFConsumer from the multi sig.',
  )
  console.log('The V4 implementation is at:', upgradeV4Address)

  utils.publishUpgradeData('RarePizzasBoxV4', proxy, upgradeV4Address)
  utils.publishBoxWeb3V3AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
