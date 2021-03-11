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

- deploy contracts (in a different terminal)

```
npx hardhat run --network localhost scripts/deploy-box.ts
```

## run unit tests
- run jest
```
npx hardhat test:jest
```
- or to run in watch mode
```
npx hardhat test:jest --watch
```
