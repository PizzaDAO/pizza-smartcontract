import { getOracleRequest, orderApiOracle, signer } from '../contracts'

export interface FulfillRequestOptions {
  // the chainlink request id
  requestId: string
  // the block containing the original reuwst
  inBlock: number
  // thetruncated metadata hash from the renderer
  truncatedMetadataHash: string
}

// fulfill a chainlink request with given metadata hash
//
export const fulfillChainlinkRequest = async ({
  requestId,
  inBlock,
  truncatedMetadataHash,
}: FulfillRequestOptions): Promise<void> => {
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
