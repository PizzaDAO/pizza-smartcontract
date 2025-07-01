# Test Fix on Sepolia

## Deploy & Configure the contracts

### V1
**deploy the rare pizzas box implementation and proxy contracts:**

- `npx hardhat run --network sepolia scripts/box.deploy.ts`

**verify the contract:**
- `npx hardhat verify --contract contracts/token/RarePizzasBox.sol:RarePizzasBox --network sepolia <CONTRACT_ADDRESS>`

### V2
**deploy the rare pizzas box V2 implementation contract:**

- `npx hardhat run --network sepolia scripts/box.upgrade.v2.prepare.ts`

**upgrade the proxy to use the rare pizzas box V2 implementation:**
From the proxy owner:

- [] call `upgradeTo(newImplementationAddress)` on the proxy with the new implementation instance address

**verify the contract:**
- `npx hardhat verify --contract contracts/token/RarePizzasBoxV2.sol:RarePizzasBoxV2 --network sepolia <CONTRACT_ADDRESS>`

### V3
**deploy the rare pizzas box V3 implementation contract:**

- `npx hardhat run --network sepolia scripts/box.upgrade.v3.prepare.ts`

**verify the contract:**
- `npx hardhat verify --contract contracts/token/RarePizzasBoxV3.sol:RarePizzasBoxV3 --network sepolia <CONTRACT_ADDRESS>`

**upgrade the proxy to use the rare pizzas box V3 implementation:**

- [] call `upgradeTo(newImplementationAddress)` on the proxy with the new implementation instance address

### V4
**deploy the rare pizzas box V4 implementation contract:**

- `npx hardhat run --network sepolia scripts/box.upgrade.v4.prepare.ts`

**upgrade the proxy to use the rare pizzas box V4 implementation:**

- [] call `upgradeTo(newImplementationAddress)` on the proxy with the new implementation instance address

**verify the contract:**
- `npx hardhat verify --contract contracts/token/V4/RarePizzaBoxV4.sol:RarePizzasBoxV4 --network sepolia <CONTRACT_ADDRESS>`

**create a subscription on the VRF Coordinator V2:**
- go to the VRF Coordinator V2 contract on etherscan and call the `createSubscription` method. Retrieve the ID of the
subscription created from the logs of the resulting transaction, and add it in decimal form to your .env file for
the relevant network.

**deploy the random consumer:**

- `npx hardhat run --network sepolia scripts/randomConsumerV2.sepolia.deploy.ts`

**verify the contract:**
- `npx hardhat verify --contract contracts/random/RandomConsumerV2.sol:RandomConsumerV2 --network sepolia <CONTRACT_ADDRESS>`

**allowList the random consumer on the VRF Coordinator V2:**
- Go to the VRF Coordinator V2 contract on etherscan and call the `addConsumer` method with the Subscription ID created
  in the earlier step, and the contract address of the deployed Random Consumer V2 contract. This will add the
  randomConsumerV2 contract to an allowList on the VRF Coordinator V2 contract for using that Subscription ID. Note the
  subscription is owned by default by the address which created the subscription, and so `addConsumer` must be called with
  the same address (ownership can be transferred).

**configure the Rare Pizzas Box V4 proxy contract with the random consumer's address:**
- Call the `setVRFConsumer` method on the Rare Pizzas Box proxy contract and use the contract address of the
  random consumer as the argument given in the call.

## Break the Contract
**fund the subscription with LINK (but not too much):**
- Go to the LINK token contract and call the `transferAndCall` method, using the VRF Coordinator V2 contract address as the
  `to` address, the amount we want, and the Subscription ID as the `data` field in the call. For the `amount`, calculate
  an amount which should get as far as letting the randomConsumer be called, but run out of gas (paid in LINK) in the
  callback to the Rare Pizzas Box V4 contract.

**call the startBatchMint method on the Rare Pizzas Box V4 proxy contract with a large input:**
- Call the `startBatchMint` method with a large enough batch that it should fail by running out of gas on the callback by
  the randomConsumerV2 contract. We want it to get far enough for the random words to exist as a record onchain in the
  logs of the randomConsumerV2 contract, but not to have fulfilled them back to the Rare Pizzas Box V4 proxy contract as
  a successfully completed call thereby minting the boxes.

## Confirm the Contract is Broken
**call the startBatchMint method again on the Rare Pizzas Box V4 proxy contract with a small input:**
- Call the `startBatchMint` method with a small input which would be less likely to fail for gas reasons. The call
  should reject due to the status on the Contract, blocking the call to the randomConsumerV2 contract even being made.

## Deploy & Configure the Fix
**identify the failed random consumer transaction which ran out of gas:**
- add the txHash, request Id and the random words to the .env, we'll use them in testing the fix

**deploy the rare pizzas box V5 implementation contract:**

- `npx hardhat run --network sepolia scripts/box.upgrade.v5.prepare.ts`

**verify the contract:**
- `npx hardhat verify --contract contracts/token/V4/RarePizzaBoxV5.sol:RarePizzasBoxV5 --network sepolia <CONTRACT_ADDRESS>`

**upgrade the proxy to use the rare pizzas box V5 implementation:**

- [] call `upgradeTo(newImplementationAddress)` on the proxy with the new implementation instance address

## Execute the Fix & Recover the Contract to Working State

**fund the subscription with sufficient LINK:**
- Go to the LINK token contract and call the `transferAndCall` method, using the VRF Coordinator V2 contract address as the
  `to` address, the amount we want, and the Subscription ID as the `data` field in the call. For the `amount`, be liberal
  and give plenty to the subscription so we don't run out of gas again.

**recover the initial failed startBatchMint attempt and the contract state**
- `npx hardhat run --network sepolia scripts/box.v5.startBatchMint.recovery.ts`

**call startBatchMint again, confirming the use of the function is no longer blocked**
- Go to etherscan and use the function again, with a reasonably sized call to the function.

# Deploy Fix on Mainnet
Repeat the `Deploy & Configure the Fix` and `Execute the Fix & Recover the Contract to Working State` sections of this
README file, just switch the network used in the env and the hardhat calls to `mainnet` instead of `sepolia` and execute
the calls to the Rare Pizzas Box proxy contract from the Pizza DAO multisig.
