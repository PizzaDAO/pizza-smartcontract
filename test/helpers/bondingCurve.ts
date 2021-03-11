import { BigNumber } from 'ethers'

const tenToThePower18 = BigNumber.from(10).pow(18)
const tenToThePower4 = BigNumber.from(10).pow(4)
const tenToThePower32 = BigNumber.from(10).pow(32)
const toThePower8 = (value: number) => BigNumber.from(value).pow(8)

export const MAX_CURVE_VALUE = 10 * 1000

export const bondingCurve = (value: number): BigNumber => {
  const valueToThePower8 = toThePower8(value)
  const temp1 = tenToThePower18.mul(value).div(tenToThePower4)
  const temp2 = tenToThePower18
    .mul(valueToThePower8)
    .mul(MAX_CURVE_VALUE - 1)
    .div(tenToThePower32)

  return temp1.add(temp2)
}
