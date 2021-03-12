import { HardhatUserConfig } from 'hardhat/config'
import { task } from 'hardhat/config'
import '@nomiclabs/hardhat-waffle'
import '@openzeppelin/hardhat-upgrades'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = "KEY";

// Replace these private keys with your testnet account private keys
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const GOERLI_PRIVATE_KEY = "YOUR GOERLI PRIVATE KEY";
const RINKEBY_PRIVATE_KEY = "YOUR RINKEBY PRIVATE KEY";
const ROPSTEN_PRIVATE_KEY = "YOUR ROPSTEN PRIVATE KEY";


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 *  rinkeby: {
      url:  'http://127.0.0.1:8555', //specify ethereum node endpoint
      accounts: ['0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3'] //specify privateKey of account
    }
 */
const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    // goerli: {
    //   url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    //   accounts: [`0x${GOERLI_PRIVATE_KEY}`]
    // },
    hardhat: {},
    // mainnet: {
    //   url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    //   accounts: [`0xNOPE!`]
    // },
    // rinkeby: {
    //   url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    //   accounts: [`0x${RINKEBY_PRIVATE_KEY}`]
    // },
    // ropsten: {
    //   url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    //   accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    // }
  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
}

export default config
