require("dotenv").config();
const { RPC_Endpoints, CA } = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/GLDToken.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const balanceBigInt = await contract.methods.balanceOf(defaultAccount).call();

  const balance = web3.utils.fromWei(balanceBigInt, "ether");

  console.log("Balance in GLD tokens >>", balance);
}

getBalance();
