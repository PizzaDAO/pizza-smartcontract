// import { expect, use } from 'chai'
// import { BigNumber, Contract, Wallet, utils } from 'ethers'
// import { randomNumber } from '@ethersproject/testcases'
// import { MockProvider, solidity } from 'ethereum-waffle'
// import { ethers } from 'hardhat'
//
// import { bondingCurve as bc } from './helpers'
// import { getAddress } from '@ethersproject/address'
//
// import config, { NetworkConfig } from '../config'
//
// use(solidity)
//
// type TestContext = {
//     slices: Contract
//     boxV2: Contract
//     boxV3: Contract
//     random: Contract
//     testHash: string,
//     wallet: Wallet
//     userWallet: Wallet
// }
//
// const MAX_NUMBER_OF_BOXES = 10 * 1000
// let testContext: TestContext
//
// describe('Box V3 Purchase Tests', function () {
//     beforeEach(async () => {
//         const [wallet, userWallet] = new MockProvider().getWallets()
//         const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
//         const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2')
//         const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3')
//         const boxV2 = await BoxV2.deploy()
//         const boxV3 = await BoxV3.deploy()
//         const Slices = await ethers.getContractFactory('slice1155')
//
//
//         // use KOVAN contract info for out tests so its clear whats happening
//         // and add our V2 callback contract
//         const random = await RandomConsumer.deploy(
//             config.CHAINLINK_KOVAN_VRF_COORD,
//             config.CHAINLINK_KOVAN_TOKEN,
//             config.CHAINLINK_KOVAN_VRF_KEY_HASH,
//             config.CHAINLINK_KOVAN_VRF_FEE,
//             boxV3.address)
//
//         // Initialize to set owner, since not deployed via proxy
//         await boxV2.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))
//         await boxV3.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))
//         // Pick a date like jan 1, 2021 so the sale is open
//         await boxV2.setSaleStartTimestamp(1609459200)
//
//         // set up the consumer to the mock contract
//         await boxV2.setVRFConsumer(random.address)
//         await boxV3.setSaleStartTimestamp(1609459200)
//
//         await boxV3.setVRFConsumer(random.address)
//         // just a hardcoded value
//         const testHash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
//         const slices = await Slices.deploy(boxV3.address)
//         console.log("SET SLICE ADDRESS")
//         await boxV3.setSliceAddress(slices.address)
//         testContext = {
//             slices,
//             boxV2,
//             boxV3,
//             random,
//             testHash,
//             wallet,
//             userWallet,
//         }
//     })
//
//     describe('Check methods', () => {
//         it('Should set the VRF query fee', async () => {
//             const { random } = testContext
//             const fee: BigNumber = await random.getFee()
//
//             // it's the kovan price set in the beforeEach
//             expect(fee).to.equal(
//                 BigNumber.from('100000000000000000')
//             )
//         })
//     })
    //
    // describe('Purchase Slices', function (){
    //     describe('Happy-ish flow', () => {
    //         console.log("getting price")
    //         it.only('Should allow purchase of box', async () => {
    //             const { boxV3, random,slices, testHash } = testContext
    //             const boxBuyers = 7
    //             let price: BigNumber = await boxV3.getPrice()
    //             await boxV3.purchase({ value: price })
    //             await random.fulfillRandomnessWrapper(testHash, randomNumber('31' + 2, 256, 512))
    //
    //             price = await boxV3.getPrice()
    //
    //             await boxV3.purchaseSlice({ value: price.div(8) })
    //             let receipt=await random.fulfillRandomnessWrapper(testHash, randomNumber('31' + 3, 256, 512))
    //             console.log(await receipt.wait())
    //             price = await boxV3.getPrice()
    //             for (let i = 0; i < boxBuyers; i++) {
    //
    //
    //                 await boxV3.purchaseSlice({ value: price.div(8) })
    //
    //
    //                 console.log(await boxV3.availableSlices())
    //                 console.log(await boxV3.currentSliceID())
    //
    //             }
    //             await boxV3.purchaseSlice({ value: price.div(8) })
    //             await expect(boxV3.purchaseSlice({ value: price.div(8) })).to.be.revertedWith('a slice is currently queried');
    //
    //             await random.fulfillRandomnessWrapper(testHash, randomNumber('31' + 4, 256, 512))
    //             console.log(await boxV3.availableSlices())
    //             console.log((await boxV3.currentSliceID()).toString())
    //         })
    //     })
    // })

})
