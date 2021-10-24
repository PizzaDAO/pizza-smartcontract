import utils from './utils'
import config, { NetworkConfig } from '../config'


module.exports = [
    utils.getChainlinkToken(config),
    utils.getOrderAPIOracleContractAddress(config),
    utils.getOrderApiConsumerAuthorizedRequestorAddress(config),
    utils.getRarePizzasProxyAddress(config),
    utils.getOrderAPIJobId(config),
    utils.getOrderAPIJobFee(config)
];