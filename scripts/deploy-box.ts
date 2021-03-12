import { ethers, upgrades } from 'hardhat'

async function main() {
  // We get the contract to deploy
  const Box = await ethers.getContractFactory('RarePizzasBox')
  // calls RarePizzasBox.initialize(address, uint8)
  const box = await upgrades.deployProxy(Box, [0xBA5E28a2D1C8cF67Ac9E0dfc850DC8b7b21A4DE2, 0])
  await box.deployed()

  console.log('RarePizzasBox deployed to:', box.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
