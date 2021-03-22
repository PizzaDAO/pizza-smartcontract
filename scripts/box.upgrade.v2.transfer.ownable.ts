import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import randomConsumer from '../artifacts/contracts/random/RandomConsumer.sol/RandomConsumer.json';

// transfer ownership of the randomConsumer admin interface from the signer to some owner
async function main() {

    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    const consumerAddress = utils.getRandomConsumerAddress(config)
    const newOwner = utils.getProxyAdminAddress(config)

    console.log('Connecting to instance')

    const contract = new ethers.Contract(consumerAddress, randomConsumer.abi, wallet);

    const currentFee = await contract.getFee()
    //verify we can query something
    console.log(`current LINK Query Fee: ${currentFee.toString() / 10 ** 18}`)

    console.log('Transferring Ownable From', wallet.address)

    await contract.transferOwnership(newOwner)
    console.log('Successfully Transferred Ownable To', newOwner)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
