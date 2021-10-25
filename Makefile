.PHONY: all environment start test deploy-storage-mumbai

environment:
	npm install

build:
	npx hardhat compile
	npx webpack

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

configure-rarepizzas-rinkeby:
	npx hardhat run --network rinkeby scripts/rarePizzas.configure.v1.ts

toggle-rarepizzas-saleisactive-rinkeby:
	npx hardhat run --network rinkeby scripts/rarePizzas.toggle.saleIsActive.v1.ts

verify-rarepizzas-rinkeby:
	npx hardhat verify --contract contracts/token/RarePizzas.sol:RarePizzas --network rinkeby 0xce218f39db452967607ece41085a7079a492f52d
