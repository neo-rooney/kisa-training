const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545/");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MetaCoin.json")
).abi;
const contractAddress = "0x42EeFc027C5FAb00D12cb37E264F9Dee0C770777";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getBalance() {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const balanceBigInt = await contract.methods
    .getBalance(defaultAccount)
    .call();
  const balanceNumber = Number(balanceBigInt);
  console.log("balance >>", balanceNumber);
}

getBalance();
