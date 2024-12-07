pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '../../libraries/MerkleProof.sol';
import { RarePizzasBoxV4 } from './RarePizzaBoxV4.sol';

import '../../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../../interfaces/IRarePizzasBoxV3Admin.sol';

contract RarePizzasBoxV5 is RarePizzasBoxV4 {
  using CountersUpgradeable for CountersUpgradeable.Counter;

  event adminManuallyFulfilledRandomWords(
    uint256 request,
    uint256[] random,
    bytes32 failedTxHash
  );

  function getBatchMintStatus() external view returns (batchMintStatus) {
    return status;
  }

  function setBatchMintStatus(batchMintStatus _status) external onlyOwner {
    status = batchMintStatus(_status);
  }

  /**
   * ONLY USE THIS TO RESUBMIT RANDOM WORDS PROVABLY AT THE SUBMITTED TX HASH
   * this function is intended for use when a BatchMint runs out of gas, and
   * we want to complete that transaction so as to result in the same outcome
   * as would have been achieved had the initial gas been set correctly. This
   * function is made to leave a provable record to show no cheating has occurred,
   * but can technically be used to cheat on outcomes if nobody is watching! Only
   * use when necessary, and use with care!!!!
   */
  function manualAdminFulfillRandomWords(
    uint256 request,
    uint256[] memory random,
    bytes32 failedTxHash
  ) external onlyOwner {
    require(bytes32(request) == batchMintRequest);
    _fulfillRandomWords(request, random);
    emit adminManuallyFulfilledRandomWords(request, random, failedTxHash);
  }

  //fulfillRandomWords
  function fulfillRandomWords(uint256 request, uint256[] memory random) external override {
    require(msg.sender == _chainlinkVRFConsumer, 'caller not VRF');
    _fulfillRandomWords(request, random);
  }

  function _fulfillRandomWords(uint256 request, uint256[] memory random) internal {
    if (bytes32(request) == batchMintRequest) {
      for (uint256 i = 0; i < batchMintUsers.length; i++) {
        // iterate over the count
        for (uint256 j = 0; j < batchMintCount; j++) {
          uint256 id = _getNextPizzaTokenId();
          _minted_pizza_count.increment();

          _safeMint(batchMintUsers[i], id);
          _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0], i)))) % BOX_LENGTH);
        }
      }
      batchMintCount = 0;
      status = batchMintStatus.OPEN;
    } else {
      address to = claims[request].to;
      uint256 amount = claims[request].amount;
      require(to != address(0), 'purchase must exist');

      for (uint256 i = 0; i < amount; i++) {
        // iterate over the count

        uint256 id = _getNextPizzaTokenId();
        _minted_pizza_count.increment();

        _safeMint(to, id);
        _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0], i)))) % BOX_LENGTH);
      }
      claims[request].amount = 0;
      claims[request].to = address(0);
      emit claimCompleted(request, to, amount);
    }
  }
}
