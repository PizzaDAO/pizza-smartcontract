import { Contract } from 'ethers'
import { writeFileSync } from 'fs'

import config, { NetworkConfig } from '../config'
import boxContract from '../artifacts/contracts/token/RarePizzasBox.sol/RarePizzasBox.json';

const getChainlinkOracle = (config: NetworkConfig) => {
    const networkName = config.NETWORK.toLowerCase()
    switch (networkName) {
        case 'mainnet':
            return config.CHAINLINK_MAINNET_PRICE_FEED
        case 'goerli':
            return config.CHAINLINK_GOERLI_PRICE_FEED
        case 'rinkeby':
            return config.CHAINLINK_RINKEBY_PRICE_FEED
        case 'ropsten':
            return config.CHAINLINK_ROPSTEN_PRICE_FEED
    }
    return 'VALUE NOT FOUND'
}

const getProxyAddress = (config: NetworkConfig) => {
    const networkName = config.NETWORK.toLowerCase()
    switch (networkName) {
        case 'mainnet':
            return config.RAREPIZZAS_BOX_MAINNET_PROXY_ADDRESS
        case 'goerli':
            return config.RAREPIZZAS_BOX_GOERLI_PROXY_ADDRESS
        case 'rinkeby':
            return config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADDRESS
    }
    return 'VALUE NOT FOUND'
}

const getProxyAdminAddress = (config: NetworkConfig) => {
    const networkName = config.NETWORK.toLowerCase()
    switch (networkName) {
        case 'mainnet':
            return config.RAREPIZZAS_BOX_MAINNET_PROXY_ADMIN_ADDRESS
        case 'rinkeby':
            return config.RAREPIZZAS_BOX_RINKEBY_PROXY_ADMIN_ADDRESS
    }
    return 'VALUE NOT FOUND'
}

const publishBoxWeb3Abi = () => {
    const boxWeb3interface = {
        contractName: boxContract.contractName,
        sourceName: boxContract.sourceName,
        abi: [
            boxContract.abi.find(i => i.name === 'BTCETHPriceUpdated'),
            boxContract.abi.find(i => i.name === 'OwnershipTransferred'),
            boxContract.abi.find(i => i.name === 'Transfer'),
            boxContract.abi.find(i => i.name === 'balanceOf'),
            boxContract.abi.find(i => i.name === 'BTCETHPriceUpdated'),
            boxContract.abi.find(i => i.name === 'getBitcoinPriceInWei'),
            boxContract.abi.find(i => i.name === 'getPrice'),
            boxContract.abi.find(i => i.name === 'maxSupply'),
            boxContract.abi.find(i => i.name === 'publicSaleStart_timestampInS'),
            boxContract.abi.find(i => i.name === 'purchase'),
            ...boxContract.abi.filter(i => i.name === 'safeTransferFrom'),
            boxContract.abi.find(i => i.name === 'tokenURI'),
            boxContract.abi.find(i => i.name === 'totalSupply'),
        ]
    }

    const json = JSON.stringify(boxWeb3interface)
    console.log(json)
    writeFileSync('./dist/boxWeb3Interface.json', json)
}

const publishDeploymentData = (name: string, contract: Contract) => {
    const deploymentData = {
        network: config.NETWORK,
        name: name,
        proxy: contract.address,
        transaction: contract.deployTransaction
    }
    const json = JSON.stringify(deploymentData)
    console.log(deploymentData)
    writeFileSync('./dist/deployment-latest.json', json)
    writeFileSync(`./dist/deployment-${Date.now()}.json`, json)
}

const utils = {
    getChainlinkOracle: getChainlinkOracle,
    getProxyAddress: getProxyAddress,
    getProxyAdminAddress: getProxyAdminAddress,
    publishBoxWeb3Abi: publishBoxWeb3Abi,
    publishDeploymentData: publishDeploymentData
}
export default utils