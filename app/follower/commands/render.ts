import axios, { AxiosResponse } from 'axios'
import { v4 as uuid } from 'uuid'
import { OrderData } from '../types/OrderData'
import { IOracleRequestData, RenderRequestOptions } from '../types'
import { getPendingRequests, pendingDirectory } from '../utils'

export const updateOrderStatus = async (
  baseUrl: string,
  apiVersion: string,
  tokenId?: number,
): Promise<AxiosResponse> => {
  const endpoint = `${baseUrl}/api/${apiVersion}/admin/render_task/find`
  try {
    const filter = {
      filter: {
        'request.data.token_id': tokenId,
      },
    }
    const response = await axios.post(endpoint, filter)

    // TODO: cache out the tasks and return a deserilized response
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

// TODO: deserialize response
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
  const requests: IOracleRequestData[] = getPendingRequests(tokenId)

  // TODO: check the renderer api if there is an existing job

  // TODO: if there is an existing job for the token_id,
  // skip it and update the task status

  //

  for (const request of requests) {
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
}

export default renderRequests
