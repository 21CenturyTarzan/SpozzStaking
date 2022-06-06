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
  Zoom,
} from "@material-ui/core";

import TabPanel from "../../components/TabPanel";
import CardHeader from "../../components/CardHeader/CardHeader";
import CustomInput from "../../components/CustomInput/CustomInput";
import { NavLink } from "react-router-dom";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState, useEffect, useCallback } from "react";
import { switchNetwork, initializeNetwork } from "../../slices/NetworkSlice";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@material-ui/lab";

import { useWeb3Context } from "../../hooks/web3Context";
import { useAppSelector } from "src/hooks";
import { error, info } from "../../slices/MessagesSlice";
import { loadAccountDetails } from "../../slices/AccountSlice";
import { approveSpozz, changeStake, claimSpozz } from "../../slices/StakeThunk";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.min.css";
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

  const [open, setOpen] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width: 650px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 379px)");

  // const [dstSwapBalance, setDstSwapBalance] = useState(0);
  const spozzBalancesE = useAppSelector(state => {
    return state.account.balances && state.account.balances.spozzBalancesE;
  });

  const spozzBalancesP = useAppSelector(state => {
    return state.account.balances && state.account.balances.spozzBalancesP;
  });

  const spozzBalancesB = useAppSelector(state => {
    return state.account.balances && state.account.balances.spozzBalancesB;
  });

  const stakedBalancesE = useAppSelector(state => {
    return state.account.balances && state.account.balances.stakedBalancesE;
  });

  const stakedBalancesP = useAppSelector(state => {
    return state.account.balances && state.account.balances.stakedBalancesP;
  });

  const stakedBalancesB = useAppSelector(state => {
    return state.account.balances && state.account.balances.stakedBalancesB;
  });

  const rewardBalancesE = useAppSelector(state => {
    return state.account.balances && state.account.balances.rewardBalancesE;
  });

  const rewardBalancesP = useAppSelector(state => {
    return state.account.balances && state.account.balances.rewardBalancesP;
  });

  const rewardBalancesB = useAppSelector(state => {
    return state.account.balances && state.account.balances.rewardBalancesB;
  });
  

  const balances = useAppSelector(state => {
    return state.account.balances && state.account.balances;
  });

  const allowance = useAppSelector(state => {
    return state.account.balances && state.account.balances.stakeAllowance;
  });

  const claimable = useAppSelector(state => {
    return state.account.balances && state.account.balances.claimable;
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
  }, [chainChanged, networkId, chainID, connected]);

  const hasAllowance = useCallback(
    () => {
      return allowance > 0;
    },
    [allowance],
  )

  const onApprove = async () => {
    await dispatch(
      approveSpozz({ provider, address, networkID: networkId }));
  }

  const onChangeStake = async (action, quantity) => {
    if (isNaN(quantity) || quantity === 0 || quantity === "" || !quantity) {
      return dispatch(error("Please enter a value!"));
    }
    await dispatch(changeStake({ address, action, value: quantity.toString(), provider, networkID: chainID }));

    setOpen(false);
  };

  const onClaimReward = async action => {
    await dispatch(claimSpozz({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

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
    return total;
  }

  const SwapAlertDialog = ({setOpen}) => {
    const [quantity, setQuantity] = useState("");
    return (
      <div style={{ background: "#ff0 !important" }}>
        <Dialog
          open={open}
          onClose={()=>{close()}}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" style={{ textAlign: "center" }}>
            <span style={{ color: "#fff", fontSize: "22px" }}>Spozz Staking Club</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Typography style={{ color: "#fff", fontSize: "20px", margin: "15px 40px" }}>Please Input Spozz Amount.</Typography>
              <FormControl variant="outlined" color="primary" style={{width: "100%"}}>
                <OutlinedInput
                  id="amount-input"
                  type="number"
                  placeholder="Enter an amount"
                  className="stake-input"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  labelWidth={0}
                />
              </FormControl>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="secondary" onClick={()=>{setOpen(false);}}>
              Cancel
            </Button>
            <Button variant="outlined" color="secondary" onClick={()=>{onChangeStake("stake", quantity);}}>
              Stake
            </Button>
            <Button variant="outlined" color="secondary" onClick={()=>{onChangeStake("unstake", quantity);}} autoFocus>
              UnStake
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };

  return (
    <Grid container className="card-container" >
      <Grid item md={12} lg={8} >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={12} style={{ display: "flex", margin: "20px" }}>
            <Grid container >
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <div className="title-big">
                  Stake Spozz Tokens
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={4} className="grid-item">
                <div className="label-container">
                  <div>
                    {/* {
                      avatarOwned != undefined ?
                        <span>Earn: {toFixed(avatarOwned * airdropUnits.avatar, 0)}</span> :
                        <Skeleton type="text" width={"60px"} height={"100%"} />
                    } */}
                    <Row>
                      <Col md={11} className="label-title">Tokens In your Wallet</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">ETH</Col>
                      <Col xs={6} className="label-Frame">{spozzBalancesE? spozzBalancesE: <Skeleton type="text" width={"60px"} height={"100%"} />}</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">POLYGON</Col>
                      <Col xs={6} className="label-Frame">{spozzBalancesB? spozzBalancesP: <Skeleton type="text" width={"60px"} height={"100%"} />}</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">BSC</Col>
                      <Col xs={6} className="label-Frame">{spozzBalancesB? spozzBalancesB: <Skeleton type="text" width={"60px"} height={"100%"} />}</Col>
                    </Row>
                    <Row>
                      <Col xs={2}/>
                      <Col xs={5}>
                        <button
                          className="claim-button"
                          onClick={ () => {onApprove();}}
                          disabled={
                            isPendingTxn(pendingTransactions, "approving") || hasAllowance()}
                        >
                          {txnButtonText(pendingTransactions, "Approving", "Approve")}
                        </button>
                      </Col>
                      <Col xs={5}>
                        <button
                          className="claim-button"
                          onClick={() => {
                            setOpen(true);
                          }}
                        >
                          {txnButtonText(pendingTransactions, "staking", "Stake")}
                        </button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={4} className="grid-item"  >
                <div className="label-container">
                  <div>
                    <Row>
                      <Col xs={11} className="label-title">Token Staked</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">ETH</Col>
                      <Col xs={6} className="label-Frame">{stakedBalancesE? stakedBalancesE : 0}</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">POLYGON</Col>
                      <Col xs={6} className="label-Frame">{stakedBalancesP? stakedBalancesP : 0}</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">BSC</Col>
                      <Col xs={6} className="label-Frame">{stakedBalancesB? stakedBalancesB : 0}</Col>
                    </Row>
                    <Row>
                      <Col xs={7}/>
                      <Col xs={5}>
                        <button
                          className="claim-button"
                          onClick={()=> {setOpen(true);}}
                          disabled={
                            isPendingTxn(pendingTransactions, "airdropping") }
                        >
                          {txnButtonText(pendingTransactions, "Unstaking", "Unstake")}
                        </button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={4} className="grid-item"  >
                <div className="label-container">
                  <div>
                    <Row>
                      <Col md={11} className="label-title">Rewards earned last month</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">ETH</Col>
                      <Col xs={6} className="label-Frame">{rewardBalancesE? rewardBalancesE : 0}</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">POLYGON</Col>
                      <Col xs={6} className="label-Frame">{rewardBalancesP? rewardBalancesP : 0}</Col>
                    </Row>
                    <Row>
                      <Col xs={5} className="label-Frame">BSC</Col>
                      <Col xs={6} className="label-Frame">{rewardBalancesB? rewardBalancesB : 0}</Col>
                    </Row>
                    <Row>
                      <Col xs={7}/>
                      <Col xs={5}>
                        <button
                          className="claim-button"
                          onClick={() => {onClaimReward();}}
                          disabled={
                            isPendingTxn(pendingTransactions, "airdropping") || !(claimable > 0 ) }
                        >
                          {txnButtonText(pendingTransactions, "Claiming", "Claim")}
                        </button>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item md={12} lg={4} >
        <Grid container spacing={2} className="descriptionPanel">
          <p className="descriptionText">
            In Spozz Club, staking is used to reward Spozz token holders
          </p>
          <p className="descriptionText">
            Monthly, the net benefit from the marketplace is calculated and distributed entirely to the spozz token owners
            according to the shared of tokens staked by each wallet.
          </p>
          <p className="descriptionText">
            Only tokens are eligible for rewards that are staked at cut-off time end of the month.
            Cut-off time is midnight last day of each month Central European Time. Rewards are deposited
            in the account of the user within the first week of the following month.
          </p>
          <p className="descriptionText">
            Rewards are calculated using the number of days a token was staked within each month.
            For Staking and Unstaking small Gas Fees are charged by the chain of the token.
          </p>
          <p className="descriptionText">
            Rewards will be automatically added to the staking balance at the end of the month.
            They cannot be claimed before.
          </p>
        </Grid>
      </Grid>
      {open && (
        <SwapAlertDialog setOpen={setOpen} />
      )}
    </Grid >
  );
}
