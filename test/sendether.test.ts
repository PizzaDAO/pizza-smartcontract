import { expect, use } from 'chai'
import { BigNumber, Contract, Wallet, utils } from 'ethers'
import { randomNumber } from '@ethersproject/testcases'
import { MockProvider, solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
const { waffle } = require("hardhat");
import { bondingCurve as bc } from './helpers'
import { getAddress } from '@ethersproject/address'

import config, { NetworkConfig } from '../config'

describe('Box V2 Purchase Tests', function () {

    describe('Check methods', () => {
        it('It should send Ether', async () => {
            //console.log(hre.waffle.provider)
            const [wallet, userWallet] = waffle.provider.getWallets()
            const provider = waffle.provider;
            let r=await wallet.sendTransaction({
                to: userWallet.address,
                value: ethers.utils.parseEther("2.0")
            })
            await r.wait()

            console.log((await provider.getBalance(wallet.address)).toString() )
            console.log((await provider.getBalance(userWallet.address)).toString() )
        })
    })
})
