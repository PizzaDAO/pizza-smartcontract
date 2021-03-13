import { expect } from 'chai'
import { BigNumber, Contract, Wallet, providers, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle';

import config, { NetworkConfig } from '../../config'

const aggregatorV3 = require('../../artifacts/@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json')
const boxContract = require('../../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json')


type TestContext = {
    box: Contract
    priceFeed: MockContract
    signer: Wallet
}

let testContext: TestContext

// this test will actually deploy a contract to rinkeby and test the chainlink integration
// so it is skipped when checked into source for now

describe.skip('Bitcoin Rinkeby Feed Tests', function () {
    it('should update price from chainlink oracle', async () => {

        const provider = new providers.AlchemyProvider("rinkeby", config.ALCHEMY_RINKEBY_KEY);
        const wallet = new Wallet(config.RINKEBY_PRIVATE_KEY, provider)

        const Box = await ethers.getContractFactory('RarePizzasBox', wallet);
        const box = await upgrades.deployProxy(Box, [config.CHAINLINK_RINKEBY_PRICE_FEED]);
        console.log(`proxy deployed to: ${box.address}`)

        await box.updateBitcoinPriceInWei(1)

        expect(await box.getBitcoinPriceInWei()).to.be.greaterThan(1)
    })

    it('should read price from chainlink oracle on rinkeby', async () => {

        const provider = new providers.AlchemyProvider("rinkeby", config.ALCHEMY_RINKEBY_KEY);
        const wallet = new Wallet(config.RINKEBY_PRIVATE_KEY, provider)

        const priceFeed = new Contract(config.CHAINLINK_RINKEBY_PRICE_FEED, aggregatorV3.abi, wallet);
        let result = await priceFeed.latestRoundData({ gasPrice: 20, gasLimit: 2000000 })
        console.log(`chainlink BTC-ETH Price: ${result.answer.toString() / 10 ** 18}`)
    })

    it('should read price from chainlink oracle in contract', async () => {
        // make sure there is a deployed contract at this address that matches the abi
        const your_deployed_contract = '0x27332f62ee3726b102429130Ce58C050801B0760'
        const provider = new providers.AlchemyProvider("rinkeby", config.ALCHEMY_RINKEBY_KEY);
        const wallet = new Wallet(config.RINKEBY_PRIVATE_KEY, provider)

        const contract = new Contract(your_deployed_contract, boxContract.abi, wallet);

        const current = await contract.getBitcoinPriceInWei()
        console.log(`current BTC-ETH Price: ${current.toString() / 10 ** 18}`)

        await contract.updateBitcoinPriceInWei(BigNumber.from('31000000000000000000'))

        const result = await contract.getBitcoinPriceInWei({ gasPrice: 20, gasLimit: 2000000 })
        console.log(`new BTC-ETH Price: ${result.toString() / 10 ** 18}`)
    })
})
