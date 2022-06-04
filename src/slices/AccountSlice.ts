import { BigNumber, BigNumberish, ethers } from "ethers";
import { addresses } from "../constants";
import { loadAppDetails } from "../slices/AppSlice";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as airdropAbi } from "../abi/Airdrop.json"
import axios from "axios";
import { setAll, handleContractError, getDisplayBalance, getMarketPrice, getTazMarketPrice } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk, IBridgeAsyncThunk } from "./interfaces";
import { findOrLoadMarketPrice } from "./AppSlice";
import {
  IERC20,
} from "src/typechain";
import { NetworkID } from "src/lib/Bond";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk, { dispatch }) => {
    await dispatch(loadAppDetails({ networkID: networkID, provider: provider, address: address }));
  },
);

interface NFTItem {
  address: string;
  type: boolean;
  id: string;
}

/////////////////////
export const getUserNFTBalance = createAsyncThunk(
  "account/getUserNFTBalance",
  async ({ address, networkID, provider, secondNetworkID }: IBridgeAsyncThunk, { dispatch }) => {

    let isWhitelist = false;
    let isReceived = false;
    let url = null;
    let polygonAirdropBalance = null;
    let ethAirdropBalance = null;
    let bscAirdropBalance = null;

    if (networkID == 4)
      url = "https://deep-index.moralis.io/api/v2/" + address + "/nft?chain=rinkeby&format=decimal";
    else if (networkID == 97)
      url = "https://deep-index.moralis.io/api/v2/" + address + "/nft?chain=bsc%20testnet&format=decimal";
    else if (networkID == 80001)
      url = "https://deep-index.moralis.io/api/v2/" + address + "/nft?chain=mumbai&format=decimal";
    else
      url = "";

    const res = await axios.get(url, {
      headers: { "X-API-Key": "iea1xCsNT6edUc6Xfu8ZqUorCRnshpsaC66IUaHOqbEnVFDK04qfeNsmGKikqJkn" },
    });

    // if (true) {
    //   const provider2 = new ethers.providers.JsonRpcProvider(
    //     "https://speedy-nodes-nyc.moralis.io/24036fe0cb35ad4bdc12155f/polygon/mumbai",
    //   );
    //   const spozzContract = new ethers.Contract(addresses[80001].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
    //   let spotBalanceBN = await spozzContract.balanceOf(addresses[80001].AIRDROP_ADDRESS);
    //   polygonAirdropBalance = ethers.utils.formatUnits(spotBalanceBN, "gwei");
    // }

    // if (true) {
    //   const provider2 = new ethers.providers.JsonRpcProvider(
    //     "https://speedy-nodes-nyc.moralis.io/24036fe0cb35ad4bdc12155f/eth/rinkeby",
    //   );
    //   const spozzContract = new ethers.Contract(addresses[4].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
    //   let spotBalanceBN = await spozzContract.balanceOf(addresses[4].AIRDROP_ADDRESS);
    //   ethAirdropBalance = ethers.utils.formatUnits(spotBalanceBN, "gwei");
    // }

    // if (true) {
    //   const provider2 = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    //   const spozzContract = new ethers.Contract(addresses[97].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
    //   let spotBalanceBN = await spozzContract.balanceOf(addresses[97].AIRDROP_ADDRESS);
    //   bscAirdropBalance = ethers.utils.formatUnits(spotBalanceBN, "gwei");
    // }

    const userNFTList = res.data.result;


    const nftBalances = [];
    const xnftBalances = [];
    try {

      const airdropContract = new ethers.Contract(addresses[networkID].AIRDROP_ADDRESS as string, airdropAbi, provider);
      for (let i = 0; i < userNFTList.length; i++) {
        const item = userNFTList[i];
        const isNFTRegistered = await airdropContract.isNFTRegistered(item.token_address);
        if (isNFTRegistered) {
          let newItem = {
            "address": item.token_address,
            "id": item.token_id,
            "type": item.contract_type == "ERC721"
          }
          // xnftBalances.push(newItem);
          nftBalances.push(newItem);
        }

        const isXNFTRegistered = await airdropContract.isXNFTRegistered(item.token_address);
        if (isXNFTRegistered) {
          xnftBalances.push({
            address: item.token_address,
            amount: item.amount,
            id: item.token_id,
            type: item.contract_type == "ERC721"
          })
        }
      }

      isWhitelist = await airdropContract.isWhitelist(address);
      isReceived = await airdropContract.isReceived(address);

    } catch (e) {
      console.log(e);
    }

    return {
      balances: {
        nftBalances: nftBalances,
        xnftBalances: xnftBalances,
        avatarBalance: 0,
        isWhitelist: isWhitelist,
        isReceived: isReceived,
        airdropBalance: {
          eth: ethAirdropBalance,
          bsc: bscAirdropBalance,
          polygon: polygonAirdropBalance,
        }

      },
    };

    // console.log("getUserNFTBalance", networkID);
    // try {
    //   let res;
    //   if (true) {
    //     const tokenContract = new ethers.Contract(
    //       addresses[networkID].SPOZZ_ADDRESS as string,
    //       ierc20Abi,
    //       provider,
    //     ) as IERC20;
    //     let srcSpotBalanceBN = await tokenContract.balanceOf(address);
    //     srcSpotBalance = ethers.utils.formatUnits(srcSpotBalanceBN, "gwei");
    //     console.log(address, addresses[networkID].BRIDGE_ADDRESS);
    //     let tokenAllowanceBN = await tokenContract.allowance(address, addresses[networkID].BRIDGE_ADDRESS);
    //     tokenAllowance = ethers.utils.formatUnits(tokenAllowanceBN, "gwei");
    //   }

    //   // let res2;
    //   if (secondNetworkID == 1) {
    //     // res2 = await axios.get(
    //     //   "https://deep-index.moralis.io/api/v2/" +
    //     //     address +
    //     //     "/erc20?chain=eth&token_addresses=" +
    //     //     addresses[secondNetworkID].SPOZZ_ADDRESS,
    //     //   {
    //     //     headers: { "X-API-Key": "YEEwMh0B4VRg6Hu5gFQcKxqinJ7UizRza1JpbkyMgNTfj4jUkSaZVajOxLNabvnt" },
    //     //   },
    //     // );
    //     dstSpotBalance = 0;
    //   }
    //   if (true) {
    //     const provider2 = new ethers.providers.JsonRpcProvider(
    //       "https://speedy-nodes-nyc.moralis.io/24036fe0cb35ad4bdc12155f/polygon/mumbai",
    //     );
    //     const spozzContract = new ethers.Contract(addresses[80001].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
    //     let spotBalanceBN = await spozzContract.balanceOf(address);
    //     polySpotBlance = ethers.utils.formatUnits(spotBalanceBN, "gwei");
    //   }
    //   if (true) {
    //     const provider2 = new ethers.providers.JsonRpcProvider(
    //       "https://speedy-nodes-nyc.moralis.io/24036fe0cb35ad4bdc12155f/eth/rinkeby",
    //     );
    //     const spozzContract = new ethers.Contract(addresses[4].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
    //     let spotBalanceBN = await spozzContract.balanceOf(address);
    //     ethSpotBalance = ethers.utils.formatUnits(spotBalanceBN, "gwei");
    //   }
    //   if (true) {
    //     const provider2 = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
    //     const spozzContract = new ethers.Contract(addresses[97].SPOZZ_ADDRESS as string, ierc20Abi, provider2) as IERC20;
    //     let spotBalanceBN = await spozzContract.balanceOf(address);
    //     bscSpotBalance = ethers.utils.formatUnits(spotBalanceBN, "gwei");
    //   }
    //   // dstSpotBalance = ethers.utils.formatUnits(res2.data[0].balance, "ether");
    // } catch (e) {
    //   handleContractError(e);
    // }
    // // await dispatch(loadAppDetails({ networkID: networkID, provider: provider, address: address }));

    // const spotBalances = {
    //   eth: ethSpotBalance,
    //   bsc: bscSpotBalance,
    //   polygon: polySpotBlance,
    // };
    // return {
    //   balances: {
    //     srcSpotBalance: srcSpotBalance,
    //     tokenAllowance: tokenAllowance,
    //     dstSpotBalance: dstSpotBalance,
    //     spotBalances,
    //   },
    // };
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

    await dispatch(getUserNFTBalance({ address, networkID, provider, secondNetworkID }));

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
      .addCase(getUserNFTBalance.pending, state => {
        state.loading = true;
      })
      .addCase(getUserNFTBalance.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getUserNFTBalance.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
