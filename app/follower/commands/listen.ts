import { Event } from 'ethers'
import { decodeOracleRequestData, orderApiOracle } from '../contracts'
import { postOrder, RenderRequestOptions } from './render'
import { saveRequest } from '../utils'
import { FetchOptions } from './fetch'

export interface ListenOptions extends RenderRequestOptions, FetchOptions {}

// Listen for new requests and post them to the OrderAPI
export const listenRequests = async ({
  baseUrl,
  apiVersion,
}: ListenOptions): Promise<void> => {
  // Listen for new requests
  orderApiOracle.on('OracleRequest', async (log: Event) => {
    const data = decodeOracleRequestData(log)
    saveRequest(data)

    // Post the request data to the OrderAPI
    const _ = await postOrder(baseUrl, apiVersion, {
      id: `manual test TODO update this string`,
      data: data,
    })

    // TODO: save the response to file?
  })
}

// TODO: long poll the api for completed events and post them back to the chain

export default listenRequests
