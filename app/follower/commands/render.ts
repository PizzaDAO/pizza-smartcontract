import axios, { AxiosResponse } from 'axios'
import { v4 as uuid } from 'uuid'
import { IRenderTask } from '../types'
import { OrderData } from '../types/OrderData'
import { getPendingRequests, pendingDirectory } from '../utils'
import { queryOrdersStatuses, queryOrderStatus } from './fetch'

export interface RenderRequestOptions {
  baseUrl: string
  apiVersion: string
  tokenId?: number
}

export const postOrder = async (
  baseUrl: string,
  apiVersion: string,
  orderData: OrderData,
): Promise<AxiosResponse> => {
  const endpoint = `${baseUrl}/api/${apiVersion}/diningroom/order`
  // callback placeholder value. It's not a secret key, but it's not a real key either.
  const callbackApiKey = 'SI/8gEsllRRJLD5HDHH1/2ESG1RKmCOy'
  try {
    console.log(
      `Posting order to ${endpoint} for token_id ${orderData.data.token_id}...`,
    )
    const response = await axios.post(endpoint, orderData, {
      headers: {
        Authorization: `Bearer ${callbackApiKey}`,
      },
    })
    // TODO: deserialize response
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Take the decoded oracle requests data saved to file
// and post them to the OrderAPI
export const renderRequests = async ({
  baseUrl,
  apiVersion,
  tokenId,
}: RenderRequestOptions): Promise<void> => {
  // Print the script usage
  console.log(`Using API URL: ${baseUrl}`)
  console.log(`Using API version: ${apiVersion}`)
  if (tokenId) {
    console.log(`Using token ID: ${tokenId}`)
  }

  console.log(`Parsing requests from ${pendingDirectory}`)

  // Read the requests from the data directory
  const requests = getPendingRequests(tokenId)

  if (requests.length === 0) {
    console.log('No requests found.')
    return
  }

  const tasks: IRenderTask[] = []

  const existing = await queryOrdersStatuses(
    baseUrl, apiVersion, requests.map((request) => request.token_id))
  if (existing.length > 0) {
    tasks.push(existing[0])
  }
  // check the renderer api if there is an existing job


  // if there is an existing job for the token_id, skip it
  const filteredRequests = requests.filter(
    (request) =>
      !tasks.find((task) => task.request.data.token_id === request.token_id),
  )

  // Post the requests to the OrderAPI
  for (const request of filteredRequests) {
    console.log(`Posting request for token_id ${request.token_id}...`)
    const taskId = uuid()

    const orderData: OrderData = {
      id: `${taskId}`,
      data: {
        address: '0xA53f6FaE797d2C4eFF65fdBb6Eba1b84fB336f9D',
        requestor: request.requestor,
        token_id: request.token_id,
        recipe_id: request.recipe_id,
      },
    }
    const response = await postOrder(baseUrl, apiVersion, orderData)
    console.log(response)
    // TODO: save the task to a file
  }

  // check the renderer api again to see if there are any new jobs
  await queryOrdersStatuses(
    baseUrl, apiVersion, requests.map((request) => request.token_id))
}

export default renderRequests