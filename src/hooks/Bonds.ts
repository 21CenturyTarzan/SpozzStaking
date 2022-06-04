import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { IUserBondDetails } from "src/slices/AccountSlice";
import { Bond, LpToken } from "src/lib/Bond";

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
export interface IAllTokenData extends LpToken {}

// Slaps together bond data within the account & bonding states
function useBonds(networkId: number) {
  const bondLoading = useSelector((state: IBondingStateView) => !state.bonding.loading);
  useEffect(() => {

  }, []);

  // Debug Log:
  // console.log(bonds);
  return { loading: bondLoading };
}

export default useBonds;
