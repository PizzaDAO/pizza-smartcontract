//import { ethers } from 'hardhat'
import { ethers } from 'ethers';
import utils from './utils'
import config from '../config'

import oracleSpec from '../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json'

// get oracle requersts that did not complete

// to fulfill a missing pizza:
// look at the original TX and get the tokenid and the recipe id
// call orderPizza on the api and let it render
// pull out the truncated_metadata_hash from the render task result
// fill in the variables at the top of this function
// including the block number, request id, and the metadata hash
// run it



// 1500, 14167164, 0x91e3a9b3e5daf871016d5dbc5ce72da252ce3f7dbb6b669092b00bd025e3cc76
async function main() {
    const inBlock = 13941256 
    const requestId = '0xc4c2ca65746674bee7590fcdc7eae89af03ba2f8cdc085a3dd5c2c3a5cd9d11e'
    const truncated_metadata_hash = '0xd94aaa994064cc8b52b803c4a5628a09ea6fc8016008f0be0c91baaf40a2892e'

    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const oracleAddress = utils.getOrderAPIOracleContractAddress(config)
    const wallet = new ethers.Wallet(utils.getOrderAPIOracleNodePrivateKey(config), provider)

    console.log('Connecting to instance')
    const oracle = new ethers.Contract(oracleAddress, oracleSpec.abi, wallet);
    const oracleFilter = oracle.filters.OracleRequest()
    
    console.log('Querying events')
    const oracleEvents = await oracle.queryFilter(oracleFilter, inBlock, inBlock)
    const incompleteEvent = oracleEvents.filter((i) => i.args && i.args['requestId'] === requestId)[0]
    console.log(incompleteEvent)

    if (!incompleteEvent.args) {
        console.log("no arguments provided")
        return
    }

    // encode commitments
    const payment = incompleteEvent.args['payment']
    const callbackAddress = incompleteEvent.args['callbackAddr']
    const callbackFunctionId = incompleteEvent.args['callbackFunctionId']
    const cancelExpiration = incompleteEvent.args['cancelExpiration']

    console.log('posting request fulfillment')
    
    // simulate the fulfillment
    const tx = await oracle.fulfillOracleRequest(
        requestId, payment, callbackAddress, callbackFunctionId, cancelExpiration, truncated_metadata_hash)

    console.log(tx)
    console.log('request fulfillment complete')

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })