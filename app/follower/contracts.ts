import { ethers } from 'ethers'

import { abi as oracleAbi } from '../../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json'
import { abi as consumerAbi } from '../../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json'

export const provider = new ethers.providers.AlchemyProvider(
  'mainnet',
  process.env.ALCHEMY_MAINNET_KEY,
)

export const orderApiConsumer = new ethers.Contract(
  process.env.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS!,
  consumerAbi,
  provider,
)

export const orderApiOracle = new ethers.Contract(
  process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS!,
  oracleAbi,
  provider,
)

export const contracts = {
  orderApiConsumer,
  orderApiOracle,
}

export default contracts
