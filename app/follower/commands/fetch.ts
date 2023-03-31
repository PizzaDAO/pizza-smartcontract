import axios from 'axios'
import fs from 'fs'

import { getOracleRequests, getOrderApiConsumerRequests } from '../contracts'
import { IOracleRequestData, IRenderTask } from '../types'
import {
  dataDirectory,
  getFromBlock,
  getPendingRequests,
  saveRenderTask,
  saveRequest,
} from '../utils'

export interface FetchOptions {
  file?: string
  block?: number
}

export interface QueryOrderStatusOptions {
  baseUrl: string
  apiVersion: string
  tokenId?: number
}

export const checkStatus = async ({
  baseUrl,
  apiVersion,
  tokenId,
}: QueryOrderStatusOptions): Promise<IRenderTask[]> => {
  const tasks = []
  // iterate over the tokenIds and query the order status

  const pending = getPendingRequests(tokenId)

  for (const tokenId of pending.map((r) => r.token_id)) {
    const existing = await queryOrderStatus({ baseUrl, apiVersion, tokenId })
    if (existing.length > 0) {
      // TODO: deduplicate
      tasks.push(existing[0])
    }
  }
  return tasks
}

export const queryOrderStatuses = async (
  baseUrl: string,
  apiVersion: string, tokenIds: number[]): Promise<IRenderTask[]> => {
  const tasks = []
  // iterate over the tokenIds and query the order status

  for (const tokenId of tokenIds) {
    const existing = await queryOrderStatus({ baseUrl, apiVersion, tokenId })
    if (existing.length > 0) {
      // TODO: deduplicate
      tasks.push(existing[0])
    }
  }
  return tasks
}

export const queryOrderStatus = async ({
  baseUrl,
  apiVersion,
  tokenId,
}: QueryOrderStatusOptions): Promise<IRenderTask[]> => {
  const endpoint = `${baseUrl}/api/${apiVersion}/admin/render_task/find`
  try {
    const filter = {
      filter: {
        'request.data.token_id': tokenId,
      },
    }
    console.log(`queryOrderStatus`, filter)
    const response = await axios.post(endpoint, filter)
    const tasks = response.data as IRenderTask[]
    tasks.map(saveRenderTask)
    console.log(tasks)
    return tasks
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Fetch unfulfilled requests from the given block to present
// and save them to file
export const fetchRequests = async ({
  file,
  block,
}: FetchOptions): Promise<IOracleRequestData[]> => {
  const fromBlock = getFromBlock(file, block)

  // fetch the pending requests from the OrderAPI Consumer contract
  const { requestIds, blockHeight } = await getOrderApiConsumerRequests(
    fromBlock,
  )

  // Save the decoded oracle requests data to file based on token_id
  if (requestIds.length !== 0) {
    console.log(`Found ${requestIds.length} pending requests`)
    const oracleRequests = await getOracleRequests(requestIds, fromBlock)
    oracleRequests.map(saveRequest)
  } else {
    console.log(
      `No pending requests found from ${fromBlock} to ${blockHeight}. Abort fetching Oracle requests.`,
    )
  }

  console.log(
    `saving latest block ${blockHeight} to ${dataDirectory}/fromBlock.json`,
  )
  // Save the latest block to file. Based on latest ChainlinkRequested event, as
  // this is the first event in the sequence and guaranteed to be emitted
  // when a pizza box is redeemed
  fs.writeFileSync(
    `${dataDirectory}/fromBlock.json`,
    JSON.stringify({ fromBlock: blockHeight }),
  )

  return getPendingRequests(undefined);
}

export default fetchRequests
