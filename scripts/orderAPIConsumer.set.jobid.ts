import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import orderAPIConsumerContract from '../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json'

// seed the contract with addresses
// note the actual list of addresses is NOT checked into source

// you cant do this on mainnet
// when owner is set to someone else
async function main() {
  const [deployer] = await ethers.getSigners()
  const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config))
  const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

  const instanceAddress = utils.getOrderAPIConsumerContractAddress(config)

  console.log('Connecting to OrderAPIConsumer instance', instanceAddress)

  const contract = new ethers.Contract(instanceAddress, orderAPIConsumerContract.abi, wallet)

  const jobId = utils.getOrderAPIJobId(config)
  console.log('OrderAPIConsumer instance setting JobId: ', jobId)
  const tx = await contract.setJobId(jobId)

  console.log(tx)

  const result = await tx.wait()

  console.log(result)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
