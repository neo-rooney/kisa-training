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
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function transfer(from, fromPrivateKey, to, tokenId) {
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 2000000;

  const singedTx = await web3.eth.accounts.signTransaction(
    {
      from,
      to: contractAddress,
      gasPrice,
      gasLimit,
      data: contract.methods
        .transferFrom(from, to, tokenId.toString())
        .encodeABI(),
    },
    fromPrivateKey
  );

  await web3.eth
    .sendSignedTransaction(singedTx.rawTransaction.toString("hex"))
    .on("receipt", console.log);

  const onwerBalance = await contract.methods.balanceOf(from).call();

  const receiverBalance = await contract.methods.balanceOf(to).call();

  console.log(`전송 후 owner의 잔고 : ${onwerBalance}`);
  console.log(`전송 후 receiver의 잔고 : ${receiverBalance}`);
}

transfer(OWNER_PUBLIC_KEY, OWNER_PRIVATE_KEY, RECEIVER_PUBLIC_KEY, 0);
