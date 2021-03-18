import { Contract } from 'ethers'
import { readFileSync, writeFileSync } from 'fs'

import config, { NetworkConfig } from '../config'

import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json'

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
  return 'VALUE NOT FOUND'
}

const getAlchemyAPIKey = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.ALCHEMY_MAINNET_KEY
    case 'goerli':
      return config.ALCHEMY_GOERLI_KEY
    case 'rinkeby':
      return config.ALCHEMY_RINKEBY_KEY
  }
  return 'VALUE NOT FOUND'
}

const getProxyAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_BOX_MAINNET_PROXY_ADDRESS
    case 'goerli':
      return config.RAREPIZZAS_BOX_GOERLI_PROXY_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

const getProxyAdminAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_BOX_MAINNET_PROXY_ADMIN_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADMIN_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

const getDeploymentKey = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.MAINNET_PRIVATE_KEY
    case 'goerli':
      return config.GOERLI_PRIVATE_KEY
    case 'rinkeby':
      return config.RINKEBY_PRIVATE_KEY
  }
  return 'VALUE NOT FOUND'
}

const publishBoxWeb3Abi = () => {
  const boxWeb3interface = {
    contractName: boxContract.contractName,
    sourceName: boxContract.sourceName,
    abi: [
      boxContract.abi.find((i) => i.name === 'BTCETHPriceUpdated'),
      boxContract.abi.find((i) => i.name === 'OwnershipTransferred'),
      boxContract.abi.find((i) => i.name === 'Transfer'),
      boxContract.abi.find((i) => i.name === 'balanceOf'),
      boxContract.abi.find((i) => i.name === 'BTCETHPriceUpdated'),
      boxContract.abi.find((i) => i.name === 'getBitcoinPriceInWei'),
      boxContract.abi.find((i) => i.name === 'getPrice'),
      boxContract.abi.find((i) => i.name === 'getPriceInWei'),
      boxContract.abi.find((i) => i.name === 'maxSupply'),
      boxContract.abi.find((i) => i.name === 'publicSaleStart_timestampInS'),
      boxContract.abi.find((i) => i.name === 'purchase'),
      // TODO: later ...boxContract.abi.filter((i) => i.name === 'safeTransferFrom'),
      boxContract.abi.find((i) => i.name === 'tokenURI'),
      boxContract.abi.find((i) => i.name === 'totalSupply'),
    ],
  }

  const json = JSON.stringify(boxWeb3interface)
  console.log(json)
  writeFileSync('./dist/boxWeb3Interface.json', json)
}

const publishBoxWeb3AdminAbi = () => {
  const boxWeb3interface = {
    contractName: boxContract.contractName,
    sourceName: boxContract.sourceName,
    abi: [
      boxContract.abi.find((i) => i.name === 'mint'),
      boxContract.abi.find((i) => i.name === 'purchaseTo'),
      boxContract.abi.find((i) => i.name === 'setPresaleAllowed'),
      boxContract.abi.find((i) => i.name === 'setSaleStartTimestamp'),
      boxContract.abi.find((i) => i.name === 'updateBitcoinPriceInWei'),
      boxContract.abi.find((i) => i.name === 'withdraw'),
    ],
  }

  const json = JSON.stringify(boxWeb3interface)
  console.log(json)
  writeFileSync('./dist/boxWeb3AdminInterface.json', json)
}

const publishDeploymentData = (name: string, contract: Contract) => {
  const deploymentData = {
    network: config.NETWORK,
    name: name,
    proxy: contract.address,
    transaction: contract.deployTransaction,
  }
  const json = JSON.stringify(deploymentData)
  console.log(deploymentData)
  writeFileSync('./dist/deployment-latest.json', json)
  writeFileSync(`./dist/deployment-${Date.now()}.json`, json)
}

const parseBoxUris = () => {
  var text = readFileSync("./data/box_resources", "utf-8");
  var textByLine = text.split("\n")
  console.log(JSON.stringify(textByLine));
}

const utils = {
  getAlchemyAPIKey: getAlchemyAPIKey,
  getDeploymentKey: getDeploymentKey,
  getChainlinkOracle: getChainlinkOracle,
  getProxyAddress: getProxyAddress,
  getProxyAdminAddress: getProxyAdminAddress,
  parseBoxUris: parseBoxUris,
  publishBoxWeb3Abi: publishBoxWeb3Abi,
  publishBoxWeb3AdminAbi: publishBoxWeb3AdminAbi,
  publishDeploymentData: publishDeploymentData,
}
export default utils
