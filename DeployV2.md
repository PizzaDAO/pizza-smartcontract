# DEPLOY V2 RUN SCRIPT

This is the run script for deploying the upgraded V2 contract to an environment.

This should be run after the Deploy.md run script.

## Prepare the existing proxy contract for upgrade

From the proxy owner:
- [] remove users from the allow list (if needed)
- [] verify that purchasing is disabled
- [] sweep funds to the owner

## Deploy RandomConsumer 

- [] ensure the correct proxy environment variable is correctly set

`npx hardhat run --network rinkeby scripts/box.upgrade.v2.prepare.ts`

- [] set the random consumer environment variable in the .env file

## Prepare the V2 Contract

- [] ensure the random consumer environment variable is correctly set

This will deploy the contract but will not try to associate it with the proxy

`npx hardhat run --network rinkeby scripts/box.upgrade.v2.prepare.ts`

- [] make note of the **V2 Implementation Address**, we'll need it later

## Push Source Code for Random Consumer

`npx hardhat verify --contract contracts/random/RandomConsumer.sol:RandomConsumer --network rinkeby --constructor-args scripts/randomConsumer.arguments.ts <CONTRACT_ADDRESS>`

## Push Source Code for Box V2

`npx hardhat verify --contract contracts/token/RarePizzasBoxV2.sol:RarePizzasBoxV2 --network rinkeby <CONTRACT_ADDRESS>`

## Transfer Ownership of Random Consumer

- [] ensure the random consumer environment variable is correctly set
- [] ensure the proxy admin environment variable is correctly set

`npx hardhat run --network rinkeby scripts/box.upgrade.v2.transfer.ownable.ts`

## Owner Accept upgrade contract

Note that currently VRF is in preview on mainnet so the random consumer contract address may need to be put on an allow list.

From the proxy owner:
- [] send some Link Tokens to the Random Consumer address to cover fees (varies by network)
- [] call `upgradeTo(newImplementationAddress)` on the proxy with the new implementation instance address
- - [] alternatively, use the Open Zepplin web app (available in gnosis)
- [] call `setVRFConsumer(randomConsumerAddress)` on the proxy with the random consumer address
- [] add one developer to the allow list
- [] developer test the purchase function

## Contract is ready to be enabled

From the proxy owner:
- [] update the bitcoin price (if needed)
- [] seed the allow list (if needed)
- [] set the start timestamp (if needed)
