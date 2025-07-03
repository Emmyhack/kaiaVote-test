require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    kairos: {
      url: process.env.KAIROS_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1001,
    },
  },
}; 