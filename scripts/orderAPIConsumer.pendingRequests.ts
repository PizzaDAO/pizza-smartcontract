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

  console.log(pendingRequests);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error) 
    process.exit(1)
  })