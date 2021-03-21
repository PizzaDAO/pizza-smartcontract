import { expect } from 'chai'
import { BigNumber, Contract, Wallet, providers, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle'

import config, { NetworkConfig } from '../../config'

import aggregatorV3 from '../../artifacts/@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json'
import boxContract from '../../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json'

type TestContext = {
  box: Contract
  priceFeed: MockContract
  signer: Wallet
}

let testContext: TestContext

// This test will connect to rinkeby
// so it is skipped when checked into source for now

describe.skip('Box Purchase Rinkeby Feed Tests', function () {
  it('Should get price for next Box', async () => {
    const your_deployed_contract = config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADDRESS
    const provider = new providers.AlchemyProvider('rinkeby', config.ALCHEMY_RINKEBY_KEY)
    const wallet = new Wallet(config.RINKEBY_PRIVATE_KEY, provider)

    const contract = new Contract(your_deployed_contract, boxContract.abi, wallet)

    const price: BigNumber = await contract.getPrice()
    const soldTokens = await contract.totalSupply()
    const btcPriceInWei = await contract.getBitcoinPriceInWei()

    console.log(`-- rinkeby deployment: ${contract.address} price: ${price}`)
    console.log(`-- rinkeby deployment: ${contract.address} soldTokens: ${soldTokens}`)
    console.log(`-- rinkeby deployment: ${contract.address} btcPriceInWei: ${btcPriceInWei}`)

    await contract.purchase({ value: price })

  })
})
