import { expect } from 'chai'
import { BigNumber, Contract, Wallet, providers, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle'

import config, { NetworkConfig } from '../../config'

import SPEC from '../../artifacts/contracts/token/RarePizzas.sol/RarePizzas.json'

type TestContext = {
    box: Contract
    priceFeed: MockContract
    signer: Wallet
}

let testContext: TestContext

// This test will connect to rinkeby
// so it is skipped when checked into source for now

describe.skip('Rare Pizzas Rinkeby Integration Tests', function () {
    // issues a request for the API on chain which responds after rendering is complete
    it('Should request rendering from the api', async () => {
        const your_deployed_contract = config.RAREPIZZAS_RINKEBY_PROXY_ADDRESS
        const provider = new providers.AlchemyProvider('rinkeby', config.ALCHEMY_RINKEBY_KEY)
        const wallet = new Wallet(config.RINKEBY_PRIVATE_KEY, provider)

        console.log(`Requesting from: ${wallet.address}`)

        const contract = new Contract(your_deployed_contract, SPEC.abi, wallet)
        
        // the TokenId must be one that you own.
        // you can mint some boxes on the permanent 
        // testnet instanceif you don't have any
        const tokenId = 548

        await contract.redeemRarePizzasBox(tokenId, 1, {type: 0, gasLimit: 2500000})

        // TODO: sleep for some time

        // check the result event

        console.log(`-- rinkeby: done`)
    })
})
