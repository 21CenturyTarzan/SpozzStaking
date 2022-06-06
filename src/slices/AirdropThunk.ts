import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as AirdropAbi } from "../abi/Airdrop.json";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getBalances, getUserBalance } from "./AccountSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { error, info } from "./MessagesSlice";
import { IJsonRPCError, IAirdropAsyncThunk } from "./interfaces";
import axios from "axios";

function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

export const airdropSpozz = createAsyncThunk(
  "presale/approveToken",
  async ({ nfts, xnfts, ids, xids, provider, address, networkID }: IAirdropAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const airdropContract = new ethers.Contract(addresses[networkID].AIRDROP_ADDRESS as string, AirdropAbi, signer);

    let approveTx;
    try {
      approveTx = await airdropContract.airdrop(nfts, xnfts, ids, xids);
      const pendingTxnType = "airdropping";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text: pendingTxnType, type: pendingTxnType }));
      const tx = await approveTx.wait();
      await dispatch(getUserBalance({provider, address, networkID}))
    } catch (e: unknown) {
      const errMsg = (e as IJsonRPCError).message;
      if (errMsg.includes("only whitelisted"))
        dispatch(error("You are not added to whitelist. Please contact Manager."));
      else if (errMsg.includes("exceed limit")) dispatch(error("Sorry. You exceed limit"));
      else dispatch(error("Airdrop failed"));
      console.log(errMsg);
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }
  },
);
