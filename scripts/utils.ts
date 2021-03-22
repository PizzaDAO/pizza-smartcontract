import { Contract } from 'ethers'
import { readFileSync, writeFileSync } from 'fs'

import config, { NetworkConfig } from '../config'

import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json'
import boxContractV2 from '../artifacts/contracts/token/RarePizzasBoxV2.sol/RarePizzasBoxV2.json'
import randomConsumer from '../artifacts/contracts/random/RandomConsumer.sol/RandomConsumer.json'

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

const getChainlinkToken = (config: NetworkConfig) => {
  // TODO: support other networks
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_TOKEN
    case 'goerli':
      return config.CHAINLINK_GOERLI_TOKEN
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_TOKEN
    case 'ropsten':
      return config.CHAINLINK_ROPSTEN_TOKEN
  }
  return 'VALUE NOT FOUND'
}

const getChainlinkVRFCoordinator = (config: NetworkConfig) => {
  // TODO: support other networks
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_VRF_COORD
    case 'goerli':
      return config.CHAINLINK_GOERLI_VRF_COORD
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_VRF_COORD
    case 'ropsten':
      return config.CHAINLINK_ROPSTEN_VRF_COORD
  }
  return 'VALUE NOT FOUND'
}

const getChainlinkVRFKeyHash = (config: NetworkConfig) => {
  // TODO: support other networks
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_VRF_KEY_HASH
    case 'goerli':
      return config.CHAINLINK_GOERLI_VRF_KEY_HASH
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_VRF_KEY_HASH
    case 'ropsten':
      return config.CHAINLINK_ROPSTEN_VRF_KEY_HASH
  }
  return 'VALUE NOT FOUND'
}

const getChainlinkVRFFee = (config: NetworkConfig) => {
  // TODO: support other networks
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_VRF_FEE
    case 'goerli':
      return config.CHAINLINK_GOERLI_VRF_FEE
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_VRF_FEE
    case 'ropsten':
      return config.CHAINLINK_ROPSTEN_VRF_FEE
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

const getRandomConsumerAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_BOX_MAINNET_RANDOM_CONSUMER_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_BOX_RINKEBY_RANDOM_CONSUMER_ADDRESS
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

const publishBoxWeb3V2AdminAbi = () => {
  const boxWeb3interface = {
    contractName: boxContractV2.contractName,
    sourceName: boxContractV2.sourceName,
    abi: [
      boxContractV2.abi.find((i) => i.name === 'mint'),
      boxContractV2.abi.find((i) => i.name === 'purchaseTo'),
      boxContractV2.abi.find((i) => i.name === 'setPresaleAllowed'),
      boxContractV2.abi.find((i) => i.name === 'setSaleStartTimestamp'),
      boxContractV2.abi.find((i) => i.name === 'updateBitcoinPriceInWei'),
      boxContractV2.abi.find((i) => i.name === 'withdraw'),
      boxContractV2.abi.find(i => i.name === 'setVRFConsumer')
    ],
  }

  const json = JSON.stringify(boxWeb3interface)
  console.log(json)
  writeFileSync('./dist/boxWeb3AdminInterface-v2.json', json)
}

const publishRandomConsumerWeb3AdminAbi = () => {
  const contractInterface = {
    contractName: randomConsumer.contractName,
    sourceName: randomConsumer.sourceName,
    abi: [
      randomConsumer.abi.find((i) => i.name === 'setCallbackContract'),
      randomConsumer.abi.find((i) => i.name === 'setFee'),
      randomConsumer.abi.find((i) => i.name === 'setKeyHash'),
      randomConsumer.abi.find((i) => i.name === 'withdrawLink'),
      randomConsumer.abi.find((i) => i.name === 'withdraw')
    ],
  }

  const json = JSON.stringify(contractInterface)
  console.log(json)
  writeFileSync('./dist/randomConsumerWeb3AdminInterface.json', json)
}

const publishDeploymentData = (name: string, proxy: Contract) => {
  const deploymentData = {
    network: config.NETWORK,
    name: name,
    proxy: proxy.address,
    transaction: proxy.deployTransaction,
  }
  const json = JSON.stringify(deploymentData)
  console.log(deploymentData)
  writeFileSync('./dist/deployment-latest.json', json)
  writeFileSync(`./dist/deployment-${Date.now()}.json`, json)
}

const publishRandomConsumerDeploymentData = (name: string, proxy: string, randomConsumer: Contract) => {
  const deploymentData = {
    network: config.NETWORK,
    name: name,
    proxy: proxy,
    randomConsumer: {
      address: randomConsumer.address,
      transaction: randomConsumer.deployTransaction
    }
  }
  const json = JSON.stringify(deploymentData)
  console.log(deploymentData)
  writeFileSync('./dist/deployment-random-latest.json', json)
  writeFileSync(`./dist/deployment-random-${Date.now()}.json`, json)
}

const publishUpgradeData = (name: string, proxy: string, implementation: string,) => {
  const deploymentData = {
    network: config.NETWORK,
    name: name,
    proxy: proxy,
    implementation: implementation,
  }
  const json = JSON.stringify(deploymentData)
  console.log(deploymentData)
  writeFileSync('./dist/deployment-upgrade-latest.json', json)
  writeFileSync(`./dist/deployment-upgrade-${Date.now()}.json`, json)
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
  getChainlinkToken: getChainlinkToken,
  getChainlinkVRFCoordinator: getChainlinkVRFCoordinator,
  getChainlinkVRFKeyHash: getChainlinkVRFKeyHash,
  getChainlinkVRFFee: getChainlinkVRFFee,
  getProxyAddress: getProxyAddress,
  getProxyAdminAddress: getProxyAdminAddress,
  getRandomConsumerAddress: getRandomConsumerAddress,
  parseBoxUris: parseBoxUris,
  publishBoxWeb3Abi: publishBoxWeb3Abi,
  publishBoxWeb3AdminAbi: publishBoxWeb3AdminAbi,
  publishBoxWeb3V2AdminAbi: publishBoxWeb3V2AdminAbi,
  publishRandomConsumerWeb3AdminAbi: publishRandomConsumerWeb3AdminAbi,
  publishDeploymentData: publishDeploymentData,
  publishRandomConsumerDeploymentData: publishRandomConsumerDeploymentData,
  publishUpgradeData: publishUpgradeData
}
export default utils
