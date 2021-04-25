import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { randomNumber } from '@ethersproject/testcases'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

import config, { NetworkConfig } from '../config'

use(solidity)

type TestContext = {
    contract: Contract
    random: Contract
    testHash: string,
    wallet: Wallet
    userWallet: Wallet
    signers: SignerWithAddress[]
}

const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext

describe('Box V2 Purchase Tests', function () {
    beforeEach(async () => {
        const [...signers] = await ethers.getSigners()
        const [wallet, userWallet] = new MockProvider().getWallets()
        const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
        const SeedStorage = await ethers.getContractFactory('RarePizzasSeedStorage')
        const contract = await SeedStorage.deploy()

        // use KOVAN contract info for out tests so its clear whats happening
        // and add our V2 callback contract
        const random = await RandomConsumer.deploy(
            config.CHAINLINK_KOVAN_VRF_COORD,
            config.CHAINLINK_KOVAN_TOKEN,
            config.CHAINLINK_KOVAN_VRF_KEY_HASH,
            config.CHAINLINK_KOVAN_VRF_FEE,
            contract.address)

        // Initialize to set owner, since not deployed via proxy
        await contract.initialize(signers[0].address)

        // set up the consumer to the mock contract
        await contract.setVRFConsumer(random.address)

        // just a hardcoded value
        const testHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'

        testContext = {
            contract,
            random,
            testHash,
            wallet,
            userWallet,
            signers
        }
    })

    // TODO: more tests

    describe('Get A Random Number', () => {
        it('Should return a pseudo-random number when VRF unset', async () => {
            const { contract, random, testHash } = testContext
            const jobId = '12345'

            // set up the consumer to the 0 address
            await contract.setVRFConsumer('0x0000000000000000000000000000000000000000')

            await contract.getRandomNumber(utils.formatBytes32String(jobId))

            const seed = contract.getPizzaSeed(utils.formatBytes32String(jobId))

            // TODO: 
            //expect
        })
    })
})
