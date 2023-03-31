# RarePizzas

For Laszlo!

In a world beset by hunger, we present to you Rare Pizzas - a collaborative art project that demonstrates the world's first art-to-pizza pipeline.

## Build

- Install dependencies

```
npm install
```

- compile contracts

```
npx hardhat compile
```

## Test

- run chai tests

```
npx hardhat test
```

- or in watch mode

```
npx hardhat test --watch
```

## Deploy

Check out the DeployXXXX.md files for more

## architecture

This repository works in conjunction with an API project that hosts a chainlink node to respond to blockchain requrests for pizzas and generates a pizza. This proejct also bridges functionality between ethereum and polygon networks. There are several components:

- Rare Pizzas Box - a reservation NFT that has a claim against a Rare Pizza
- Rare Pizza - a generative NFT powered by chainlink
- Random Consumer - a contract for interacting with chainlink VRF (deployed on mainnet and polygon)
- Seed Storage - a storage contract deployed on polygon that queries chainlink VRF for random numbers
- Order API Oracle - an oracle contract that brokers requests to the API to get a pizza

Check out the `PizzaMintSequence.md` file for more info (requires [mermaid-js](https://mermaid-js.github.io/mermaid/#/))

## dev

we use rinkeby and mumbai for testnets.

----------------------
# Blockchain Listener CLI
## Install and Run
- install dependancies
```
make environment
```
or
```
npm install
```
Designed to run as script, install ts-node typescript interpreter globally
```
npm install -g ts-node
```
and set the file to be executable
```
chmod +x projectRoot/app/blockchain-listener/blistener.ts
```
then run script directly via path to blistener.ts script
```
projectRoot/app/blockchain-listener/blistener.ts
```
or install as global script

## Usage
basic usage includes 3 commands/modes:
  - listen (default)
  - fetch
  - push

All options on commands provide default values, and if no command is given the 
script runs the listen command by default.

recommended usage is to continuously run the app as a service in the 'listen' 
mode for live processing, and intermittenly (daily?) run the app in the 'fetch' 
mode followed by the 'push' mode in case any events were missed by the service
due to restarts or provider downtime. Intermittent runs can be performed via a
cronjob.
### listen
listen continuously monitors the blockchain for OracleRequest events. When an 
event is emitted, it is processed and the decoded cbor data, saved to disk
in the data directory. The data is then also pushed to the pizza oven's
Order API.

can be kept alive as a service/daemon using pm2
```
npm install -g pm2
pm2 start path/to/blistener.ts
```
pm2 will restart the application if it dies, or if the system is rebooted.

### fetch
fetch returns all OracleRequest events (filtered by pendingRequests), decodes
their cbor data, and saves them to disk in the projectRoot/app/blockchain-listener/data 
directory. Naming format is tokenId.json where the tokenId is the id of the pizza box
being minted against. Latest block visited is stored to avoid unnecessary re-processing
of events.

### push
pushes json file/s stored in the data directory to the pizza oven's Order API

For more details on usage and options, use the --help option



