import { ethers } from "ethers";
import config, { NetworkConfig } from "../config";
import { abi } from "../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json";
import utils from "./utils";

async function main() {
  const provider = new ethers.providers.AlchemyProvider(
    config.NETWORK,
    utils.getAlchemyAPIKey(config)
  );

  const contract = new ethers.Contract(
    config.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS,
    abi,
    provider
  );

  const events = await contract.queryFilter("ChainlinkRequested")// requestOrderAPI(1);
  console.log(events);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error) 
    process.exit(1)
  })

/* async function findPendingRequests() {
  const provider = new ethers.providers.JsonRpcProvider(
    config.RPC_URL,
    config.NETWORK
  );

  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    config.ORDER_API_CONSUMER_CONTRACT_ADDRESS,
    [
      "function requestOrderAPI(uint256 _pizzaId) public returns (bytes32 requestId)",
    ],
    signer
  );

  const tx = await contract.requestOrderAPI(1);
  console.log("tx:", tx);
}

async function getOutstandingRequestIds(contract) {
  // Get the contract instance
  const contractInstance = await ethers.getContractAt(contract.abi, contract.address)

  // Get the logs for the contract since it was deployed
  const logs = await contractInstance.provider.getLogs({
    fromBlock: 0,
    toBlock: 'latest',
    address: contract.address
  })

  // Create a map of requestIds for the ChainlinkRequested events
  const requestedIds = new Map()
  logs
    .filter(log => log.topics[0] === contract.interface.events.ChainlinkRequested.topic)
    .forEach(log => requestedIds.set(log.topics[1], true))

  // Create a map of requestIds for the ChainlinkFulfilled events
  const fulfilledIds = new Map()
  logs
    .filter(log => log.topics[0] === contract.interface.events.ChainlinkFulfilled.topic)
    .forEach(log => fulfilledIds.set(log.topics[1], true))

  // Build an array of requestIds that are in the ChainlinkRequested collection but not the ChainlinkFulfilled collection
  const outstandingIds = []
  for (const [requestId, value] of requestedIds.entries()) {
    if (!fulfilledIds.has(requestId)) {
      outstandingIds.push(requestId)
    }
  }

  // Print the collection of outstanding requestIds
  console.log(outstandingIds)
} */