import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json';

import presale_mainnet from './reservations.mainnet.allowed.json';

// seed the contract with addresses
// note the actual list of addresses is NOT checked into source

// you cant do this on mainnet
// when owner is set to someone else
async function main() {
    const [deployer] = await ethers.getSigners()
    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const wallet = new ethers.Wallet(utils.getDeploymentKey(config), provider)

    const instanceAddress = utils.getBoxProxyAddress(config)

    console.log('Connecting to instance')

    const contract = new ethers.Contract(instanceAddress, boxContract.abi, wallet);

    const current = await contract.getBitcoinPriceInWei()
    //verify we can query something
    console.log(`current BTC-ETH Price: ${current.toString() / 10 ** 18}`)

    console.log('seeding addresses')

    await contract.setPresaleAllowed(0, [...presale_mainnet])

    console.log('addresses seeded')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
