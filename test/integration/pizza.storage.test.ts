import { expect } from 'chai'
import { BigNumber, Contract, Wallet, providers, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle'

import scriptUtils from '../../scripts/utils'
import config, { NetworkConfig } from '../../config'

import aggregatorV3 from '../../artifacts/@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json'
import storageContract from '../../artifacts/contracts/data/RarePizzasSeedStorage.sol/RarePizzasSeedStorage.json'

type TestContext = {
  box: Contract
  priceFeed: MockContract
  signer: Wallet
}

let testContext: TestContext

// This test will connect to rinkeby
// so it is skipped when checked into source for now

describe.skip('Pizza Seed Storage Matic Mumbai Tests', function () {
  it('Should get a random number for a job id', async () => {
    const your_deployed_contract = scriptUtils.getStorageProxyAddress(config)
    const provider = new providers.AlchemyProvider(config.NETWORK, scriptUtils.getAlchemyAPIKey(config))
    const wallet = new Wallet(scriptUtils.getDeploymentKey(config), provider)

    const contract = new Contract(your_deployed_contract, storageContract.abi, wallet)

    const tx = await contract.getRandomNumber(utils.formatBytes32String('abc-123'))

    console.log(`-- ${config.NETWORK} deployment: ${contract.address} fetching random number`)

  })
})
