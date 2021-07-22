import * as React from "react";
import { useBeaconWallet } from "@tz-contrib/react-wallet-provider";
import { initPollContract, initTezos, setWalletProvider } from "./contract";
import CreatePollCard from "./components/CreatePollCard";
import AddVoterCard from "./components/AddVoterCard";
import RemoveVoterCard from "./components/RemoveVoterCard";
import VoteCard from "./components/VoteCard";
import Nav from "./components/Nav";
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
  // const { connected, disconnect, activeAccount, connect } = useWallet();
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
        <Nav/>
        <Switch>
          <Route exact path="/">
            <main>
              <Link to="/vote/1">Vote on Poll 1</Link><br></br>
              <Link to="/vote/2">Vote on Poll 2</Link><br></br>
              <Link to="/vote/3">Vote on Poll 3</Link>
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
          <Route path="/admin">
            <CreatePollCard />
            <AddVoterCard />
            <RemoveVoterCard />
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
