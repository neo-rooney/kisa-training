const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = "0x3Df608fD54707Bd0F5D4f4C71e9cA2aa0Fa9Dd9c";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const balanceBigInt = await contract.methods
    .cupcakeBalances(contractAddress)
    .call();
  const balanceNumber = Number(balanceBigInt);
  console.log("balance >>", balanceNumber);
}

getBalance();
