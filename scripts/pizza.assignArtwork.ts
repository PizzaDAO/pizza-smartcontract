import { ethers, upgrades } from 'hardhat'
//import { BigNumber, Contract, Wallet } from 'ethers'
import utils from './utils'
import config from '../config'

import Contract from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';
import { privateEncrypt } from 'crypto';

// set the pizza sale to active
async function main() {
    const tokenId = 571
    const truncated_hex = "17d5dcaa0433cb2370aabdac2215dab7be00d01d3c937687358352d0b6b9d57b"

    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    const instanceAddress = utils.getRarePizzasProxyAddress(config);

    console.log('Connecting to instance')
    const contract = new ethers.Contract(instanceAddress, Contract.abi, wallet);

    const hex_string = ethers.utils.formatBytes32String()
    console.log('setting artwork')
    const tx = await contract.setPizzaArtworkURI({type: 0, gasLimit: 120000})
    console.log(tx)

    console.log('complete')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
