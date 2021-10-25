import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import boxContract from '../artifacts/contracts/data/RarePizzasSeedStorage.sol/RarePizzasSeedStorage.json';

// Assign the authorized Requestor to the seed storage contract
// this lets the authorized account query for a random number
async function main() {
  const [deployer] = await ethers.getSigners()
  const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
  const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

  const proxy = utils.getStorageProxyAddress(config)
  const authorized = utils.getStorageProxyAuthorizedRequestorAddress(config)

  console.log('Connecting to instance')

  const contract = new ethers.Contract(proxy, boxContract.abi, wallet);

  await contract.setAuthorizedRequestor(authorized)
  console.log('Successfully Assigned Authorized To', authorized)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
