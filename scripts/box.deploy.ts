import { ethers, upgrades } from 'hardhat'

import utils from './utils'
import config from '../config'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // TODO: estiamte gas usage & check balance

  // We get the contract to deploy
  const Box = await ethers.getContractFactory('RarePizzasBox')

  const Proxy = await upgrades.deployProxy(Box, [utils.getChainlinkOracle(config)])
  const proxy = await Proxy.deployed()

  utils.publishDeploymentData('RarePizzasBox', Proxy)
  utils.publishBoxWeb3Abi()
  utils.publishBoxWeb3AdminAbi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
