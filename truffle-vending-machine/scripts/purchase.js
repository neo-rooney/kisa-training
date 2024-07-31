require("dotenv").config();
const { CA, RPC_Endpoints, RECEIVER_PUBLIC_KEY } = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/VendingMachine.json")
).abi;

console.log("CA", CA);
console.log("RECEIVER_PUBLIC_KEY", RECEIVER_PUBLIC_KEY);
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function purchase() {
  try {
    const receiver = RECEIVER_PUBLIC_KEY;
    const amount = 1;
    const value = amount * 10 ** 18;

    await contract.methods
      .purchase(amount)
      .send({ from: receiver, value })
      .on("transactionHash", function (hash) {
        console.log("tx hash >>", hash);
      })
      .on("receipt", function (receipt) {
        console.log("tx receipt >>", receipt);
      })
      .on("error", console.error);

    const contractBalance = await contract.methods
      .cupcakeBalances(contractAddress)
      .call();

    const receiverBalance = await contract.methods
      .cupcakeBalances(receiver)
      .call();

    console.log(`contract : ${contractAddress} >> ${contractBalance}`);
    console.log(`receiver : ${receiver} >> ${receiverBalance}`);
  } catch (e) {
    console.log(e);
  }
}

purchase();
