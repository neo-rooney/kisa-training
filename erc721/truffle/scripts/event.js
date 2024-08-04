require("dotenv").config();
const { RPC_Endpoints, CA, OWNER_PUBLIC_KEY } = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function event() {
  await contract
    .getPastEvents(
      "Transfer",
      {
        filter: { from: OWNER_PUBLIC_KEY },
        fromBlock: 6433178,
        toBlock: "latest",
      },
      function (error, events) {
        console.log(events);
      }
    )
    .then(function (events) {
      console.log("all events >>", events);
      for (i in events) {
        console.log("i >>", i);
        console.log("blockNumber : ", events[i].blockNumber);
        console.log("blockHash : ", events[i].blockHash);
        console.log("from : ", events[i].returnValues.from);
        console.log("to : ", events[i].returnValues.to);
        console.log("tokenID : ", events[i].returnValues.tokenId);
      }
    });
}

event();
