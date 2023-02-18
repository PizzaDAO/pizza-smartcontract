#!/usr/bin/env ts-node
import 'dotenv/config';
import { ethers } from "ethers";
import * as cbor from 'cbor';
import axios, { AxiosResponse } from 'axios';
import { Command, Option, Argument } from 'commander';
import fs from 'fs';
import path from 'path';

// Import the contract ABIs
import { abi as consumerAbi } from "./OrderAPIConsumer.json";
import { abi as oracleAbi } from "./OrderAPIOracle.json";

interface Options {
  file: string;
  block: string;
  url: string;
  apiVersion: string;
  mode: string;
}

interface Program extends Command, Options {}

const program = new Command() as Program;

program
  .version('0.0.1', '-v --version', 'output the current version')
  .description('A blockchain event processor which can listen for the events or process them in batches')
  .option(
    '-f, --file [file]', 
    'fromBlock value to be used, supplied by a file for persistance', 
    'fromBlock.json'
  )
  .option(
      '-b, --block [block]', 
      'fromBlock value if latestBlock.json not found, otherwise zero if neither value is provided',
    '0'
  )
  .option(
    '-u, --url [url]',
    'URL of the api to post request data to',
    'http://localhost:8080'
  )
  .option(
    '-a, --apiVersion <apiVersion>',
    'API version, to use when contructing URI to post request data to',
    'v1'
  )
  .option(
    '-m, --mode <mode>',
    'mode to run the listener in, either "service" or "batch"',
    'batch'
  )
  .parse();
  
const options = program.opts() as Options;

interface IChainlinkFulfilledEventArgs {
  id: string;
}

// Get the pending requests from the OrderAPIConsumer contract
const getPendingRequests = async (
  contract: ethers.Contract,
  fromBlock: number
  ): Promise<{
    pendingRequests: ethers.Event[], 
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
  console.log(`Found ${pendingRequests.length} pending requests`);

  return {pendingRequests, latestBlock};
}

interface IOracleRequestEventArgs {
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
const getOracleRequests = async (
  contract: ethers.Contract,
  requestIds: string[],
  fromBlock: number
  ): Promise<ethers.Event[]> => {

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
interface IOracleRequestData {
  address: string,
  requestor: string,
  token_id: number,
  recipe_id: number
}

// Decode the oracle request data
const decodeOracleRequestData = (
  contract: ethers.Contract,
  logs: ethers.Event[]): IOracleRequestData[] => {
  const decodedEventsData = logs.map((log) => {
    const event = contract.interface.parseLog(log);
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
  })
  return decodedEventsData;
}

interface OrderData {
  bridge: string,
  address: string,
  requestor: string,
  token_id: number,
  recipe_id: number
}

const postOrder = async (
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

const listenRequests = async () => {};

const fetchRequests = async () => {}; 

const pushRequests = async () => {
  // Print the script usage
  console.log(`Using API URL: ${options.url}`);
  console.log(`Using API version: ${options.apiVersion}`);

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
}


const main = async () => {

  // Get the fromBlock value from the file or command line
  // Will default to 0 if neither are provided
  //
  let fromBlock: number;
  // Tries to set the fromBlock value from the provided file option
  // If the file option is not provided, it will use the block option
  // If the block option is not provided, it will default to 0
   if (options.file) {  
    try {
      const fromBlock = JSON.parse(
        fs.readFileSync(options.file, 'utf8')
      ).fromBlock;
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

  // Set the API configuration
  const baseUrl = options.url;
  const apiVersion = options.apiVersion;
  
  const provider = new ethers.providers.AlchemyProvider(
    'mainnet',
    process.env.ALCHEMY_MAINNET_KEY,
  );

  const consumerContract = new ethers.Contract(
    process.env.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS!,
    consumerAbi,
    provider
  );

  consumerContract.address;

  const oracleContract = new ethers.Contract(
    process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS!,
    oracleAbi,
    provider
  );

  const { pendingRequests, latestBlock} = await getPendingRequests(consumerContract, fromBlock!);
  const requestIds = pendingRequests.map((event) => {
    return event.topics[1]
  });

  const oracleRequests = await getOracleRequests(oracleContract, requestIds, fromBlock!);

  const decodedOracleRequestsData = decodeOracleRequestData(
    oracleContract,
    oracleRequests
  );

  // Save the decoded oracle requests data to file based on token_id
  console.log(`saving decoded oracle requests data to ${path.dirname(process.argv[1])}/data}. 
    File name is token_id.json`
  );
  
  // Save the decoded oracle requests data to file based on token_id
  decodedOracleRequestsData.forEach((request) => {
    const fileName = `${path.dirname(process.argv[1])}/data/${request.token_id}.json`;
    fs.writeFileSync(fileName, JSON.stringify(request));
  });


  console.log(`saving latest block to ${path.dirname(process.argv[1])}/fromBlock.json`);
  // Save the latest block to file. Based on latest ChainlinkRequested event, as
  // this is the first event in the sequence and guaranteed to be emitted
  // when a pizza box is redeemed
  fs.writeFileSync(
    `${path.dirname(process.argv[1])}/fromBlock.json`,
    JSON.stringify({fromBlock: latestBlock})
  );

  // Push the decoded oracle requests data to the API
  await pushRequests();
};
  
  /* const eventAbi = consumerContract.filters.ChainlinkRequested();

  // Listen for new requests
  consumerContract.on(
    eventAbi,
    (id: string) => {

    }
  ) */


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error) 
    process.exit(1)
  })