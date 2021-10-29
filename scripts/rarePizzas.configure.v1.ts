import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import Contract from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';

// configure the pizza contract with the address of the order api consumer
async function main() {
    const [deployer] = await ethers.getSigners()
    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    const instanceAddress = utils.getRarePizzasProxyAddress(config);

    console.log('Connecting to instance')
    const contract = new ethers.Contract(instanceAddress, Contract.abi, wallet);

    console.log(`setOrderAPIClient: ${utils.getOrderAPIConsumerContractAddress(config)}`)
    const tx = await contract.setOrderAPIClient(utils.getOrderAPIConsumerContractAddress(config), {type: 0, gasLimit: 120000})

    console.log(tx)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
