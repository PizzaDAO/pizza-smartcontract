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
    case 'rinkeby':
      return config.ALCHEMY_RINKEBY_KEY
    case 'matic':
        return config.ALCHEMY_MATIC_KEY
    case 'mumbai':
      return config.ALCHEMY_MUMBAI_KEY
  }
  return 'VALUE NOT FOUND'
}

const getDeploymentKey = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.MAINNET_PRIVATE_KEY
    case 'rinkeby':
      return config.RINKEBY_PRIVATE_KEY
    case 'matic':
        return config.MATIC_PRIVATE_KEY
    case 'mumbai':
      return config.MATIC_MUMBAI_PRIVATE_KEY
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the address of the chainlink price feed oracle
 */
const getChainlinkOracle = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_PRICE_FEED
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_PRICE_FEED
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the address of the chainlink token
 */
const getChainlinkToken = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_TOKEN
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_TOKEN
    case 'matic':
        return config.CHAINLINK_MATIC_TOKEN
    case 'mumbai':
      return config.CHAINLINK_MATIC_MUMBAI_TOKEN
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the Address of the Chainlink VRF coordinator
 */
const getChainlinkVRFCoordinator = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_VRF_COORD
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_VRF_COORD
    case 'matic':
        return config.CHAINLINK_MATIC_VRF_COORD
    case 'mumbai':
      return config.CHAINLINK_MATIC_MUMBAI_VRF_COORD
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the key hash of the chainlink vrf coordinator
 */
const getChainlinkVRFKeyHash = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_VRF_KEY_HASH
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_VRF_KEY_HASH
    case 'matic':
        return config.CHAINLINK_MATIC_VRF_KEY_HASH
    case 'mumbai':
      return config.CHAINLINK_MATIC_MUMBAI_VRF_KEY_HASH
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the fee for the chainlink VRF coordinator calls
 */
const getChainlinkVRFFee = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.CHAINLINK_MAINNET_VRF_FEE
    case 'rinkeby':
      return config.CHAINLINK_RINKEBY_VRF_FEE
    case 'matic':
        return config.CHAINLINK_MATIC_VRF_FEE
    case 'mumbai':
      return config.CHAINLINK_MATIC_MUMBAI_VRF_FEE
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the contract address of the OrderAPI Oracle
 */
const getOrderAPIOracleContractAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_ORDER_API_RINKEBY_ORACLE_CONTRACT_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the EOA address that is loaded into the chainlink oracle node
 */
const getOrderAPIOracleNodeAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_NODE_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_ORDER_API_RINKEBY_ORACLE_NODE_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the contract address of the contact that will consume the OrderAPI result
 */
const getOrderAPIConsumerContractAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_ORDER_API_CONSUMER_RINKEBY_CONTRACT_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the jobId associated with the OrderAPI oracle
 */
const getOrderAPIJobId = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_ORDER_API_MAINNET_JOB_ID
    case 'rinkeby':
      return config.RAREPIZZAS_ORDER_API_RINKEBY_JOB_ID
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the job fee of the OrderAPI Oracle
 */
const getOrderAPIJobFee = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_ORDER_API_MAINNET_JOB_FEE
    case 'rinkeby':
      return config.RAREPIZZAS_ORDER_API_RINKEBY_JOB_FEE
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the proxy address of the Box contract
 */
const getBoxProxyAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_BOX_MAINNET_PROXY_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the address of the administrator of the box contract (usually a multi-sig)
 */
const getBoxProxyAdminAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_BOX_MAINNET_PROXY_ADMIN_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADMIN_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the contract address of the VRF random consumer.
 * 
 * Note: this contract is deployed on both ethereum and polygon networks
 */
const getRandomConsumerAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_BOX_MAINNET_RANDOM_CONSUMER_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_BOX_RINKEBY_RANDOM_CONSUMER_ADDRESS
    case 'matic':
        return config.RAREPIZZAS_MATIC_RANDOM_CONSUMER_ADDRESS
    case 'mumbai':
      return config.RAREPIZZAS_MUMBAI_RANDOM_CONSUMER_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the proxy address of the Rare Pizzas contract
 */
const getRarePizzasProxyAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_MAINNET_PROXY_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_RINKEBY_PROXY_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the address of the administrator of the Rare Pizzas contract (usually a multi-sig)
 */
const getRarePizzasProxyAdminAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'mainnet':
      return config.RAREPIZZAS_MAINNET_PROXY_ADMIN_ADDRESS
    case 'rinkeby':
      return config.RAREPIZZAS_RINKEBY_PROXY_ADMIN_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the proxy address of the seed storage contract
 * 
 * note: this contract is deployed on polygon
 */
const getStorageProxyAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'matic':
      return config.RAREPIZZAS_SEEDSTORAGE_MATIC_PROXY_ADDRESS
    case 'mumbai':
      return config.RAREPIZZAS_SEEDSTORAGE_MUMBAI_PROXY_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the address of the administrator of the Seed Storage contract (usually a multi-sig)
 */
const getStorageProxyAdminAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'matic':
      return config.RAREPIZZAS_MATIC_PROXY_ADMIN_ADDRESS
    case 'mumbai':
      return config.RAREPIZZAS_MUMBAI_PROXY_ADMIN_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Get the address of an EOA that is authorized to make requests to the seed storage contract
 */
const getStorageProxyAuthorizedRequestorAddress = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  switch (networkName) {
    case 'matic':
      return config.RAREPIZZAS_SEEDSTORAGE_AUTHORIZED_REQUESTOR_MATIC_ADDRESS
    case 'mumbai':
      return config.RAREPIZZAS_SEEDSTORAGE_AUTHORIZED_REQUESTOR_MUMBAI_ADDRESS
  }
  return 'VALUE NOT FOUND'
}

/**
 * Publish a truncated version of the Box Web3 ABI
 */
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

/**
 * Publish a truncated version of the Box Web3 Admin ABI
 */
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

/**
 * Publish a truncated version of the Box V2 Web3 Admin ABI
 */
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

/**
 * Publish a truncated version of the Random Conusmer Web3 Admin ABI
 */
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

/**
 * Publish some deployment data.
 * 
 * This function should be called for all contract deployments
 */
const publishDeploymentData = (name: string, proxy: Contract) => {
  const deploymentData = {
    network: config.NETWORK,
    name: name,
    proxy: proxy.address,
    transaction: proxy.deployTransaction,
  }
  const json = JSON.stringify(deploymentData)
  console.log(deploymentData)
  writeFileSync(`./dist/deployment-${config.NETWORK}-${name}-latest.json`, json)
  writeFileSync(`./dist/deployment-${config.NETWORK}-${name}-${Date.now()}.json`, json)
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
  writeFileSync(`./dist/deployment-${config.NETWORK}-${name}-latest.json`, json)
  writeFileSync(`./dist/deployment-${config.NETWORK}-${name}-${Date.now()}.json`, json)
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
  getOrderAPIOracleContractAddress: getOrderAPIOracleContractAddress,
  getOrderAPIOracleNodeAddress: getOrderAPIOracleNodeAddress,
  getOrderAPIConsumerContractAddress: getOrderAPIConsumerContractAddress,
  getOrderAPIJobId: getOrderAPIJobId,
  getOrderAPIJobFee: getOrderAPIJobFee,
  getBoxProxyAddress: getBoxProxyAddress,
  getBoxProxyAdminAddress: getBoxProxyAdminAddress,
  getRandomConsumerAddress: getRandomConsumerAddress,
  getRarePizzasProxyAddress: getRarePizzasProxyAddress,
  getRarePizzasProxyAdminAddress: getRarePizzasProxyAdminAddress,
  getStorageProxyAddress: getStorageProxyAddress,
  getStorageProxyAdminAddress: getStorageProxyAdminAddress,
  getStorageProxyAuthorizedRequestorAddress:getStorageProxyAuthorizedRequestorAddress,
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
