import { BigNumber } from 'ethers'

// uint256 constant oneEth = 10**18;
// uint256 constant oneGwei = 10**4;
// uint256 constant MAX_CURVE = 8750;
// uint256 constant TIER1 = ((501 * oneEth) / 10**4);
// uint256 constant TIER2 = TIER1 + ((250 * oneEth) / 10**3);
// uint256 constant TIER3 = TIER2 + ((250 * oneEth) / 10**3);
// uint256 constant TIER4 = TIER3 + ((250 * oneEth) / 10**3);
// uint256 constant TIER5 = TIER4 + ((500 * oneEth) / 10**3);

// require(n > 0, 'BondingCurve: starting position cannot be zero');
// require(n <= MAX_CURVE, 'BondingCurve: cannot go past MAX_CURVE value');
// // x+.0001
// if (n <= 2500) {
//   return ((2 * n * oneEth) / (10**5)) + oneEth / 10**4;
// }
// if (n > 2500 && n <= 5000) {
//   return TIER1 + ((4 * n * oneEth) / (10**5));
// }
// if (n > 5000 && n <= 7500) {
//   return TIER2 + ((n * oneEth) / (10**4));
// }
// if (n > 7500 && n <= 8000) {
//   return TIER3 + ((5 * n * oneEth) / (10**4));
// }
// if (n > 8000 && n <= 8500) {
//   return TIER4 + ((n * oneEth) / (10**3));
// }
// if (n > 8500 && n <= 8750) {
//   return TIER5 + ((3 * n * oneEth) / (10**3));
// }

export const MAX_CURVE_VALUE = 8750

const tenToThePowerX = (x: number) => BigNumber.from(10).pow(x)

const TIER1 = BigNumber.from(501).mul(tenToThePowerX(14))
const TIER2 = BigNumber.from(100).mul(tenToThePowerX(15)).add(TIER1)
const TIER3 = BigNumber.from(250).mul(tenToThePowerX(15)).add(TIER2)
const TIER4 = BigNumber.from(250).mul(tenToThePowerX(15)).add(TIER3)
const TIER5 = BigNumber.from(500).mul(tenToThePowerX(15)).add(TIER4)

const approxvalues = [
  100,
  436,
  650,
  900,
  1000,
  1200,
  1400,
  1500,
  1600,
  1700,
  1800,
  1900,
  2000,
  2400,
  3000,
  4000,
  4400,
  6000,
  12000,
  24000,
  50000,
  100000,
  240000,
  333300,
  1000000,
]

export const bondingCurve = (value: number): BigNumber => {
  if (value < 0) throw new Error('Number cannot be less than 0')
  if (value > MAX_CURVE_VALUE) throw new Error('Number cannot be over 8750')

  let valueBn = BigNumber.from(value)

  if (valueBn.lte(2500)) {
    valueBn = valueBn.mul(2).mul(tenToThePowerX(13)).add(tenToThePowerX(14))
  }
  if (valueBn.gt(2500) && valueBn.lte(5000)) {
    valueBn = valueBn.sub(2500).mul(4).mul(tenToThePowerX(13)).add(TIER1)
  }
  if (valueBn.gt(5000) && valueBn.lte(7500)) {
    valueBn = valueBn.sub(5000).mul(tenToThePowerX(14)).add(TIER2)
  }
  if (valueBn.gt(7500) && valueBn.lte(8000)) {
    valueBn = valueBn.sub(7500).mul(5).mul(tenToThePowerX(14)).add(TIER3)
  }
  if (valueBn.gt(8000) && valueBn.lte(8500)) {
    valueBn = valueBn.sub(8000).mul(tenToThePowerX(15)).add(TIER4)
  }
  if (valueBn.gt(8500) && valueBn.lte(8724)) {
    valueBn = valueBn.sub(8500).mul(3).mul(tenToThePowerX(15)).add(TIER5)
  }
  if (valueBn.gt(8724) && valueBn.lt(8750)) {
    valueBn = BigNumber.from(approxvalues[value - 8725]).mul(tenToThePowerX(16))
  }
  if (valueBn.eq(8750)) {
    valueBn = BigNumber.from(0) // LAST ONE IS FREE!!
  }

  return valueBn
}
