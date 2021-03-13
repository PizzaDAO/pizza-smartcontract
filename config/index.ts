import 'dotenv/config'

export type NetworkConfig = Record<string, string>
const config: NetworkConfig = {
  NETWORK: process.env.NETWORK || 'hardhat',
  ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY || '',
  ALCHEMY_GOERLI_KEY: process.env.ALCHEMY_GOERLI_KEY || '',
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
  GOERLI_PRIVATE_KEY: process.env.GOERLI_PRIVATE_KEY || '',
  RINKEBY_PRIVATE_KEY: process.env.RINKEBY_PRIVATE_KEY || '',
  ROPSTEN_PRIVATE_KEY: process.env.ROPSTEN_PRIVATE_KEY || '',
}

export default config
