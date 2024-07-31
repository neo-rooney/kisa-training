require("dotenv").config();
const { CA, RPC_Endpoints, OWNER_PUBLIC_KEY } = process.env;
const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function refill() {
  try {
    const owner = OWNER_PUBLIC_KEY;
    const amount = 1;

    await contract.methods.refill(amount).send({ from: owner });

    const contractBalance = await contract.methods
      .cupcakeBalances(contractAddress)
      .call();

    console.log(`contract : ${contractAddress} >> ${contractBalance}`);
  } catch (e) {
    console.log(e);
  }
}

refill();
