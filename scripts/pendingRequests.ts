import 'dotenv/config';
import { ethers } from "ethers";
import { abi as consumerAbi } from "../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json";
import { abi as oracleAbi } from "../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json";

interface IChainlinkFulfilledEventArgs {
  id: string;
}

// Get the pending requests from the OrderAPIConsumer contract
const getPendingRequests = async (
  contract: ethers.Contract,
  ): Promise<ethers.Event[]> => {

  // Get the requested and fulfilled events
  const requestedFilter = contract.filters.ChainlinkRequested();
  const requestedEvents = await contract.queryFilter(requestedFilter);

  const fulfilledFilter = contract.filters.ChainlinkFulfilled();
  const fulfilledLogs = await contract.queryFilter(fulfilledFilter);
  
  let pendingRequests = []

  // Loop through the requested events and check if the requestId is in the fulfilled events
  for (let i = 0; i < requestedEvents.length; i++) {
    const requestedEvent = requestedEvents[i];
    const requestId = requestedEvent.topics[1];
    const fulfilledRequest = fulfilledLogs.find((log) => {
      const event = contract.interface.parseLog(log);
      const args = event.args as unknown as IChainlinkFulfilledEventArgs;
      return args.id === requestId
    })
    if (!fulfilledRequest) {
      pendingRequests.push(requestedEvent)
    }
  }

  return pendingRequests;
}

interface IOracleRequestEventArgs {
  requestId: string;
}

// Get the oracle request data from the OrderAPIOracle contract for the IDs of the given events
const getOracleRequests = async (
  contract: ethers.Contract,
  requestIds: string[]
  ): Promise<ethers.Event[]> => {

  // Get the oracle events data
  const requestFilter = contract.filters.OracleRequest();
  const oracleRequests = await contract.queryFilter(requestFilter)
 
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
      matchedOracleRequests.push(oracleRequest)
    }
  }

  return matchedOracleRequests;
}

const main = async () => {
  const provider = new ethers.providers.AlchemyProvider(
    'mainnet',
    process.env.ALCHEMY_MAINNET_KEY,
  );

  const consumerContract = new ethers.Contract(
    process.env.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS!,
    consumerAbi,
    provider
  );

  const oracleContract = new ethers.Contract(
    process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS!,
    oracleAbi,
    provider
  );

  const pendingRequests = await getPendingRequests(consumerContract);
  const requestIds = pendingRequests.map((event) => {
    return event.topics[1]
  });

  const oracleRequests = await getOracleRequests(oracleContract, requestIds);
  
  console.log(oracleRequests, `This many requests: ${oracleRequests.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error) 
    process.exit(1)
  })