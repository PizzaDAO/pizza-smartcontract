import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

import storageContract from '../artifacts/contracts/data/RarePizzasSeedStorage.sol/RarePizzasSeedStorage.json'

async function main() {
    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const instanceAddress = utils.getStorageProxyAddress(config)
    const randomConsumerAddress = utils.getRandomConsumerAddress(config)
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    console.log('Connecting to instance with the account:', wallet.address)
    console.log('Balance:', (await wallet.getBalance()).toString())
    console.log('Instance:', instanceAddress)

    // set the VRF RandomConsumer address
    const instance = new ethers.Contract(instanceAddress, storageContract.abi, wallet);
    await instance.setVRFConsumer(randomConsumerAddress, {type: 0, gasLimit: 120000})

    console.log('Function Call: SUCCESS')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
