import utils from './utils'

import { ethers } from 'hardhat'

import config, { NetworkConfig } from '../config'

// deploy the OderAPIConsumer
async function main() {
    const [deployer] = await ethers.getSigners()

    console.log('Preparing RandomConsumer with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    const Contract = await ethers.getContractFactory('OrderAPIConsumerV2')
    const contract = await Contract.deploy(
        utils.getOrderApiConsumerAuthorizedRequestorAddress(config),
        utils.getRarePizzasProxyAddress(config),
    )



    console.log('OderAPIConsumer:', contract)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
