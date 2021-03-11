// scripts/create-box.js
import { ethers, upgrades } from 'hardhat'

async function main() {
  // We get the contract to deploy
  const Box = await ethers.getContractFactory('RarePizzasBox')
  const box = await upgrades.deployProxy(Box)
  await box.deployed()
  console.log('RarePizzasBox deployed to:', box.address)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
