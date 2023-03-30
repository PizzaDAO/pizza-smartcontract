import axios from 'axios'
import fs from 'fs'

import { getOracleRequests, getOrderApiConsumerRequests } from '../contracts'
import { IRenderTask } from '../types'
import {
  dataDirectory,
  getFromBlock,
  saveRenderTask,
  saveRequest,
} from '../utils'

export interface FetchOptions {
  file: string
  block: number
}

export interface QueryOrderStatusOptions {
  baseUrl: string
  apiVersion: string
  tokenId?: number
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
    const response = await axios.post(endpoint, filter)
    const tasks = response.data as IRenderTask[]
    tasks.map(saveRenderTask)
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
}: FetchOptions): Promise<void> => {
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
}

export default fetchRequests
