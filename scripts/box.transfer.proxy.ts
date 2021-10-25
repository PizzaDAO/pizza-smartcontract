import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

// transfer ownership of the upgrade proxy from the signer to some owner
async function main() {
  const [deployer] = await ethers.getSigners()
  const newOwner = utils.getBoxProxyAdminAddress(config)

  console.log('Owner:', deployer.address)
  console.log('- balance:', (await deployer.getBalance()).toString())

  console.log('New Owner:', newOwner)

  // The owner of the ProxyAdmin can upgrade our contracts
  await upgrades.admin.transferProxyAdminOwnership(newOwner)
  console.log('Successfully Transferred To', newOwner)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
