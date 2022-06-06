import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import axios from 'axios';
import { abi as tazorStaking } from "../abi/tazorStaking.json";
import {
  setAll,
  getTokenPrice,
  getDisplayBalance,
  getMarketPrice,
} from "../helpers";
import { NodeHelper } from "src/helpers/NodeHelper";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "src/store";
import { IBaseAsyncThunk } from "./interfaces";
import { IERC20 } from "src/typechain";


export const loadAppDetails = createAsyncThunk(
  "app/loadAppDetails",
  async ({ networkID, provider, address }: IBaseAsyncThunk, { dispatch }) => {
    if (networkID !== 1) {
      // provider = NodeHelper.getMainnetStaticProvider();
      // networkID = 1;
    }

    let marketPrice;
    try {
      // const originalPromiseResult = await dispatch(
      //   loadMarketPrice({ networkID: networkID, provider: provider }),
      // ).unwrap();
      //pair address: 0x806955F90Ee7765736811eD83e7d1B04f782d81b
      const res = await axios.get("https://deep-index.moralis.io/api/v2/erc20/0x494BF4795c80E01EA51EBD1cBc5d3C54fCD49Dba/price?chain=rinkeby", {
        headers: { "X-API-Key": "iea1xCsNT6edUc6Xfu8ZqUorCRnshpsaC66IUaHOqbEnVFDK04qfeNsmGKikqJkn" },
      });
      marketPrice = res.data.usdPrice;
      console.log("[tz]: spozz market price: ", marketPrice);
    } catch (rejectedValueOrSerializedError) {
      console.error("Returned a null response from dispatch(loadMarketPrice)");
      return;
    }

    if (!provider) {
      console.error("failed to connect to provider, please connect your wallet");
      return {
        marketPrice,
      } as IAppData;
    }
    return {
      marketPrice,
    } as IAppData;
  },
);

/**
 * - fetches the OHM price from CoinGecko (via getTokenPrice)
 * - falls back to fetch marketPrice from ohm-dai contract
 * - updates the App.slice when it runs
 */
const loadMarketPrice = createAsyncThunk(
  "app/loadMarketPrice",
  async ({ networkID, provider, address }: IBaseAsyncThunk) => {
    let marketPrice: number;
    let tazorTotalSupply: Number;
    try {
      // only get marketPrice from eth mainnet
      marketPrice = await getMarketPrice({ networkID, provider, address });
      const tazorContract = new ethers.Contract(
        addresses[networkID].SPOZZ_ADDRESS as string,
        ierc20Abi,
        provider,
      ) as IERC20;
      tazorTotalSupply = Number(getDisplayBalance(await tazorContract.totalSupply(), 9));
    } catch (e) {
      marketPrice = await getTokenPrice("tazor");
      tazorTotalSupply = 0;
    }
    return { marketPrice, tazorTotalSupply };
  },
);

interface IAppData {
  readonly circSupply?: number;
  readonly loading: boolean;
  readonly loadingMarketPrice: boolean;
  readonly marketCap?: number;
  readonly marketPrice?: number;
  readonly totalSupply?: number;
}

const initialState: IAppData = {
  loading: false,
  loadingMarketPrice: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchAppSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAppDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAppDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAppDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.name, error.message, error.stack);
      })
      .addCase(loadMarketPrice.pending, (state, action) => {
        state.loadingMarketPrice = true;
      })
      .addCase(loadMarketPrice.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loadingMarketPrice = false;
      })
      .addCase(loadMarketPrice.rejected, (state, { error }) => {
        state.loadingMarketPrice = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
