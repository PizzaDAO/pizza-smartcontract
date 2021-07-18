import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// deploy the OderAPIConsumer
async function main() {
    const [deployer] = await ethers.getSigners()


    console.log('Preparing RandomConsumer with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    // const jobId = ethers.utils.formatBytes32String(utils.getOrderAPIJobId(config))
    // we get the chgainlink VRF to deploy
    const Contract = await ethers.getContractFactory('OrderAPIConsumer')
    const contract = await Contract.deploy(
        utils.getChainlinkToken(config),
        utils.getOrderAPIOracleContractAddress(config),
        utils.getRarePizzasProxyAddress(config),
        utils.getOrderAPIJobFee(config))

    console.log('OrderAPIOracle:', contract)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
