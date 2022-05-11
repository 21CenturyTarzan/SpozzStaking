import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import allBonds, { allExpiredBonds, allLpBonds, allLpTokens } from "src/helpers/AllBonds";
import { IUserBondDetails } from "src/slices/AccountSlice";
import { Bond, LpToken } from "src/lib/Bond";
import { IBondDetails } from "src/slices/BondSlice";

interface IBondingStateView {
  account: {
    bonds: {
      [key: string]: IUserBondDetails;
    };
  };
  bonding: {
    loading: Boolean;
    [key: string]: any;
  };
}

// Smash all the interfaces together to get the BondData Type
export interface IAllBondData extends Bond, IBondDetails, IUserBondDetails {}
export interface IAllTokenData extends LpToken {}

const initialBondArray = allBonds;
const initialLpBondArray = allLpBonds;
const initialLpTokenArray = allLpTokens;
const initialExpiredArray = allExpiredBonds;
// Slaps together bond data within the account & bonding states
function useBonds(networkId: number) {
  const bondLoading = useSelector((state: IBondingStateView) => !state.bonding.loading);
  const bondState = useSelector((state: IBondingStateView) => state.bonding);
  const accountBondsState = useSelector((state: IBondingStateView) => state.account.bonds);
  const [bonds, setBonds] = useState<Bond[] | IAllBondData[]>(initialBondArray);
  const [lpBonds, setLpBonds] = useState<Bond[] | IAllBondData[]>(initialLpBondArray);
  const [lpTokens, setLpTokens] = useState<LpToken[] | IAllTokenData[]>(initialLpTokenArray);
  const [expiredBonds, setExpiredBonds] = useState<Bond[] | IAllBondData[]>(initialExpiredArray);

  useEffect(() => {
    let bondDetails: IAllBondData[];
    bondDetails = allBonds
      .flatMap(bond => {
        if (bondState[bond.name] && bondState[bond.name].bondDiscount) {
          return Object.assign(bond, bondState[bond.name]); // Keeps the object type
        }
        return bond;
      })
      .flatMap(bond => {
        if (accountBondsState[bond.name]) {
          return Object.assign(bond, accountBondsState[bond.name]);
        }
        return bond;
      });

    // NOTE (appleseed): temporary for ONHOLD MIGRATION
    const mostProfitableBonds = bondDetails.concat().sort((a, b) => {
      if (!a.getBondability(networkId)) return 1;
      if (!b.getBondability(networkId)) return -1;
      return a["bondDiscount"] > b["bondDiscount"] ? -1 : b["bondDiscount"] > a["bondDiscount"] ? 1 : 0;
    });
    setBonds(mostProfitableBonds);
    // setBonds(bondDetails);

    // TODO (appleseed-expiredBonds): there may be a smarter way to refactor this
    let expiredDetails: IAllBondData[];
    expiredDetails = allExpiredBonds
      .flatMap(bond => {
        if (bondState[bond.name] && bondState[bond.name].bondDiscount) {
          return Object.assign(bond, bondState[bond.name]); // Keeps the object type
        }
        return bond;
      })
      .flatMap(bond => {
        if (accountBondsState[bond.name]) {
          return Object.assign(bond, accountBondsState[bond.name]);
        }
        return bond;
      });
    setExpiredBonds(expiredDetails);
  }, [bondState, accountBondsState, bondLoading]);

  // Debug Log:
  // console.log(bonds);
  return { bonds, lpTokens, loading: bondLoading, expiredBonds };
}

export default useBonds;
