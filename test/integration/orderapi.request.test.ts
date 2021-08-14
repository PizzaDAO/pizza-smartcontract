import { expect } from 'chai'
import { BigNumber, Contract, Wallet, providers, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle'

import config, { NetworkConfig } from '../../config'

import SPEC from '../../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json'

type TestContext = {
    box: Contract
    priceFeed: MockContract
    signer: Wallet
}

let testContext: TestContext

// This test will connect to rinkeby
// so it is skipped when checked into source for now

describe.skip('Order API Consumer Rinkeby Test', function () {
    // issues a request for the API on chain which responds after rendering is complete
    it('Should request rendering from the api', async () => {
        const your_deployed_contract = config.RAREPIZZAS_ORDER_API_CONSUMER_RINKEBY_CONTRACT_ADDRESS
        const provider = new providers.AlchemyProvider('rinkeby', config.ALCHEMY_RINKEBY_KEY)
        const wallet = new Wallet(config.RINKEBY_PRIVATE_KEY, provider)

        console.log(`Requesting from: ${wallet.address}`)

        const contract = new Contract(your_deployed_contract, SPEC.abi, wallet)

        const requestId = await contract.executeRequest(wallet.address, {type: 0, gasLimit: 150000})

        // sleep for some time

        // check the result event

        console.log(`-- rinkeby deployment: ${contract.address} requestId: ${requestId}`)
    })
})
