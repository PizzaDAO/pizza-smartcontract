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
