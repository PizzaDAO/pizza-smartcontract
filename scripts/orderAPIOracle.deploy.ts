import utils from './utils'
import { ethers, upgrades } from 'hardhat'
import config, { NetworkConfig } from '../config'

import { abi } from '../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json';
import { getAddress } from '@ethersproject/address';

// deploy the OrderAPIOracle and assign the fulfillment address
async function main() {
    const [deployer] = await ethers.getSigners()
    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    console.log('Preparing OrderAPIOracle with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    // Deploy the oracle
    const Contract = await ethers.getContractFactory('OrderAPIOracle')
    const contract = await Contract.deploy(
        utils.getChainlinkToken(config))

    console.log('OrderAPIOracle: ', contract)

    const receipt = await contract.deployTransaction.wait()
    console.log(receipt)

    // set the fulfillment address
    console.log(`setFulfillmentPermission for: ${utils.getOrderAPIOracleNodeAddress(config)}`)

    const instance = new ethers.Contract(contract.address, abi, wallet);
    const tx = await instance.setFulfillmentPermission(
        utils.getOrderAPIOracleNodeAddress(config), true, { gasPrice: 200000000000,  gasLimit: 200000 })
    const result = await tx.wait()

    const status = await instance.getAuthorizationStatus(utils.getOrderAPIOracleNodeAddress(config))
    console.log(`status: ${status}`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
