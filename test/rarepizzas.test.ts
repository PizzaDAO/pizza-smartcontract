import { expect } from 'chai'
import { BigNumber, Contract, Wallet } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { MockProvider } from 'ethereum-waffle'

type TestContext = {
  instance: Contract
  wallet: SignerWithAddress
  signer: SignerWithAddress
}

let testContext: TestContext

describe('RarePizzas Unit Tests', function () {
    beforeEach(async () => {
        const [signer, wallet] = await ethers.getSigners()
    
        const Contract = await ethers.getContractFactory('FakeRarePizzas')
        const instance = await upgrades.deployProxy(Contract, ['0x0000000000000000000000000000000000000000'])
    
    
        testContext = {
            instance,
          wallet,
          signer,
        }
      })

      it('Should base58 encode ipfs hashes', async () => {
        const { instance } = testContext

        // just some arbitrary values output from the API project
        const truncated_hex = '0x8ac3afee0e9b7ca5586fddd2911d695a2660c1fd16c36492b3d805de48488dc3'
        const truncated_uint256 = BigNumber.from('62764922505738877353466289536431399957489368053249139277983636807144413105603')

        const encoded_hex = await instance.base58EncodeAsString(truncated_hex)
        const encoded_uint256 = await instance.base58EncodeAsString(truncated_hex)

        expect(encoded_hex).to.equal('ipfs://QmXgL3C7hmNdwPnsJXGTDt1mqTcqnpG5G3q8Mfre5wnDsQ')
        expect(encoded_uint256).to.equal('ipfs://QmXgL3C7hmNdwPnsJXGTDt1mqTcqnpG5G3q8Mfre5wnDsQ')
      })
})