import { getOracleRequest, orderApiOracle, signer } from '../contracts'
import { getPendingRequests, getRenderTasks } from '../utils'

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
  const oracle = orderApiOracle.Connect(signer)

  console.log('Querying events')
  const incompleteEvent = await getOracleRequest(requestId, inBlock)

  if (!incompleteEvent) {
    throw new Error(
      `Could not find incomplete event for requestId ${requestId}`,
    )
  }

  console.log('posting request fulfillment')

  // simulate the fulfillment
  const tx = await oracle.fulfillOracleRequest(
    requestId,
    incompleteEvent.payment,
    incompleteEvent.callbackAddr,
    incompleteEvent.callbackFunctionId,
    incompleteEvent.cancelExpiration,
    truncatedMetadataHash,
  )

  console.log(tx)
  console.log('request fulfillment complete')
}

// TODO: fulfillListenerRequest
