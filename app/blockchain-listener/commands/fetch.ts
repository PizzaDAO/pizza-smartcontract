import fs from 'fs';
import path from 'path';
import { Event, Contract } from "ethers";
import * as cbor from 'cbor';
import contracts, { orderApiOracle } from './contracts';

export interface IChainlinkFulfilledEventArgs {
  id: string;
}

// Get the pending requests from the OrderAPIConsumer contract
export const getPendingRequests = async (
  contract: Contract,
  fromBlock: number
  ): Promise<{
    pendingRequests: Event[], 
    latestBlock: number | undefined
  }> => {

  console.log(`Getting events from block ${fromBlock} onwards...`)

  // Get the requested and fulfilled events
  const requestedFilter = contract.filters.ChainlinkRequested();
  console.log(`Getting ChainlinkRequested events...`);
  const requestedEvents = await contract.queryFilter(requestedFilter, fromBlock);
  console.log(`Found ${requestedEvents.length} ChainlinkRequested events`);

  const fulfilledFilter = contract.filters.ChainlinkFulfilled();
  console.log(`Getting ChainlinkFulfilled events...`);
  const fulfilledLogs = await contract.queryFilter(fulfilledFilter, fromBlock);
  console.log(`Found ${fulfilledLogs.length} ChainlinkFulfilled events`);
  
  console.log(`Cross-referencing ChainlinkRequested and ChainlinkFulfilled events to determine pending requests...`);

  let pendingRequests = []
  let latestBlock: number = fromBlock; 
  // Loop through the requested events and check if the requestId is in the fulfilled events
  for (let i = 0; i < requestedEvents.length; i++) {
    const requestedEvent = requestedEvents[i];
    const blockNumber = requestedEvent.blockNumber;

    // Update the latest block number
    // This is used to update the fromBlock value in the latestBlock.json file
    if (blockNumber > latestBlock) {
      latestBlock = blockNumber;
    }

    const requestId = requestedEvent.topics[1];
    const fulfilledRequest = fulfilledLogs.find((log) => {
      const event = contract.interface.parseLog(log);
      const args = event.args as unknown as IChainlinkFulfilledEventArgs;
      return args.id === requestId;
    })
    if (!fulfilledRequest) {
      console.log(`Found pending request with requestId ${requestId} at block ${blockNumber}`);
      pendingRequests.push(requestedEvent);
    }
  }

  return {pendingRequests, latestBlock};
}

export interface IOracleRequestEventArgs {
  specId: string;
  requester: string;
  requestId: string;
  payment: number;
  callbackAddr: string;
  callbackFunctionId: string;
  cancelExpiration: number;
  dataVersion: number;
  data: string;
}

// Get the oracle request data from the OrderAPIOracle contract for the IDs of the given events
export const getOracleRequests = async (
  contract: Contract,
  requestIds: string[],
  fromBlock: number
  ): Promise<Event[]> => {

  // Get the oracle events data
  const requestFilter = contract.filters.OracleRequest();
  console.log(`Getting OracleRequest events...`);
  const oracleRequests = await contract.queryFilter(requestFilter, fromBlock)
 
  const matchedOracleRequests = []

  // Loop through the pending requests and check if the requestId is in the oracle requests
  for (let i = 0; i < requestIds.length; i++) {
    const requestId = requestIds[i]
    const oracleRequest = oracleRequests.find((log) =>  {
      const event = contract.interface.parseLog(log);
      const args = event.args as unknown as IOracleRequestEventArgs;
      return args.requestId === requestId
    })
    if (oracleRequest) {
      console.log(`Found oracle request with requestId ${requestId} at block ${oracleRequest.blockNumber}`)
      matchedOracleRequests.push(oracleRequest)
    }
  }

  console.log(`Matched ${matchedOracleRequests.length} oracle requests to pending requests`);
  return matchedOracleRequests;
}

// The decoded oracle request data structure
export interface IOracleRequestData {
  address: string,
  requestor: string,
  token_id: number,
  recipe_id: number
}

// Decode the oracle request data
export const decodeOracleRequestData = (log: Event): IOracleRequestData => {
  const event = orderApiOracle.interface.parseLog(log);
  const args = event.args as unknown as IOracleRequestEventArgs;
  const decodedData = cbor.decodeAllSync(
    Buffer.from(args.data.slice(2),
    'hex'
  ));
  let decodedObject: { [key: string]: any } = {};
  for (let i = 0; i < decodedData.length; i += 2) {
    decodedObject[decodedData[i]] = decodedData[i + 1];
  }
  return decodedObject as IOracleRequestData;
}

export const saveRequest = (request: IOracleRequestData) => {
  // Check if the data directory exists
  const dataDir = `${path.dirname(process.argv[1])}/data`;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  // Save the request to file
  console.log(`Saving request to file: ${request.token_id}.json`)
  const fileName = `${dataDir}/${request.token_id}.json`;
  fs.writeFileSync(fileName, JSON.stringify(request));
}

export interface FetchOptions {
  file: string;
  block: string;
}

// Fetch unfulfilled requests from the given block to present
// and save them to file
export const fetchRequests = async (options: FetchOptions) => {

  // Get the fromBlock value from the file or command line
  // Will default to 0 if neither are provided
  let fromBlock: number;
  // Tries to set the fromBlock value from the provided file option
  // If the file option is not provided, it will use the block option
  // If the block option is not provided, it will default to 0
   if (options.file) {  
    try {
      const data = JSON.parse(
        fs.readFileSync(`${path.dirname(process.argv[1])}/${options.file}`, 'utf8')
      ).fromBlock;
      fromBlock = parseInt(data);
      console.log(`fromBlock value: ${fromBlock}
      retrieved from file: ${options.file}`);
    } catch (error) {
      console.log(
        `Error reading fromBlock file: ${error} - using fromBlock value from command line or defaulting to 0 if not provided`
      );
      fromBlock = parseInt(options.block);
      console.log(`fromBlock value used: ${fromBlock}`);
    }
  } else {
    fromBlock = parseInt(options.block);
    console.log(`fromBlock value used: ${fromBlock}`);
  }

  const { pendingRequests, latestBlock} = await getPendingRequests(
    contracts.orderApiConsumer, fromBlock!
  );

  const requestIds = pendingRequests.map((event) => {
    return event.topics[1]
  });

  let newFromBlock;

  if (requestIds.length !== 0) {
    console.log(`Found ${requestIds.length} pending requests`);
    const oracleRequests = await getOracleRequests(
      contracts.orderApiOracle, requestIds, fromBlock!
    );

    const decodedOracleRequestsData = oracleRequests.map(decodeOracleRequestData);

    // Save the decoded oracle requests data to file based on token_id
    console.log(`Writing decoded oracle requests data to ${path.dirname(process.argv[1])}/data...`);
    decodedOracleRequestsData.map(saveRequest); 

    newFromBlock = latestBlock!+1;
  } else {
    console.log(
      `No pending requests found from ${fromBlock} to ${latestBlock}. Abort fetching Oracle requests.`
    );
    newFromBlock = fromBlock;
  }

  console.log(`saving latest block ${newFromBlock} to ${path.dirname(process.argv[1])}/fromBlock.json`);
  // Save the latest block to file. Based on latest ChainlinkRequested event, as
  // this is the first event in the sequence and guaranteed to be emitted
  // when a pizza box is redeemed
  fs.writeFileSync(
    `${path.dirname(process.argv[1])}/fromBlock.json`,
    JSON.stringify({fromBlock: newFromBlock})
  );
};

export default fetchRequests;