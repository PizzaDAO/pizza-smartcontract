.PHONY: all environment start test deploy-storage-mumbai

environment:
	npm install

build:
	npx hardhat compile

test:
	npx hardhat test

deploy-storage-mumbai:
	npx hardhat run --network maticmum scripts/pizza.storage.deploy.ts

deploy-random-mumbai:
	npx hardhat run --network maticmum scripts/randomConsumer.polygon.deploy.ts

set-storage-random-mumbai:
	npx hardhat run --network maticmum scripts/pizza.storage.setRandomConsumer.ts

deploy-rarepizzas-rinkeby:
	npx hardhat run --network rinkeby scripts/rarePizzas.deploy.v1.ts

deploy-oracle-rinkeby:
	npx hardhat run --network rinkeby scripts/orderAPIOracle.deploy.ts

deploy-api-rinkeby:
	npx hardhat run --network rinkeby scripts/orderAPIConsumer.deploy.ts

rarepizzas-configure:
	npx hardhat run --network rinkeby scripts/rarePizzas.configure.v1.ts
