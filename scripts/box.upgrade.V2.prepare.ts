import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

// run the migration from the current signer account
async function main() {

    const [deployer] = await ethers.getSigners()

    console.log('Preparing upgreade contracts with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    // We get the contract to deploy
    const UpgradeV2 = await ethers.getContractFactory('FakeRarePizzasBoxV2')

    const upgradeV2Address = await upgrades.prepareUpgrade(
        utils.getProxyAddress(config), UpgradeV2)
    console.log("Upgrade Successful.  You must now update the proxy contract.")
    console.log("The V2 implementation is at:", upgradeV2Address);

    // TODO: when its real
    // utils.publishUpgradeData('FakeRarePizzasBoxV2', upgradeV2Address)
    // utils.publishBoxWeb3V2Abi()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })