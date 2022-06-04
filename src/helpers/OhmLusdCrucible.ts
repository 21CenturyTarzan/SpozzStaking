import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { NetworkID } from "src/lib/Bond";

export const calcAludelDetes = async (networkID: NetworkID, provider: StaticJsonRpcProvider) => {

  return {
    averageApy: 100,
    tvlUsd: 100,
  };
};
