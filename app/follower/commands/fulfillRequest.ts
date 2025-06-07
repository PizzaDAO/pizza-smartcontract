import { getOracleRequest, orderApiOracle, orderApiOracleWriteEnabled, signer } from '../contracts'
import { deleteRequest, getPendingRequests, getRenderTasks } from '../utils'
import fetchRequests, { queryOrderStatuses } from './fetch'

export interface FulfillRequestOptions {
  // the chainlink request id
  tokenId: number
}

export interface FulfillChainlinkRequestOptions {
  // the chainlink request id
  requestId: string
  // the block containing the original reuwst
  inBlock: number
  // thetruncated metadata hash from the renderer
  truncatedMetadataHash: string
}

// find the complete render task for the given token id
// and fulfill the chainlink request with the truncated metadata hash
export const fulfullRequest = async (
  { tokenId }: FulfillRequestOptions): Promise<void> => {
  const tasks = getRenderTasks(tokenId);
  const task = tasks.find((t) => t.status === "complete");
  const pendingRequests = getPendingRequests(tokenId);
  const request = pendingRequests.find((r) => r.token_id === tokenId);

  if (!task) {
    throw new Error(`Could not find render task for token ${tokenId}`)
  }

  if (!task.truncated_metadata) {
    throw new Error(`Could not find truncated metadata for token ${tokenId}`)
  }

  if (!request) {
    throw new Error(`Could not find pending request for token ${tokenId}`)
  }

  const { requestId, blockNumber } = request

  await fulfillChainlinkRequest({
    requestId, inBlock: blockNumber,
    truncatedMetadataHash: task.truncated_metadata
  })

}

// fulfill a chainlink request with given metadata hash
//
export const fulfillChainlinkRequest = async ({
  requestId,
  inBlock,
  truncatedMetadataHash,
}: FulfillChainlinkRequestOptions): Promise<void> => {
  console.log('Connecting to instance')
  const oracle = orderApiOracleWriteEnabled

  console.log('Querying events')
  const incompleteEvent = await getOracleRequest(requestId, inBlock)

  if (!incompleteEvent) {
    throw new Error(
      `Could not find incomplete event for requestId ${requestId}`,
    )
  }

  console.log('posting request fulfillment', incompleteEvent)

  // simulate the fulfillment by chainlink
  // by calling the fulfill function on the oracle contract
  const tx = await oracle.fulfillOracleRequest(
    incompleteEvent.requestId,
    incompleteEvent.payment,
    incompleteEvent.callbackAddr,
    incompleteEvent.callbackFunctionId,
    incompleteEvent.cancelExpiration,
    `0x${truncatedMetadataHash}`,
  )

  console.log(tx)
  const result = await tx.wait()
  console.log('request fulfillment complete', result)
}

// TODO: fulfillment wihtout chainlink

// clean up the filesystem of completed events
// by nuking the folder and repopulating it
export const cleanupCompletedEvents = async (): Promise<void> => {
  console.log('cleanupCompletedEvents')

  // get the pending events from the file system and delete them all
  const pending = getPendingRequests(undefined)
  for (const event of pending) {
    deleteRequest(event.token_id)
  }

  // force a refresh which repopulates the filesystem
  const _ = await fetchRequests({})
}

// clean up the filesystem of completed tasks
// by nuking the folder and repopulating it
export const cleanupCompletedTasks = async (baseUrl: string,
  apiVersion: string): Promise<void> => {
  console.log('cleanupCompletedTasks')

  // get the pending tasks from the file system and delete ethem all
  const pending = getRenderTasks(undefined)
  for (const task of pending) {
    if (task.status === "complete") {
      deleteRequest(task.request.data.token_id)
    }
  }

  // force a refresh which repopulates the filesystem
  const requests = getPendingRequests(undefined)
  const _ = await queryOrderStatuses(
    baseUrl, apiVersion, requests.map((request) => request.token_id))
}
