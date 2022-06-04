import {
  Paper,
  Button,
  Box,
  Grid,
  FormControl,
  OutlinedInput,
  InputLabel,
  Typography,
  MenuItem,
  Dialog,
  LinearProgress,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  InputAdornment,
  Zoom, Container,
} from "@material-ui/core";

import SwapVertIcon from "@material-ui/icons/SwapVert";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import InfoTooltipMulti from "../../components/InfoTooltip/InfoTooltipMulti";
import TabPanel from "../../components/TabPanel";
import CardHeader from "../../components/CardHeader/CardHeader";
import CustomInput from "../../components/CustomInput/CustomInput";
import { NavLink } from "react-router-dom";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState, useEffect } from "react";
import { switchNetwork, initializeNetwork } from "../../slices/NetworkSlice";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@material-ui/lab";

import { useWeb3Context } from "../../hooks/web3Context";
import { useAppSelector } from "src/hooks";
import { error, info } from "../../slices/MessagesSlice";
import { loadAccountDetails } from "../../slices/AccountSlice";
import { airdropSpozz } from "../../slices/AirdropThunk";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import ethereum from "../../assets/tokens/wETH.svg";
import arbitrum from "../../assets/arbitrum.png";
import avalanche from "../../assets/tokens/AVAX.svg";
import polygon from "../../assets/tokens/polygon.svg";
import binance from "../../assets/binance.png";

import "./stake.scss";

const airdropUnits = {
  avatar: 50,
  nft: 10,
  specialNFT: 30,
  whitelist: 30
}

const spozzAirdropInfo = {
  totalSupply: 10000,
  airdropAmount: "10%",
  // whitelistCo
}

// export function Airdrop({ srcSwapBalance, setSrcSwapCallback }) {
export default function Stake() {
  const dispatch = useDispatch();
  const { connect, disconnect, connected, web3, provider, address, chainID, chainChanged } = useWeb3Context();

  const [srcSwapBalance, setSrcSwapBalance] = useState(0);
  const [open, setOpen] = useState(false);
  const [isSwapButtonClicked, setSwapButtonClicked] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 379px)");

  // const [dstSwapBalance, setDstSwapBalance] = useState(0);
  const srcSpotBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.srcSpotBalance;
  });

  const balances = useAppSelector(state => {
    return state.account.balances && state.account.balances;
  });

  const avatarOwned = useAppSelector(state => {
    return state.account.balances && state.account.balances.avatarBalance;
  });

  const nftListed = useAppSelector(state => {
    return state.account.balances && state.account.balances.nftBalances && state.account.balances.nftBalances.length;
  });

  const specialNFT = useAppSelector(state => {
    return state.account.balances && state.account.balances.xnftBalances && state.account.balances.xnftBalances.length;
  });

  const isWhitelist = useAppSelector(state => {
    return state.account.balances && state.account.balances.isWhitelist;
  });

  const isReceived = useAppSelector(state => {
    return state.account.balances && state.account.balances.isReceived;
  });

  const airdropBalance = useAppSelector(state => {
    return state.account.balances && state.account.balances.airdropBalance;
  });

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  const toFixed = (number, digit) => {

    let strValue = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digit,
      minimumFractionDigits: digit,
    }).format(number);

    return strValue.replace(",", "'");
  };

  const networkId = useAppSelector(state => state.network.networkId);

  useEffect(() => {
    // don't load ANY details until wallet is Checked
    dispatch(initializeNetwork({ provider: provider }));

    // const id = networkList.findIndex(item => item.id == networkId);
    // console.log("network ID, index", networkId, id);

    // if (networkId == -1) return;

    // if (id == -1) {
    //   // dispatch(error("Unsupported Network. Please Switch Network"));
    //   dispatch(switchNetwork({ provider: provider, networkId: networkList[0].id }));
    //   return;
    // }
    // setSrcNetIndex(id);

    // let list = [];
    // networkList.map((item, index) => {
    //   if (id != index) list.push(item);
    // });
    // setDestinationNetworkList(list);
  }, [chainChanged, networkId, chainID, connected]);

  const onClaim = async () => {
    let nfts = [];
    let xnfts = [];
    let ids = [];
    let xids = [];


    nfts.push(balances.nftBalances[0].address);
    await dispatch(
      airdropSpozz({
        nfts,
        xnfts,
        ids,
        xids,
        provider,
        address,
        networkID: networkId,
      }));
  }

  const onSrcNetworkChanged = id => {
    if (!connected) return dispatch(info("Please connect to wallet"));
    dispatch(switchNetwork({ provider: provider, networkId: networkList[id].id })).then(e => {
      let list = [];
      networkList.map((item, index) => {
        if (id != index) list.push(item);
      });
      setDestinationNetworkList(list);
      setSrcNetIndex(id);
      setDstNetIndex(0);
    });
  };

  const NetworkIcon = ({ list, id }) => {
    return (
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <img src={list[id].image} width="45px" height="45px" />
        <span className="network-name">{list[id].title}</span>
      </div>
    );
  };

  const totalEarned = () => {
    let total = 0;
    if (nftListed)
      total += nftListed * airdropUnits.nft;
    if (specialNFT)
      total += specialNFT * airdropUnits.specialNFT;
    if (avatarOwned)
      total += avatarOwned * airdropUnits.avatar;
    if (isWhitelist)
      total += airdropUnits.whitelist;

    return total;
  }
  return (
    // <Paper className="ohm-card">
    <Grid container spacing={2}>
      <Grid item md={12} lg={12} >
        <Grid container spacing={2}>
          <Grid item xs={0} sm={0} md={1} lg={3} />
          <Grid item xs={12} sm={12} md={10} lg={6}>
            <div className="title-small">
              {"Presale & Airdropfor"}
            </div>
            <div />
            <div className="title-medium">
              SPOZZ TOKEN
            </div>
            <hr />
            {/* <div className="title-big">
              Airdrop Amount
            </div> */}
          </Grid>
        </Grid>
      </Grid>
      <Grid item lg={12} >
        <Grid container spacing={2}>

          <Grid item xs={0} sm={0} md={1} lg={3} />
          <Grid item xs={12} sm={12} md={10} lg={6} style={{ display: "flex" }}>
            <Grid container spacing={2} className="card-container">
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <div className="title-big">
                  SPOZZ TOKEN Info
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">Total Supply</span>
                  <div className="label-value">
                    <span>400,000 SPOZZ</span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">SPOZZ Price</span>
                  <div className="label-value">
                    <span>$0.01</span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">Airrdop Amount</span>
                  <div className="label-value">
                    <span>10%</span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">Whitelisted NFT</span>
                  <div className="label-value">
                    <span>130</span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">Special NFT</span>
                  <div className="label-value">
                    <span>5</span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">Whitelist Member</span>
                  <div className="label-value">
                    <span>1000</span>
                  </div>
                </div>
              </Grid>
              <Grid item xs={4} sm={64} md={4} lg={4} className="grid-item"  >
                <div>Ethereum Sold 5679/10000 </div>
                <div className="progressbar-container">
                  <CircularProgressbar
                    value={45}
                    text={`45%`}
                  />
                </div>
              </Grid>
              <Grid item xs={4} sm={4} md={4} lg={4} className="grid-item"  >
                <div>Baince Sold 5679/10000 </div>
                <div className="progressbar-container">
                  <CircularProgressbar value={29} text={`29%`} />
                </div>
              </Grid>
              <Grid item xs={4} sm={4} md={4} lg={4} className="grid-item"  >
                <div>Polygon Sold 5679/10000</div>
                <div className="progressbar-container">
                  <CircularProgressbar value={72} text={`72.45%`} />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item lg={12} >
        <Grid container spacing={2}>
          <Grid item xs={0} sm={0} md={1} lg={3} />
          <Grid item xs={12} sm={12} md={10} lg={6} style={{ display: "flex" }}>
            <Grid container spacing={2} className="card-container">
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <div className="title-big">
                  Private Activity
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <div className="label-arrange">
                    <span className="label-title">Avatar Owned</span>
                    {
                      avatarOwned != undefined ?
                        <span className="label-title">{avatarOwned}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }
                    {/* <span className="label-title">{avatarOwned != undefined ? avatarOwned : 0}</span> */}
                  </div>
                  <div className="label-value">
                    {
                      avatarOwned != undefined ?
                        <span>Earn: {toFixed(avatarOwned * airdropUnits.avatar, 0)}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }

                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <div className="label-arrange">
                    <span className="label-title">NFT Listed</span>
                    {
                      avatarOwned != undefined ?
                        <span className="label-title">{nftListed}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }

                  </div>
                  <div className="label-value">
                    {
                      avatarOwned != undefined ?
                        <span>Earn: {toFixed(nftListed * airdropUnits.nft, 0)}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <div className="label-arrange">
                    <span className="label-title">Special NFT</span>
                    {
                      avatarOwned != undefined ?
                        <span className="label-title">{specialNFT}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }
                  </div>
                  <div className="label-value">
                    {
                      avatarOwned != undefined ?
                        <span>Earn: {toFixed(specialNFT * airdropUnits.specialNFT, 0)}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }

                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={3} lg={3} className="grid-item"  >
                <div className="label-container">
                  <div className="label-arrange">
                    <span className="label-title">Whitelisted</span>
                    {
                      avatarOwned != undefined ?
                        <span className="label-title">{isWhitelist == true ? "Yes" : "No"}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }
                  </div>
                  <div className="label-value">
                    {
                      avatarOwned != undefined ?
                        <span>Earn: {isWhitelist == true ? airdropUnits.whitelist : 0}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} className="grid-item"  >
                <div className="label-container">
                  <span className="label-title">Total Earned</span>
                  <div className="label-value">
                    {
                      avatarOwned != undefined ?
                        <span>{isReceived ? "You already received" : (totalEarned() + " SPOZZ")}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    }
                  </div>
                </div>
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} className="grid-item"  >
                <div className="label-container">
                  <button
                    className="claim-button"
                    onClick={onClaim}
                    disabled={
                      isPendingTxn(pendingTransactions, "airdropping") || totalEarned() <= 0 || isReceived
                    }
                  >
                    {txnButtonText(pendingTransactions, "airdropping", "Claim My SPOZZ")}
                  </button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  );
}
