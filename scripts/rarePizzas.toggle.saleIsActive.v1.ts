import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import Contract from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';
import { privateEncrypt } from 'crypto';

// set the pizza sale to active
async function main() {
    const [deployer] = await ethers.getSigners()
    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    const instanceAddress = utils.getRarePizzasProxyAddress(config);

    console.log('Connecting to instance')
    const contract = new ethers.Contract(instanceAddress, Contract.abi, wallet);

    console.log('toggling sale is active')
    const tx = await contract.toggleSaleIsActive({type: 0, gasLimit: 120000})
    console.log(tx)

    console.log('complete')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
