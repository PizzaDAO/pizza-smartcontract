import { ethers } from 'hardhat'
//import { BigNumber, Contract, Wallet } from 'ethers'
import utils from './utils'
import config from '../config'

import Contract from '../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json';
import { privateEncrypt } from 'crypto';

async function main() {
    const tokenId = 704
    const truncated_hex = "0x6aec5b7ee656b16b16048580f39ae8b9cf68dde65add62de70d5f3cc69dbfe17"

    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    const instanceAddress = utils.getRarePizzasProxyAddress(config);

    console.log('Connecting to instance')
    const contract = new ethers.Contract(instanceAddress, Contract.abi, wallet);

    console.log('setting artwork')
    //{type: 0,gasPrice: 105000000000, gasLimit: 50000}
    const tx = await contract.setPizzaArtworkURI(tokenId, truncated_hex)
    console.log(tx)

    console.log('complete')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
