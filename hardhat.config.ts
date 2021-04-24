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
    gasPrice: 250000000000
  },
  goerli: {
    url: `https://eth-goerli.alchemyapi.io/v2/${config.ALCHEMY_GOERLI_KEY}`,
    accounts: [`0x${config.GOERLI_PRIVATE_KEY}`],
  },
  rinkeby: {
    url: `https://eth-rinkeby.alchemyapi.io/v2/${config.ALCHEMY_RINKEBY_KEY}`,
    accounts: [`0x${config.RINKEBY_PRIVATE_KEY}`],
  },
  ropsten: {
    url: `https://eth-ropsten.alchemyapi.io/v2/${config.ALCHEMY_ROPSTEN_KEY}`,
    accounts: [`0x${config.ROPSTEN_PRIVATE_KEY}`],
  },
  matic: {
    url: `https://rpc-mainnet.maticvigil.com/v1/${config.VIGIL_MATIC_KEY}`,
    accounts: [`0x${config.MATIC_PRIVATE_KEY}`],
  },
  mumbai: {
    url: `https://rpc-mumbai.maticvigil.com/v1/${config.VIGIL_MUMBAI_KEY}`,
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

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 *  rinkeby: {
      url:  'http://127.0.0.1:8555', //specify ethereum node endpoint
      accounts: ['0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'] //specify privateKey of account
    }
 */
const hardhatConfig: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: getNetworks(config),
  etherscan: {
    apiKey: config.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [{
      version: "0.8.0", settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }, {
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
    gasPrice: 150,
  },
}

export default hardhatConfig
