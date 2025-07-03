require("dotenv").config();
const { ethers } = require("ethers");
const VotingABI = require("../frontend/src/abi/Voting.json");

const CONTRACT_ADDRESS = "0x4522C745878C946aa9520060D31549367290E814";
const NEW_OWNER = "0xfE6c8F4AD600427daa37690a2F035d199f50C3C2";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.KAIROS_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, wallet);
  const tx = await contract.transferOwnership(NEW_OWNER);
  console.log("Ownership transfer transaction sent:", tx.hash);
  await tx.wait();
  console.log("Ownership transferred to:", NEW_OWNER);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 