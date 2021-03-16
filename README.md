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
npx hardhat run --network localhost scripts/box.deploy.ts
```

- deploy contracts remotely

copy .env.example to .env and fill in your keys

```
npx hardhat run --network rinkeby scripts/box.deploy.ts
```

then go to etherscan and get the implementation address (under the contract source, theres a `more options` dropdown menu and select `is this a proxy?`)

```
$ npx hardhat verify --contract contracts/token/RarePizzasBox.sol:RarePizzasBox --network rinkeby 0x_THE_IMPLEMENTATION_ADDRESS
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

## Upgrading

Basically do this:

https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-hardhat/3580


```bash
# transfer ownership if you havent already
npx hardhat run --network rinkeby scripts/box.transfer.proxy.ts
```

```bash
# deploy the upgraded contract with your current signing key
npx hardhat run --network rinkeby scripts/box.upgrade.V2.prepare.ts
```

then, go to gnosis and open the openzepplin app and put in the proxy and new implementation and send a request


## dev

we use goerli as a developer test network and we use rinkeby for UAT.

opensea doesnt currently work with goerli
neither does gnosis