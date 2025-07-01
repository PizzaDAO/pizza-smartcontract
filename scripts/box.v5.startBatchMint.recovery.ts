import { ethers } from 'hardhat'
import utils from './utils'
import config from '../config'

// This script handles recovery from stuck batch mint state
async function main() {
  const [deployer] = await ethers.getSigners()
  const proxy = utils.getBoxProxyAddress(config)

  console.log('========================================')
  console.log('RarePizzasBox V5 Batch Mint Recovery')
  console.log('========================================')
  console.log('Network:', config.NETWORK)
  console.log('Executing with account:', deployer.address)
  console.log('Contract Address:', proxy)
  console.log('')

  // Get the V5 contract
  const boxV5 = await ethers.getContractAt('RarePizzasBoxV5', proxy)

  // Check current status
  const currentStatus = await boxV5.status()
  console.log('Current batch mint status:', ['OPEN', 'QUEUED', 'FETCHED'][currentStatus])

  if (currentStatus === 0) {
    console.log('✅ Status is already OPEN - no recovery needed')
    return
  }

  // Get batch mint details
  const batchMintRequest = await boxV5.getBatchMintRequest()
  console.log('Current batch mint request ID:', batchMintRequest)

  if (batchMintRequest === '0x' + '0'.repeat(64)) {
    console.log('⚠️  No batch mint request found')
    console.log('Resetting status to OPEN...')

    const tx = await boxV5.setBatchMintStatus(0)
    await tx.wait()

    console.log('✅ Status reset to OPEN')
    return
  }

  console.log('')
  console.log('🔍 Recovery Options:')
  console.log('1. Reset status (loses pending mints)')
  console.log('2. Manual fulfill with random words from failed transaction')
  console.log('')

  // For manual fulfillment, you need:
  // 1. The failed transaction hash
  // 2. The random words from that transaction

  // Example recovery (fill in actual values in environment variables):
  const RECOVERY_MODE = process.env.RECOVERY_MODE || 'prompt'

  if (RECOVERY_MODE === 'manual_fulfill') {
    console.log('Executing manual fulfillment...')

    // These values must come from the failed transaction
    const FAILED_TX_HASH = utils.getStartBatchMintRecoveryFailedTxHash(config)
    const RANDOM_WORDS = utils.getStartBatchMintRecoveryRandomWords(config)
    const REQUEST_ID = utils.getStartBatchMintRecoveryRequestId(config)


    if (!FAILED_TX_HASH || !RANDOM_WORDS || !REQUEST_ID) {
      console.error('❌ Missing required environment variables:')
      console.error('FAILED_TX_HASH - The hash of the failed VRF fulfillment transaction')
      console.error('RANDOM_WORDS - The random words from the failed transaction (comma-separated)')
      console.error('REQUEST_ID - The batchMintRequest which failed (should be the current value on the deployed contract')
      process.exit(1)
    }

    const randomWords = RANDOM_WORDS.split(',').map(w => ethers.BigNumber.from(w.trim()))

    console.log('Request ID:', REQUEST_ID.toString())
    console.log('Failed TX Hash:', FAILED_TX_HASH)
    console.log('Random Words:', randomWords.map(w => w.toString()))
    console.log('')

    console.log('⚠️  WARNING: Manual fulfillment will mint NFTs with these random values')
    console.log('Press Ctrl+C within 10 seconds to cancel...')
    await new Promise(resolve => setTimeout(resolve, 10000))

    const tx = boxV5.interface.encodeFunctionData(
      'manualAdminFulfillRandomWords',
      [REQUEST_ID, randomWords, FAILED_TX_HASH]
    );

    console.log('===== manualAdminFulfillRandomWords TX Data =====');
    console.log('submit this tx on the multisig with the proxy address as the to address')
    console.log(tx);

  } else if (RECOVERY_MODE === 'reset') {
    console.log('Resetting batch mint status...')
    console.log('⚠️  WARNING: This will abandon the pending batch mint')
    console.log('Press Ctrl+C within 10 seconds to cancel...')
    await new Promise(resolve => setTimeout(resolve, 10000))

    const tx = boxV5.interface.encodeFunctionData(
      'setBatchMintStatus',
      [0]
    );

    console.log('===== setBatchMintStatus TX Data =====');
    console.log('submit this tx on the multisig with the proxy address as the to address')
    console.log(tx);

  } else {
    console.log('Recovery mode not specified. Set RECOVERY_MODE environment variable to:')
    console.log('- "manual_fulfill" to complete the stuck batch with manual random words')
    console.log('- "reset" to abandon the stuck batch and reset status')
    console.log('')
    console.log('For manual_fulfill, also set:')
    console.log('- FAILED_TX_HASH: The transaction hash of the failed VRF fulfillment')
    console.log('- RANDOM_WORDS: Comma-separated random words from the failed transaction')
    console.log('')
    console.log('Example:')
    console.log('RECOVERY_MODE=manual_fulfill \\')
    console.log('FAILED_TX_HASH=0x123... \\')
    console.log('RANDOM_WORDS=12345,67890 \\')
    console.log('npx hardhat run scripts/box.v5.recovery.ts --network mainnet')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error during recovery:', error)
    process.exit(1)
  })
