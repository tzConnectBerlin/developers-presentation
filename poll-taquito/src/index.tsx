import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import {
  WalletProvider,
  WalletProviderProps,
} from "@tz-contrib/react-wallet-provider";

const NETWORK =
  (process.env.REACT_APP_NETWORK as WalletProviderProps["network"]) ||
  "FLORENCENET";

ReactDOM.render(
  <React.StrictMode>
    <WalletProvider name="Polling App" clientType="taquito" network={NETWORK}>
      <App />
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
