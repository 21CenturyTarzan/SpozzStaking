import { BigNumber, BigNumberish, ethers } from "ethers";
import { addresses } from "../constants";
import { loadAppDetails } from "../slices/AppSlice";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as stakingAbi } from "../abi/SpozzStaking.json"
import axios from "axios";
import { setAll, handleContractError, getDisplayBalance, getMarketPrice, getTazMarketPrice } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk, IBridgeAsyncThunk } from "./interfaces";
import { IERC20 } from "src/typechain";
import { NetworkID } from "src/lib/Bond";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk, { dispatch }) => {
    await dispatch(loadAppDetails({ networkID: networkID, provider: provider, address: address }));
  },
);

/////////////////////
export const getUserBalance = createAsyncThunk(
  "account/getUserNFTBalance",
  async ({ address, networkID, provider }: IBridgeAsyncThunk, { dispatch }) => {

    let spozzBalancesE = null;
    let spozzBalancesP = null;
    let spozzBalancesB = null;

    let stakedBalancesE = null;
    let stakedBalancesP = null;
    let stakedBalancesB = null;

    let rewardBalancesE = null;
    let rewardBalancesP = null;
    let rewardBalancesB = null;

    if (true) {
      const provider2 = new ethers.providers.JsonRpcProvider(
        "https://speedy-nodes-nyc.moralis.io/20cea78632b2835b730fdcf4/polygon/mumbai",
      );
      const spozzContract = new ethers.Contract(addresses[80001].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
      let spotBalanceBN = await spozzContract.balanceOf(address);
      spozzBalancesP = ethers.utils.formatUnits(spotBalanceBN, "gwei");
      try {
        const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, provider2);
        let userInfo = await stakingContract.userInfos(address);
        stakedBalancesE = ethers.utils.formatUnits(userInfo.stakedAmount, "gwei");

        let userReward = await stakingContract.pendingSpozz();
        rewardBalancesE = ethers.utils.formatUnits(userReward, "gwei");

      } catch (e) {
        handleContractError(e);
      }
    }

    if (true) {
      const provider2 = new ethers.providers.JsonRpcProvider(
        "https://speedy-nodes-nyc.moralis.io/20cea78632b2835b730fdcf4/eth/rinkeby",
      );
      const spozzContract = new ethers.Contract(addresses[4].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
      let spotBalanceBN = await spozzContract.balanceOf(address);
      spozzBalancesE = ethers.utils.formatUnits(spotBalanceBN, "gwei");
      try {
        const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, provider2);
        let userInfo = await stakingContract.userInfos(address);
        stakedBalancesP = ethers.utils.formatUnits(userInfo.stakedAmount, "gwei");

        let userReward = await stakingContract.pendingSpozz();
        rewardBalancesP = ethers.utils.formatUnits(userReward, "gwei");

      } catch (e) {
        handleContractError(e);
      }
    }

    if (true) {
      const provider2 = new ethers.providers.JsonRpcProvider("https://speedy-nodes-nyc.moralis.io/20cea78632b2835b730fdcf4/bsc/testnet",);
      const spozzContract = new ethers.Contract(addresses[97].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
      let spotBalanceBN = await spozzContract.balanceOf(address);
      spozzBalancesB = ethers.utils.formatUnits(spotBalanceBN, "gwei");

      try {
        const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, provider2);
        let userInfo = await stakingContract.userInfos(address);
        stakedBalancesB = ethers.utils.formatUnits(userInfo.stakedAmount, "gwei");

        let userReward = await stakingContract.pendingSpozz();
        rewardBalancesB = ethers.utils.formatUnits(userReward, "gwei");

      } catch (e) {
        handleContractError(e);
      }
    }

    const curSpozzContract = new ethers.Contract(addresses[networkID].SPOZZ_ADDRESS as string, ierc20Abi, provider) as IERC20;
    const allowance = await curSpozzContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    const stakingContract = new ethers.Contract(addresses[networkID].STAKING_ADDRESS as string, stakingAbi, provider);
    let claimable = await stakingContract.pendingSpozz();

    return {
      balances: {
        spozzBalancesE: spozzBalancesE,
        spozzBalancesP: spozzBalancesP,
        spozzBalancesB: spozzBalancesB,
        stakedBalancesE: stakedBalancesE,
        stakedBalancesP: stakedBalancesP,
        stakedBalancesB: stakedBalancesB,
        stakeAllowance: ethers.utils.formatUnits(allowance, "gwei"),
        rewardBalancesE: rewardBalancesE,
        rewardBalancesP: rewardBalancesP,
        rewardBalancesB: rewardBalancesB,
        claimable: claimable,
      },
    };
  },
);

////////////////////

interface IUserAccountDetails {
  wrapping: {
    sohmWrap: number;
    wsohmUnwrap: number;
    gOhmUnwrap: number;
    wsOhmMigrate: number;
  };
}

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk, { dispatch }) => {
    let tazorAllowance = BigNumber.from("0");
    let tazAllowance = BigNumber.from("0");
    let secondNetworkID = 3;

    if (networkID == NetworkID.Mainnet) secondNetworkID = 56;
    else if (networkID == NetworkID.Testnet) secondNetworkID = 97;
    else if (networkID == NetworkID.BSCMainnet) secondNetworkID = 1;
    else if (networkID == NetworkID.BSCTestnet) secondNetworkID = 3;

    await dispatch(getUserBalance({ address, networkID, provider }));

    return {
      staking: {
        tazorStake: +tazorAllowance,
        tazStake: +tazAllowance,
      },
    };
  },
);

export interface IUserBondDetails {
  // bond: string;
  allowance: number;
  interestDue: number;
  bondMaturationBlock: number;
  pendingPayout: string; //Payout formatted in gwei.
}
export const calculateUserBondDetails = createAsyncThunk(
  "account/calculateUserBondDetails",
  async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
    if (!address) {
      return {
        bond: "",
        displayName: "",
      };
    }
    
    // balanceVal should NOT be converted to a number. it loses decimal precision
    return {
      bond: bond.name,
      displayName: bond.getTokenName(networkID),
    };
  },
);

interface IAccountSlice extends IUserAccountDetails {
  bonds: { [key: string]: IUserBondDetails };
  balances: {
    gohm: string;
    secondNetworkID: number;
    ohmV1: string;

    tazor: string;
    taz: string;
    tazorStaked: string;
    tazStaked: string;
    tazReward: string;
    totalTazorStaked: number;
    totalTazStaked: number;
    totalDeposited: number;
    tazorPTotalSupply: number;
    tazorInCirculation: number;
    tazPTotalSupply: number;
    tazInCirculation: number;
    presaleLeftTime: number;
    currentETHBalance: number;

    sohm: string;
    sohmV1: string;
    dai: string;
    oldsohm: string;
    fsohm: string;
    fgohm: string;
    fgOHMAsfsOHM: string;
    wsohm: string;
    fiatDaowsohm: string;
    pool: string;
  };
  loading: boolean;
  staking: {
    ohmStakeV1: number;
    ohmUnstakeV1: number;
    tazorStake: number;
    tazStake: number;
    ohmUnstake: number;
  };
  presale: {
    isFairLaunchFinshed: boolean;
    isTazorClaimed: boolean;
    isTazClaimed: boolean;
    tazorPPrice: number;
    tazPPrice: number;
    tazorPurchasedBalance: number;
    tazPurchasedBalance: number;
    pendingPayoutPresale: number;
    vestingPeriodPresale: number;
  };
  migration: {
    ohm: number;
    sohm: number;
    wsohm: number;
    gohm: number;
  };
  pooling: {
    sohmPool: number;
  };
  isMigrationComplete: boolean;
}

const initialState: IAccountSlice = {
  loading: false,
  bonds: {},
  balances: {
    gohm: "",
    secondNetworkID: 80001,
    ohmV1: "",

    tazor: "",
    taz: "",
    tazorStaked: "",
    tazStaked: "",
    tazReward: "",
    totalTazorStaked: 0,
    totalTazStaked: 0,
    totalDeposited: 0,
    tazorPTotalSupply: 0,
    tazorInCirculation: 0,
    tazPTotalSupply: 0,
    presaleLeftTime: 0,
    tazInCirculation: 0,
    currentETHBalance: 0,

    sohm: "",
    sohmV1: "",
    dai: "",
    oldsohm: "",
    fsohm: "",
    fgohm: "",
    fgOHMAsfsOHM: "",
    wsohm: "",
    fiatDaowsohm: "",
    pool: "",
  },
  staking: { ohmStakeV1: 0, ohmUnstakeV1: 0, tazorStake: 0, tazStake: 0, ohmUnstake: 0 },
  presale: {
    isFairLaunchFinshed: false,
    isTazorClaimed: false,
    isTazClaimed: false,
    tazorPPrice: 0,
    tazPPrice: 0,
    tazorPurchasedBalance: 0,
    tazPurchasedBalance: 0,
    pendingPayoutPresale: 0,
    vestingPeriodPresale: 0,
  },
  wrapping: { sohmWrap: 0, wsohmUnwrap: 0, gOhmUnwrap: 0, wsOhmMigrate: 0 },
  pooling: { sohmPool: 0 },
  migration: { ohm: 0, sohm: 0, wsohm: 0, gohm: 0 },
  isMigrationComplete: false,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getUserBalance.pending, state => {
        state.loading = true;
      })
      .addCase(getUserBalance.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getUserBalance.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
