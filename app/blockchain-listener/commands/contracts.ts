import { abi as consumerAbi } from "../OrderAPIConsumer.json";
import { abi as oracleAbi } from "../OrderAPIOracle.json";
import { ethers } from "ethers";

export const provider = new ethers.providers.AlchemyProvider(
  'mainnet',
  process.env.ALCHEMY_MAINNET_KEY,
);

export const orderApiConsumer = new ethers.Contract(
  process.env.RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS!,
  consumerAbi,
  provider
);

export const orderApiOracle = new ethers.Contract(
  process.env.RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS!,
  oracleAbi,
  provider
);

export const contracts = {
  orderApiConsumer,
  orderApiOracle,
};

export default contracts;