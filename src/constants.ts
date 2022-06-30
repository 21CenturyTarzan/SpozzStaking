import { NodeHelper } from "./helpers/NodeHelper";
import { EnvHelper } from "./helpers/Environment";
import ethereum from "./assets/tokens/wETH.svg";
import arbitrum from "./assets/arbitrum.png";
import avalanche from "./assets/tokens/AVAX.svg";
import polygon from "./assets/tokens/polygon.svg";
import binance from "./assets/binance.png";

export const THE_GRAPH_URL = "https://api.thegraph.com/subgraphs/name/drondin/olympus-protocol-metrics";
export const EPOCH_INTERVAL = 28800; //28800

// NOTE could get this from an outside source since it changes slightly over time
export const BLOCK_RATE_SECONDS = 3; //13.14;

export const TOKEN_DECIMALS = 9;

export const BNB_FEE = "0.0025";

// presale price, but this got from presale contract.
export const tazorPPrice = 100;
export const tazPPrice = 1;
export const maxTransactionFee = 0.01;

interface IPoolGraphURLS {
  [index: string]: string;
}

export const POOL_GRAPH_URLS: IPoolGraphURLS = {
  4: "https://api.thegraph.com/subgraphs/name/pooltogether/rinkeby-v3_4_3",
  1: "https://api.thegraph.com/subgraphs/name/pooltogether/pooltogether-v3_4_3",
};

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const addresses: IAddresses = {
  97: {
    SPOZZ_ADDRESS: "0x787499d12F05DC371726359Be5736d760ddFB32F",
    AIRDROP_ADDRESS: "0xA377b13a8be77a89016b9d2b179C30beF3280991",
    STAKING_ADDRESS: "0xD37eC0f158d1311526e0375349FA0d682B5F73e8",
    STAKING_HELPER_ADDRESS: "0xaB217aA0fD9fD0C6930f2827789622C4251E9058",
    REDEEM_HELPER_ADDRESS: "0x27bCF334D7C3Ad8248B06E90ee8a3851c1de0A41",
  },
  56: {
    SPOZZ_ADDRESS: "0x787499d12F05DC371726359Be5736d760ddFB32F",
    AIRDROP_ADDRESS: "0xA377b13a8be77a89016b9d2b179C30beF3280991",
    STAKING_ADDRESS: "0xD37eC0f158d1311526e0375349FA0d682B5F73e8",
    STAKING_HELPER_ADDRESS: "0xaB217aA0fD9fD0C6930f2827789622C4251E9058",
    REDEEM_HELPER_ADDRESS: "0x27bCF334D7C3Ad8248B06E90ee8a3851c1de0A41",
  },
  4: {
    SPOZZ_ADDRESS: "0x494BF4795c80E01EA51EBD1cBc5d3C54fCD49Dba",
    AIRDROP_ADDRESS: "0x8012522Ff18dDc5FEc20E81AA6e7E29Df4821dda",
    STAKING_ADDRESS: "0xAf51c10168A277b473cA761E385015F0a6c56B46",
    STAKING_HELPER_ADDRESS: "0xf73f23Bb0edCf4719b12ccEa8638355BF33604A1",
    REDEEM_HELPER_ADDRESS: "0xBd35d8b2FDc2b720842DB372f5E419d39B24781f",
  },
  1: {
    SPOZZ_ADDRESS: "0x383518188c0c6d7730d91b2c03a03c837814a899",
    STAKING_ADDRESS: "0xfd31c7d00ca47653c6ce64af53c1571f9c36566a", // The new staking contract
    STAKING_HELPER_ADDRESS: "0xc8c436271f9a6f10a5b80c8b8ed7d0e8f37a612d", // Helper contract used for Staking only
    OLD_STAKING_ADDRESS: "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
    PRESALE_ADDRESS: "0xcBb60264fe0AC96B0EFa0145A9709A825afa17D8",
    PT_TOKEN_ADDRESS: "0x0E930b8610229D74Da0A174626138Deb732cE6e9", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
  },
  137: {
    SPOZZ_ADDRESS: "0x9aB2B0730DFE6c44C0B9649Cc458B3A1438fbF31",
    STAKING_ADDRESS: "0x58517F6eD9Be72ecdc29126A0d22C2a69Df0867A",
    STAKING_HELPER_ADDRESS: "0xaB217aA0fD9fD0C6930f2827789622C4251E9058",
    REDEEM_HELPER_ADDRESS: "0x27bCF334D7C3Ad8248B06E90ee8a3851c1de0A41",
  },
  80001: {
    SPOZZ_ADDRESS: "0x494BF4795c80E01EA51EBD1cBc5d3C54fCD49Dba",
    AIRDROP_ADDRESS: "0x89fec673A171D3E8d292cdBcF7d7043Bae35B936",
    STAKING_ADDRESS: "0x1837089fe0063f173CF301C846E858fa264f73FE",
    STAKING_HELPER_ADDRESS: "0xaB217aA0fD9fD0C6930f2827789622C4251E9058",
    REDEEM_HELPER_ADDRESS: "0x27bCF334D7C3Ad8248B06E90ee8a3851c1de0A41",
  },
};

/**
 * Network details required to add a network to a user's wallet, as defined in EIP-3085 (https://eips.ethereum.org/EIPS/eip-3085)
 */

interface INativeCurrency {
  name: string;
  symbol: string;
  decimals?: number;
}

interface INetwork {
  chainName: string;
  chainId: number;
  nativeCurrency: INativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  image: SVGImageElement;
  imageAltText: string;
  uri: () => string;
}

// These networks will be available for users to select. Other networks may be functional
// (e.g. testnets, or mainnets being prepared for launch) but need to be selected directly via the wallet.
// export const USER_SELECTABLE_NETWORKS = [1, 56, 42161, 43114];
export const USER_SELECTABLE_NETWORKS = [4, 97, 80001];

// Set this to the chain number of the most recently added network in order to enable the 'Now supporting X network'
// message in the UI. Set to -1 if we don't want to display the message at the current time.
export const NEWEST_NETWORK_ID = 43114;

export const NETWORKS: { [key: number]: INetwork } = {
  1: {
    chainName: "Ethereum",
    chainId: 1,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.infura.io/v3/"],
    blockExplorerUrls: ["https://etherscan.io/#/"],
    image: ethereum,
    imageAltText: "Ethereum Logo",
    uri: () => NodeHelper.getMainnetURI(1),
  },
  3: {
    chainName: "Ropsten Testnet",
    chainId: 3,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://ropsten.infura.io/v3/"],
    blockExplorerUrls: ["https://ropsten.etherscan.io/#/"],
    image: ethereum,
    imageAltText: "Ethereum Logo",
    uri: () => NodeHelper.getMainnetURI(3),
  },
  4: {
    chainName: "Rinkeby Testnet",
    chainId: 4,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rinkeby.infura.io/v3/"],
    blockExplorerUrls: ["https://rinkeby.etherscan.io/#/"],
    image: ethereum,
    imageAltText: "Ethereum Logo",
    uri: () => NodeHelper.getMainnetURI(4),
  },
  56: {
    chainName: "Binance",
    chainId: 56,
    nativeCurrency: {
      name: "Binance",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed1.binance.org/"],
    blockExplorerUrls: ["https://bscscan.io/#/"],
    image: binance,
    imageAltText: "Binance Logo",
    uri: () => NodeHelper.getMainnetURI(56),
  },
  97: {
    chainName: "Binance Test",
    chainId: 97,
    nativeCurrency: {
      name: "Binance",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.io/#/"],
    image: binance,
    imageAltText: "Binance Logo",
    uri: () => NodeHelper.getMainnetURI(97),
  },
  137: {
    chainName: "Polygon",
    chainId: 137,
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
    blockExplorerUrls: ["https://explorer.matic.network/"],
    image: polygon,
    imageAltText: "Avalanche Logo",
    uri: () => NodeHelper.getMainnetURI(137),
  },
  80001: {
    chainName: "Polygon Testnet",
    chainId: 80001,
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
    image: polygon,
    imageAltText: "Avalanche Logo",
    uri: () => NodeHelper.getMainnetURI(80001),
  },
  42161: {
    chainName: "Arbitrum",
    chainId: 42161,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://explorer.arbitrum.io/#/"],
    image: arbitrum,
    imageAltText: "Arbitrum Logo",
    uri: () => NodeHelper.getMainnetURI(42161),
  },
  421611: {
    chainName: "Arbitrum Testnet",
    chainId: 421611,
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rinkeby.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://rinkeby-explorer.arbitrum.io/#/"],
    image: arbitrum,
    imageAltText: "Arbitrum Logo",
    uri: () => EnvHelper.alchemyArbitrumTestnetURI,
  },
  43113: {
    chainName: "Avalanche Fuji Testnet",
    chainId: 43113,
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io/#/"],
    image: avalanche,
    imageAltText: "Avalanche Logo",
    uri: () => EnvHelper.alchemyAvalancheTestnetURI,
  },
  43114: {
    chainName: "Avalanche",
    chainId: 43114,
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://cchain.explorer.avax.network/"],
    image: avalanche,
    imageAltText: "Avalanche Logo",
    uri: () => NodeHelper.getMainnetURI(43114),
  },
};

// VIEWS FOR NETWORK is used to denote which paths should be viewable on each network
// ... attempting to prevent contract calls that can't complete & prevent user's from getting
// ... stuck on the wrong view
interface IViewsForNetwork {
  dashboard: boolean;
  stake: boolean;
  wrap: boolean;
  zap: boolean;
  threeTogether: boolean;
  bonds: boolean;
  network: boolean;
}

export const VIEWS_FOR_NETWORK: { [key: number]: IViewsForNetwork } = {
  1: {
    dashboard: true,
    stake: true,
    wrap: true,
    zap: true,
    threeTogether: true,
    bonds: true,
    network: true,
  },
  3: {
    dashboard: true,
    stake: true,
    wrap: true,
    zap: true,
    threeTogether: true,
    bonds: true,
    network: true,
  },
  56: {
    dashboard: true,
    stake: true,
    wrap: false,
    zap: false,
    threeTogether: true,
    bonds: true,
    network: true,
  },
  97: {
    dashboard: true,
    stake: true,
    wrap: false,
    zap: false,
    threeTogether: true,
    bonds: true,
    network: true,
  },
  42161: {
    dashboard: true,
    stake: false,
    wrap: true,
    zap: false,
    threeTogether: false,
    bonds: false,
    network: true,
  },
  421611: {
    dashboard: true,
    stake: false,
    wrap: true,
    zap: false,
    threeTogether: false,
    bonds: false,
    network: true,
  },
  43114: {
    dashboard: true,
    stake: true,
    wrap: false,
    zap: false,
    threeTogether: true,
    bonds: true,
    network: true,
  },
  137: {
    dashboard: true,
    stake: false,
    wrap: false,
    zap: false,
    threeTogether: true,
    bonds: false,
    network: true,
  },
  80001: {
    dashboard: true,
    stake: false,
    wrap: false,
    zap: false,
    threeTogether: true,
    bonds: false,
    network: true,
  },
  43113: {
    dashboard: true,
    stake: true,
    wrap: false,
    zap: false,
    threeTogether: true,
    bonds: true,
    network: true,
  },
};
