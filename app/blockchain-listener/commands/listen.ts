import { Event } from 'ethers';
import { orderApiOracle } from './contracts';
import { OrderData, postOrder, PushOptions } from './push';
import { 
  decodeOracleRequestData,
  FetchOptions,
  saveRequest
} from './fetch';

export interface ListenOptions extends PushOptions, FetchOptions {}

// Listen for new requests and post them to the OrderAPI
export const listenRequests = ({url, apiVersion}: ListenOptions) => {
  // Listen for new requests
  orderApiOracle.on('OracleRequest', async (log: Event) => {
    const data = decodeOracleRequestData(log);
    // Save the request data to file
    saveRequest(data);
    // Post the request data to the OrderAPI
    postOrder(url, apiVersion, data as OrderData);
  }); 
}

export default listenRequests;