// import { expect } from 'chai'
// import { BigNumber, Contract, Signer, Wallet } from 'ethers'
// import { ethers, upgrades } from 'hardhat'
// import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// import { MockProvider } from 'ethereum-waffle'
// import { merkleTree as utils } from './helpers'
// //tests todo
// //v4 upgrade
// //purchase
// //pre-purchase
// //claim
// //start batch mint
// //finish batch mint
//
// import config, { NetworkConfig } from '../config'
//
// type TestContext = {
//     box: Contract
//     boxV4: Contract
//     random: Contract
//     accounts: SignerWithAddress[]
//
// }
//
// let testContext: TestContext
//
// let getRinkebyRandomConsumer = async (box: Contract) => {
//     const RandomConsumer = await ethers.getContractFactory('FakeRandomConsumer')
//     return await RandomConsumer.deploy(
//         config.CHAINLINK_RINKEBY_VRF_COORD,
//         config.CHAINLINK_RINKEBY_TOKEN,
//         '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4',
//         config.CHAINLINK_RINKEBY_VRF_FEE,
//         box.address,
//     )
// }

import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, Signer, utils } from 'ethers'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

import presale from '../scripts/reservations.rinkeby.json';

use(solidity)

type TestContext = {
  box: Contract
  wallet: Wallet
  userWallet: Wallet
}

const PointoneEth = BigNumber.from("100000000000000000")
const MAX_NUMBER_OF_BOXES = 10 * 1000
let testContext: TestContext

describe('Box Purchase Tests', function () {
  beforeEach(async () => {
    const [wallet, userWallet] = new MockProvider().getWallets()
    const Box = await ethers.getContractFactory('RarePizzasBoxV4')
    const box = await Box.deploy()

    // Initialize to set owner, since not deployed via proxy
    await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))

    // Pick a date like jan 1, 2021
    await box.setSaleStartTimestamp(1609459200)

    testContext = {
      box,
      wallet,
      userWallet
    }
  })

  describe('Check methods', () => {
    it('Should get price for next Box', async () => {
      const { box } = testContext
      const price: BigNumber = await box.getPrice()
      const soldTokens = await box.totalSupply()


      expect(PointoneEth).to.equal(price)
    })

    it('Should return max supply', async () => {
      const { box } = testContext

      expect(await box.maxSupply()).to.equal(MAX_NUMBER_OF_BOXES)
    })
  })

  describe('Purchase a box', () => {
    describe('Happy flow', () => {
      it('Should allow purchase of box', async () => {
        const { box } = testContext
        const boxBuyers = 10

        for (let i = 0; i < boxBuyers; i++) {
          const price: BigNumber = await box.getPrice()
          await box.purchase({ value: price })

          expect(await box.totalSupply()).to.equal(i + 1)
        }
      })

      // it('Should add presale from list', async () => {
      //   const { box, wallet, userWallet } = testContext
      //
      //   await box.setPresaleAllowed(10, [box.signer.getAddress()])
      //
      //   for (let presaleAddress of presale) {
      //     await box.setPresaleAllowed(10, [presaleAddress])
      //   }
      //
      //   // also set as array
      //   await box.setPresaleAllowed(10, [...presale])
      // })

      // it('Should allow purchase for presale address', async () => {
      //   const { box, wallet, userWallet } = testContext
      //   // Pick a day in the future
      //   await box.setSaleStartTimestamp(3609459200)
      //   await box.setPresaleAllowed(10, [box.signer.getAddress()])
      //
      //   // Execute again with more addresses
      //   await box.setPresaleAllowed(10, [wallet.address, userWallet.address])
      //
      //   const price: BigNumber = await box.getPrice()
      //
      //   await box.purchase({ value: price })
      //
      //   expect(await box.balanceOf(box.signer.getAddress())).to.equal(1)
      // })

      // it('Should allow owner mint to address', async () => {
      //   const { box, userWallet } = testContext
      //
      //   await box.mint(userWallet.address, 1)
      //
      //   expect(await box.totalSupply()).to.equal(1)
      //   expect(await box.balanceOf(userWallet.address)).to.equal(1)
      // })

      // it('Should allow owner to mint different quantities', async () => {
      //   const { box, userWallet } = testContext
      //
      //   // Can go up to 255
      //   await box.mint(userWallet.address, 5)
      //   await box.mint(userWallet.address, 10)
      //
      //   expect(await box.totalSupply()).to.equal(15)
      //   expect(await box.balanceOf(userWallet.address)).to.equal(15)
      // })

      // it('Should allow owner purchase to address', async () => {
      //   const { box, wallet } = testContext
      //   const price: BigNumber = await box.getPrice()
      //
      //   await box.purchaseTo(wallet.address, { value: price })
      //
      //   expect(await box.totalSupply()).to.equal(1)
      //   expect(await box.balanceOf(wallet.address)).to.equal(1)
      // })
    })

    // describe('Revert', () => {
    //   it('Should reject purchase of box for free', async () => {
    //     const { box } = testContext
    //
    //     await expect(box.purchase({ value: 0 })).to.be.reverted
    //   })
    //
    //   // TODO: Implement this with mock contract functions
    //   // it('Should reject purchase of box over MAX_NUMBER_OF_BOXES', async (done) => {})
    // })
  })

  describe('Withdraw funds', () => {
    describe('Happy flow', () => {
      it('Should withdraw from owner', async () => {
        const { box } = testContext

        await expect(box.withdraw()).to.not.be.reverted
      })
    })

    describe('Revert', () => {
      it('Should not allow purchase for non-presale address', async () => {
        const { box, wallet } = testContext

        // Make sure balance is 0 before
        expect(await box.balanceOf(wallet.address)).to.equal(0)

        // Pick a day in the future
        await box.setSaleStartTimestamp(Date.now() + 24 * 60 * 60 * 1000)

        const price: BigNumber = await box.getPrice()

        await expect(box.purchase({ value: price })).to.be.reverted

        // Check that balance is still 0
        expect(await box.balanceOf(wallet.address)).to.equal(0)
      })

      it('Should reject withdrawal when not owner', async () => {
        const { box, wallet } = testContext

        await box.transferOwnership(wallet.address)

        await expect(box.withdraw()).to.be.revertedWith('caller is not the owner')
      })
    })
  })
})

// describe('Box V4 Real Claim, Purchase and Mint Tests', function () {
//     beforeEach(async () => {
//         // Deploy the original contract
//         const accounts = await ethers.getSigners()
//         const Box = await ethers.getContractFactory('RarePizzasBox')
//         const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])
//         console.log(upgrades)
//         // pick a date like jan 1, 2021
//         await box.setSaleStartTimestamp(1609459200)
//
//         // Call a function that changes state
//         const price: BigNumber = await box.getPrice()
//         await box.purchase({ value: price })
//
//         expect(await box.totalSupply()).to.equal(1)
//         const random = await getRinkebyRandomConsumer(box)
//
//         // run the upgrade
//         const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2')
//         const BoxV3 = await ethers.getContractFactory('RarePizzasBoxV3')
//         const BoxV4 = await ethers.getContractFactory('RarePizzasBoxV4')
//         const boxV2 = await upgrades.upgradeProxy(box.address, BoxV2)
//         const boxV3 = await upgrades.upgradeProxy(boxV2.address, BoxV3)
//         const boxV4 = await upgrades.upgradeProxy(boxV3.address, BoxV4)
//
//
//         // set up the random consumer
//         await boxV4.setVRFConsumer(random.address)
//         testContext = {
//             box: box,
//             boxV4: boxV4,
//             random: random,
//             accounts
//         }
//     })
//
//     describe('Box Purchase Tests', function () {
//       beforeEach(async () => {
//         const [wallet, userWallet] = new MockProvider().getWallets()
//         const Box = await ethers.getContractFactory('RarePizzasBox')
//         const box = await Box.deploy()
//
//         // Initialize to set owner, since not deployed via proxy
//         await box.initialize(utils.getAddress('0x0000000000000000000000000000000000000000'))
//
//         // Pick a date like jan 1, 2021
//         await box.setSaleStartTimestamp(1609459200)
//
//         testContext = {
//           box,
//           wallet,
//           userWallet
//         }
//       })
//
//       describe('Check methods', () => {
//         it('Should get price for next Box', async () => {
//           const { box } = testContext
//           const price: BigNumber = await box.getPrice()
//           const soldTokens = await box.totalSupply()
//           const btcPriceInWei = await box.getBitcoinPriceInWei()
//
//           const expected = bc.bondingCurve(soldTokens + 1).mul(btcPriceInWei)
//
//           expect(price.mul(oneEth)).to.equal(expected)
//         })
//
//         it('Should return max supply', async () => {
//           const { box } = testContext
//
//           expect(await box.maxSupply()).to.equal(MAX_NUMBER_OF_BOXES)
//         })
//       })
//
//       describe('Purchase a box', () => {
//         describe('Happy flow', () => {
//           it('Should allow purchase of box', async () => {
//             const { box } = testContext
//             const boxBuyers = 10
//
//             for (let i = 0; i < boxBuyers; i++) {
//               const price: BigNumber = await box.getPrice()
//               await box.purchase({ value: price })
//
//               expect(await box.totalSupply()).to.equal(i + 1)
//             }
//           })
//
//           it('Should add presale from list', async () => {
//             const { box, wallet, userWallet } = testContext
//
//             await box.setPresaleAllowed(10, [box.signer.getAddress()])
//
//             for (let presaleAddress of presale) {
//               await box.setPresaleAllowed(10, [presaleAddress])
//             }
//
//             // also set as array
//             await box.setPresaleAllowed(10, [...presale])
//           })
//
//           it('Should allow purchase for presale address', async () => {
//             const { box, wallet, userWallet } = testContext
//             // Pick a day in the future
//             await box.setSaleStartTimestamp(3609459200)
//             await box.setPresaleAllowed(10, [box.signer.getAddress()])
//
//             // Execute again with more addresses
//             await box.setPresaleAllowed(10, [wallet.address, userWallet.address])
//
//             const price: BigNumber = await box.getPrice()
//
//             await box.purchase({ value: price })
//
//             expect(await box.balanceOf(box.signer.getAddress())).to.equal(1)
//           })
//
//           it('Should allow owner mint to address', async () => {
//             const { box, userWallet } = testContext
//
//             await box.mint(userWallet.address, 1)
//
//             expect(await box.totalSupply()).to.equal(1)
//             expect(await box.balanceOf(userWallet.address)).to.equal(1)
//           })
//
//           it('Should allow owner to mint different quantities', async () => {
//             const { box, userWallet } = testContext
//
//             // Can go up to 255
//             await box.mint(userWallet.address, 5)
//             await box.mint(userWallet.address, 10)
//
//             expect(await box.totalSupply()).to.equal(15)
//             expect(await box.balanceOf(userWallet.address)).to.equal(15)
//           })
//
//           it('Should allow owner purchase to address', async () => {
//             const { box, wallet } = testContext
//             const price: BigNumber = await box.getPrice()
//
//             await box.purchaseTo(wallet.address, { value: price })
//
//             expect(await box.totalSupply()).to.equal(1)
//             expect(await box.balanceOf(wallet.address)).to.equal(1)
//           })
//         })
//
//         describe('Revert', () => {
//           it('Should reject purchase of box for free', async () => {
//             const { box } = testContext
//
//             await expect(box.purchase({ value: 0 })).to.be.reverted
//           })
//
//           // TODO: Implement this with mock contract functions
//           // it('Should reject purchase of box over MAX_NUMBER_OF_BOXES', async (done) => {})
//         })
//       })
//
//       describe('Withdraw funds', () => {
//         describe('Happy flow', () => {
//           it('Should withdraw from owner', async () => {
//             const { box } = testContext
//
//             await expect(box.withdraw()).to.not.be.reverted
//           })
//         })
//
//         describe('Revert', () => {
//           it('Should not allow purchase for non-presale address', async () => {
//             const { box, wallet } = testContext
//
//             // Make sure balance is 0 before
//             expect(await box.balanceOf(wallet.address)).to.equal(0)
//
//             // Pick a day in the future
//             await box.setSaleStartTimestamp(Date.now() + 24 * 60 * 60 * 1000)
//
//             const price: BigNumber = await box.getPrice()
//
//             await expect(box.purchase({ value: price })).to.be.reverted
//
//             // Check that balance is still 0
//             expect(await box.balanceOf(wallet.address)).to.equal(0)
//           })
//
//           it('Should reject withdrawal when not owner', async () => {
//             const { box, wallet } = testContext
//
//             await box.transferOwnership(wallet.address)
//
//             await expect(box.withdraw()).to.be.revertedWith('caller is not the owner')
//           })
//         })
//       })
//     })
//
//     it('can set merkle roots and make a claim', async () => {
//         const { boxV4, accounts, random } = testContext
//         let Tree = utils.merkleTree
//         await boxV4.setSaleWhitelist(Tree.root)
//         await boxV4.setclaimWhiteList(Tree.root2)
//         let proof = Tree.tree2.getProof(Tree.elements2[1])
//         proof = proof.map((item: any) => '0x' + item.data.toString('hex'))
//         await boxV4.connect(accounts[1]).claim(proof, 2)
//
//         await random.fulfillRandomnessWrapper('0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4', 234324)
//         let r = await boxV4.completeClaim('0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4')
//         console.log(await r.wait())
//
//     })
//     it('can set merkle roots and make a prepurchase', async () => {
//         const { boxV4, accounts, random } = testContext
//         let Tree = utils.merkleTree
//         await boxV4.setSaleWhitelist(Tree.root)
//         await boxV4.setclaimWhiteList(Tree.root2)
//         let proof = Tree.tree.getProof(Tree.elements[1])
//         proof = proof.map((item: any) => '0x' + item.data.toString('hex'))
//         await boxV4.connect(accounts[1]).prePurchase(proof, { value: ethers.utils.parseEther('0.08') })
//
//         await random.fulfillRandomnessWrapper('0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4', 234324)
//
//     })
//     /**  it('Should not modify ownable when upgrading', async () => {
//             const { box, wallet, signer } = testContext
//
//             expect(await box.owner()).to.equal(signer.address);
//
//             // transfer ownership of the proxy
//             await upgrades.admin.transferProxyAdminOwnership(wallet.address)
//             expect(await box.owner()).to.equal(signer.address); // the signer is still the owner
//
//             // transfer ownership of the contract logic to another wallet
//             await box.connect(signer).transferOwnership(wallet.address)
//             expect(await box.owner()).to.equal(wallet.address)
//
//             // run the upgrade (using the new owner)
//             const BoxV2 = await ethers.getContractFactory('RarePizzasBoxV2', wallet)
//             const BoxV2Address = await upgrades.prepareUpgrade(box.address, BoxV2)
//             await upgrades.upgradeProxy(box.address, BoxV2)
//
//             // validate the owner is not changed
//             expect(await box.owner()).to.equal(wallet.address)
//         })
//         **/
// })
