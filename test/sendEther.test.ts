import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { randomNumber } from '@ethersproject/testcases'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'

import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

import config, { NetworkConfig } from '../config'

describe('Box V2 Purchase Tests', function () {

    describe('Check methods', () => {
        it('It should send Ether', async () => {
            const [wallet, userWallet] = new MockProvider().getWallets()
            let r=await wallet.sendTransaction({
                to: userWallet.address,
                value: ethers.utils.parseEther("1.0")
            })
            await r.wait()
            const provider = new MockProvider();
            console.log((await provider.getBalance(wallet.address)).toString() )
            console.log((await provider.getBalance(userWallet.address)).toString() )

        })
    })



})