import { expect } from 'chai'
import { BigNumber, Contract, Wallet, utils, ContractFactory } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { MockProvider, deployMockContract, MockContract } from 'ethereum-waffle';

const aggregatorV3 = require('../artifacts/@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol/AggregatorV3Interface.json')
const boxContract = require('../artifacts/contracts/mocks/FakeRarePizzasBox.sol/FakeRarePizzasBox.json')


type TestContext = {
    box: Contract
    priceFeed: MockContract
    signer: Wallet
}

let testContext: TestContext

describe('Bitcoin Feed Tests', function () {
    beforeEach(async () => {

        const [signer] = new MockProvider().getWallets();
        const priceFeed = await deployMockContract(signer, aggregatorV3.abi)
        const factory = new ContractFactory(boxContract.abi, boxContract.bytecode, signer)
        const box = await factory.deploy()

        testContext = {
            box,
            priceFeed,
            signer
        }
    })

    it('Should set fallback price when interface not set', async () => {
        const { box } = testContext;

        await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

        await box.updateBitcoinPriceInUSD(1)

        expect(await box.getBitcoinPriceInUSD()).to.equal(1)
    })

    it('Should not set fallback price when caller is drunk', async () => {
        const { box } = testContext;

        await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

        await box.updateBitcoinPriceInUSD(0)

        expect(await box.getBitcoinPriceInUSD()).to.equal(50000)
    })
    // todo
    // it('Should set interface price when interface returns', async () => {
    //     const { box, priceFeed, signer } = testContext;
    //     await box.initialize(priceFeed.address)
    //     const hotmess = 1000
    //     priceFeed.mock.latestRoundData.returns('123', `${hotmess}`, '123', '123', '12')

    //     const instance = box.connect(signer)
    //     await instance.updateBitcoinPriceInUSD(1)

    //     // expect(await box.getBitcoinPriceInUSD()).to.equal(1000)

    // })
    it('Should set fallback price when interface fails', async () => {
        const { box, priceFeed } = testContext;
        await box.initialize(priceFeed.address)

        await box.updateBitcoinPriceInUSD(1)

        expect(await box.getBitcoinPriceInUSD()).to.equal(1)
    })
})
