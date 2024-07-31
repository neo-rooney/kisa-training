require("dotenv").config();
const { CA, RPC_Endpoints } = process.env;
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const balanceBigInt = await contract.methods
    .cupcakeBalances(contractAddress)
    .call();
  const balanceNumber = Number(balanceBigInt);
  console.log("balance >>", balanceNumber);
}

getBalance();
