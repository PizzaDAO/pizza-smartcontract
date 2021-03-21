# DEPLOY V2 RUN SCRIPT

This is the run script for deploying the upgraded V2 contract to an environment.

This should be run after the Deploy.md run script.

## Prepare the existing proxy contract for upgrade

From the proxy owner:
- [] remove users from the allow list
- [] verify that purchasing is disabled
- [] sweep funds to the owner

## Deploy RandomConsumer and V2 Contract

npx hardhat run --network rinkeby scripts/box.upgrade.v2.prepare.ts  

## Push Source Code for Random Consumer

npx hardhat verify --contract contracts/random/RandomConsumer.sol:RandomConsumer --network rinkeby --constructor-args scripts/randomConsumer.arguments.ts <CONTRACT_ADDRESS>

## Push Source Code for Box V2

npx hardhat verify --contract contracts/token/RarePizzasBoxV2.sol:RarePizzasBoxV2 --network rinkeby <CONTRACT_ADDRESS>

## Transfer Ownership of Random Consumer

Make sure you update the contract address in the script first

npx hardhat run --network rinkeby scripts/box.upgrade.v2.transfer.ownable.ts

## Owner Accept upgrade contract

Note that currently VRF is in preview on mainnet so the random consumer contract address may need to be put on an allow list.

From the proxy owner:
- [] send some link to the Random Consumer
- [] call `upgradeTo(newImplementationAddress)` with the new instance address
- [] call `setVRFConsumer(randomConsumerAddress)` with the random consumer address
- [] add one developer to the allow list
- [] developer test the purchase function

## Contract is ready to be enabled

From the proxy owner:
- [] update the bitcoin price (if needed)
- [] seed the allow list (if needed)
- [] set the start timestamp (if needed)
