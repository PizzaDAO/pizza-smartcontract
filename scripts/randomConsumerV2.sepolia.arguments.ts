import utils from './utils'
import config, { NetworkConfig } from '../config'


module.exports = [
  utils.getChainlinkVRFCoordinatorV2(config),
  utils.getChainlinkVRFKeyHashV2(config),
  utils.getBoxProxyAddress(config),
  utils.getChainlinkVRFCoordinatorV2SubscriptionId(config),
];
