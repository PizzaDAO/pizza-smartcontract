let { MerkleTree } = require('merkletreejs')
let keccak256 = require('keccak256')
let ethers = require('ethers')
const users = [
  {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  },
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  },
  {
    address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
  },
  {
    address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
  },
  {
    address: '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
  },
  {
    address: '0x976ea74026e726554db657fa54763abd0c3a0aa9',
  },
  {
    address: '0x14dc79964da2c08b23698b3d3cc7ca32193d9955',
  },
  {
    address: '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
  },
  {
    address: '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
  },
  {
    address: '0xbcd4042de499d14e55001ccbb24a551f3b954096',
  },
  {
    address: '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
  },
  {
    address: '0xfabb0ac9d68b0b445fb7357272ff202c5651694a',
  },
  {
    address: '0x1cbd3b2770909d4e10f157cabc84c7264073c9ec',
  },
  {
    address: '0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097',
  },
  {
    address: '0xcd3b766ccdd6ae721141f452c550ca635964ce71',
  },
  {
    address: '0x2546bcd3c84621e976d8185a91a922ae77ecec30',
  },
  {
    address: '0xbda5747bfd65f08deb54cb465eb87d40e51b197e',
  },
  {
    address: '0xdd2fd4581271e230360230f9337d5c0430bf44c0',
  },
  {
    address: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
  },
]

const claimableAmount = 2

const elements = users.map((x) => ethers.utils.solidityKeccak256(['address'], [x.address]))
const elements2 = users.map((x) => ethers.utils.solidityKeccak256(['address', 'uint256'], [x.address, claimableAmount]))
const tree = new MerkleTree(elements, keccak256, { sort: true })
const tree2 = new MerkleTree(elements2, keccak256, { sort: true })
export const merkleTree = {
  tree: tree,
  tree2: tree2,
  root: tree.getHexRoot(),
  root2: tree2.getHexRoot(),
  elements: elements,
  elements2: elements2,
  claimableAmount,
}

interface claim {
  address: string
  amount: number
}
export const generateUserProof = async (claimList: claim[], wallet: string) => {
  const indexOfUser = claimList.map((x) => x['address'].toLowerCase()).indexOf(wallet.toLowerCase())
  const claimListHashes = claimList.map((x) =>
    ethers.utils.solidityKeccak256(['address', 'uint256'], [x['address'].toLowerCase(), x['amount']]),
  )
  const claimListMerkleTree = new MerkleTree(claimListHashes, keccak256, { sort: true })
  let proof = claimListMerkleTree.getProof(claimListHashes[indexOfUser])
  proof = proof.map((item: any) => '0x' + item.data.toString('hex'))
}
// get the root
// const root = merkleTree.getHexRoot();
// const indexOfUser = 0;
// const leaf = elements[indexOfUser];
// const proof = merkleTree.getHexProof(leaf);
