let ethers = require('ethers')
let { MerkleTree } = require('merkletreejs')
let keccak256 = require('keccak256')
let presale = require('../data/presaleList.json')
const fs = require('fs')
const generatePresaleProof = (claimList) => {
  const leaves = []
  const data = []

  claimList.forEach((item) => {
    if (!data.includes(item.address.toLowerCase())) {
      data.push(item.address.toLowerCase())

      leaves.push(ethers.utils.solidityKeccak256(['address'], [item.address.toLowerCase()]))
    }
  })
  const claimListMerkleTree = new MerkleTree(leaves, keccak256, { sort: true })
  return { tree: claimListMerkleTree, root: '0x' + claimListMerkleTree.getHexRoot(), data: data }
}

let result = generatePresaleProof(presale)
console.log(result.root)
fs.writeFileSync('preSaleList.txt', JSON.stringify({ root: result.root, addresses: result.data }))
