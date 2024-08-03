require("dotenv").config();
const {
  RPC_Endpoints,
  CA,
  OWNER_PUBLIC_KEY,
  OWNER_PRIVATE_KEY,
  RECEIVER_PUBLIC_KEY,
} = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/GLDToken.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function mint() {
  const trnsferAmount = web3.utils.toWei("10", "ether");
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 2000000;

  const singedTx = await web3.eth.accounts.signTransaction(
    {
      from: OWNER_PUBLIC_KEY,
      to: contractAddress,
      gasPrice,
      gasLimit,
      data: contract.methods
        .transfer(RECEIVER_PUBLIC_KEY, trnsferAmount)
        .encodeABI(),
    },
    OWNER_PRIVATE_KEY
  );

  await web3.eth
    .sendSignedTransaction(singedTx.rawTransaction.toString("hex"))
    .on("receipt", console.log);

  const ownerBlanceBigInt = await contract.methods
    .balanceOf(OWNER_PUBLIC_KEY)
    .call();

  const onwerBalance = web3.utils.fromWei(ownerBlanceBigInt, "ether");

  const receiverBlanceBigInt = await contract.methods
    .balanceOf(RECEIVER_PUBLIC_KEY)
    .call();

  const receiverBalance = web3.utils.fromWei(receiverBlanceBigInt, "ether");

  console.log(`전송 후 owner의 잔고 : ${onwerBalance}`);
  console.log(`전송 후 receiver의 잔고 : ${receiverBalance}`);
}

mint();
