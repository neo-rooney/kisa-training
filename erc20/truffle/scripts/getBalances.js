require("dotenv").config();
const { RPC_Endpoints, CA, OWNER_PUBLIC_KEY } = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/GLDToken.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const balanceBigInt = await contract.methods
    .balanceOf(OWNER_PUBLIC_KEY)
    .call();

  const balance = web3.utils.fromWei(balanceBigInt, "ether");

  console.log("Balance in GLD tokens >>", balance);
}

getBalance();
