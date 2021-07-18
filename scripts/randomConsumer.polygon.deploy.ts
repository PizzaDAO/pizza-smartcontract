import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// deploy the polygon random consumer
async function main() {
    const [deployer] = await ethers.getSigners()
    const proxy = utils.getStorageProxyAddress(config)
    const proxyOwner = utils.getStorageProxyAdminAddress(config)

    console.log('Preparing RandomConsumer with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())
    console.log('Proxy Address:', proxy)
    console.log('Owner Address:', proxyOwner)

    // we get the chgainlink VRF to deploy
    const RandomConsumer = await ethers.getContractFactory('RandomConsumer')
    const randomConsumer = await RandomConsumer.deploy(
        utils.getChainlinkVRFCoordinator(config),
        utils.getChainlinkToken(config),
        utils.getChainlinkVRFKeyHash(config),
        utils.getChainlinkVRFFee(config),
        proxy)

    console.log('Random Consumer:', randomConsumer)

    utils.publishRandomConsumerDeploymentData("RandomConsumer", proxy, randomConsumer)
    utils.publishRandomConsumerWeb3AdminAbi()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
