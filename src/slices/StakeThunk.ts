import { ethers, BigNumber } from "ethers";
import { addresses, BNB_FEE } from "../constants";
import { abi as ierc20ABI } from "../abi/IERC20.json";
import { abi as spozzStaking } from "../abi/SpozzStaking.json";
import { abi as StakingHelperABI } from "../abi/StakingHelper.json";
import { clearPendingTxn, fetchPendingTxns, getStakingTypeText } from "./PendingTxnsSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAccountSuccess, getBalances, getUserBalance } from "./AccountSlice";
import { error, info } from "../slices/MessagesSlice";
import {
  IBaseAsyncThunk,
  IActionValueAsyncThunk,
  IChangeApprovalAsyncThunk,
  IChangeApprovalWithVersionAsyncThunk,
  IJsonRPCError,
} from "./interfaces";
import { segmentUA } from "../helpers/userAnalyticHelpers";
import { IERC20, OlympusStakingv2__factory, OlympusStaking__factory, StakingHelper } from "src/typechain";
import ReactGA from "react-ga";
import { SystemUpdateAltSharp } from "@material-ui/icons";


export const claimSpozz = createAsyncThunk(
  "stake/onClaim",
  async ({ networkID, provider, address }: IBaseAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const spozzStakingContract = new ethers.Contract(
      addresses[networkID].STAKING_ADDRESS as string,
      spozzStaking,
      signer,
    );

    let stakeTx;
    try {
      stakeTx = await spozzStakingContract.unstakeToken(0);
      const pendingTxnType = "TAZ claim";
      dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: "pendingTxnType", type: pendingTxnType }));
      await stakeTx.wait();
    } catch (e) {
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(error("You must have vault authority."));
      } else {
        dispatch(error(rpcError.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
    dispatch(getUserBalance({ address, networkID, provider }));
  },
);


export const approveSpozz = createAsyncThunk(
  "stake/changeApproval",
  async ({ provider, address, networkID }: IChangeApprovalAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const spozzContract = new ethers.Contract(addresses[networkID].SPOZZ_ADDRESS as string, ierc20ABI, signer);

    let approveTx;
    let spozzAllowance = await spozzContract.allowance(address, addresses[networkID].STAKING_ADDRESS);

    try {
      // won't run if wrapAllowance > 0
      approveTx = await spozzContract.approve(
        addresses[networkID].STAKING_ADDRESS,
        ethers.utils.parseUnits("10000000000", "gwei"),
      );

      const text = "approve";
      const pendingTxnType = "approving";
      if (approveTx) {
        dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));
        await approveTx.wait();
        dispatch(info("Successfully Approved!"));
        dispatch(getUserBalance({ networkID, address, provider }));
      }
      // go get fresh allowances
      // spozzAllowance = await spozzContract.allowance(address, addresses[networkID].STAKING_ADDRESS);

      return dispatch(
        fetchAccountSuccess({
          staking: {
            tazorStake: Number(ethers.utils.formatUnits(spozzAllowance, "gwei")),
          },
        }),
      );
    } catch (e) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }
  },
);


export const changeStake = createAsyncThunk(
  "stake/changeTazorStake",
  async ({ action, value, provider, address, networkID }: IActionValueAsyncThunk, { dispatch }) => {
    console.log("networkID in stakethunk------", networkID);
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const spozzStakingContract = new ethers.Contract(
      addresses[networkID].STAKING_ADDRESS as string,
      spozzStaking,
      signer,
    );

    let stakeTx;
    try {
      if (true) {
        if (action === "stake") {
          if (parseInt(value) == 0) {
            dispatch(error("Please check staking amount"));
            return;
          }
          stakeTx = await spozzStakingContract.stakeToken(ethers.utils.parseUnits(value, "gwei"));
        } else {
          stakeTx = await spozzStakingContract.unstakeToken(ethers.utils.parseUnits(value, "gwei"));
        }
      } else {
      }
      const pendingTxnType = action === "stake" ? "staking" : "unstaking";
      dispatch(fetchPendingTxns({ txnHash: stakeTx.hash, text: getStakingTypeText(action), type: pendingTxnType }));
      await stakeTx.wait();
    } catch (e) {
      const rpcError = e as IJsonRPCError;
      if (rpcError.code === -32603 && rpcError.message.indexOf("ds-math-sub-underflow") >= 0) {
        dispatch(
          error("You may be trying to stake more than your balance! Error code: 32603. Message: ds-math-sub-underflow"),
        );
      } else {
        dispatch(error(rpcError.message));
      }
      return;
    } finally {
      if (stakeTx) {
        dispatch(clearPendingTxn(stakeTx.hash));
      }
    }
    dispatch(getUserBalance({ address, networkID, provider }));
  },
);