import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json';

// withdraw from the contract
// only useful on testnets
async function main() {
    const [deployer] = await ethers.getSigners()
    const provider = new ethers.providers.AlchemyProvider("rinkeby", config.ALCHEMY_RINKEBY_KEY);
    const wallet = new ethers.Wallet(config.RINKEBY_PRIVATE_KEY, provider)

    const instanceAddress = config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADDRESS;

    console.log('Connecting to instance')
    const contract = new ethers.Contract(instanceAddress, boxContract.abi, wallet);

    console.log('Withdrawing with the account:', deployer.address)
    console.log('Account balance:', (await deployer.getBalance()).toString())

    await contract.withdraw()

    console.log('Withdrawal complete')
    console.log('Account balance:', (await deployer.getBalance()).toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })