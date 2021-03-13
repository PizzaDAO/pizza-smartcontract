import { ethers, upgrades } from 'hardhat'
import { Contract } from 'ethers'
import { writeFileSync } from 'fs'

import config, { NetworkConfig } from '../config'
import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json';

const getChainlinkOracle = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_PRICE_FEED
    case 'goerli':
      return config.CHAINLINK_GOERLI_PRICE_FEED
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_PRICE_FEED
    case 'ropsten':
      return config.CHAINLINK_ROPSTEN_PRICE_FEED
  }
}

function publishBoxWeb3Abi() {
  const boxWeb3interface = {
    contractName: boxContract.contractName,
    sourceName: boxContract.sourceName,
    abi: [
      boxContract.abi.find(i => i.name === 'BTCETHPriceUpdated'),
      boxContract.abi.find(i => i.name === 'OwnershipTransferred'),
      boxContract.abi.find(i => i.name === 'Transfer'),
      boxContract.abi.find(i => i.name === 'balanceOf'),
      boxContract.abi.find(i => i.name === 'BTCETHPriceUpdated'),
      boxContract.abi.find(i => i.name === 'getBitcoinPriceInWei'),
      boxContract.abi.find(i => i.name === 'getPrice'),
      boxContract.abi.find(i => i.name === 'maxSupply'),
      boxContract.abi.find(i => i.name === 'publicSaleStart_timestampInS'),
      boxContract.abi.find(i => i.name === 'purchase'),
      boxContract.abi.filter(i => i.name === 'safeTransferFrom'),
      boxContract.abi.find(i => i.name === 'tokenURI'),
      boxContract.abi.find(i => i.name === 'totalSupply'),
    ]
  }

  const json = JSON.stringify(boxWeb3interface)
  console.log(json)
  writeFileSync('./dist/boxWeb3Interface.json', json)
}

function publishDeploymentData(name: string, contract: Contract) {
  const deploymentData = {
    network: config.NETWORK,
    name: name,
    proxy: contract.address,
    transaction: contract.deployTransaction
  }
  const json = JSON.stringify(deploymentData)
  console.log(deploymentData)
  writeFileSync('./dist/deployment-latest.json', json)
  writeFileSync(`./dist/deployment-${Date.now()}.json`, json)
}

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // We get the contract to deploy
  const Box = await ethers.getContractFactory('RarePizzasBox')

  // gnosis safe: 0xBA5E28a2D1C8cF67Ac9E0dfc850DC8b7b21A4DE2
  const box = await upgrades.deployProxy(Box, [getChainlinkOracle(config)])
  await box.deployed()

  publishDeploymentData('RarePizzasBox', box)
  publishBoxWeb3Abi()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
