import { createAsyncThunk } from "@reduxjs/toolkit";
import { BigNumber, ethers } from "ethers";
import { addresses } from "src/constants";
import {
  IActionValueAsyncThunk,
  IBaseAddressAsyncThunk,
  IChangeApprovalWithDisplayNameAsyncThunk,
  IJsonRPCError,
  IValueAsyncThunk,
} from "./interfaces";
import { fetchAccountSuccess, getBalances } from "./AccountSlice";
import { error, info } from "../slices/MessagesSlice";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { OlympusTokenMigrator__factory } from "src/typechain";
import { NetworkID } from "src/lib/Bond";

enum TokenType {
  UNSTAKED,
  STAKED,
  WRAPPED,
}

interface IMigrationWithType extends IActionValueAsyncThunk {
  type: String;
}

export const bridgeBack = createAsyncThunk(
  "migrate/bridgeBack",
  async ({ provider, address, networkID, value }: IValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const migrator = OlympusTokenMigrator__factory.connect(addresses[networkID].MIGRATOR_ADDRESS, signer);

    let unMigrateTx: ethers.ContractTransaction | undefined;

    try {
      unMigrateTx = await migrator.bridgeBack(ethers.utils.parseUnits(value, "ether"), TokenType.STAKED);
      const text = `Bridge Back gOHM`;
      const pendingTxnType = `migrate`;

      dispatch(fetchPendingTxns({ txnHash: unMigrateTx.hash, text, type: pendingTxnType }));
      await unMigrateTx.wait();
      dispatch(info("Successfully unwrapped gOHM!"));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (unMigrateTx) {
        dispatch(clearPendingTxn(unMigrateTx.hash));
        dispatch(getBalances({ address, provider, networkID }));
      }
    }
  },
);

export const migrateWithType = createAsyncThunk(
  "migrate/migrateWithType",
  async ({ provider, address, networkID, type, value, action }: IMigrationWithType, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const migrator = OlympusTokenMigrator__factory.connect(addresses[networkID].MIGRATOR_ADDRESS, signer);

    let migrateTx: ethers.ContractTransaction | undefined;
    try {
      migrateTx = await migrator.migrate(
        ethers.utils.parseUnits(value, type === "wsohm" ? "ether" : "gwei"),
        type === "wsohm" ? TokenType.WRAPPED : TokenType.STAKED,
        TokenType.WRAPPED,
      );
      const text = `Migrate ${type} Tokens`;
      const pendingTxnType = `migrate`;

      dispatch(fetchPendingTxns({ txnHash: migrateTx.hash, text, type: pendingTxnType }));
      await migrateTx.wait();
      dispatch(info(action));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
    } finally {
      if (migrateTx) {
        dispatch(clearPendingTxn(migrateTx.hash));
      }
    }
    // go get fresh balances
    dispatch(getBalances({ address, provider, networkID }));
  },
);

export const migrateAll = createAsyncThunk(
  "migrate/migrateAll",
  async ({ provider, address, networkID }: IBaseAddressAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const migrator = OlympusTokenMigrator__factory.connect(addresses[networkID].MIGRATOR_ADDRESS, signer);

    let migrateAllTx: ethers.ContractTransaction | undefined;

    try {
      migrateAllTx = await migrator.migrateAll(TokenType.WRAPPED);
      const text = `Migrate All Tokens`;
      const pendingTxnType = `migrate_all`;

      dispatch(fetchPendingTxns({ txnHash: migrateAllTx.hash, text, type: pendingTxnType }));
      await migrateAllTx.wait();
      dispatch(info("All assets have been successfully migrated!"));
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      throw e;
    } finally {
      if (migrateAllTx) {
        dispatch(clearPendingTxn(migrateAllTx.hash));
      }
    }
    // go get fresh balances
    dispatch(getBalances({ address, provider, networkID }));
    dispatch(fetchAccountSuccess({ isMigrationComplete: true }));
  },
);

export const migrateCrossChainWSOHM = createAsyncThunk(
  "migrate/migrateCrossChain",
  async ({ provider, address, networkID, value }: IValueAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }
    
    // go get fresh balances
    dispatch(getBalances({ address, provider, networkID }));
  },
);
