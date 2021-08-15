import { ethers, upgrades } from 'hardhat'

import utils from './utils'
import config, { NetworkConfig } from '../config'

// deploy the RarePizzas contract
async function main() {
    const [deployer] = await ethers.getSigners()

    console.log('Preparing RarePizzas with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    // we get the chgainlink VRF to deploy
    const Contract = await ethers.getContractFactory('RarePizzas')
    const Proxy = await upgrades.deployProxy(
        Contract, [utils.getBoxProxyAddress(config)]
    )
    const proxy = await Proxy.deployed()

    console.log('Contract:', Proxy)
    console.log("contract:", proxy)

    utils.publishRarePizzasAbi(Proxy)
    utils.publishDeploymentData("RarePizzas", proxy)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
