# DEPLOY RUN SCRIPT

This is the run script for deploying to an environment

- [ ] CHECK THE Hard-coded start time in RarePizzasBox.sol

## Deploy

npx hardhat run --network mainnet scripts/box.deploy.ts  

## Update Bitcoin Price

npx hardhat run --network mainnet scripts/box.update.bitcoin.ts

## Deploy DEV Allowed (and then test the network)

npx hardhat run --network mainnet scripts/box.update.allowed.devs.ts

## Deploy Everyone else Allowed

npx hardhat run --network mainnet scripts/box.update.allowed.mainnet.ts

## Verify contract address

npx hardhat verify --contract contracts/token/RarePizzasBox.sol:RarePizzasBox --network mainnet <CONTRACT_ADDRESS>

## Transfer Ownership

 npx hardhat run --network mainnet scripts/box.transfer.proxy.ts

## Transfer ownable

 npx hardhat run --network mainnet scripts/box.transfer.ownable.ts
 