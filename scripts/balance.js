require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.KAIROS_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`Address: ${wallet.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} KAIA`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 