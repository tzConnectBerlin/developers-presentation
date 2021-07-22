import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useBeaconWallet, useWallet } from "@tz-contrib/react-wallet-provider";
import { initPollContract, initTezos, setWalletProvider } from "./contract";
import CreatePollCard from "./CreatePollCard";
import { Grid } from "@material-ui/core";
import AddVoterCard from "./AddVoterCard";
import RemoveVoterCard from "./RemoveVoterCard";
import VoteCard from "./VoteCard";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const RPC_URL =
  process.env.REACT_APP_RPC_URL || "https://florencenet.smartpy.io/";
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const { connected, disconnect, activeAccount, connect } = useWallet();
  const beaconWallet = useBeaconWallet();
  React.useEffect(() => {
    initTezos(RPC_URL);
    initPollContract(CONTRACT_ADDRESS);
  }, []);
  React.useEffect(() => {
    setWalletProvider(beaconWallet);
  }, [beaconWallet]);
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Hicvote
            </Typography>
            {activeAccount ? (
              <>
                {activeAccount.address}
                <Button color="inherit" onClick={disconnect}>
                  Logout
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={connect}>
                Login
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <Switch>
          <Route exact path="/">
            <main>
              <Container sx={{ marginTop: "2rem" }}>
                <Grid container direction="row" spacing={3}>
                  <Grid item xs={6}>
                    <CreatePollCard />
                  </Grid>
                  <Grid item xs={6}>
                    <VoteCard />
                  </Grid>
                  <Grid item xs={6}>
                    <AddVoterCard />
                  </Grid>
                  <Grid item xs={6}>
                    <RemoveVoterCard />
                  </Grid>
                </Grid>
              </Container>
            </main>
          </Route>
          <Route path="/about">
            {/* <About /> */}
          </Route>
          <Route path="/dashboard">
            {/* <Dashboard /> */}
          </Route>
          <Route path="/vote/:poll">
            <VoteCard/>
          </Route>
        </Switch>
      </Box>
    </Router>
  );
}

export default App;
