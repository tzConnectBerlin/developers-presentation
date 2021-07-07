import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useWallet } from "@tz-contrib/react-wallet-provider";
import { initPollContract, initTezos } from "./contract";

const RPC_URL =
  process.env.REACT_APP_RPC_URL || "https://florencenet.smartpy.io/";
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const { connected, disconnect, activeAccount, connect } = useWallet();
  React.useEffect(() => {
    initTezos(RPC_URL);
    initPollContract(CONTRACT_ADDRESS);
  }, []);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Polling App
            {activeAccount && (
              <Typography variant="caption">
                {" "}
                Connected at: {activeAccount.address}
              </Typography>
            )}
          </Typography>
          {connected ? (
            <Button color="inherit" onClick={disconnect}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={connect}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default App;
