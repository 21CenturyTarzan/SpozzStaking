import { JsonRpcSigner, StaticJsonRpcProvider } from "@ethersproject/providers";
import { ethers, BigNumber } from "ethers";

import { abi as ierc20Abi } from "src/abi/IERC20.json";
import { getTokenPrice } from "src/helpers";
import { getBondCalculator } from "src/helpers/BondCalculator";
import { EthContract, PairContract } from "src/typechain";
import { addresses } from "src/constants";
import React from "react";

export enum NetworkID {
  Mainnet = 1,
  Testnet = 4,
  BSCMainnet = 56,
  BSCTestnet = 97,
  Polygon = 137,
  Moombai = 80001,
}

export enum BondType {
  StableAsset,
  LP,
}

export interface BondAddresses {
  reserveAddress: string;
  bondAddress: string;
}

export interface NetworkAddresses {
  [NetworkID.Mainnet]?: BondAddresses;
  [NetworkID.Testnet]?: BondAddresses;
  [NetworkID.BSCMainnet]?: BondAddresses;
  [NetworkID.BSCTestnet]?: BondAddresses;
  [NetworkID.Polygon]?: BondAddresses;
  [NetworkID.Moombai]?: BondAddresses;
}

export interface BondNameOnNetwork {
  [NetworkID.Mainnet]?: string;
  [NetworkID.Testnet]?: string;
  [NetworkID.BSCMainnet]?: string;
  [NetworkID.BSCTestnet]?: string;
  [NetworkID.Polygon]?: string;
  [NetworkID.Moombai]?: string;
}

export interface BondImageOnNetwork {
  [NetworkID.Mainnet]?: React.ReactNode;
  [NetworkID.BSCMainnet]?: React.ReactNode;
  [NetworkID.Polygon]?: React.ReactNode;
}

export interface Available {
  [NetworkID.Mainnet]: boolean;
  [NetworkID.Testnet]: boolean;
  [NetworkID.BSCMainnet]?: boolean;
  [NetworkID.BSCTestnet]?: boolean;
  [NetworkID.Polygon]?: boolean;
  [NetworkID.Moombai]?: boolean;
}

interface BondOpts {
  name: string; // Internal name used for references
  displayName: string; // Displayname on UI
  tokenName: BondNameOnNetwork; // tokenName on UI
  isBondable: boolean; // aka isBondable => set false to hide
  isClaimable: boolean; // set false to hide
}

interface TokenOpts {
  name: string; // Internal name used for references
  displayName: string; // Displayname on UI
  tokenName: BondNameOnNetwork; // tokenName on UI
}

// Technically only exporting for the interface
export abstract class Bond {
  // Standard Bond fields regardless of LP bonds or stable bonds.
  readonly name: string;
  readonly displayName: string;
  readonly tokenName: BondNameOnNetwork; // tokenName on UI
  readonly isBondable: boolean;
  // NOTE (appleseed): temporary for ONHOLD MIGRATION

  // The following two fields will differ on how they are set depending on bond type
  abstract isLP: Boolean;
  abstract reserveContract: ethers.ContractInterface; // Token ABI
  abstract displayUnits: string;

  // Async method that returns a Promise
  constructor(type: BondType, bondOpts: BondOpts) {
    this.name = bondOpts.name;
    this.displayName = bondOpts.displayName;
    this.isBondable = bondOpts.isBondable;
    // NOTE (appleseed): temporary for ONHOLD MIGRATION
    this.tokenName = bondOpts.tokenName;
  }

  /**
   * makes isBondable accessible within Bonds.ts
   * @param networkID
   * @returns boolean
   */
  getBondability(networkID: NetworkID) {
    return true;
  }

  getTokenName(networkID: NetworkID) {
    return this.tokenName[networkID];
  }
  
}

export class LpToken {
  // Standard Bond fields regardless of LP bonds or stable bonds.
  readonly name: string;
  readonly displayName: string;
  readonly tokenName: BondNameOnNetwork;

  // The following two fields will differ on how they are set depending on bond type

  constructor(bondOpts: TokenOpts) {
    this.name = bondOpts.name;
    this.displayName = bondOpts.displayName;
    // NOTE (appleseed): temporary for ONHOLD MIGRATION
    this.tokenName = bondOpts.tokenName;
  }

  getTokenName(networkID: NetworkID) {
    return this.tokenName[networkID];
  }
}

// Keep all LP specific fields/logic within the LPBond class
export interface LPBondOpts extends BondOpts {
  reserveContract: ethers.ContractInterface;
  lpUrl: string;
}

export class LPBond extends Bond {
  readonly isLP = true;
  readonly lpUrl: string;
  readonly reserveContract: ethers.ContractInterface;
  readonly displayUnits: string;

  constructor(lpBondOpts: LPBondOpts) {
    super(BondType.LP, lpBondOpts);

    this.lpUrl = lpBondOpts.lpUrl;
    this.reserveContract = lpBondOpts.reserveContract;
    this.displayUnits = "LP";
  }
  
}

// Generic BondClass we should be using everywhere
// Assumes the token being deposited follows the standard ERC20 spec
export interface StableBondOpts extends BondOpts {}
export class StableBond extends Bond {
  readonly isLP = false;
  readonly reserveContract: ethers.ContractInterface;
  readonly displayUnits: string;

  constructor(stableBondOpts: StableBondOpts) {
    super(BondType.StableAsset, stableBondOpts);
    // For stable bonds the display units are the same as the actual token
    this.displayUnits = stableBondOpts.displayName;
    this.reserveContract = ierc20Abi; // The Standard ierc20Abi since they're normal tokens
  }
}

// These are special bonds that have different valuation methods
export interface CustomBondOpts extends BondOpts {
  reserveContract: ethers.ContractInterface;
  bondType: number;
  lpUrl: string;
  customTreasuryBalanceFunc: (
    this: CustomBond,
    networkID: NetworkID,
    provider: StaticJsonRpcProvider,
  ) => Promise<number>;
}
export class CustomBond extends Bond {
  readonly isLP: Boolean;
  getTreasuryBalance(networkID: NetworkID, provider: StaticJsonRpcProvider): Promise<number> {
    throw new Error("Method not implemented.");
  }
  readonly reserveContract: ethers.ContractInterface;
  readonly displayUnits: string;
  readonly lpUrl: string;

  constructor(customBondOpts: CustomBondOpts) {
    super(customBondOpts.bondType, customBondOpts);

    if (customBondOpts.bondType === BondType.LP) {
      this.isLP = true;
    } else {
      this.isLP = false;
    }
    this.lpUrl = customBondOpts.lpUrl;
    // For stable bonds the display units are the same as the actual token
    this.displayUnits = customBondOpts.displayName;
    this.reserveContract = customBondOpts.reserveContract;
    this.getTreasuryBalance = customBondOpts.customTreasuryBalanceFunc.bind(this);
  }
}
