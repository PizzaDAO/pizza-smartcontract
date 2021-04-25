.PHONY: all environment lint install-poetry start test test-natron

environment:
	npm install

build:
	npx hardhat compile

test:
	npx hardhat test