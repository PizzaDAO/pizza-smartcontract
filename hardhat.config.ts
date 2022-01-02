import { task, HardhatUserConfig } from 'hardhat/config'
import { NetworksUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'
import config, { NetworkConfig } from './config'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

const networks: NetworksUserConfig = {
  mainnet: {
    url: `https://eth-mainnet.alchemyapi.io/v2/${config.ALCHEMY_MAINNET_KEY}`,
    accounts: [`0x${config.MAINNET_PRIVATE_KEY}`],
    gasPrice: 220000000000
  },
  rinkeby: {
    url: `https://eth-rinkeby.alchemyapi.io/v2/${config.ALCHEMY_RINKEBY_KEY}`,
    accounts: [`0x${config.RINKEBY_PRIVATE_KEY}`],
  },
  matic: {
    url: `https://polygon-mainnet.g.alchemy.com/v2/${config.ALCHEMY_MATIC_KEY}`,
    accounts: [`0x${config.MATIC_PRIVATE_KEY}`],
  },
  maticmum: {
    url: `https://polygon-mumbai.g.alchemy.com/v2/${config.ALCHEMY_MUMBAI_KEY}`,
    accounts: [`0x${config.MATIC_MUMBAI_PRIVATE_KEY}`],
  },
}

const getNetworks = (config: NetworkConfig) => {
  const networkName = config.NETWORK.toLowerCase()
  const network = networks[networkName]

  return {
    hardhat: {},
    ...(network && { [networkName]: network }),
  }
}

const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: getNetworks(config),
  etherscan: {
    apiKey: config.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [{
      version: "0.8.6", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    },
    {
    version: "0.8.4", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    },
    {
      version: "0.8.0", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    },
    {
      version: "0.6.6", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 50,
  },
}

export default hardhatConfig
