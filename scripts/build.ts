import { ethers, upgrades } from 'hardhat'
import utils from './utils'
import config from '../config'

// Do build things 
async function main() {
  utils.parseBoxUris()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
