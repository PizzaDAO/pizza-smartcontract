import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// deploy the mainnet random consumer
async function main() {
    const [deployer] = await ethers.getSigners()
    const proxy = utils.getBoxProxyAddress(config)
    const proxyOwner = utils.getBoxProxyAdminAddress(config)

    console.log('Preparing RandomConsumerV2 with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())
    console.log('Proxy Address:', proxy)
    console.log('Owner Address:', proxyOwner)

    // we get the chgainlink VRF to deploy
    const RandomConsumerV2 = await ethers.getContractFactory('RandomConsumerV2')
    const randomConsumerV2 = await RandomConsumerV2.deploy(
        utils.getChainlinkVRFCoordinatorV2(config),
        utils.getChainlinkVRFKeyHashV2(config),
        utils.getBoxProxyAddress(config),
        utils.getChainlinkVRFCoordinatorV2SubscriptionId(config),
      )

    console.log('Random Consumer V2:', randomConsumerV2)

    utils.publishRandomConsumerV2DeploymentData("RandomConsumerV2", proxy, randomConsumerV2)
    utils.publishRandomConsumerV2Web3AdminAbi()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
