require("dotenv").config();
const { ethers } = require("ethers");
const VotingABI = require("../frontend/src/abi/Voting.json");

const CONTRACT_ADDRESS = "0x4522C745878C946aa9520060D31549367290E814";

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.KAIROS_RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, provider);
  const owner = await contract.owner();
  console.log("Voting contract owner:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 