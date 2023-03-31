.PHONY: all environment start test deploy-storage-mumbai

environment:
	npm install

build:
	npx hardhat compile
#	npx webpack

test:
	npx hardhat test

start-blockchain-listener:
	npx ts-node app/blockchain-listener/blistener.ts

box-transfer-ownable:
	npx hardhat run --network rinkeby scripts/box.upgrade.v3.prepare.ts

prepare-box-v3-rinkeby:
	npx hardhat run --network rinkeby scripts/box.upgrade.v3.prepare.ts

prepare-box-v3-mainnet:
	npx hardhat run --network mainnet scripts/box.upgrade.v3.prepare.ts

verify-box-mainnet:
	npx hardhat verify --contract contracts/token/RarePizzaBoxV3.sol:RarePizzasBoxV3 --network mainnet 0x0F754c7E6fdDE99B3BD16eC559587BD8A7DE4dCc

deploy-storage-mumbai:
	npx hardhat run --network maticmum scripts/pizza.storage.deploy.ts

deploy-storage-polygon:
	npx hardhat run --network matic scripts/pizza.storage.deploy.ts

deploy-random-mumbai:
	npx hardhat run --network maticmum scripts/randomConsumer.polygon.deploy.ts

deploy-random-polygon:
	npx hardhat run --network matic scripts/randomConsumer.polygon.deploy.ts

set-orderapi-jobid:
	npx hardhat run --network mainnet scripts/orderAPIConsumer.set.jobid.ts

set-storage-random-mumbai:
	npx hardhat run --network maticmum scripts/pizza.storage.setRandomConsumer.ts

set-storage-random-polygon:
	npx hardhat run --network matic scripts/pizza.storage.setRandomConsumer.ts

deploy-rarepizzas-rinkeby:
	npx hardhat run --network rinkeby scripts/rarePizzas.deploy.v1.ts

deploy-rarepizzas-mainnet:
	npx hardhat run --network mainnet scripts/rarePizzas.deploy.v1.ts

deploy-oracle-rinkeby:
	npx hardhat run --network rinkeby scripts/orderAPIOracle.deploy.ts

deploy-oracle-mainnet:
	npx hardhat run --network mainnet scripts/orderAPIOracle.deploy.ts

deploy-orderapi-rinkeby:
	npx hardhat run --network rinkeby scripts/orderAPIConsumer.deploy.ts

deploy-orderapi-mainnet:
	npx hardhat run --network mainnet scripts/orderAPIConsumer.deploy.ts

follower-fetch:
	npx ts-node app/follower fetch

follower-render:
	npx ts-node app/follower render

follower-status:
	npx ts-node app/follower status

verify-orderapi-rinkeby:
	npx hardhat verify --contract contracts/chainlink/OrderAPIConsumer.sol:OrderAPIConsumer --network rinkeby 0x3afD8Cc13fD8bc2B1F60F1e591a56EB4d0E1A3BD

configure-rarepizzas-rinkeby:
	npx hardhat run --network rinkeby scripts/rarePizzas.configure.v1.ts

configure-rarepizzas-mainnet:
	npx hardhat run --network mainnet scripts/rarePizzas.configure.v1.ts

toggle-rarepizzas-saleisactive-rinkeby:
	npx hardhat run --network rinkeby scripts/rarePizzas.toggle.saleIsActive.v1.ts

toggle-rarepizzas-saleisactive-mainnet:
	npx hardhat run --network mainnet scripts/rarePizzas.toggle.saleIsActive.v1.ts

verify-rarepizzas-rinkeby:
	npx hardhat verify --contract contracts/token/RarePizzas.sol:RarePizzas --network rinkeby 0xe5516529aec6feecd79ff3bf9225d78846f6768a

verify-rarepizzas-mainnet:
	npx hardhat verify --contract contracts/token/RarePizzas.sol:RarePizzas --network mainnet 0x2504C51C87265d2c9Ed6b0646e809b3729e1e023

withdraw-box-rinkeby:
	npx hardhat run --network rinkeby scripts/box.withdraw.ts

assign-artwork-rarepizzas-rinkeby:
	npx hardhat run --network rinkeby scripts/pizza.assignArtwork.ts

assign-artwork-rarepizzas-mainnet:
	npx hardhat run --network mainnet scripts/pizza.assignArtwork.ts

find-missing-pizzas-mainnet:
	npx hardhat run --network mainnet scripts/oracle.getEvents.ts
