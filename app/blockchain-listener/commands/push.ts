import fs from 'fs';
import path from 'path';
import axios, { AxiosResponse } from 'axios';

export interface OrderData {
  bridge: string,
  address: string,
  requestor: string,
  token_id: number,
  recipe_id: number
}

export const postOrder = async (
  baseUrl: string,
  apiVersion: string,
  orderData: OrderData): Promise<AxiosResponse> => {
  const endpoint = `${baseUrl}/api/${apiVersion}/orders`;
  try {
    console.log(`Posting order to ${endpoint} for token_id ${orderData.token_id}...`)
    const response = await axios.post(endpoint, orderData);
    return response;
  }
  catch (error) {
    console.log(error);
    throw error;
  }
}

export interface PushOptions {
  url: string;
  apiVersion: string;
}

// Take the decoded oracle requests data saved to file
// and post them to the OrderAPI
export const pushRequests = async (options: PushOptions) => {
  // Set the API configuration
  const baseUrl = options.url;
  const apiVersion = options.apiVersion;

  // Print the script usage
  console.log(`Using API URL: ${baseUrl}`);
  console.log(`Using API version: ${apiVersion}`);

  console.log(`Parsing requests from ${path.dirname(process.argv[1])}/data...`)
  // Read the requests from the data directory
  const requests = fs.readdirSync(
    `${path.dirname(process.argv[1])}/data`
  ).map((file) => {
    const request = JSON.parse(
      fs.readFileSync(`${path.dirname(process.argv[1])}/data/${file}`, 'utf8')
    );
    return request;
  });

  for (const request of requests) {
    const orderData: OrderData = {
      bridge: 'orderpizzav1',
      address: request.address,
      requestor: request.requestor,
      token_id: request.token_id,
      recipe_id: request.recipe_id
    };
    const response = await postOrder(
      options.url,
      options.apiVersion,
      orderData
    );
    console.log(response);
  };
};

export default pushRequests;