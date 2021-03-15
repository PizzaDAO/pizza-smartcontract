import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json'

// seed the contract with addresses
async function main() {
  const [deployer] = await ethers.getSigners()
  const provider = new ethers.providers.AlchemyProvider('rinkeby', config.ALCHEMY_RINKEBY_KEY)
  const wallet = new ethers.Wallet(config.RINKEBY_PRIVATE_KEY, provider)

  const instanceAddress = config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADDRESS

  console.log('Connecting to instance')

  const contract = new ethers.Contract(instanceAddress, boxContract.abi, wallet)

  const current = await contract.getBitcoinPriceInWei()
  // Verify we can query something
  console.log(`current BTC-ETH Price: ${current.toString() / 10 ** 18}`)

  console.log('seeding addresses')

  await contract.setPresaleAllowed(10, ['0xSOME_ADDRESSES'])

  console.log('addresses seeded')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
