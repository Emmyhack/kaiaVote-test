import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ethers } from "ethers";
import CreateEvent from "./components/CreateEvent";
import Vote from "./components/Vote";
import Results from "./components/Results";

const OWNER_ADDRESS = "0xfE6c8F4AD600427daa37690a2F035d199f50C3C2";

function Home({ account, connectWallet, walletError }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Voting DApp</h1>
      {walletError && <div className="mb-4 text-red-600">{walletError}</div>}
      {account ? (
        <div className="mb-4 text-green-700">Connected: {account}</div>
      ) : (
        <button onClick={connectWallet} className="px-4 py-2 bg-blue-600 text-white rounded">Connect Wallet</button>
      )}
      <CreateEvent account={account} />
      <Results />
    </div>
  );
}

function App() {
  const [account, setAccount] = useState("");
  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) setAccount(accounts[0]);
        })
        .catch((err) => {
          setWalletError("Failed to fetch accounts: " + err.message);
          console.error("Wallet error:", err);
        });
    } else {
      setWalletError("MetaMask or a compatible wallet is not installed.");
    }
  }, []);

  const connectWallet = async () => {
    setWalletError("");
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        if (accounts[0].toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
          setWalletError("Warning: You are not connected as the contract owner. Only the owner can create events.");
        }
      } catch (err) {
        setWalletError("Wallet connection failed: " + err.message);
        console.error("Wallet connection error:", err);
      }
    } else {
      setWalletError("MetaMask or a compatible wallet is not installed.");
    }
  };

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home account={account} connectWallet={connectWallet} walletError={walletError} />} />
        <Route path="/vote/:eventId" element={<Vote account={account} />} />
      </Routes>
    </Router>
  );
}

export default App;
