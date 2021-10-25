import { ethers, upgrades } from 'hardhat'

import utils from './utils'
import config, { NetworkConfig } from '../config'

// deploy the polygon RarePizzasSeedStorage
async function main() {
    const [deployer] = await ethers.getSigners()

    console.log('Preparing RarePizzasSeedStorage with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    // we get the contract to deploy
    const Contract = await ethers.getContractFactory('RarePizzasSeedStorage')
    const Proxy = await upgrades.deployProxy(
        Contract, [utils.getStorageProxyAuthorizedRequestorAddress(config)]
    )
    const proxy = await Proxy.deployed()

    console.log('Contract:', Proxy)
    console.log("contract:", proxy)

    utils.publishRarePizzasSeedStorageAbi(Proxy)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
