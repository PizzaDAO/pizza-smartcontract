import { expect } from 'chai'
import { BigNumber, Contract, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider } from 'ethereum-waffle'
import { deploy_box } from './box.v2.purchase.test'

import config, { NetworkConfig } from '../config'

type TestContext = {
  box: Contract
  random: Contract,
  instance: Contract
  api: Contract
  wallet: SignerWithAddress
  signer: SignerWithAddress
}

let testContext: TestContext

describe('RarePizzas Unit Tests', function () {
    beforeEach(async () => {
        const [signer, wallet] = await ethers.getSigners()

        // deploy the box
        const {box, random} = await deploy_box()
  
        // deploy the pizza contract
        const Contract = await ethers.getContractFactory('FakeRarePizzas')
        const instance = await upgrades.deployProxy(Contract, [box.address])
    
        // deploy the order api consumer
        const OrderAPIClient = await ethers.getContractFactory('FakeOrderAPIConsumer')
        const api = await OrderAPIClient.deploy(instance.address)

        // update the pizza contract
        await instance.setOrderAPIClient(api.address)
        await instance.toggleSaleIsActive()
    
        testContext = {
          box,
          random,
          instance,
          api,
          wallet,
          signer,
        }
      })

      it('Should allow updating artwork hashes', async () => {
        const { box, instance, api } = testContext
        const tokenId = 0
        const a_starting_hex = '0x8ac3afee0e9b7ca5586fddd2911d695a2660c1fd16c36492b3d805de48488dc3'

        // purchase a box
        // set up the consumer to the 0 address
        await box.setVRFConsumer('0x0000000000000000000000000000000000000000')
        const price: BigNumber = await box.getPrice()
        await box.purchase({ value: price })
        expect(await box.totalSupply()).to.equal(1)

        // redeem the box
        await instance.redeemRarePizzasBox(tokenId,0)

        // post back from the api to complete the redemption
        const requestId = await api.getRequestId(tokenId)
        await api.fulfillResponse(requestId, a_starting_hex)

        // validate the postback succeeds
        expect(await instance.tokenURI(tokenId)).to.equal('ipfs://QmXgL3C7hmNdwPnsJXGTDt1mqTcqnpG5G3q8Mfre5wnDsQ')

        // pick some new arbitrary values
        const truncated_hex = '0x17d5dcaa0433cb2370aabdac2215dab7be00d01d3c937687358352d0b6b9d57b'
        const truncated_uint256 = BigNumber.from('10781056910042705915093903968325189521849951138986993459545126530989076108667')

        // verify we can update them as admin
        await instance.setPizzaArtworkURI(tokenId, truncated_hex)

        expect(await instance.tokenURI(tokenId)).to.equal('ipfs://QmPwhE8YL6kdCJGVqvYU3hnzz8J4f96xdYjQYSzsYXcet2')

        await instance.setPizzaArtworkURI(tokenId, truncated_uint256)

        expect(await instance.tokenURI(tokenId)).to.equal('ipfs://QmPwhE8YL6kdCJGVqvYU3hnzz8J4f96xdYjQYSzsYXcet2')

      })

      it('Should base58 encode ipfs hashes', async () => {
        const { instance } = testContext

        // just some arbitrary values output from the API project
        const truncated_hex = '0x8ac3afee0e9b7ca5586fddd2911d695a2660c1fd16c36492b3d805de48488dc3'
        const truncated_uint256 = BigNumber.from('62764922505738877353466289536431399957489368053249139277983636807144413105603')

        const encoded_hex = await instance.base58EncodeAsString(truncated_hex)
        const encoded_uint256 = await instance.base58EncodeAsString(truncated_uint256)

        expect(encoded_hex).to.equal('ipfs://QmXgL3C7hmNdwPnsJXGTDt1mqTcqnpG5G3q8Mfre5wnDsQ')
        expect(encoded_uint256).to.equal('ipfs://QmXgL3C7hmNdwPnsJXGTDt1mqTcqnpG5G3q8Mfre5wnDsQ')
      })
})
