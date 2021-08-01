import utils from './utils'

import { ethers, upgrades } from 'hardhat'

import config, { NetworkConfig } from '../config'

import linkToken from '../artifacts/@chainlink/contracts/src/v0.6/interfaces/LinkTokenInterface.sol/LinkTokenInterface.json';
import randomConsumer from '../artifacts/contracts/random/RandomConsumer.sol/RandomConsumer.json'

// deploy the polygon random consumer
// set the callback as the seed storage
// and fund the consumer with some link
async function main() {
    const [deployer] = await ethers.getSigners()
    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const proxy = utils.getStorageProxyAddress(config)
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    console.log('Preparing RandomConsumer with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())
    console.log('Storage Proxy Address:', proxy)

    // we get the chgainlink VRF to deploy
    const Contract = await ethers.getContractFactory('RandomConsumer')
    const contract = await Contract.deploy(
        utils.getChainlinkVRFCoordinator(config),
        utils.getChainlinkToken(config),
        utils.getChainlinkVRFKeyHash(config),
        utils.getChainlinkVRFFee(config),
        proxy)

    console.log('Random Consumer:', contract)

    // set the storage proxy as the callback
    const instance = new ethers.Contract(contract.address, randomConsumer.abi, wallet);
    await instance.setCallbackContract(utils.getStorageProxyAddress(config), {type: 0, gasLimit: 120000})

    console.log('Random Consumer: setCallbackContract', utils.getStorageProxyAddress(config))

    // fund with link
    const linkInstance = new ethers.Contract(utils.getChainlinkToken(config), linkToken.abi, wallet);
    const success = await linkInstance.transfer(
        contract.address, ethers.BigNumber.from('1000000000000000000'), {type: 0, gasLimit: 120000}
    ) //1 link

    console.log('Link Token: transfer: ', success)

    utils.publishRandomConsumerDeploymentData("PolygonRandomConsumer", proxy, contract)
    utils.publishRandomConsumerWeb3AdminAbi()
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
