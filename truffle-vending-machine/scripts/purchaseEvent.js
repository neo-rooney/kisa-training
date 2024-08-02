const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = "0x3Df608fD54707Bd0F5D4f4C71e9cA2aa0Fa9Dd9c";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getPurchaseEvents() {
  const accounts = await web3.eth.getAccounts();
  const receiver = accounts[2];

  const events = await contract.getPastEvents("Purchase", {
    filter: { purchaser: receiver },
    fromBlock: 0,
    toBlock: "latest",
  });

  for (i in events) {
    console.log("i >>", i);
    console.log("blockNumber : ", events[i].blockNumber);
    console.log("blockHash : ", events[i].blockHash);
    console.log("purchaser : ", events[i].returnValues.purchaser);
    console.log("amount : ", Number(events[i].returnValues.amount));
  }
}

getPurchaseEvents();
