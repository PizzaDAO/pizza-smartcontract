import { Event } from 'ethers'
import { decodeOracleRequestData, orderApiOracle } from '../contracts'
import renderRequests, { postOrder, RenderRequestOptions } from './render'
import { saveRequest } from '../utils'
import { checkStatus, FetchOptions } from './fetch'
import { cleanupCompletedEvents, cleanupCompletedTasks, fulfullRequest } from './fulfillRequest'

export interface ListenOptions extends RenderRequestOptions, FetchOptions { }

// listen for the status event to change to complete
const listenForCompletion = async (
  baseUrl: string,
  apiVersion: string,
  tokenId: number, interval: number): Promise<boolean> => {
  try {
    const status = await checkStatus({ baseUrl, apiVersion, tokenId })
    const complete = status.find((s) => s.status === 'complete' && s.truncated_metadata)
    if (complete) {
      return true
    }

    // If the state is not true, retry after the specified interval
    setTimeout(() => listenForCompletion(baseUrl, apiVersion, tokenId, interval));

  } catch (error) {
    console.log(error)

    // retry in case of errors
    setTimeout(() => listenForCompletion(baseUrl, apiVersion, tokenId, interval));
  }
  return false
}

// Listen for new requests and post them to the OrderAPI
export const listenRequests = async ({
  baseUrl,
  apiVersion,
}: ListenOptions): Promise<void> => {
  // Listen for new requests
  orderApiOracle.on('OracleRequest', async (log: Event) => {
    try {
      // 60k ms = 1 minute
      const pollInterval = 60000;
      const data = decodeOracleRequestData(log)
      saveRequest(data)

      // render the request
      await renderRequests({ baseUrl, apiVersion, tokenId: data.token_id })

      // long poll the api for completed events and post them back to the chain
      if (await listenForCompletion(baseUrl, apiVersion, data.token_id, pollInterval)) {
        await fulfullRequest({ tokenId: data.token_id })
        await cleanupCompletedEvents()
        await cleanupCompletedTasks(baseUrl, apiVersion)
      } else {
        console.log(`listenForCompletion timed out for token ${data.token_id}. manually run thee fulfillment`)
      }
    } catch (error) {
      console.log(error)
    }
  })
}

export default listenRequests
