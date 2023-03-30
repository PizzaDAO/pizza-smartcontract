//import { ethers } from 'hardhat'
import { ethers } from 'ethers';
import utils from './utils'
import config from '../config'

import oracleSpec from '../artifacts/contracts/chainlink/OrderAPIOracle.sol/OrderAPIOracle.json';
import apiSpec from '../artifacts/contracts/chainlink/OrderAPIConsumer.sol/OrderAPIConsumer.json';

// get oracle requersts that did not complete
async function main() {

    const provider = new ethers.providers.AlchemyProvider(config.NETWORK, utils.getAlchemyAPIKey(config));
    const oracleAddress = utils.getOrderAPIOracleContractAddress(config)
    const apiAddress = utils.getOrderAPIConsumerContractAddress(config)

    const startBlock = 13541167 

    console.log('Connecting to instance')
    const oracle = new ethers.Contract(oracleAddress, oracleSpec.abi, provider);
    const api = new ethers.Contract(apiAddress, apiSpec.abi, provider)

    const oracleFilter = oracle.filters.OracleRequest()
    const apiFilter = api.filters.ResponseFulfilled()
    

    console.log('Querying events')
    const oracleEvents = await oracle.queryFilter(oracleFilter, startBlock)
    const apiEvents = await api.queryFilter(apiFilter, startBlock)

    const completedRequestIds = new Set(apiEvents.map((i) => i.args && i.args['requestId']))
    console.log(completedRequestIds)

    const incompleteEvents = oracleEvents.filter((i) => i.args && !completedRequestIds.has(i.args['requestId']))

    console.log(incompleteEvents)


    console.log('event query complete')

    //

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })