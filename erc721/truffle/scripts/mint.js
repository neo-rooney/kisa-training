require("dotenv").config();
const { RPC_Endpoints, CA, OWNER_PUBLIC_KEY, OWNER_PRIVATE_KEY } = process.env;

const fs = require("fs");
const { Web3 } = require("web3");

const web3 = new Web3(RPC_Endpoints);

const contractABI = JSON.parse(
  fs.readFileSync("./build/contracts/MyERC721.json")
).abi;
const contractAddress = CA;

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function mint(address, privateKey) {
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 2000000;

  const singedTx = await web3.eth.accounts.signTransaction(
    {
      from: address,
      to: contractAddress,
      gasPrice,
      gasLimit,
      data: contract.methods.mint(address).encodeABI(),
    },
    privateKey
  );

  console.log("singedTx >>", singedTx.rawTransaction);

  await web3.eth
    .sendSignedTransaction(singedTx.rawTransaction.toString("hex"))
    .on("receipt", console.log);
}

mint(OWNER_PUBLIC_KEY, OWNER_PRIVATE_KEY);
