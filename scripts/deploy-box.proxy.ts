import { ethers, upgrades } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // We get the contract to deploy
  const Box = await ethers.getContractFactory('RarePizzasBox')

  // calls RarePizzasBox.initialize()
  // gnosis safe: 0xBA5E28a2D1C8cF67Ac9E0dfc850DC8b7b21A4DE2
  // TODO: define chainlink dep based on env
  const box = await upgrades.deployProxy(Box, ['0x0000000000000000000000000000000000000000'])
  await box.deployed()

  console.log('RarePizzasBox deployed to:', box.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
