# RarePizzas
For Laszlo!

# Instructions

- Clone Repository

```
git clone git@github.com:PizzaDAO/pizza-smartcontract.git && cd pizza-smartcontract
```
- Install dependencies

```
npm install
```

- compile contracts

```
npx hardhat compile
```

- run local node

```
npx hardhat node
```

- deploy contracts locally (in a different terminal)

```
npx hardhat run --network localhost scripts/deploy-box.proxy.ts
```

- deploy contracts to goerli

edit hardhat.config.ts and include your keys

```
$ npx hardhat run --network goerli scripts/deploy-box.proxy.ts
```

then go to etherscan and get the implementation address (under the contract source, theres a `more options` dropdown menu and select `is this a proxy?`)

```
$ npx hardhat verify --contract contracts/token/RarePizzasBox.sol:RarePizzasBox --network goerli 0x_THE_IMPLEMENTATION_ADDRESS
```

## Run unit tests

- run chai tests

```
npx hardhat test
```

- or in watch mode

```
npx hardhat test --watch
```
