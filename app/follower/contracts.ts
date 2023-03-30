import { Event, Contract, providers, Wallet } from 'ethers'
import * as cbor from 'cbor'

import { abi as oracleAbi } from '../../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json'
import { abi as consumerAbi } from '../../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json'
import {
  IChainlinkFulfilledEventArgs,
  IOracleRequestData,
  IOracleRequestEventArgs,
} from './types'

export const provider = new providers.AlchemyProvider(
  'mainnet',
  process.env.ALCHEMY_MAINNET_KEY,
)

export const signer = new Wallet(
  process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_NODE_PRIVATE_KEY!,
)

export const orderApiConsumer = new Contract(
  process.env.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS!,
  consumerAbi,
  provider,
)

export const orderApiOracle = new Contract(
  process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS!,
  oracleAbi,
  provider,
)

export const contracts = {
  orderApiConsumer,
  orderApiOracle,
}

// Get the pending requests from the OrderAPIConsumer contract
export const getOrderApiConsumerRequests = async (
  fromBlock: number,
): Promise<{
  requestIds: string[]
  blockHeight: number
}> => {
  console.log(`Getting events from block ${fromBlock} onwards...`)

  // Get the requested and fulfilled events
  const contract = contracts.orderApiConsumer
  const requestedFilter = contract.filters.ChainlinkRequested()
  console.log(`Getting ChainlinkRequested events...`)

  const requestedEvents = await contract.queryFilter(requestedFilter, fromBlock)
  console.log(`Found ${requestedEvents.length} ChainlinkRequested events`)

  const fulfilledFilter = contract.filters.ChainlinkFulfilled()
  console.log(`Getting ChainlinkFulfilled events...`)

  const fulfilledLogs = await contract.queryFilter(fulfilledFilter, fromBlock)
  console.log(`Found ${fulfilledLogs.length} ChainlinkFulfilled events`)

  console.log(
    `Cross-referencing ChainlinkRequested and ChainlinkFulfilled events to determine pending requests...`,
  )

  const pendingRequests = []
  let blockHeight: number = fromBlock
  // Loop through the requested events and check if the requestId is in the fulfilled events
  for (let i = 0; i < requestedEvents.length; i++) {
    const requestedEvent = requestedEvents[i]
    const blockNumber = requestedEvent.blockNumber

    // Update the latest block number
    // This is used to update the fromBlock value in the latestBlock.json file
    if (blockNumber > blockHeight) {
      blockHeight = blockNumber
    }

    const requestId = requestedEvent.topics[1]
    const fulfilledRequest = fulfilledLogs.find((log) => {
      const event = contract.interface.parseLog(log)
      const args = event.args as unknown as IChainlinkFulfilledEventArgs
      return args.id === requestId
    })
    if (!fulfilledRequest) {
      console.log(
        `Found pending request with requestId ${requestId} at block ${blockNumber}`,
      )
      pendingRequests.push(requestedEvent)
    }
  }

  const requestIds = pendingRequests.map((event) => event.topics[1])

  return { requestIds, blockHeight }
}

export const getOracleRequest = async (
  requestId: string,
  inBlock: number,
): Promise<IOracleRequestEventArgs | undefined> => {
  const contract = contracts.orderApiOracle
  const requestFilter = contract.filters.OracleRequest()
  console.log(`Getting OracleRequest events...`)
  const oracleRequests = await contract.queryFilter(
    requestFilter,
    inBlock,
    inBlock,
  )
  console.log(`Found ${oracleRequests.length} OracleRequest events`)

  const request = oracleRequests.find((log) => {
    const event = contract.interface.parseLog(log)
    const args = event.args as unknown as IOracleRequestEventArgs
    return args.requestId === requestId
  })

  return request?.args as unknown as IOracleRequestEventArgs
}

// Get the oracle request data from the OrderAPIOracle
// contract for the IDs of the given events
export const getOracleRequests = async (
  requestIds: string[],
  fromBlock: number,
): Promise<IOracleRequestData[]> => {
  // Get the oracle events data
  const contract = contracts.orderApiOracle
  const requestFilter = contract.filters.OracleRequest()
  console.log(`Getting OracleRequest events...`)
  const oracleRequests = await contract.queryFilter(requestFilter, fromBlock)

  const matchedOracleRequests = []

  // Loop through the pending requests and check
  // if the requestId is in the oracle requests
  for (let i = 0; i < requestIds.length; i++) {
    const requestId = requestIds[i]
    const oracleRequest = oracleRequests.find((log) => {
      const event = contract.interface.parseLog(log)
      const args = event.args as unknown as IOracleRequestEventArgs
      return args.requestId === requestId
    })
    if (oracleRequest) {
      console.log(
        `Found oracle request with requestId ${requestId} at block ${oracleRequest.blockNumber}`,
      )
      matchedOracleRequests.push(oracleRequest)
    }
  }

  console.log(
    `Matched ${matchedOracleRequests.length} oracle requests to pending requests`,
  )
  return matchedOracleRequests.map(decodeOracleRequestData)
}

// Decode the oracle request data
export const decodeOracleRequestData = (log: Event): IOracleRequestData => {
  const event = orderApiOracle.interface.parseLog(log)
  const args = event.args as unknown as IOracleRequestEventArgs
  const decodedData = cbor.decodeAllSync(Buffer.from(args.data.slice(2), 'hex'))
  const decodedObject: { [key: string]: any } = {}
  for (let i = 0; i < decodedData.length; i += 2) {
    decodedObject[decodedData[i]] = decodedData[i + 1]
  }
  console.log('decodeOracleRequestData', decodedObject)
  return decodedObject as IOracleRequestData
}

export default contracts
