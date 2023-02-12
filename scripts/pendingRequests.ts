import { ethers } from "ethers";
import config, { NetworkConfig } from "../config";
import { abi as consumerAbi } from "../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json";
import { abi as oracleAbi } from "../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json";
import utils from "./utils";


// Get the pending requests from the OrderAPIConsumer contract
const getPendingRequests = async (
  provider: ethers.providers.AlchemyProvider
  ): Promise<ethers.Event[]> => {
    
  const contract = new ethers.Contract(
    config.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS,
    consumerAbi,
    provider
  );

  // Get the requested and fulfilled events
  const requestedEvents = await contract.queryFilter("ChainlinkRequested")
  const fulfilledEvents = await contract.queryFilter("ChainlinkFulfilled")
  let pendingRequests = []

  // Loop through the requested events and check if the requestId is in the fulfilled events
  for (let i = 0; i < requestedEvents.length; i++) {
    const requestedEvent = requestedEvents[i]
    const requestId = requestedEvents[i].topics[1]
    const fulfilled = fulfilledEvents.find((event) => event.topics[1] === requestId)
    if (!fulfilled) {
      pendingRequests.push(requestedEvent)
    }
  }

  return pendingRequests;
}

// Get the oracle request data from the OrderAPIOracle contract for the IDs of the given events
const getOracleRequests = async (
  provider: ethers.providers.AlchemyProvider,
  requests: ethers.Event[]
  ): Promise<ethers.Event[]> => {

  const contract = new ethers.Contract(
    config.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS,
    oracleAbi,
    provider
  );

  // Get the oracle events data
  const oracleRequests = await contract.queryFilter("OracleRequest")
  const pendingOracleRequests = []

  // Loop through the pending requests and check if the requestId is in the oracle requests
  for (let i = 0; i < requests.length; i++) {
    const requestId = requests[i].topics[1]
    const oracleRequest = oracleRequests.find((event) => event.topics[1] === requestId)
    if (oracleRequest) {
      pendingOracleRequests.push(oracleRequest)
    }
  }
  //const foo: ethers.utils.Result = oracleRequests[0].args;

  return oracleRequests;//pendingOracleRequests;
}

const main = async () => {
  const provider = new ethers.providers.AlchemyProvider(
    config.NETWORK,
    utils.getAlchemyAPIKey(config)
  );

  const pendingRequests = await getPendingRequests(provider);
  console.log(pendingRequests);

  const oracleRequests = await getOracleRequests(provider, pendingRequests);
  console.log(oracleRequests);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error) 
    process.exit(1)
  })