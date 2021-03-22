import utils from './utils'
import config, { NetworkConfig } from '../config'


module.exports = [
    utils.getChainlinkVRFCoordinator(config),
    utils.getChainlinkToken(config),
    utils.getChainlinkVRFKeyHash(config),
    utils.getChainlinkVRFFee(config),
    utils.getProxyAddress(config)
];