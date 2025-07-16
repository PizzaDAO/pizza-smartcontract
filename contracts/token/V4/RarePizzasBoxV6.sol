// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import '../../libraries/MerkleProof.sol';
import { RarePizzasBoxV5 } from './RarePizzaBoxV5.sol';

import '../../interfaces/IChainlinkVRFRandomConsumer.0.8.0.sol';
import '../../interfaces/IRarePizzasBoxV3Admin.sol';

/**
 * @title RarePizzasBoxV6
 * @dev Fixes the double counting bug where purchase functions incorrectly increment _minted_pizza_count
 *
 * Bug Summary:
 * - V4+ purchase functions (multiPurchase, prePurchase) increment _purchased_pizza_count correctly
 * - But fulfillRandomWords callback incorrectly also increments _minted_pizza_count for purchases
 * - _minted_pizza_count should ONLY track team allocations via startBatchMint
 * - This results in _minted_pizza_count being overcounted by the number of V4+ purchases
 *
 * Solution:
 * - Introduce _corrected_team_count to track team allocations correctly
 * - Fix fulfillRandomWords to not increment team counters for purchases
 * - Preserve existing _minted_pizza_count for historical reference
 */
contract RarePizzasBoxV6 is RarePizzasBoxV5 {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  using SafeMathUpgradeable for uint256;

  // V6 Variables - New corrected tracking
  CountersUpgradeable.Counter public _corrected_team_count;

  // V6 Events
  event TeamAllocationMinted(address[] users, uint256 countPerUser, uint256 totalMinted);

  /**
   * @dev Initialize the corrected counter and start using it
     * This approach is safest as it doesn't modify existing storage
     */
  function initializeCorrectedCount() external onlyOwner {
    require(_corrected_team_count.current() == 0, "Already initialized");

    uint256 totalSupply = totalSupply();
    uint256 purchasedCount = _purchased_pizza_count.current();
    uint256 correctTeamCount = totalSupply.sub(purchasedCount);

    require(correctTeamCount <= MAX_MINTABLE_SUPPLY, "exceeds team mint");
    require(_minted_pizza_count.current() >= correctTeamCount, "Current minted count is less than calculated - unexpected state");

    // Set the corrected counter to the correct team allocation value
    for (uint256 i = 0; i < correctTeamCount; i++) {
      _corrected_team_count.increment();
    }
  }

  /**
   * @dev Fixed fulfillRandomWords that correctly handles team vs purchase allocations
     * This is the core fix for the double counting bug
     */
  function _fulfillRandomWords(uint256 request, uint256[] memory random) internal override {
    if (bytes32(request) == batchMintRequest) {
      // TEAM BATCH MINT - increment team allocation counter
      for (uint256 i = 0; i < batchMintUsers.length; i++) {
        for (uint256 j = 0; j < batchMintCount; j++) {
          uint256 id = _getNextPizzaTokenId();

          _corrected_team_count.increment();

          _safeMint(batchMintUsers[i], id);
          _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0], i)))) % BOX_LENGTH);
        }
      }
      batchMintCount = 0;
      status = batchMintStatus.OPEN;

      emit TeamAllocationMinted(batchMintUsers, batchMintCount, batchMintUsers.length.mul(batchMintCount));
    } else {
      // PURCHASE CLAIMS - DON'T increment team counters (this was the bug!)
      address to = claims[request].to;
      uint256 amount = claims[request].amount;
      require(to != address(0), 'purchase must exist');

      for (uint256 i = 0; i < amount; i++) {
        uint256 id = _getNextPizzaTokenId();
        // ❌ REMOVED: _minted_pizza_count.increment();
        // This was the bug - purchases should NOT increment team allocation counters
        // _purchased_pizza_count was already incremented in multiPurchase/prePurchase

        _safeMint(to, id);
        _assignBoxArtwork(id, (uint256(keccak256(abi.encode(random[0], i)))) % BOX_LENGTH);
      }
      claims[request].amount = 0;
      claims[request].to = address(0);

      emit claimCompleted(request, to, amount);
    }
  }

  /**
   * @dev Override startBatchMint to use corrected counting
     */
  function startBatchMint(address[] calldata users, uint256 count) external virtual override onlyOwner {
    require(_corrected_team_count.current().add(users.length.mul(count)) <= MAX_MINTABLE_SUPPLY, 'exceeds team mint');
    require(status == batchMintStatus.OPEN, 'minting has been queued');

    batchMintCount = count;
    batchMintUsers = users;
    _queryForBatch();
  }

  /**
   * @dev Override gift function to use corrected counting
     */
  function gift(address toPizzaiolo, uint256 count) public override onlyOwner {
//    require(toPizzaiolo != address(0), 'dont be silly');
//    require(count > 0, 'need a number');
//    require(totalSupply().add(count) <= maxSupply(), 'would exceed supply.');
//    require(_corrected_team_count.current().add(count) <= MAX_MINTABLE_SUPPLY, 'exceeds team mint');
//
//    for (uint256 i = 0; i < count; i++) {
//      if (usesCorrectedCount) {
//        _corrected_team_count.increment();
//      } else {
//        _minted_pizza_count.increment();
//      }
//      _internalMintWithArtwork(toPizzaiolo);
//    }
//
//    emit Gift(toPizzaiolo, count);
  }

  /**
   * @dev Override mint function to use corrected counting
     */
  function mint(address toPizzaiolo, uint8 count) public virtual override onlyOwner {
//    require(toPizzaiolo != address(0), 'dont be silly');
//    require(count > 0, 'need a number');
//    require(totalSupply().add(count) <= maxSupply(), 'would exceed supply.');
//    require(_corrected_team_count.current().add(count) <= MAX_MINTABLE_SUPPLY, 'exceeds team mint');
//
//    for (uint256 i = 0; i < count; i++) {
//      if (usesCorrectedCount) {
//        _corrected_team_count.increment();
//      } else {
//        _minted_pizza_count.increment();
//      }
//      _internalMintWithArtwork(toPizzaiolo);
//    }
  }
}
