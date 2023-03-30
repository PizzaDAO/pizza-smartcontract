import { Event } from 'ethers'
import { orderApiOracle } from '../contracts'
import { postOrder } from './render'
import { RenderRequestOptions } from '../types/RenderRequestOptions'
import { decodeOracleRequestData, FetchOptions } from './fetch'
import { saveRequest } from '../utils'

export interface ListenOptions extends RenderRequestOptions, FetchOptions {}

// Listen for new requests and post them to the OrderAPI
export const listenRequests = async ({
  baseUrl: url,
  apiVersion,
}: ListenOptions) => {
  // Listen for new requests
  orderApiOracle.on('OracleRequest', async (log: Event) => {
    const data = decodeOracleRequestData(log)
    // Save the request data to file
    saveRequest(data)
    // Post the request data to the OrderAPI
    await postOrder(url, apiVersion, {
      id: `manual test TODO update this string`,
      data: data,
    })
  })
}

export default listenRequests
