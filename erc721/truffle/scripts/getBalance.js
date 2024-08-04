require("dotenv").config();
const { RPC_Endpoints, CA, OWNER_PUBLIC_KEY, RECEIVER_PUBLIC_KEY } =
  process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance(address) {
  const balance = await contract.methods.balanceOf(address).call();

  console.log(`NFT Balance of ${address} is ${balance}`);
}

getBalance(OWNER_PUBLIC_KEY);
