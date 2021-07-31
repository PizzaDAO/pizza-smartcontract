# DEPLOY PIZZA RUN SCRIPT

This is the run script for deploying the RarePizzas.sol contract with all dependencies and connecting it to the API.

## Prepare Variables

- [] ensure the polygon RAREPIZZAS_MATIC_PROXY_ADMIN_ADDRESS environment variable is set
- [] ensure the polygon RAREPIZZAS_SEEDSTORAGE_AUTHORIZED_REQUESTOR_MATIC_ADDRESS is set
- [] ensure the mainnet RAREPIZZAS_MAINNET_PROXY_ADMIN_ADDRESS environment variable is set
- [] ensure the mainnet RAREPIZZAS_ORDER_API_MAINNET_ORACLE_NODE_ADDRESS environment variable is set

# Deploy the Polygon RarePizzasSeedStorage.sol contract

- [] ensure the rarepizzas polygon MATIC_PRIVATE_KEY eenvironment variable is set

`npx hardhat run --network polygon scripts/pizza.storagte.deploy.ts`

- [] set the polygon RAREPIZZAS_SEEDSTORAGE_MATIC_PROXY_ADDRESS environment variable in the .env file

# Deploy the Polygon copy of the RandomConsumer.sol contract

- [] ensure the polygon RAREPIZZAS_SEEDSTORAGE_MATIC_PROXY_ADDRESS environment variable is set
- [] ensure the polygon CHAINLINK_MATIC_TOKEN environment variable is set

`npx hardhat run --network polygon scripts/randomConsumer.deploy.ts`

- [] set the polygon RAREPIZZAS_MATIC_RANDOM_CONSUMER_ADDRESS environment variable in the .env file
- [] Call `transferOwnership` to transfer to RAREPIZZAS_MATIC_PROXY_ADMIN_ADDRESS
- [] Fund with link

# Update the Polygon Pizza Storage contract with the VRF consumer

- [] ensure the polygon RAREPIZZAS_MATIC_RANDOM_CONSUMER_ADDRESS environment variable is set

`npx hardhat run --network polygon scripts/rarePizzasSeedStorage.configure.v1.ts`

- [] Call `transferOwnership` to transfer to RAREPIZZAS_MATIC_PROXY_ADMIN_ADDRESS

## Deploy the Ethereum RarePizzas.sol contract

- [] ensure the RAREPIZZAS_BOX_MAINNET_PROXY_ADDRESS environemnt variable is set

`npx hardhat run --network rinkeby scripts/rarePizzas.deploy.v1.ts`

- [] set the RAREPIZZAS_MAINNET_PROXY_ADDRESS environment variable in the .env file

## Deploy the Ethereum OrderAPIOracle.sol contract

- [] ensure the RAREPIZZAS_ORDER_API_MAINNET_ORACLE_NODE_ADDRESS environment variable is set
- [] ensure the CHAINLINK_MAINNET_TOKEN environment variable is set

`npx hardhat run --network rinkeby scripts/orderAPIOracle.deploy.ts`

- [] Verify `setFulfillmentPermission` RAREPIZZAS_ORDER_API_MAINNET_ORACLE_NODE_ADDRESS is set on the contract
- [] Call `setFulfillmentPermission` with the emergency funding address (optional)
- [] Call `transferOwnership` to transfer to RAREPIZZAS_MAINNET_PROXY_ADMIN_ADDRESS
- [] set the RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS environment variable in the .env file

## Configure the chainlink oracle

For this step, it is required that the chainlink node be operational and pointed to the OrderAPIOracle contract. This happens in another repository.

At a high level:

- Deploy the chainlink oracle with the proper configuration
- Configure a bridge pointed to the API
- set up the job that is expected to run. Get the job ID
- come back to this repository and:

- [] set the RAREPIZZAS_ORDER_API_MAINNET_JOB_ID environment variable in the .env file
- [] set the RAREPIZZAS_ORDER_API_MAINNET_JOB_FEE environment variable in the .env file

## Deploy the Ethereum OrderAPIConsumer.sol contract

- [] ensure the CHAINLINK_MAINNET_TOKEN environment variable is set
- [] ensure the RAREPIZZAS_ORDER_API_MAINNET_ORACLE_CONTRACT_ADDRESS environment variable is set
- [] ensure the RAREPIZZAS_ORDER_API_MAINNET_JOB_ID environment variable is set
- [] ensure the RAREPIZZAS_ORDER_API_MAINNET_JOB_FEE environment variable is set
- [] ensure the RAREPIZZAS_MAINNET_PROXY_ADDRESS environment variable is set

`npx hardhat run --network rinkeby scripts/orderAPIConsumer.deploy.ts`

- [] set the RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS environment variable in the .env file
- [] Call `transferOwnership` to transfer to RAREPIZZAS_MAINNET_PROXY_ADMIN_ADDRESS
- [] fund with link

## Update the Rare Pizzas contract with the address of the Order API Consumer

- [] ensure the RAREPIZZAS_ORDER_API_CONSUMER_MAINNET_CONTRACT_ADDRESS environment variable is set

`npx hardhat run --network polygon scripts/rarePizzas.configure.v1.ts`

- [] Call `transferOwnership` to transfer RAREPIZZAS_MAINNET_PROXY_ADMIN_ADDRESS

## Push the source code for all contracts

TODO: instructions to push source on polygon

push the source code for the oracle contract:

`npx hardhat verify --contract contracts/chainlink/OrderAPIOracle.sol:OrderAPIOracle --network mainnet --constructor-args scripts/orderAPIOracle.arguments.ts <CONTRACT_ADDRESS>`

push the source code for the oracle api consumer:

`npx hardhat verify --contract contracts/chainlink/OrderAPIConsumer.sol:OrderAPIConsumer --network mainnet --constructor-args scripts/OrderAPIConsumer.arguments.ts <CONTRACT_ADDRESS>`

push the source code for the rarepizzas contract:

`npx hardhat verify --contract contracts/token/RarePizzas.sol:RarePizzas --network mainnet --constructor-args scripts/RarePizzas.arguments.ts <CONTRACT_ADDRESS>`

## TODO:

- A diagram showing all the architecture and its interaction

Mainnet job spec has 2 tasks to run in the job

- first is to call matic for a random number
- second is to pass the random number to the API

build an initiator that sends a TX to the matic network

need a multi sig for matic/polygon
