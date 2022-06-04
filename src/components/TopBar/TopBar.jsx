import { useCallback, useState } from "react";
import { AppBar, Toolbar, Box, Button, SvgIcon, Link, Typography, Menu } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { ReactComponent as MenuIcon } from "../../assets/icons/hamburger.svg";
import { ReactComponent as OlympusIcon } from "../../assets/icons/TAZOR_logo.svg";
import OhmMenu from "./OhmMenu.jsx";
import ThemeSwitcher from "./ThemeSwitch.jsx";
import LocaleSwitcher from "./LocaleSwitch.tsx";
import ConnectMenu from "./ConnectMenu.jsx";
import "./topbar.scss";
import NetworkMenu from "./NetworkMenu.jsx";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ethereum from "../../assets/tokens/wETH.svg";
import arbitrum from "../../assets/arbitrum.png";
import avalanche from "../../assets/tokens/AVAX.svg";
import polygon from "../../assets/tokens/polygon.svg";
import binance from "../../assets/binance.png";

const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: "100%",
      padding: "10px",
    },
    justifyContent: "flex-end",
    alignItems: "flex-end",
    background: "#fff",
    backdropFilter: "none",
    marginBottom: "10px",
    zIndex: 10,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("981")]: {
      display: "none",
    },
  },

  logo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "20px",
  },
  menu: {
    display: "flex",
    justifyContent: "flex-start",
    paddingLeft: "30px",
  },
  logoTitle: {
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontweight: "500",
    fontSize: "36px",
    lineHeight: "44px",
    letterSpacing: "0.18em",
    color: "#6D83FB",
  },
  logoTitlePhone: {
    fontFamily: "Montserrat",
    fontStyle: "normal",
    fontweight: "400",
    fontSize: "25px",
    lineHeight: "44px",
    letterSpacing: "0.18em",
    color: "#6D83FB",
  },
  buttonProp: {
    paddingLeft: "20px",
    fontFamily: 'Montserrat',
    fontStyle: "normal",
    fontWeight: "700",
    fontSize: "14px",
    lineHeight: "17px",
    letterSpacing: "0.175em",
    color: "#3F3F3F",
  },
  searchbar: {
    display: "flex",
    justifyContent: "center",
    background: "#FFFFFF",
    fontSize: "16px",
    fontWeight: "400",
    boxShadow: "2px 2px 9px rgba(0, 0, 0, 0.25)",
    borderRadius: "50px",
    minWidth: "150px",
    alignSelf: "center",
    minHeight: "40px"
  },
  searchbarPhone: {
    display: "flex",
    justifyContent: "center",
    background: "#FFFFFF",
    fontSize: "0px",
    boxShadow: "2px 2px 9px rgba(0, 0, 0, 0.25)",
    borderRadius: "50px",
    alignSelf: "center",
    minHeight: "40px",
    minWidth: "40px"
  },
}));

function TopBar({ theme, toggleTheme, handleDrawerToggle }) {
  const classes = useStyles();
  const networkName = useSelector(state => state.network.networkName);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");
  const [isActive] = useState();

  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }
    if (currentPath.indexOf("stake") >= 0 && page === "stake") {
      return true;
    }
    if (currentPath.indexOf("home") >= 0 && page === "home") {
      return true;
    }
    if (currentPath.indexOf("state") >= 0 && page === "state") {
      return true;
    }
    if (currentPath.indexOf("wallet") >= 0 && page === "wallet") {
      return true;
    }
    if (currentPath.indexOf("swap") >= 0 && page === "swap") {
      return true;
    }
    return false;
  }, []);

  const Logo = () => {
    return (
      <div className={classes.logo}>
        <img src="/logo192.png" height="64px" />
        <span className={` ${!isSmallScreen? classes.logoTitle : classes.logoTitlePhone} `}>|SPOZZ</span>
        {!isSmallScreen && <Menu />}
      </div>
    );
  };

  const Menu = () => {
    return (
      <div className={classes.menu}>
        <Link
          component={NavLink}
          id="dash-nav"
          to="#"
          isActive={(match, location) => {
            return checkPage(match, location, "dashboard");
          }}
          className={`button-dapp-menu ${isActive ? "active" : ""}`}
        >
          <Typography variant="h3" className={classes.buttonProp} >
            CREATE
          </Typography>
        </Link>

        <Link
          component={NavLink}
          id="stake-nav"
          to="#"
          isActive={(match, location) => {
            return checkPage(match, location, "stake");
          }}
        // className={`button-dapp-menu ${isActive ? "active" : ""}`}
        >
          <Typography variant="h3" className={classes.buttonProp}>
            GALLERY
          </Typography>
        </Link>
        <Link
          component={NavLink}
          id="home-nav"
          to="#"
          isActive={(match, location) => {
            return checkPage(match, location, "home");
          }}
        // className={`button-dapp-menu ${isActive ? "active" : ""}`}
        >
          <Typography variant="h3" className={classes.buttonProp}>
            STATSTICS
          </Typography>
        </Link>
        <Link
          component={NavLink}
          id="home-nav"
          to="#"
          isActive={(match, location) => {
            return checkPage(match, location, "home");
          }}
        // className={`button-dapp-menu ${isActive ? "active" : ""}`}
        >
          <Typography variant="h3" className={classes.buttonProp}>
            COMMUNITY
          </Typography>
        </Link>
      </div>
    )
  }

  const SearchBar = () => {
    const getNetworkIcon = () => {
      if (networkName == "ETH")
        return ethereum;
      if (networkName == "BSC")
        return binance;
      if (networkName == "Polygon")
        return polygon;

      return ethereum;
    }

    return (
      <div className={` ${ isSmallScreen? classes.searchbarPhone : classes.searchbar}` } >
        <div style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
          <div>
            <Link component={NavLink} to="/network">
              <div style={{ color: "black", display: "flex" }}>
                <div style={{display: "flex", margin: "5px"}}><img src={getNetworkIcon()} width="25px" height="25px" /></div>
                <div style={{alignSelf: "center"}}>{networkName}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppBar position="sticky" className={classes.appBar} elevation={0}>
      <Toolbar disableGutters className="dapp-topbar">
        <Box display="flex" justifyContent="space-between" width="100%">
          <Logo />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <SearchBar />
            <ConnectMenu theme={theme} />
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
