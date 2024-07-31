const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3("http://127.0.0.1:7545/");

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MetaCoin.json")
).abi;
const contractAddress = "0x42EeFc027C5FAb00D12cb37E264F9Dee0C770777";

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function purchase() {
  try {
    const accounts = await web3.eth.getAccounts();

    const sender = accounts[0];
    const receiver = accounts[1];
    const value = 500;

    await contract.methods.sendCoin(receiver, value).send({ from: sender });

    const senderBalanceBigInt = await contract.methods
      .getBalance(sender)
      .call();
    const senderBalance = Number(senderBalanceBigInt);

    const receiverBalanceBigInt = await contract.methods
      .getBalance(receiver)
      .call();
    const receiverBalance = Number(receiverBalanceBigInt);

    console.log(`sender : ${sender} >> ${senderBalance}`);
    console.log(`receiver : ${receiver} >> ${receiverBalance}`);
  } catch (e) {
    console.log(e);
  }
}

purchase();
