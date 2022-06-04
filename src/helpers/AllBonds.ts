import { StableBond, LPBond, NetworkID, CustomBond, BondType, LpToken } from "src/lib/Bond";
// TODO(zx): Further modularize by splitting up reserveAssets into vendor token definitions
//   and include that in the definition of a bond
export const mai = new StableBond({
  name: "mai",
  displayName: "MAI",
  tokenName: {
    [NetworkID.Mainnet]: "mai",
    [NetworkID.BSCMainnet]: "mai",
    [NetworkID.Polygon]: "MaiImg",
  },
  isBondable: true,
  isClaimable: true,
});

export const dai = new StableBond({
  name: "mai",
  displayName: "MAI",
  tokenName: {
    [NetworkID.Mainnet]: "mai",
    [NetworkID.BSCMainnet]: "mai",
    [NetworkID.Polygon]: "MaiImg",
  },
  isBondable: true,
  isClaimable: true,
});

export const usdt = new StableBond({
  name: "mai",
  displayName: "MAI",
  tokenName: {
    [NetworkID.Mainnet]: "mai",
    [NetworkID.BSCMainnet]: "mai",
    [NetworkID.Polygon]: "MaiImg",
  },
  isBondable: true,
  isClaimable:true,
});

export const allBonds = [
  dai,
  usdt,
];

export const taz_native_token = new LpToken({
  name: "taz_dai_lp",
  displayName: "DAI - TAZ",
  tokenName: {
    [NetworkID.Mainnet]: "DAI - TAZ",
    [NetworkID.BSCMainnet]: "TAZ - BNB",
  },
});

export const tazor_native_token = new LpToken({
  name: "taz_dai_lp",
  displayName: "DAI - TAZ",
  tokenName: {
    [NetworkID.Mainnet]: "DAI - TAZ",
    [NetworkID.BSCMainnet]: "TAZ - BNB",
  },
});

export const allLpTokens = [
  tazor_native_token,
  taz_native_token,
  // ohm_fraxOld,
  // lusd,
  // ohm_lusd,
  // ohm_weth,
  // ohm_wethOld,
];

// TODO (appleseed-expiredBonds): there may be a smarter way to refactor this
// export const allExpiredBonds = [cvx_expired];
export const allBondsMap = allBonds.reduce((prevVal, bond) => {
  return { ...prevVal, [bond.name]: bond };
}, {});

// Debug Log
// console.log(allBondsMap);
export default allBonds;
