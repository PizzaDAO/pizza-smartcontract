pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '../../libraries/MerkleProof.sol';
import { RarePizzasBoxV4 } from './RarePizzaBoxV4.sol';

import '../../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../../interfaces/IRarePizzasBoxV3Admin.sol';

contract RarePizzasBoxV5 is RarePizzasBoxV4 {

  function getBatchMintStatus() external view returns (batchMintStatus) {
    return status;
  }

  function setBatchMintStatus(batchMintStatus _status) external onlyOwner {
    status = batchMintStatus(_status);
  }
}