import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import {
  WalletProvider,
  WalletProviderProps,
} from "@tz-contrib/react-wallet-provider";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";
import LocalizationProvider from "@material-ui/lab/LocalizationProvider";
import { ToastProvider } from "react-toast-notifications";

const network = process.env.REACT_APP_NETWORK || "FLORENCENET";
export const NETWORK: WalletProviderProps["network"] =
  network as WalletProviderProps["network"];

ReactDOM.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ToastProvider placement="bottom-right">
        <WalletProvider
          name="Polling App"
          clientType="taquito"
          network={NETWORK}
        >
          <App />
        </WalletProvider>
      </ToastProvider>
    </LocalizationProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
